import { prisma } from '../../config/prisma.js';

// Keep the check cheap: a single round-trip query, capped so a slow/stuck
// DB connection can't make polling clients (the frontend hits this every
// ~30s) hang or pile up requests.
const DB_CHECK_TIMEOUT_MS = 2000;

/**
 * SELECT 1 against Postgres, raced against a timeout. Resolves to a plain
 * boolean — never throws — so a DB outage or slow connection just reports
 * `false` instead of taking the health endpoint down with it.
 */
async function isDatabaseUp() {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Database check timed out')), DB_CHECK_TIMEOUT_MS);
  });

  try {
    await Promise.race([prisma.$queryRaw`SELECT 1`, timeout]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Combined health snapshot for the frontend's HealthStatusTag: reaching
 * this handler at all already proves the backend is up, so `services.backend`
 * is always true here — only the DB check can flip the overall status.
 */
export async function getHealthStatus() {
  const database = await isDatabaseUp();

  return {
    status: database ? 'healthy' : 'unhealthy',
    services: { backend: true, database },
    timestamp: new Date().toISOString(),
  };
}
