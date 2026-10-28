// Time-zone behaviour of the TCZ CreateDate / CreateTime columns and of the application's connection pool,
// on a DISPOSABLE LOCAL database. Run it against databases whose TimeZone setting differs (UTC, America/Los_Angeles,
// Asia/Kolkata ...). The test itself changes NO database-level or role-level setting; the database simply has to
// have been created that way, e.g. on a scratch server:
//     CREATE DATABASE nexora_tz_la;  ALTER DATABASE nexora_tz_la SET timezone = 'America/Los_Angeles';   (then apply the migrations)
//     TCZ_EXPECT_DB_TZ=America/Los_Angeles DATABASE_URL=postgresql://postgres@localhost:5432/nexora_tz_la node test/tczTimezone.integration.mjs
// TCZ_EXPECT_DB_TZ is optional; when set, the test first checks the database really has that zone, so a run can never
// pass vacuously on a UTC database by mistake. REFUSES to run on anything but a local database.
//
// What it asserts, for ANY database TimeZone:
//   * every connection of the application's pool (src/config/prisma.js) has session TimeZone = UTC, also after a reconnect;
//   * CreateDate (timestamptz) keeps the exact instant of the real checkout / of explicit boundary instants;
//   * CreateTime is the IST (Asia/Kolkata) wall-clock time of that same instant;
//   * a plain (non-application) session in the database's own zone sees the same exact instants, and verify is clean;
//   * NEGATIVE CONTROL: a Prisma client WITHOUT the UTC pin does shift CreateDate by the database zone's offset, which is
//     why the pin exists (if this ever stops being true, the adapter changed: revisit the pin).
import 'dotenv/config';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import pg from 'pg';

if (!/@(localhost|127\.0\.0\.1)[:/]/.test(process.env.DATABASE_URL || '')) {
  console.error('Refusing to run: DATABASE_URL must point at a LOCAL test database.'); process.exit(2);
}
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-test-secret-123';
process.env.NODE_ENV = 'test';
const here = path.dirname(fileURLToPath(import.meta.url));
const VERIFY = fs.readFileSync(path.join(here, '../scripts/verify-tcz-backfill.sql'), 'utf8');

const { app } = await import('../src/app.js');
const { prisma } = await import('../src/config/prisma.js');                // the application's own, pinned client
const { istTimeOfDay } = await import('../src/modules/sale/tczBilling.service.js');
const jwt = (await import('jsonwebtoken')).default;
const { PrismaClient } = await import('@prisma/client');
const { PrismaPg } = await import('@prisma/adapter-pg');
const server = http.createServer(app); await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}/api`;
const db = new pg.Client({ connectionString: process.env.DATABASE_URL }); await db.connect(); // plain session: the database's own zone
const DB_TZ = (await db.query('show timezone')).rows[0].TimeZone;

let passed = 0; const failures = [];
const test = async (n, f) => { try { await f(); passed += 1; console.log(`  ok   ${n}`); } catch (e) { failures.push(n); console.log(`  FAIL ${n}\n       ${e.message}`); } };
const iso = (ts) => `to_char(${ts} at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`;

const sfx = Date.now().toString(36);
const tenant = (await prisma.tenant.create({ data: { name: `TZ-${sfx}`, slug: `tz-${sfx}` } }));
const outlet = await prisma.outlet.create({ data: { tenantId: tenant.id, code: 'A', name: 'Outlet A' } });
const product = await prisma.product.create({ data: { tenantId: tenant.id, code: 'P1', name: 'Item P1', group: 'G', uom: 'KG', salePrice: 50, availableQty: 1000 } });
const token = jwt.sign({ id: 'u1', tenantId: tenant.id, username: 'u1', name: 'Name u1', role: 'ADMIN', outletId: outlet.id }, process.env.JWT_SECRET);

console.log(`\nTCZ time zone — database TimeZone = ${DB_TZ}, node TZ = ${process.env.TZ ?? '(unset)'}`);

await test('database under test has the expected zone (guards against passing vacuously)', async () => {
  if (process.env.TCZ_EXPECT_DB_TZ) assert.equal(DB_TZ, process.env.TCZ_EXPECT_DB_TZ);
});

const poolPids = new Set();
await test('APPLICATION POOL: every connection reports session TimeZone = UTC (15 parallel queries over several connections)', async () => {
  const rows = await Promise.all(Array.from({ length: 15 }, () => prisma.$queryRaw`select pg_backend_pid()::int as pid, current_setting('TimeZone') as tz, pg_sleep(0.05)::text as s`));
  rows.forEach((r) => { poolPids.add(r[0].pid); assert.equal(r[0].tz, 'UTC', `connection ${r[0].pid} runs in ${r[0].tz}`); });
  assert.ok(poolPids.size >= 2, `only ${poolPids.size} connection(s) exercised`);
});
await test('APPLICATION POOL: interactive transactions (used by checkout) are UTC too', async () => {
  const tz = await prisma.$transaction(async (tx) => (await tx.$queryRaw`select current_setting('TimeZone') as tz`)[0].tz);
  assert.equal(tz, 'UTC');
});
await test('APPLICATION POOL: still UTC after the pool reconnects (all its backends terminated)', async () => {
  const pids = [...poolPids];
  await db.query('select pg_terminate_backend(pid) from pg_stat_activity where pid = any($1)', [pids]);
  let tz;
  for (let i = 0; i < 5 && !tz; i += 1) { try { tz = (await prisma.$queryRaw`select current_setting('TimeZone') as tz`)[0].tz; } catch { await new Promise((r) => setTimeout(r, 200)); } }
  assert.equal(tz, 'UTC');
  const rows = await Promise.all(Array.from({ length: 8 }, () => prisma.$queryRaw`select pg_backend_pid()::int as pid, current_setting('TimeZone') as tz, pg_sleep(0.05)::text as s`));
  rows.forEach((r) => { assert.equal(r[0].tz, 'UTC'); assert.ok(!pids.includes(r[0].pid), 'new backend expected after termination'); });
});

let saleId; const t0 = Date.now();
await test('real checkout succeeds', async () => {
  const r = await fetch(`${base}/sales`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ customerName: 'Walk-in Customer', cashierName: 'c1', paymentMethod: 'cash', receivedAmount: 1000, lines: [{ productId: product.id, qty: 2 }] }) });
  const j = await r.json(); assert.equal(r.status, 201, JSON.stringify(j)); saleId = j.data.id;
});
const t1 = Date.now();
await test('REAL CHECKOUT: CreateDate is the exact instant (not shifted) and CreateTime is the IST time of it, in every database zone', async () => {
  const r = (await db.query(`select (h."CreateDate") cd, (s."createdAt" at time zone 'UTC') sc, to_char(h."CreateTime",'HH24:MI:SS.MS') ct,
       to_char((h."CreateDate" at time zone 'Asia/Kolkata'),'HH24:MI:SS.MS') ist,
       extract(epoch from h."CreateDate") * 1000 - extract(epoch from (s."createdAt" at time zone 'UTC')) * 1000 shift_ms
     from "TCZ_OPOS" h join "Sale" s on s.id = h."SaleId" where s.id = $1`, [saleId])).rows[0];
  assert.ok(r.sc.getTime() >= t0 - 5000 && r.sc.getTime() <= t1 + 5000, 'Sale.createdAt is the real instant');
  assert.ok(Math.abs(Number(r.shift_ms)) < 60000, `CreateDate is ${r.shift_ms} ms away from the real instant (database zone ${DB_TZ})`);
  assert.ok(r.cd.getTime() >= t0 - 5000 && r.cd.getTime() <= t1 + 5000, `CreateDate ${r.cd.toISOString()} outside the checkout window`);
  assert.equal(r.ct, r.ist, 'CreateTime is the IST time of CreateDate');
});
await test('verify script is clean (every PROBLEM row 0) when read from a plain session in the database zone', async () => {
  const rows = (await db.query(VERIFY)).rows; const problems = rows.filter((x) => x.check.startsWith('PROBLEM'));
  assert.ok(problems.length >= 25);
  problems.forEach((p) => assert.equal(Number(p.n), 0, `${p.check} = ${p.n}`));
});

// explicit instants: IST midnight, year boundary, leap day, ordinary day
const INSTANTS = [
  ['2026-10-27T14:11:21.300Z', '19:41:21.300'],
  ['2026-10-27T18:30:00.000Z', '00:00:00.000'],
  ['2026-12-31T18:30:00.000Z', '00:00:00.000'],
  ['2028-02-29T18:29:59.999Z', '23:59:59.999'],
  ['2028-02-29T18:30:00.000Z', '00:00:00.000'],
];
await test('EXACT INSTANT through the application client at IST-midnight / year / leap-day boundaries; CreateTime is IST; Prisma reads it back unchanged', async () => {
  for (const [stamp, ist] of INSTANTS) {
    const when = new Date(stamp);
    const h = await prisma.tczOpos.create({ data: { tenantId: tenant.id, docNum: `INST-${stamp}`, createDate: when, createTime: istTimeOfDay(when) } });
    const r = (await db.query(`select ${iso('"CreateDate"')} utc, to_char("CreateTime",'HH24:MI:SS.MS') ct from "TCZ_OPOS" where "DocEntry"=$1`, [h.docEntry])).rows[0];
    assert.deepEqual([r.utc, r.ct], [stamp, ist], `instant ${stamp}`);
    assert.equal((await prisma.tczOpos.findUnique({ where: { docEntry: h.docEntry } })).createDate.toISOString(), stamp);
  }
});

await test('NEGATIVE CONTROL: a Prisma client WITHOUT the UTC pin stores the same instant shifted by the database zone offset (the reason for the pin)', async () => {
  const unpinned = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 2 }) });
  try {
    const stamp = '2026-10-27T14:11:21.300Z';
    const h = await unpinned.tczOpos.create({ data: { tenantId: tenant.id, docNum: 'UNPINNED-1', createDate: new Date(stamp) } });
    const r = (await db.query(`select ${iso('"CreateDate"')} utc, extract(epoch from "CreateDate") * 1000 - extract(epoch from $2::timestamptz) * 1000 as shift_ms,
         (select current_setting('TimeZone')) tz from "TCZ_OPOS" where "DocEntry"=$1`, [h.docEntry, stamp])).rows[0];
    // what Postgres does with the zone-less string "2026-10-27 14:11:21.300" in this database's zone:
    const expected = (await db.query(`select extract(epoch from '2026-10-27 14:11:21.300'::timestamptz) * 1000 - extract(epoch from '2026-10-27 14:11:21.300+00'::timestamptz) * 1000 as ms`)).rows[0].ms;
    assert.equal(Number(r.shift_ms), Number(expected), `unpinned shift ${r.shift_ms} ms, expected ${expected} ms for zone ${DB_TZ}`);
    if (DB_TZ === 'UTC') assert.equal(Number(r.shift_ms), 0);
    if (DB_TZ === 'America/Los_Angeles') assert.equal(Number(r.shift_ms), 7 * 3600 * 1000);     // PDT on 27 Oct 2026
    if (DB_TZ === 'Asia/Kolkata') assert.equal(Number(r.shift_ms), -5.5 * 3600 * 1000);
  } finally { await unpinned.$disconnect(); }
});

console.log(`\n${passed} passed, ${failures.length} failed`);
await db.end(); await prisma.$disconnect(); server.close();
process.exit(failures.length ? 1 : 0);
