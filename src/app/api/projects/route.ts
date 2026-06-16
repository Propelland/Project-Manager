import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        color: true,
        visible: true,
        customer: true,
      },
    });
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Failed to fetch projects', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    const newProject = await prisma.project.create({
      data: { name },
    });
    return NextResponse.json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { projects } = await request.json();
    await prisma.project.deleteMany();
    const createdProjects = await prisma.project.createMany({
      data: projects.map((project: {
        id: string;
        name: string;
        color: string;
        visible?: boolean;
        customer?: string;
      }) => ({
        id: project.id,
        name: project.name,
        color: project.color,
        visible: project.visible !== undefined ? project.visible : true,
        customer: project.customer,
      })),
    });
    return NextResponse.json({ success: true, count: createdProjects.count });
  } catch (error) {
    console.error('Error updating projects:', error);
    return NextResponse.json(
      { error: 'Failed to update projects' },
      { status: 500 }
    );
  }
}
