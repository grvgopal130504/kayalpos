import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// Prisma 7 moved the connection string out of schema.prisma and into this
// config file (used by the Prisma CLI — `generate`, `migrate`, `studio`,
// etc.). The running app itself still reads DATABASE_URL directly via
// src/config/env.js and passes it to the @prisma/adapter-pg driver adapter
// in src/config/prisma.js — this file only affects CLI commands.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    // Lets `npx prisma migrate dev` / `npx prisma db seed` run
    // prisma/seed.js (creates the dev Tenant, Outlets, and Admin user).
    seed: 'node prisma/seed.js',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
