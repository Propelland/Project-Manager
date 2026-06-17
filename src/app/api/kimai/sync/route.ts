import { NextResponse } from 'next/server';
import { syncKimaiUsers, syncKimaiProjects, syncKimaiAbsences, testKimaiConnection } from '@/lib/kimai';

export async function POST() {
  try {
    // Test connection first
    const connectionOk = await testKimaiConnection();
    if (!connectionOk) {
      return NextResponse.json(
        { error: 'Failed to connect to Kimai database' },
        { status: 500 }
      );
    }

    console.log('Starting Kimai synchronization...');

    // Synchronize users, projects, and absences
    const [usersResult, projectsResult] = await Promise.all([
      syncKimaiUsers(),
      syncKimaiProjects(),
    ]);
    const absencesCount = await syncKimaiAbsences();

    console.log(`Synchronization completed: ${usersResult.length} users, ${projectsResult.length} projects, ${absencesCount} absences`);

    return NextResponse.json({
      success: true,
      users: {
        count: usersResult.length,
        data: usersResult,
      },
      projects: {
        count: projectsResult.length,
        data: projectsResult,
      },
      absences: {
        count: absencesCount,
      },
    });
  } catch (error) {
    console.error('Error synchronizing Kimai data:', error);
    return NextResponse.json(
      { error: 'Failed to synchronize Kimai data' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Test connection first
    const connectionOk = await testKimaiConnection();
    if (!connectionOk) {
      return NextResponse.json(
        { error: 'Failed to connect to Kimai database' },
        { status: 500 }
      );
    }

    const [usersResult, projectsResult] = await Promise.all([
      syncKimaiUsers(),
      syncKimaiProjects(),
    ]);
    const absencesCount = await syncKimaiAbsences();

    return NextResponse.json({
      connected: true,
      users: {
        count: usersResult.length,
        data: usersResult,
      },
      projects: {
        count: projectsResult.length,
        data: projectsResult,
      },
      absences: {
        count: absencesCount,
      },
    });
  } catch (error) {
    console.error('Error checking Kimai status:', error);
    return NextResponse.json(
      { connected: false, error: 'Failed to connect to Kimai database' },
      { status: 500 }
    );
  }
}
