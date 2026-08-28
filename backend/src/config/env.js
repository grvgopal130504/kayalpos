import 'dotenv/config';
import { z } from 'zod';

// All configuration comes from environment variables — nothing here is
// hardcoded. DATABASE_URL is now required: the project is connected to the
// live Azure PostgreSQL instance (see backend/.env), and src/config/prisma.js
// touches it at startup via the /api/health/db check.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  JWT_SECRET: z
    .string()
    .min(16, 'JWT_SECRET must be set in .env (see .env.example) and be at least 16 characters'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL must be set in .env (see .env.example)'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:');
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error('Fix the environment variables in backend/.env (see .env.example) before starting the server.');
}

export const env = parsed.data;
