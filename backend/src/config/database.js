import { PrismaClient } from '@prisma/client';

// Singleton Prisma client to avoid multiple instances in dev environment
const prisma = new PrismaClient();

export default prisma;
