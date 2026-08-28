import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from './env.js';

// Prisma 7 requires a driver adapter instead of a datasource url in
// schema.prisma. This adapter is what actually opens the connection to the
// Azure Postgres instance using DATABASE_URL from backend/.env.
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

// Single shared PrismaClient instance for the whole process. Node's ESM
// module cache makes this a natural singleton — every module that imports
// { prisma } from here gets the same connection pool instead of opening a
// new one per import (which exhausts Postgres connections fast, especially
// against a small `connection_limit` like the Azure DATABASE_URL uses).
export const prisma = new PrismaClient({
  adapter,
  log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});
