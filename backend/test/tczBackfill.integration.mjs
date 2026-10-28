// Integration test for scripts/backfill-tcz-billing.sql + scripts/verify-tcz-backfill.sql.
// Creates sales through the REAL checkout (so TCZ rows are written live), then
// "ages" them (deletes their TCZ rows to look like pre-migration sales), runs the
// backfill, and compares the backfilled rows with the live-written ones.
// CreateTime convention under test: CreateDate = exact instant (timestamptz); CreateTime = the IST (Asia/Kolkata,
// UTC+05:30) wall-clock time of that same instant, written identically by the live checkout and by the backfill.
// REFUSES to run unless DATABASE_URL is a LOCAL database.
//   DATABASE_URL=postgresql://postgres@localhost:5432/nexora_test npm run test:tcz-backfill
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
const BACKFILL = fs.readFileSync(path.join(here, '../scripts/backfill-tcz-billing.sql'), 'utf8');
const VERIFY = fs.readFileSync(path.join(here, '../scripts/verify-tcz-backfill.sql'), 'utf8');
// psql meta-commands (\echo) are not SQL; the pg driver runs the three statements as one multi-result query.
const DIAGNOSE = fs.readFileSync(path.join(here, '../scripts/diagnose-tcz-backfill.sql'), 'utf8').split('\n').filter((l) => !l.startsWith('\\')).join('\n');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const { app } = await import('../src/app.js');
const { prisma } = await import('../src/config/prisma.js');
const jwt = (await import('jsonwebtoken')).default;
const server = http.createServer(app); await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}/api`;
const db = new pg.Client({ connectionString: process.env.DATABASE_URL }); await db.connect();

let passed = 0; const failures = [];
const test = async (n, f) => { try { await f(); passed += 1; console.log(`  ok   ${n}`); } catch (e) { failures.push(n); console.log(`  FAIL ${n}\n       ${e.message}`); } };

const sfx = Date.now().toString(36);
const tenant = await prisma.tenant.create({ data: { name: `BF-${sfx}`, slug: `bf-${sfx}` } });
const outlet = await prisma.outlet.create({ data: { tenantId: tenant.id, code: 'A', name: 'Outlet A' } });
const mk = (code, price, qty) => prisma.product.create({ data: { tenantId: tenant.id, code, name: `Item ${code}`, group: 'G', uom: 'KG', salePrice: price, availableQty: qty } });
const p1 = await mk('P1', 33.33, 10000); const p2 = await mk('P2', 50, 10000); const p3 = await mk('P3', 7.77, 10000);
const cust = await prisma.customer.create({ data: { tenantId: tenant.id, code: 'C1', name: 'Ravi', mobile: '9999999999', customerType: 'Retail' } });
const TA = jwt.sign({ id: 'u1', tenantId: tenant.id, username: 'u1', name: 'Name u1', role: 'ADMIN', outletId: outlet.id }, process.env.JWT_SECRET);
const api = async (m, p, b) => { const r = await fetch(base + p, { method: m, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TA}` }, body: b ? JSON.stringify(b) : undefined }); const j = await r.json().catch(() => ({})); return { status: r.status, data: j.data, body: j }; };
const L = (...pairs) => pairs.map(([p, qty]) => ({ productId: p.id, qty }));
const sell = (extra) => api('POST', '/sales', { customerName: 'Walk-in Customer', cashierName: 'cashier1', paymentMethod: 'cash', receivedAmount: 100000, ...extra });
const run = async (limit) => { await db.query(`select set_config('tcz.backfill_limit', $1, false)`, [limit ?? '']); return db.query(BACKFILL); };
const count = async (sql, args = []) => Number((await db.query(sql, args)).rows[0].n);
const headers = () => count('select count(*) n from "TCZ_OPOS" where "TenantId"=$1', [tenant.id]);
const fp = async () => {
  const out = {};
  for (const t of ['Sale', 'SaleLine', 'Product', 'Customer', 'HeldBill', 'SalesReturn']) {
    out[t] = (await db.query(`select count(*)||':'||coalesce(md5(string_agg(x::text,'' order by x::text)),'') v from "${t}" x`)).rows[0].v;
  }
  return out;
};

console.log('\nTCZ backfill — integration tests');
const live = []; // sales written through the live path
await test('setup: 9 varied sales through the real checkout (live TCZ rows written)', async () => {
  const cases = [
    { lines: L([p1, 3], [p2, 2]), paymentMethod: 'cash', receivedAmount: 500, discountType: 'amount', discountValue: 12.5 },
    { lines: L([p1, 1]), paymentMethod: 'card', receivedAmount: 34.99 },
    { lines: L([p3, 7], [p2, 1]), paymentMethod: 'upi', receivedAmount: 200, discountType: 'percent', discountValue: 7 },
    { lines: L([p2, 4]), paymentMethod: 'wallet', receivedAmount: 210 },
    { lines: L([p1, 2]), paymentMethod: 'credit', receivedAmount: 0 },
    { lines: L([p3, 3]), paymentMethod: 'cash', receivedAmount: 10 }, // underpaid -> Balance > 0
    { lines: L([p2, 1], [p2, 2]), paymentMethod: 'cash', receivedAmount: 500 }, // same product on two lines
    { lines: L([p1, 5], [p3, 1], [p2, 1]), paymentMethod: 'cash', receivedAmount: 1000, discountType: 'percent', discountValue: 33.333, customerId: cust.id, customerName: 'Ravi' },
    { lines: L([p3, 1]), paymentMethod: 'cheque', receivedAmount: 8.16, paymentReference: 'CHQ-1' },
  ];
  for (const c of cases) { const r = await sell(c); assert.equal(r.status, 201, JSON.stringify(r.body)); live.push(r.data.id); }
  assert.equal(await headers(), 9);
});

const snapshot = {};
await test('snapshot the live-written TCZ rows, then age the sales (delete TCZ rows = pre-migration state)', async () => {
  const h = await db.query('select * from "TCZ_OPOS" where "SaleId" = any($1)', [live]);
  const l = await db.query('select p.*, o."SaleId" from "TCZ_POS1" p join "TCZ_OPOS" o using ("DocEntry") where o."SaleId" = any($1) order by o."SaleId", p."LineId"', [live]);
  snapshot.h = Object.fromEntries(h.rows.map((r) => [r.SaleId, r])); snapshot.l = l.rows;
  await db.query('delete from "TCZ_OPOS" where "SaleId" = any($1)', [live]);
  assert.equal(await headers(), 0);
});

let before;
await test('legacy edge sales: HELD status, no lines, huge names, DocNum already taken', async () => {
  const mkSale = (billNo, extra = {}, lines = true) => prisma.sale.create({ data: {
    tenantId: tenant.id, billNo, customerName: 'Legacy', cashierName: 'old', subTotal: 100, discountAmount: 0, taxAmount: 5, grandTotal: 105,
    paymentMethod: 'cash', receivedAmount: 105, ...extra,
    ...(lines ? { lines: { create: [{ productId: p2.id, code: 'P2', name: 'Item P2', uom: 'KG', qty: 2, price: 50, taxRate: 0.05, amount: 100 }] } } : {}),
  } });
  await mkSale('OLD-HELD', { status: 'HELD' });
  await mkSale('OLD-NOLINES', {}, false);
  const big = await mkSale('OLD-LONG', { customerName: 'N'.repeat(300), cashierName: 'C'.repeat(600) });
  await prisma.saleLine.updateMany({ where: { saleId: big.id }, data: { name: 'X'.repeat(400) } });
  await mkSale('OLD-OK');
  assert.ok(true);
});

await test('backfill with a small batch size copies the OLDEST sales first and stops at the limit', async () => {
  before = await fp();
  await run('4');
  assert.equal(await headers(), 4);
  const got = (await db.query('select s."billNo" from "TCZ_OPOS" h join "Sale" s on s.id=h."SaleId" where h."TenantId"=$1 order by h."DocEntry"', [tenant.id])).rows.map((r) => r.billNo);
  const oldest = (await db.query(`select "billNo" from "Sale" where "tenantId"=$1 and status='COMPLETED' and id not in (select "SaleId" from "TCZ_OPOS" where "SaleId" is not null) order by "createdAt" limit 1`, [tenant.id])).rows[0];
  assert.deepEqual(got, ['LS-00001', 'LS-00002', 'LS-00003', 'LS-00004']);
  assert.ok(oldest && oldest.billNo === 'LS-00005');
});
await test('repeat until done; HELD and no-line sales are skipped; nothing else missing', async () => {
  await run('4'); await run('4'); await run('4');
  assert.equal(await headers(), 9 + 2); // 9 aged live sales + OLD-LONG + OLD-OK
  const skipped = (await db.query(`select s."billNo" from "Sale" s where s."tenantId"=$1 and not exists (select 1 from "TCZ_OPOS" t where t."SaleId"=s.id) order by 1`, [tenant.id])).rows.map((r) => r.billNo);
  assert.deepEqual(skipped, ['OLD-HELD', 'OLD-NOLINES']);
});
await test('RE-RUN inserts nothing (idempotent)', async () => {
  const n = await headers(); const lines = await count('select count(*) n from "TCZ_POS1" p join "TCZ_OPOS" o using("DocEntry") where o."TenantId"=$1', [tenant.id]);
  await run(); await run();
  assert.equal(await headers(), n);
  assert.equal(await count('select count(*) n from "TCZ_POS1" p join "TCZ_OPOS" o using("DocEntry") where o."TenantId"=$1', [tenant.id]), lines);
});

await test('backfilled rows == live-written rows (every column except InStock/ClientToken/DocEntry/CreateDate)', async () => {
  const skip = new Set(['DocEntry', 'InStock', 'ClientToken', 'CreateDate', 'CreateTime']);
  const tol = new Set(['TaxableValue', 'TaxValue']);
  const tolHdr = new Set(['HeaderDiscount']); // live row keeps the raw typed discount (33.333); Sale stores 2dp (33.33)
  const h = await db.query('select * from "TCZ_OPOS" where "SaleId" = any($1)', [live]);
  assert.equal(h.rows.length, live.length);
  for (const row of h.rows) {
    const want = snapshot.h[row.SaleId];
    for (const k of Object.keys(want)) {
      if (skip.has(k)) continue;
      const a = row[k]; const b = want[k];
      if (a === null || b === null) assert.equal(a, b, `header ${row.DocNum}.${k}: ${a} vs ${b}`);
      else if (tolHdr.has(k)) assert.ok(Math.abs(Number(a) - Number(b)) <= 0.005, `header ${row.DocNum}.${k}: ${a} vs ${b}`);
      else if (typeof b === 'string' && /^-?\d+\.\d+$/.test(b)) assert.equal(Number(a), Number(b), `header ${row.DocNum}.${k}: ${a} vs ${b}`);
      else assert.equal(String(a), String(b), `header ${row.DocNum}.${k}: ${a} vs ${b}`);
    }
    assert.ok(Math.abs(new Date(row.CreateDate) - new Date(want.CreateDate)) < 2000, `CreateDate ${row.DocNum}`);
    assert.equal(row.ClientToken, null);
  }
  const l = await db.query('select p.*, o."SaleId" from "TCZ_POS1" p join "TCZ_OPOS" o using ("DocEntry") where o."SaleId" = any($1) order by o."SaleId", p."LineId"', [live]);
  assert.equal(l.rows.length, snapshot.l.length);
  l.rows.forEach((row, i) => {
    const want = snapshot.l[i];
    for (const k of Object.keys(want)) {
      if (skip.has(k) || k === 'SaleId') continue;
      const a = row[k]; const b = want[k];
      if (a === null || b === null) assert.equal(a, b, `line ${i}.${k}: ${a} vs ${b}`);
      else if (tol.has(k)) assert.ok(Math.abs(Number(a) - Number(b)) <= 0.01, `line ${i}.${k}: ${a} vs ${b}`);
      else if (typeof b === 'string' && /^-?\d+\.\d+$/.test(b)) assert.equal(Number(a), Number(b), `line ${i}.${k}: ${a} vs ${b}`);
      else assert.equal(String(a), String(b), `line ${i}.${k}: ${a} vs ${b}`);
    }
    assert.equal(row.InStock, null);
  });
});
const normT = (t) => { const [hms, f = ''] = String(t).split('.'); return `${hms}.${(f + '000').slice(0, 3)}`; };
const istOracle = (d) => new Date(d.getTime() + 5.5 * 3600 * 1000).toISOString().slice(11, 23); // fixed UTC+05:30, no DST
await test('CreateTime is IST for LIVE-written rows and for BACKFILLED rows; CreateDate keeps the exact instant', async () => {
  // live-written (snapshot taken before the sales were aged)
  for (const sid of live) {
    const r = snapshot.h[sid];
    assert.equal(normT(r.CreateTime), istOracle(new Date(r.CreateDate)), `live ${r.DocNum}: CreateTime ${r.CreateTime} vs CreateDate ${r.CreateDate.toISOString()}`);
    assert.notEqual(normT(r.CreateTime), new Date(r.CreateDate).toISOString().slice(11, 23), 'must not be the UTC time of day');
  }
  // backfilled: exact instant preserved and IST time of day, for every copied sale
  const rows = (await db.query(`select h."DocNum", to_char(h."CreateTime",'HH24:MI:SS.MS') t, h."CreateDate" cd,
      (extract(epoch from h."CreateDate") = extract(epoch from (s."createdAt" at time zone 'UTC'))) same_instant
    from "TCZ_OPOS" h join "Sale" s on s.id=h."SaleId" where h."TenantId"=$1`, [tenant.id])).rows;
  assert.ok(rows.length >= 11);
  for (const r of rows) {
    assert.equal(r.same_instant, true, `${r.DocNum}: CreateDate must equal Sale.createdAt exactly`);
    assert.equal(r.t, istOracle(new Date(r.cd)), `${r.DocNum}: CreateTime ${r.t} vs IST of ${r.cd.toISOString()}`);
  }
});
await test('InStock is NULL (never guessed), TCZ_POS2 stays empty, Object = TCZ_OPOS', async () => {
  assert.equal(await count('select count(*) n from "TCZ_POS1" p join "TCZ_OPOS" o using("DocEntry") where o."TenantId"=$1 and p."InStock" is not null', [tenant.id]), 0);
  assert.equal(await count('select count(*) n from "TCZ_POS2"'), 0);
  assert.equal(await count(`select count(*) n from "TCZ_OPOS" where "TenantId"=$1 and "Object"<>'TCZ_OPOS'`, [tenant.id]), 0);
});
await test('over-long text is cut, not fatal (OLD-LONG copied; lengths within column limits)', async () => {
  const r = (await db.query(`select length("CustomerName") cn, length("CreatedBy") cb, (select max(length("ItemName")) from "TCZ_POS1" p where p."DocEntry"=h."DocEntry") ln from "TCZ_OPOS" h where "DocNum"='OLD-LONG' and "TenantId"=$1`, [tenant.id])).rows[0];
  assert.deepEqual([Number(r.cn), Number(r.cb), Number(r.ln)], [255, 500, 255]);
});
await test('LEGACY DATA UNCHANGED: Sale, SaleLine, Product(stock), Customer, HeldBill, SalesReturn identical before/after', async () => {
  assert.deepEqual(await fp(), before);
});
const verifyMap = async (c = db) => new Map((await c.query(VERIFY)).rows.map((r) => [r.check, Number(r.n)]));
const problemRows = (m) => [...m].filter(([k]) => k.startsWith('PROBLEM'));
await test('verify script: every PROBLEM row is 0 on a correct backfill (and there are many checks)', async () => {
  const m = await verifyMap(); const problems = problemRows(m);
  assert.ok(problems.length >= 25, `only ${problems.length} PROBLEM checks`);
  problems.forEach(([k, n]) => assert.equal(n, 0, `${k} = ${n}`));
  // tenant-level counts agree for our tenant
  assert.equal(m.get(`TENANT bf-${sfx}: completed sales with lines`), m.get(`TENANT bf-${sfx}: TCZ headers`));
});

// ---- every injected fault must be caught by the named check (rolled back after each) -------------
const tenant2 = await prisma.tenant.create({ data: { name: `BF2-${sfx}`, slug: `bf2-${sfx}` } });
await test('verify script catches EVERY injected fault (missing/orphan/duplicate/collision, tenant, DocNum, outlet, dates, totals, lines, qty, product, tender, indexes)', async () => {
  const S1 = live[1]; const S0 = live[0]; const SM = live[7]; // single-line card sale, cash sale, 3-line sale
  const hdr = (sid) => `(select "DocEntry" from "TCZ_OPOS" where "SaleId"='${sid}')`;
  const faults = [
    ['missing header', 'NO TCZ header', `delete from "TCZ_OPOS" where "SaleId"='${S1}'`],
    ['bill-number collision', 'ANOTHER header', `delete from "TCZ_OPOS" where "SaleId"='${S1}'; insert into "TCZ_OPOS"("TenantId","DocNum") select "tenantId","billNo" from "Sale" where id='${S1}'`],
    ['header without lines', 'TCZ header with no lines', `delete from "TCZ_POS1" where "DocEntry"=${hdr(S1)}`],
    ['orphan header', 'orphan headers', `update "TCZ_OPOS" set "SaleId"=null where "SaleId"='${S1}'`],
    ['duplicate header per sale', 'SaleId used by more than one', `drop index "TCZ_OPOS_SaleId_key"; insert into "TCZ_OPOS"("TenantId","SaleId","DocNum") select "TenantId","SaleId",'DUP-1' from "TCZ_OPOS" where "SaleId"='${S1}'`],
    ['duplicate bill number', 'bill number) used by more than one', `drop index "TCZ_OPOS_TenantId_DocNum_key"; insert into "TCZ_OPOS"("TenantId","DocNum") select "TenantId","DocNum" from "TCZ_OPOS" where "SaleId"='${S1}'`],
    ['header of a non-completed sale', 'sale is not COMPLETED', `update "Sale" set status='HELD' where id='${S1}'`],
    ['unique index dropped', 'indexes missing', `drop index "TCZ_OPOS_TenantId_ClientToken_key"`],
    ['wrong tenant', 'header tenant differs', `update "TCZ_OPOS" set "TenantId"='${tenant2.id}' where "SaleId"='${S1}'`],
    ['wrong DocNum', 'DocNum differs', `update "TCZ_OPOS" set "DocNum"='WRONG-1' where "SaleId"='${S1}'`],
    ['wrong outlet', 'outlet differs', `update "TCZ_OPOS" set "OutletId"=null where "SaleId"='${S1}'`],
    ['CreateDate shifted 5h30', 'CreateDate missing or more than 60 s', `update "TCZ_OPOS" set "CreateDate"="CreateDate"+interval '5 hours 30 minutes' where "SaleId"='${S1}'`],
    ['CreateDate NULL', 'CreateDate missing or more than 60 s', `update "TCZ_OPOS" set "CreateDate"=null where "SaleId"='${S1}'`],
    ['CreateTime left in UTC (the old convention)', 'CreateTime missing or not the IST', `update "TCZ_OPOS" set "CreateTime"=("CreateDate" AT TIME ZONE 'UTC')::time where "SaleId"='${S1}'`],
    ['CreateTime off by one hour', 'CreateTime missing or not the IST', `update "TCZ_OPOS" set "CreateTime"="CreateTime"+interval '1 hour' where "SaleId"='${S1}'`],
    ['CreateTime off by one second', 'CreateTime missing or not the IST', `update "TCZ_OPOS" set "CreateTime"="CreateTime"+interval '1 second' where "SaleId"='${S1}'`],
    ['CreateTime NULL', 'CreateTime missing or not the IST', `update "TCZ_OPOS" set "CreateTime"=null where "SaleId"='${S1}'`],
    ['CreateDate moved 30 min while CreateTime did not (they must agree)', 'CreateTime missing or not the IST', `update "TCZ_OPOS" set "CreateDate"="CreateDate"+interval '30 minutes' where "SaleId"='${S1}'`],
    ['GrandTotal NULL', 'GrandTotal differs', `update "TCZ_OPOS" set "GrandTotal"=null where "SaleId"='${S1}'`],
    ['GrandTotal changed', 'GrandTotal differs', `update "TCZ_OPOS" set "GrandTotal"="GrandTotal"+1 where "SaleId"='${S1}'`],
    ['Paid changed', 'Paid <>', `update "TCZ_OPOS" set "Paid"="Paid"+1 where "SaleId"='${S1}'`],
    ['Balance changed', 'Balance <>', `update "TCZ_OPOS" set "Balance"="Balance"+1 where "SaleId"='${S1}'`],
    ['line total changed', 'sum(LineTotal) differs', `update "TCZ_POS1" set "LineTotal"="LineTotal"+1 where ("DocEntry","LineId")=(${hdr(S1)},1)`],
    ['line deleted', 'line count differs', `delete from "TCZ_POS1" where ("DocEntry","LineId")=(${hdr(SM)},3)`],
    ['LineId gap', 'LineId is not 1..n', `update "TCZ_POS1" set "LineId"=9 where ("DocEntry","LineId")=(${hdr(SM)},3)`],
    ['quantity changed', 'sum(Quantity) differs', `update "TCZ_POS1" set "Quantity"="Quantity"+5 where ("DocEntry","LineId")=(${hdr(S1)},1)`],
    ['ProductId swapped', 'set of ProductIds differs', `update "TCZ_POS1" set "ProductId"='${p3.id}' where ("DocEntry","LineId")=(${hdr(S1)},1) and "ProductId"<>'${p3.id}'`],
    ['two lines swap quantities (sums/products unchanged)', 'some line differs from the sale line', `update "TCZ_POS1" p set "Quantity"=q."Quantity" from "TCZ_POS1" q where p."DocEntry"=${hdr(SM)} and q."DocEntry"=p."DocEntry" and ((p."LineId",q."LineId") in ((1,2),(2,1)))`],
    ['tender moved Cash -> Card', 'tender columns (Cash', `update "TCZ_OPOS" set "Card"="Cash","Cash"=0 where "SaleId"='${S0}'`],
    ['payment method spelling variant', 'not one of the 9 known values', `update "Sale" set "paymentMethod"='CASH' where id='${S0}'`],
    ['tenant count drift', 'tenants whose TCZ header count differs', `delete from "TCZ_OPOS" where "SaleId"='${S1}'`],
  ];
  const base = await verifyMap();
  const results = [];
  for (const [name, check, sql] of faults) {
    await db.query('BEGIN');
    let m;
    try { await db.query(sql); m = await verifyMap(); } finally { await db.query('ROLLBACK'); }
    const keys = [...m.keys()].filter((k) => k.includes(check));
    assert.equal(keys.length, 1, `fault "${name}": check text "${check}" matches ${keys.length} rows`);
    const n = m.get(keys[0]);
    results.push(`${name} -> ${n}`);
    assert.ok(n >= 1, `fault "${name}" NOT caught by "${keys[0]}" (n=${n}); other problems: ${problemRows(m).filter(([, v]) => v > 0).map(([k]) => k).join('; ') || 'none'}`);
    if (name === 'missing header') assert.equal(m.get(`TENANT bf-${sfx}: TCZ headers`), base.get(`TENANT bf-${sfx}: TCZ headers`) - 1);
  }
  // all rolled back: database is clean again
  problemRows(await verifyMap()).forEach(([k, n]) => assert.equal(n, 0, `${k} = ${n} after rollback`));
  console.log(`       ${faults.length} injected faults, all caught`);
});

// ---- collision: never resolved silently ------------------------------------------------------
const oldSale = (billNo, extra = {}) => prisma.sale.create({ data: {
  tenantId: tenant.id, outletId: outlet.id, billNo, customerName: 'Legacy', cashierName: 'old', subTotal: 100, discountAmount: 0, taxAmount: 5, grandTotal: 105,
  paymentMethod: 'cash', receivedAmount: 105, ...extra,
  lines: { create: [{ productId: p2.id, code: 'P2', name: 'Item P2', uom: 'KG', qty: 2, price: 50, taxRate: 0.05, amount: 100 }] },
} });
await test('bill-number collision: sale is skipped, NOT silently resolved; diagnostic lists it; verify flags it; history untouched', async () => {
  const sale = await oldSale('OLD-COLL');
  const blocker = (await db.query(`insert into "TCZ_OPOS"("TenantId","DocNum","GrandTotal","CreatedBy") values ($1,'OLD-COLL',999,'imported') returning "DocEntry"`, [tenant.id])).rows[0].DocEntry;
  const salesBefore = await fp();
  await run(); await run();
  assert.equal(await count('select count(*) n from "TCZ_OPOS" where "SaleId"=$1', [sale.id]), 0, 'colliding sale must not be copied');
  const b = (await db.query('select "SaleId","GrandTotal","CreatedBy" from "TCZ_OPOS" where "DocEntry"=$1', [blocker])).rows[0];
  assert.deepEqual([b.SaleId, Number(b.GrandTotal), b.CreatedBy], [null, 999, 'imported'], 'blocking header must be untouched');
  assert.equal(await count('select count(*) n from "TCZ_POS1" where "DocEntry"=$1', [blocker]), 0);
  assert.deepEqual(await fp(), salesBefore, 'no sale data changed');
  const [tz, dry, coll, pay] = await db.query(DIAGNOSE);
  assert.equal(tz.rows.length, 1); assert.ok(tz.rows[0].session_timezone);
  assert.ok(Number(dry.rows.find((r) => r.what.startsWith('skipped: bill-number collision')).sales) >= 1);
  const row = coll.rows.find((r) => r.sale_id === sale.id);
  assert.ok(row, 'collision list must contain the sale');
  assert.equal(String(row.blocking_doc_entry), String(blocker)); assert.match(row.reason, /orphan header/);
  assert.ok(pay.rows.some((r) => r.payment_method_as_stored === '[cash]'));
  const m = await verifyMap();
  assert.ok(m.get([...m.keys()].find((k) => k.includes('ANOTHER header'))) >= 1);
  assert.ok(m.get([...m.keys()].find((k) => k.includes('NO TCZ header'))) >= 1);
  assert.ok(m.get([...m.keys()].find((k) => k.includes('orphan headers'))) >= 1);
  // a person resolves it (here: removes the stray header); the next run copies the sale
  await db.query('delete from "TCZ_OPOS" where "DocEntry"=$1', [blocker]);
  await run();
  assert.equal(await count('select count(*) n from "TCZ_OPOS" where "SaleId"=$1', [sale.id]), 1);
  problemRows(await verifyMap()).forEach(([k, n]) => assert.equal(n, 0, `${k} = ${n}`));
});

await test('payment-method spelling variant is NOT normalised (Sale untouched), is reported by verify and diagnostic', async () => {
  const sale = await oldSale('OLD-PMVAR', { paymentMethod: 'CASH ' });
  await run();
  const h = (await db.query('select "Cash","Card","UPI","Wallet","Paid" from "TCZ_OPOS" where "SaleId"=$1', [sale.id])).rows[0];
  assert.deepEqual([Number(h.Cash), Number(h.Card), Number(h.UPI), Number(h.Wallet), Number(h.Paid)], [0, 0, 0, 0, 105]);
  assert.equal((await prisma.sale.findUnique({ where: { id: sale.id } })).paymentMethod, 'CASH ');
  const m = await verifyMap();
  assert.equal(m.get([...m.keys()].find((k) => k.includes('not one of the 9 known values'))), 1);
  const pay = (await db.query(DIAGNOSE))[3].rows.find((r) => r.payment_method_as_stored === '[CASH ]');
  assert.match(pay.tcz_treatment, /UNRECOGNISED/);
  // clean up so later checks stay green: restore the value a person would fix, re-copy
  await db.query(`update "Sale" set "paymentMethod"='cash' where id=$1`, [sale.id]);
  await db.query('delete from "TCZ_OPOS" where "SaleId"=$1', [sale.id]); await run();
  problemRows(await verifyMap()).forEach(([k, n]) => assert.equal(n, 0, `${k} = ${n}`));
});

// ---- CreateTime IST: midnight / year / leap-day boundaries through the real backfill --------------
const BOUNDARIES = [
  ['2026-10-27T06:20:42.689Z', '11:50:42.689', '2026-10-27'],
  ['2026-10-27T18:29:59.999Z', '23:59:59.999', '2026-10-27'], // last ms of the IST day
  ['2026-10-27T18:30:00.000Z', '00:00:00.000', '2026-10-28'], // IST midnight (UTC date still the 27th)
  ['2026-10-27T23:59:59.999Z', '05:29:59.999', '2026-10-28'], // UTC day end
  ['2026-10-28T00:00:00.000Z', '05:30:00.000', '2026-10-28'], // UTC midnight
  ['2026-12-31T18:29:59.999Z', '23:59:59.999', '2026-12-31'], // last ms of 2026 IST
  ['2026-12-31T18:30:00.000Z', '00:00:00.000', '2027-01-01'], // year boundary
  ['2026-12-31T23:59:59.999Z', '05:29:59.999', '2027-01-01'],
  ['2028-02-28T18:30:00.000Z', '00:00:00.000', '2028-02-29'], // leap day starts
  ['2028-02-29T18:29:59.999Z', '23:59:59.999', '2028-02-29'],
  ['2028-02-29T18:30:00.000Z', '00:00:00.000', '2028-03-01'], // leap day ends
  ['2027-02-28T18:30:00.000Z', '00:00:00.000', '2027-03-01'], // non-leap Feb -> Mar
];
await test('IST CreateTime at midnight, year-end and leap-day boundaries (backfill): time, IST date and exact instant', async () => {
  const sales = [];
  for (const [i, [iso]] of BOUNDARIES.entries()) sales.push(await oldSale(`BND-${i}`, { createdAt: new Date(iso) }));
  await run();
  for (const [i, [iso, time, date]] of BOUNDARIES.entries()) {
    const r = (await db.query(`select to_char("CreateTime",'HH24:MI:SS.MS') t,
        ("CreateDate" at time zone 'Asia/Kolkata')::date::text ist_date,
        to_char("CreateDate" at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') utc_instant
      from "TCZ_OPOS" where "SaleId"=$1`, [sales[i].id])).rows[0];
    assert.deepEqual([r.t, r.ist_date, r.utc_instant], [time, date, iso], `boundary ${iso}`);
  }
  problemRows(await verifyMap()).forEach(([k, n]) => assert.equal(n, 0, `${k} = ${n}`));
});
await test('verify results and stored CreateTime do not depend on the database SESSION time zone (only the TimeZone INFO row reports it)', async () => {
  const isTzRow = ([k]) => k.startsWith('INFO: database TimeZone');
  const base = [...(await verifyMap())].filter((r) => !isTzRow(r));
  const baseTimes = (await db.query(`select "DocNum", "CreateTime"::text t from "TCZ_OPOS" order by "DocEntry"`)).rows;
  const offsets = { UTC: 0, 'Asia/Kolkata': 19800, 'America/Los_Angeles': -25200 };
  for (const zone of ['America/Los_Angeles', 'Asia/Kolkata', 'Pacific/Auckland', 'UTC']) {
    await db.query(`set timezone = '${zone}'`);
    try {
      const m = await verifyMap();
      assert.deepEqual([...m].filter((r) => !isTzRow(r)), base, `verify output changes under session zone ${zone}`);
      const row = [...m].find(isTzRow); assert.ok(row[0].includes(zone), `INFO row names the zone ${zone}`);
      if (zone in offsets && zone !== 'America/Los_Angeles') assert.equal(row[1], offsets[zone]);
      assert.deepEqual((await db.query(`select "DocNum", "CreateTime"::text t from "TCZ_OPOS" order by "DocEntry"`)).rows, baseTimes);
    } finally { await db.query('reset timezone'); }
  }
});

// ---- concurrency -----------------------------------------------------------------------------
const mkClient = async () => { const c = new pg.Client({ connectionString: process.env.DATABASE_URL }); await c.connect(); return c; };
const slowCommit = (sql) => sql.replace(/^COMMIT;/m, 'SELECT pg_sleep(3);\nCOMMIT;');
const inserted = (res) => (Array.isArray(res) ? res : [res]).filter((r) => r.command === 'INSERT').map((r) => r.rowCount);
await test('CONTROL: without the advisory lock two simultaneous runs collide (proves the concurrency test is sensitive)', async () => {
  const noLock = BACKFILL.replace(/SELECT pg_advisory_xact_lock[^;]*;/, '');
  assert.notEqual(noLock, BACKFILL);
  for (const n of ['CC-1', 'CC-2', 'CC-3']) await oldSale(n);
  const A = await mkClient(); const B = await mkClient();
  try {
    const before = await headers();
    const pa = A.query(slowCommit(noLock)); await sleep(800);
    let err; try { await B.query(noLock); } catch (e) { err = e; }
    await B.query('ROLLBACK').catch(() => {});
    await pa;
    assert.equal(err?.code, '23505', `expected a duplicate-key failure, got ${err?.message}`);
    assert.equal(await headers(), before + 3, 'the first run still committed exactly its 3 sales');
  } finally { await A.end(); await B.end(); }
});
await test('CONCURRENT backfill runs serialize: second run waits, then inserts 0 rows; no error, no duplicates', async () => {
  for (const n of ['CL-1', 'CL-2', 'CL-3']) await oldSale(n);
  const A = await mkClient(); const B = await mkClient();
  try {
    const before = await headers();
    const pa = A.query(slowCommit(BACKFILL)); await sleep(800);
    const t0 = Date.now(); const rb = await B.query(BACKFILL); const waited = Date.now() - t0;
    const ra = await pa;
    assert.ok(waited >= 1500, `second run should have waited for the first (waited ${waited} ms)`);
    assert.deepEqual(inserted(rb), [0, 0], 'second run inserts nothing');
    assert.equal(inserted(ra)[0], 3);
    assert.equal(await headers(), before + 3);
  } finally { await A.end(); await B.end(); }
  problemRows(await verifyMap()).forEach(([k, n]) => assert.equal(n, 0, `${k} = ${n}`));
});
await test('FIVE simultaneous runs: every sale copied exactly once, all succeed', async () => {
  for (const n of ['CM-1', 'CM-2', 'CM-3', 'CM-4', 'CM-5', 'CM-6']) await oldSale(n);
  const cs = await Promise.all([1, 2, 3, 4, 5].map(mkClient));
  try {
    const before = await headers();
    const res = await Promise.all(cs.map((c) => c.query(BACKFILL)));
    assert.equal(res.map((r) => inserted(r)[0]).reduce((a, b) => a + b, 0), 6, 'total inserted across runs');
    assert.equal(await headers(), before + 6);
    assert.equal(await count(`select count(*) n from (select "SaleId" from "TCZ_OPOS" where "SaleId" is not null group by 1 having count(*)>1) d`), 0);
  } finally { await Promise.all(cs.map((c) => c.end())); }
  problemRows(await verifyMap()).forEach(([k, n]) => assert.equal(n, 0, `${k} = ${n}`));
});
await test('after backfill: a new live sale still works (no DocNum/SaleId clash) and gets its own TCZ rows with InStock', async () => {
  const r = await sell({ lines: L([p2, 1]), clientToken: `bf-${sfx}-new-1` });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  const row = (await db.query('select p."InStock" from "TCZ_POS1" p join "TCZ_OPOS" o using("DocEntry") where o."SaleId"=$1', [r.data.id])).rows[0];
  assert.notEqual(row.InStock, null);
});
await test('Sales Return against a BACKFILLED sale still works and does not touch TCZ', async () => {
  const sale = (await db.query(`select s.id, s."billNo" from "Sale" s where s."tenantId"=$1 and s."billNo"='LS-00001'`, [tenant.id])).rows[0];
  const inv = (await api('GET', `/sales-returns/lookup/${sale.billNo}`)).data;
  const tczBefore = JSON.stringify((await db.query('select p.* from "TCZ_POS1" p join "TCZ_OPOS" o using("DocEntry") where o."SaleId"=$1 order by p."LineId"', [sale.id])).rows);
  const r = await api('POST', '/sales-returns', { saleId: inv.saleId, items: [{ saleLineId: inv.items[0].saleLineId, qty: 1 }], reason: 'damaged', refundMode: 'refund', refundTo: 'cash' });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  const tczAfter = JSON.stringify((await db.query('select p.* from "TCZ_POS1" p join "TCZ_OPOS" o using("DocEntry") where o."SaleId"=$1 order by p."LineId"', [sale.id])).rows);
  assert.equal(tczAfter, tczBefore);
});
await test('a sale saved by an OLD backend after migration (no TCZ rows) is picked up by a later re-run', async () => {
  const s = await prisma.sale.create({ data: { tenantId: tenant.id, billNo: 'OLD-LATE', customerName: 'x', cashierName: 'old', subTotal: 50, taxAmount: 2.5, grandTotal: 52.5, paymentMethod: 'upi', receivedAmount: 52.5,
    lines: { create: [{ productId: p2.id, code: 'P2', name: 'Item P2', uom: 'KG', qty: 1, price: 50, taxRate: 0.05, amount: 50 }] } } });
  const n = await headers(); await run();
  assert.equal(await headers(), n + 1);
  const h = (await db.query('select "UPI","Paid","Balance" from "TCZ_OPOS" where "SaleId"=$1', [s.id])).rows[0];
  assert.deepEqual([Number(h.UPI), Number(h.Paid), Number(h.Balance)], [52.5, 52.5, 0]);
});
console.log(`\n${passed} passed, ${failures.length} failed`);
await db.end(); await prisma.$disconnect(); server.close(); process.exit(failures.length ? 1 : 0);
