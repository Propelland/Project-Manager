const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function main() {
  console.log('Testing Prisma connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    await prisma.$connect();
    console.log('Successfully connected to the database!');
    
    const count = await prisma.project.count();
    console.log('Number of projects:', count);
    
    await prisma.$disconnect();
  } catch (e) {
    console.error('Failed to connect to the database:');
    console.error(e);
    process.exit(1);
  }
}

main();
