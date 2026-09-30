// One-off remediation for "Too many database connections opened:
// remaining connection slots are reserved for roles with the SUPERUSER
// attribute" — Postgres's own way of saying max_connections is exhausted.
//
// Root cause: backend/src/server.js used to exit on every nodemon restart
// without calling prisma.$disconnect(), so each restart could leave its
// PrismaClient's pooled connections dangling on the Azure Postgres server
// (they only get reaped once the OS/network eventually notices the dead
// TCP socket, which can take a long time on default keepalive settings).
// After enough restarts in one dev session, the server's connection slots
// filled up and every query started failing. server.js now disconnects
// cleanly on SIGINT/SIGTERM, which stops new leaks — but it can't free
// connections that are *already* stuck from earlier in the session. This
// script clears those out once, from a plain `pg` client (not through
// Prisma's pool), by asking Postgres itself to terminate every other
// backend connection currently open against this database.
//
// Usage (from backend/): node scripts/reset-db-connections.js
// (or: npm run db:reset-connections)
import pg from 'pg';
import { env } from '../src/config/env.js';

const { Client } = pg;

async function main() {
  const client = new Client({ connectionString: env.DATABASE_URL });
  await client.connect();

  const { rows: before } = await client.query(
    'SELECT pid, usename, application_name, state, now() - query_start AS running_for '
      + 'FROM pg_stat_activity WHERE datname = current_database() AND pid <> pg_backend_pid()',
  );
  console.log(`Found ${before.length} other connection(s) open against this database:`);
  before.forEach((row) => {
    console.log(`  pid ${row.pid}  user=${row.usename}  state=${row.state}  app=${row.application_name || '—'}`);
  });

  if (before.length === 0) {
    console.log('Nothing to clear.');
    await client.end();
    return;
  }

  const { rows: terminated } = await client.query(
    'SELECT pid, pg_terminate_backend(pid) AS terminated FROM pg_stat_activity '
      + 'WHERE datname = current_database() AND pid <> pg_backend_pid()',
  );
  const okCount = terminated.filter((row) => row.terminated).length;
  console.log(`Terminated ${okCount}/${terminated.length} connection(s). Restart the backend now.`);

  await client.end();
}

main().catch((err) => {
  console.error('Failed to reset connections:', err.message);
  process.exit(1);
});
