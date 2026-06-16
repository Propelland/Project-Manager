import mysql from 'mysql2/promise';
import { prisma } from '@/lib/prisma';

// Kimai database connection configuration
const kimaiConfig = {
  host: process.env.KIMAI_DB_HOST,
  port: parseInt(process.env.KIMAI_DB_PORT || '3306'),
  user: process.env.KIMAI_DB_USER,
  password: process.env.KIMAI_DB_PASSWORD,
  database: process.env.KIMAI_DB_NAME,
  connectTimeout: 10000,
};

// Create a reusable connection pool
let connectionPool: mysql.Pool | null = null;

async function getKimaiConnection() {
  if (!connectionPool) {
    connectionPool = mysql.createPool(kimaiConfig);
  }
  return connectionPool;
}

// Function to fetch all users from Kimai (both enabled and disabled)
export async function getKimaiUsers() {
  const pool = await getKimaiConnection();
  const [users] = await pool.execute(`
    SELECT id, username, alias as name, email, enabled 
    FROM kimai2_users 
  `);
  
  return (users as { id: number; username: string; name: string | null; email: string; enabled: number }[]).map((user) => ({
    id: user.id.toString(),
    name: user.name || user.username, // Use alias (full name) if available
    username: user.username,
    email: user.email,
    enabled: Boolean(user.enabled), // Include enabled status
  }));
}

// Function to fetch all projects from Kimai (including invisible ones)
export async function getKimaiProjects() {
  const pool = await getKimaiConnection();
  const [projects] = await pool.execute(`
    SELECT p.id, p.name, p.color, c.name as customer_name, p.visible
    FROM kimai2_projects p
    LEFT JOIN kimai2_customers c ON p.customer_id = c.id
  `);
  
  return (projects as { id: number; name: string; color: string | null; customer_name: string | null; visible: number }[]).map((project) => ({
    id: project.id.toString(),
    name: project.name,
    customer: project.customer_name,
    color: project.color || '#000000', // Default color if null
    visible: Boolean(project.visible),
  }));
}

// Function to synchronize Kimai users with local database
export async function syncKimaiUsers() {
  const kimaiUsers = await getKimaiUsers();
  console.log(`Found ${kimaiUsers.length} users in Kimai (${kimaiUsers.filter(u => u.enabled).length} enabled)`);
  
  // Synchronize with local database
  const existingPeople = await prisma.person.findMany();
  const existingPersonIds = existingPeople.map(p => p.id);
  const kimaiUserIds = kimaiUsers.map(u => u.id);

  // Users to create (not in local database)
  const usersToCreate = kimaiUsers.filter(user => !existingPersonIds.includes(user.id));
  if (usersToCreate.length > 0) {
    await prisma.person.createMany({
      data: usersToCreate.map(user => ({
        id: user.id,
        name: user.name,
        enabled: user.enabled !== undefined ? user.enabled : true,
      })),
    });
  }

  // Users to update (already in local database)
  const usersToUpdate = kimaiUsers.filter(user => existingPersonIds.includes(user.id));
  for (const user of usersToUpdate) {
    await prisma.person.update({
      where: { id: user.id },
      data: {
        name: user.name,
        enabled: user.enabled !== undefined ? user.enabled : true,
      },
    });
  }

  // Users to disable (no longer in Kimai - we don't delete to preserve history)
  const usersToDisable = existingPeople.filter(p => !kimaiUserIds.includes(p.id) && p.enabled);
  for (const person of usersToDisable) {
    await prisma.person.update({
      where: { id: person.id },
      data: { enabled: false },
    });
  }

  console.log(`Synchronized users: ${usersToCreate.length} created, ${usersToUpdate.length} updated, ${usersToDisable.length} disabled`);
  
  return kimaiUsers;
}

// Function to synchronize Kimai projects with local database
export async function syncKimaiProjects() {
  const kimaiProjects = await getKimaiProjects();
  console.log(`Found ${kimaiProjects.length} projects in Kimai (${kimaiProjects.filter(p => p.visible).length} visible)`);
  
  // Synchronize with local database
  const existingProjects = await prisma.project.findMany();
  const existingProjectIds = existingProjects.map(project => project.id);
  const kimaiProjectIds = kimaiProjects.map(project => project.id);
  
  // Projects to create (not in local database)
  const projectsToCreate = kimaiProjects.filter(project => !existingProjectIds.includes(project.id));
  if (projectsToCreate.length > 0) {
    await prisma.project.createMany({
      data: projectsToCreate.map(project => ({
        id: project.id,
        name: project.name,
        color: project.color,
        visible: project.visible,
        customer: project.customer,
      })),
    });
  }
  
  // Projects to update (already in local database)
  const projectsToUpdate = kimaiProjects.filter(project => existingProjectIds.includes(project.id));
  for (const project of projectsToUpdate) {
    await prisma.project.update({
      where: { id: project.id },
      data: {
        name: project.name,
        color: project.color,
        visible: project.visible,
        customer: project.customer,
      },
    });
  }
  
  // Projects to mark as invisible (no longer in Kimai or marked invisible in Kimai)
  const projectsToMarkInvisible = existingProjects.filter(project => 
    !kimaiProjectIds.includes(project.id) || 
    (kimaiProjects.find(p => p.id === project.id)?.visible === false)
  );
  for (const project of projectsToMarkInvisible) {
    if (project.visible) {
      await prisma.project.update({
        where: { id: project.id },
        data: { visible: false },
      });
    }
  }

  console.log(`Synchronized projects: ${projectsToCreate.length} created, ${projectsToUpdate.length} updated, ${projectsToMarkInvisible.length} marked as invisible`);
  
  return await prisma.project.findMany();
}

// Returns vacation percentages grouped by personId -> weekStart (YYYY-MM-DD) -> percentage
// Each absence day = 20%, half_day = 10%
export async function getAbsencesGrouped(): Promise<Record<string, Record<string, number>>> {
  const pool = await getKimaiConnection();
  const [rows] = await pool.execute(`
    SELECT user_id, date, half_day
    FROM kimai2_absence
    WHERE type = 'holiday'
  `);

  const result: Record<string, Record<string, number>> = {};

  for (const row of rows as { user_id: number; date: Date; half_day: number }[]) {
    const personId = row.user_id.toString();
    const d = new Date(row.date);
    // Snap to Monday using local time to match the UI's snapToWeek logic
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    const weekKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const pct = row.half_day ? 10 : 20;
    if (!result[personId]) result[personId] = {};
    result[personId][weekKey] = (result[personId][weekKey] || 0) + pct;
  }

  return result;
}

// Function to test Kimai connection
export async function testKimaiConnection() {
  try {
    const pool = await getKimaiConnection();
    const [result] = await pool.execute('SELECT 1');
    return (result as unknown[]).length > 0;
  } catch (error) {
    console.error('Kimai connection test failed:', error);
    return false;
  }
}
