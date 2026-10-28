import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from './env.js';

// Prisma 7 requires a driver adapter instead of a datasource url in
// schema.prisma. `PrismaPg` wraps node-postgres's own `pg.Pool` directly —
// and pg.Pool does NOT understand Prisma's old query-string tuning params
// (`connection_limit`, `pool_timeout`, `connect_timeout`). Those get parsed
// into a generic object by pg-connection-string but are never read by
// pg.Pool's constructor, so DATABASE_URL setting `connection_limit=5` was
// silently doing nothing — the pool was actually running on node-postgres's
// hardcoded default of `max: 10` the whole time, double what was intended,
// and twice what every restart could leak before server.js's shutdown
// handler was added. Real pg.Pool tuning has to be passed as plain
// `pg.PoolConfig` fields here instead of relying on the connection string.
//
// `max: 5` is a hard, honored cap on how many connections this one process
// may hold open to Postgres at once. It's sized to match this app's actual
// worst-case fan-out per request — see sale.service.js's
// getTenderSalesReport (4 concurrent queries) and getOtherPaymentsReport
// (5, after consolidating its extra aggregates into one groupBy) — so a
// single request's own queries can be satisfied without the pool needing
// to queue, while still leaving headroom on a small Postgres instance for
// Prisma Studio, psql, or another app talking to the same database.
//
// `options: '-c timezone=UTC'` pins EVERY pooled connection's session time zone
// to UTC at connect time (a startup parameter, so it beats any server, database
// or role default). The Prisma pg adapter sends Date values to Postgres as
// zone-less UTC strings ("2026-10-27 14:11:21.300") and reads timestamptz back
// by relabelling the offset as +00:00. That is exactly right when the session
// is UTC; in any other zone a timestamptz column (the TCZ_OPOS CreateDate) is
// stored shifted by the zone's offset. `timestamp` columns are unaffected either
// way. Do not remove this without re-running test/tczTimezone.integration.mjs.
const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
  max: 5,
  connectionTimeoutMillis: 15_000,
  idleTimeoutMillis: 10_000,
  options: '-c timezone=UTC',
});

// Single shared PrismaClient instance for the whole process. Node's ESM
// module cache makes this a natural singleton — every module that imports
// { prisma } from here gets the same connection pool instead of opening a
// new one per import (which would multiply `max` above by however many
// times this module got re-instantiated).
export const prisma = new PrismaClient({
  adapter,
  log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});
