// Integration test for the Shift-to-Shift Variance Report — runs the REAL express
// app against a real Postgres, seeding its own throwaway tenant. Refuses to run
// unless DATABASE_URL is local (never the shared Azure database).
//   DATABASE_URL=postgresql://postgres@localhost:5432/nexora_test npm run test:shift-variance
import 'dotenv/config';
import assert from 'node:assert/strict';
import http from 'node:http';

if (!/@(localhost|127\.0\.0\.1)[:/]/.test(process.env.DATABASE_URL || '')) {
  console.error('Refusing to run: DATABASE_URL must point at a LOCAL test database.');
  process.exit(2);
}
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-test-secret-123';
process.env.NODE_ENV = 'test';

const { app } = await import('../src/app.js');
const { prisma } = await import('../src/config/prisma.js');
const jwt = (await import('jsonwebtoken')).default;
const server = http.createServer(app);
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}/api`;

let passed = 0;
const failures = [];
async function test(name, fn) {
  try { await fn(); passed += 1; console.log(`  ok   ${name}`); } catch (e) { failures.push(name); console.log(`  FAIL ${name}\n       ${e.message}`); }
}

const suffix = Date.now().toString(36);
const tenant = await prisma.tenant.create({ data: { name: `T-${suffix}`, slug: `t-${suffix}` } });
const other = await prisma.tenant.create({ data: { name: `O-${suffix}`, slug: `o-${suffix}` } });
const outletA = await prisma.outlet.create({ data: { tenantId: tenant.id, code: 'A', name: 'Outlet A' } });
const outletB = await prisma.outlet.create({ data: { tenantId: tenant.id, code: 'B', name: 'Outlet B' } });

const tok = (t, outletId, role = 'ADMIN') => jwt.sign(
  { id: 'u1', tenantId: t.id, username: 'u1', name: 'U One', role, outletId }, process.env.JWT_SECRET,
);
const admin = tok(tenant, outletA.id);
const cashierRole = tok(tenant, outletA.id, 'CASHIER');
const foreign = tok(other, null);
const api = async (path, token = admin) => {
  const res = await fetch(`${base}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, data: json.data, body: json };
};

const D = (day, h, m = 0) => new Date(2026, 2, day, h, m); // local time, March 2026
let billSeq = 0;
const sale = (outletId, at, paymentMethod, grandTotal, receivedAmount, extra = {}) => prisma.sale.create({
  data: {
    tenantId: tenant.id, outletId, billNo: `B-${suffix}-${++billSeq}`, cashierName: 'x', paymentMethod,
    grandTotal, subTotal: grandTotal, receivedAmount, changeAmount: receivedAmount - grandTotal, createdAt: at, ...extra,
  },
});
let shiftSeq = 0;
const shift = (data) => prisma.shiftSession.create({
  data: {
    tenantId: tenant.id, shiftDate: data.openedAt, startTime: '09:00', cashierId: 'c', cashierName: 'Cashier', agreedTerms: true,
    shiftNo: String(++shiftSeq).padStart(2, '0'), ...data,
  },
});
const move = (model, shiftRow, amount, at, extra = {}) => prisma[model].create({
  data: {
    tenantId: tenant.id, outletId: shiftRow.outletId, shiftSessionId: shiftRow.id, referenceNo: `R-${suffix}-${++billSeq}`,
    purpose: 'p', amount, cashierId: 'c', cashierName: 'Cashier', createdAt: at, ...extra,
  },
});

// ---- S1 (A, cashier A): 1000 open; cash sales net 500 (paid 600, change 100) + 200; card 300; upi 150;
//      cash refund 50; withdrawal 100; deposit 200; transfer 50  => expected 1300, counted 1290 => −10
const s1 = await shift({ outletId: outletA.id, cashierId: 'A', cashierName: 'Alice', openedAt: D(10, 9), closedAt: D(10, 17), status: 'CLOSED', openingCash: 1000, closingCash: 1290, expectedClosingCash: 1300, closingVariance: -10 });
const cs1 = await sale(outletA.id, D(10, 10), 'cash', 500, 600);
await sale(outletA.id, D(10, 11), 'cash', 200, 200);
await sale(outletA.id, D(10, 12), 'card', 300, 300);
await sale(outletA.id, D(10, 13), 'upi', 150, 150);
await sale(outletA.id, D(10, 14), 'cash', 999, 999, { status: 'HELD' }); // must be ignored
await prisma.salesReturn.create({ data: { tenantId: tenant.id, returnNo: `RT-${suffix}-1`, saleId: cs1.id, cashierName: 'x', reason: 'r', refundMode: 'refund', refundTo: 'cash', grandTotal: 50, createdAt: D(10, 15) } });
await prisma.salesReturn.create({ data: { tenantId: tenant.id, returnNo: `RT-${suffix}-2`, saleId: cs1.id, cashierName: 'x', reason: 'r', refundMode: 'credit-note', grandTotal: 40, createdAt: D(10, 15, 30) } }); // credit note: no cash
await move('cashWithdrawal', s1, 100, D(10, 11, 30));
await move('cashDeposit', s1, 200, D(10, 12, 30));
await move('cashTransfer', s1, 50, D(10, 13, 30), { toLocation: 'Petty Cash Box' });

// ---- S2 (A, cashier B): crosses midnight. Opens 1300 (declared 1290 → handover +10); cash 100 at 23:50 and 80 at 00:30 (+1 day);
//      expected 1480, counted 1500 => +20
const s2 = await shift({ outletId: outletA.id, cashierId: 'B', cashierName: 'Bob', openedAt: D(10, 17, 30), closedAt: D(11, 1, 30), status: 'CLOSED', openingCash: 1300, closingCash: 1500 });
await sale(outletA.id, D(10, 23, 50), 'cash', 100, 100);
await sale(outletA.id, D(11, 0, 30), 'cash', 80, 100);
// ---- S3 (A, cashier A): closed but closing count missing (legacy row)
const s3 = await shift({ outletId: outletA.id, cashierId: 'A', cashierName: 'Alice', openedAt: D(11, 6), closedAt: D(11, 14), status: 'CLOSED', openingCash: 1500, closingCash: null });
// ---- S4 (A): still OPEN
const s4 = await shift({ outletId: outletA.id, cashierId: 'B', cashierName: 'Bob', openedAt: D(11, 15), status: 'OPEN', openingCash: 1400 });
await sale(outletA.id, D(11, 16), 'cash', 60, 60); // open shift: counted so far, window ends at now
// ---- S5 (B): closed exactly balanced, no following shift → pending handover
const s5 = await shift({ outletId: outletB.id, cashierId: 'C', cashierName: 'Carl', openedAt: D(10, 9), closedAt: D(10, 18), status: 'CLOSED', openingCash: 500, closingCash: 750 });
await sale(outletB.id, D(10, 12), 'cash', 250, 250);
// foreign tenant noise that must never leak
await prisma.outlet.create({ data: { tenantId: other.id, code: 'X', name: 'Foreign' } });

const q = (extra = '') => `/shift-variance?from=2026-03-10&to=2026-03-11&pageSize=100${extra}`;
const byId = (rows, id) => rows.find((r) => r.id === id);

console.log('\nShift-to-Shift Variance — integration tests');

await test('1. normal handover + shortage: S1 figures and both variances kept separate', async () => {
  const r = await api(q());
  assert.equal(r.status, 200, JSON.stringify(r.body));
  const row = byId(r.data.rows, s1.id);
  assert.equal(row.openingCash, 1000);
  assert.equal(row.cashSales, 700); // 500 (not the 600 tendered) + 200
  assert.equal(row.cashRefunds, 50); // credit note excluded
  assert.equal(row.cashPaidOut, 350);
  assert.equal(row.cashWithdrawals, 100); assert.equal(row.cashDeposits, 200); assert.equal(row.cashTransfers, 50);
  assert.equal(row.expectedClosingCash, 1300);
  assert.equal(row.actualClosingCash, 1290);
  assert.equal(row.closingVariance, -10);
  assert.equal(row.closingStatus, 'SHORT');
  assert.equal(row.handover.declared, 1290);
  assert.equal(row.handover.acknowledged, 1300);
  assert.equal(row.handover.variance, 10);
  assert.equal(row.handover.status, 'EXCESS');
  assert.equal(row.nextShift.id, s2.id); assert.equal(row.previousShift, null);
  assert.equal(row.card.sales, 300); assert.equal(row.upi.sales, 150);
  assert.equal(row.cardUpiReconciliation, 'NOT_TRACKED'); assert.equal(row.approvalStatus, 'NOT_TRACKED');
  assert.equal(row.register, null);
  assert.equal(row.recordedAtClose.differsFromRecomputed, false);
});

await test('2. HELD-status sales and credit-note returns are not counted; sale counts exclude them', async () => {
  const row = byId((await api(q())).data.rows, s1.id);
  assert.equal(row.totalSales, 1150); // 500+200+300+150
  assert.equal(row.transactionCount, 4 + 1 + 3);
});

await test('3. shift crossing midnight keeps every sale and belongs to its opening day; cash excess', async () => {
  const row = byId((await api(q())).data.rows, s2.id);
  assert.equal(row.businessDate, '2026-03-10');
  assert.equal(row.crossesMidnight, true);
  assert.equal(row.cashSales, 180);
  assert.equal(row.expectedClosingCash, 1480);
  assert.equal(row.closingVariance, 20);
  assert.equal(row.closingStatus, 'EXCESS');
  assert.equal(row.previousShift.id, s1.id);
  assert.equal(row.handover.variance, 0); assert.equal(row.handover.status, 'MATCHED'); // 1500 → S3 opens 1500
});

await test('4. missing cash count: no fabricated variance, handover flagged', async () => {
  const row = byId((await api(q())).data.rows, s3.id);
  assert.equal(row.actualClosingCash, null);
  assert.equal(row.closingVariance, null);
  assert.equal(row.closingStatus, 'MISSING_COUNT');
  assert.equal(row.handover.status, 'MISSING_COUNT');
  assert.equal(row.handover.variance, null);
});

await test('5. open shift: live expected cash only, no variance / handover', async () => {
  const row = byId((await api(q())).data.rows, s4.id);
  assert.equal(row.shiftStatus, 'OPEN');
  assert.equal(row.cashSales, 60);
  assert.equal(row.expectedClosingCash, 1460);
  assert.equal(row.closingVariance, null);
  assert.equal(row.closingStatus, 'OPEN');
  assert.equal(row.handover.status, 'NOT_CLOSED');
});

await test('6. pending handover (no following shift) at outlet B; outlet filter works', async () => {
  const all = await api(q('&outletId=all'));
  const row = byId(all.data.rows, s5.id);
  assert.equal(row.handover.status, 'PENDING');
  assert.equal(row.handover.acknowledged, null);
  assert.equal(row.closingVariance, 0); assert.equal(row.closingStatus, 'BALANCED');
  assert.equal(row.outletName, 'Outlet B');
  const onlyB = await api(q(`&outletId=${outletB.id}`));
  assert.deepEqual(onlyB.data.rows.map((x) => x.id), [s5.id]);
  const def = await api(q()); // default = caller's own outlet
  assert.ok(!byId(def.data.rows, s5.id));
});

await test('7. summary cards over real data', async () => {
  const s = (await api(q('&outletId=all'))).data.summary;
  assert.equal(s.shifts, 5);
  assert.equal(s.totalShortage, 10); assert.equal(s.shortageCount, 1);
  assert.equal(s.totalExcess, 20); assert.equal(s.excessCount, 1);
  assert.equal(s.pendingHandovers, 1); assert.equal(s.pendingHandoverAmount, 750);
  assert.equal(s.netHandoverVariance, 10);
  assert.equal(s.unresolvedVariances, 2); // S1 and S2
  assert.equal(s.missingCounts, 1);
});

await test('8. status / cashier / date filters (cards unaffected by status)', async () => {
  const short = await api(q('&outletId=all&status=shortage'));
  assert.deepEqual(short.data.rows.map((x) => x.id), [s1.id]);
  assert.equal(short.data.summary.shifts, 5);
  assert.deepEqual((await api(q('&outletId=all&status=excess'))).data.rows.map((x) => x.id).sort(), [s1.id, s2.id].sort());
  assert.deepEqual((await api(q('&outletId=all&status=pending'))).data.rows.map((x) => x.id).sort(), [s4.id, s5.id].sort());
  assert.deepEqual((await api(q('&outletId=all&status=missing'))).data.rows.map((x) => x.id), [s3.id]);
  assert.deepEqual((await api(q('&outletId=all&status=balanced'))).data.rows.map((x) => x.id), []);
  assert.deepEqual((await api(q('&cashierId=B'))).data.rows.map((x) => x.id).sort(), [s2.id, s4.id].sort());
  const one = await api('/shift-variance?from=2026-03-11&to=2026-03-11');
  assert.deepEqual(one.data.rows.map((x) => x.id).sort(), [s3.id, s4.id].sort());
  assert.equal(byId(one.data.rows, s3.id).previousShift.id, s2.id); // neighbour outside the range still found
});

await test('9. totals reconcile with the underlying database rows (independent recomputation)', async () => {
  const rows = (await api(q('&outletId=all'))).data.rows;
  for (const r of rows) {
    const sh = await prisma.shiftSession.findUnique({ where: { id: r.id } });
    const end = sh.closedAt || new Date();
    const sales = await prisma.sale.findMany({ where: { tenantId: tenant.id, outletId: sh.outletId, status: 'COMPLETED', createdAt: { gte: sh.openedAt, lte: end } } });
    const cash = sales.filter((x) => x.paymentMethod === 'cash').reduce((a, x) => a + Number(x.receivedAmount) - Math.max(Number(x.changeAmount), 0), 0);
    const refunds = (await prisma.salesReturn.findMany({ where: { tenantId: tenant.id, refundMode: 'refund', refundTo: 'cash', createdAt: { gte: sh.openedAt, lte: end }, sale: { outletId: sh.outletId } } }))
      .reduce((a, x) => a + Number(x.grandTotal), 0);
    const sum = async (m) => (await prisma[m].aggregate({ where: { shiftSessionId: sh.id }, _sum: { amount: true } }))._sum.amount || 0;
    const expected = Number(sh.openingCash) + cash - refunds - Number(await sum('cashWithdrawal')) - Number(await sum('cashDeposit')) - Number(await sum('cashTransfer'));
    assert.equal(r.expectedClosingCash, Math.round(expected * 100) / 100, `shift ${r.shiftNo}`);
    assert.equal(r.totalSales, sales.reduce((a, x) => a + Number(x.grandTotal), 0), `shift ${r.shiftNo} total`);
  }
});

await test('10. drill-down transactions reconcile to the expected closing cash', async () => {
  for (const s of [s1, s2, s3, s5]) {
    const r = await api(`/shift-variance/${s.id}/transactions`);
    assert.equal(r.status, 200);
    const row = byId((await api(q('&outletId=all'))).data.rows, s.id);
    assert.equal(r.data.cashTotal, row.expectedClosingCash, `shift ${s.shiftNo}`);
    assert.equal(new Set(r.data.items.map((i) => `${i.type}:${i.id}`)).size, r.data.items.length); // no duplicates
  }
  const d1 = (await api(`/shift-variance/${s1.id}/transactions`)).data;
  assert.deepEqual(d1.items.map((i) => i.type).sort(), ['DEPOSIT', 'OPENING', 'REFUND', 'SALE', 'SALE', 'SALE', 'SALE', 'TRANSFER', 'WITHDRAWAL']);
});

await test('11. isolation: other tenant sees nothing; non-admin pinned to own outlet; bad ids/params rejected', async () => {
  assert.equal((await api(`/shift-variance/${s1.id}/transactions`, foreign)).status, 404);
  const f = await api(q('&outletId=all'), foreign);
  assert.equal(f.status, 200); assert.equal(f.data.rows.length, 0); // sees none of our tenant's shifts
  assert.equal((await api(q(), foreign)).status, 400); // and with no outlet in its session there is nothing to default to
  const ca = await api(q(`&outletId=${outletB.id}`), cashierRole);
  assert.ok(!byId(ca.data.rows, s5.id)); // non-admin cannot switch outlet
  assert.equal((await api(`/shift-variance/${s5.id}/transactions`, cashierRole)).status, 404);
  assert.equal((await api(q('&outletId=nope'))).status, 404);
  assert.equal((await api('/shift-variance?from=2026-03-11&to=2026-03-10')).status, 400);
  assert.equal((await api('/shift-variance?from=2025-01-01&to=2026-03-10')).status, 400);
  assert.equal((await api('/shift-variance?status=bogus')).status, 400);
  assert.equal((await fetch(`${base}/shift-variance`)).status, 401);
});

await test('12. nothing was modified: sales/payments untouched by reading the report', async () => {
  const before = await prisma.sale.aggregate({ where: { tenantId: tenant.id }, _sum: { grandTotal: true, receivedAmount: true }, _count: true });
  await api(q('&outletId=all'));
  await api(`/shift-variance/${s1.id}/transactions`);
  const after = await prisma.sale.aggregate({ where: { tenantId: tenant.id }, _sum: { grandTotal: true, receivedAmount: true }, _count: true });
  assert.deepEqual(after, before);
});

console.log(`\n${passed} passed, ${failures.length} failed`);
server.close();
await prisma.$disconnect();
process.exit(failures.length ? 1 : 0);
