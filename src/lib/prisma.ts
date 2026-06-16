import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ 
  log: ['query', 'info', 'warn', 'error'],
});

prisma.$connect()
  .then(() => console.log('Successfully connected to Prisma database'))
  .catch((err) => console.error('Failed to connect to Prisma database:', err));

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
