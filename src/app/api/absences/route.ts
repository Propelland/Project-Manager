import { NextResponse } from 'next/server';
import { getAbsencesGrouped } from '@/lib/kimai';

export async function GET() {
  try {
    const vacations = await getAbsencesGrouped();
    return NextResponse.json({ vacations });
  } catch (error) {
    console.error('Error fetching absences:', error);
    return NextResponse.json({ error: 'Failed to fetch absences' }, { status: 500 });
  }
}
