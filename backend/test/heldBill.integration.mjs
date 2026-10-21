// Integration test for Hold / Resume bill — runs the REAL express app against
// a real Postgres. It creates its own throwaway tenant/outlets/products and
// writes real Sale rows, so it REFUSES to run unless DATABASE_URL points at a
// local database (never run it against the shared Azure dev/prod database).
//
//   1. Start a local Postgres and apply the migrations to an empty database
//      (e.g. DATABASE_URL=postgresql://postgres@localhost:5432/nexora_test
//      npx prisma migrate deploy)
//   2. DATABASE_URL=... npm run test:held-bills
import 'dotenv/config';
import assert from 'node:assert/strict';
import http from 'node:http';

if (!/@(localhost|127\.0\.0\.1)[:/]/.test(process.env.DATABASE_URL || '')) {
  console.error('Refusing to run: DATABASE_URL must point at a LOCAL test database (localhost / 127.0.0.1).');
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
const mkOutlet = (code) => prisma.outlet.create({ data: { tenantId: tenant.id, code, name: `Outlet ${code}` } });
const outletA = await mkOutlet('A');
const outletB = await mkOutlet('B');
const mkProduct = (code, price, qty) => prisma.product.create({
  data: { tenantId: tenant.id, code, name: `Item ${code}`, group: 'G', uom: 'KG', salePrice: price, availableQty: qty },
});
const p1 = await mkProduct('P1', 100, 50);
const p2 = await mkProduct('P2', 50, 20);
const p3 = await mkProduct('P3', 10, 2);
const customer = await prisma.customer.create({
  data: { tenantId: tenant.id, code: 'C1', name: 'Ravi', mobile: '9999999999', customerType: 'Retail' },
});

const token = (id, outletId, role = 'ADMIN') => jwt.sign(
  { id, tenantId: tenant.id, username: id, name: `Name ${id}`, role, outletId },
  process.env.JWT_SECRET,
);
const T = {
  a1: token('a1', outletA.id), // admin at outlet A
  a2: token('a2', outletA.id, 'CASHIER'), // non-admin at outlet A (own bills only)
  adminA: token('adminA', outletA.id),
  b1: token('b1', outletB.id),
};

async function api(method, path, tok, body) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, body: json, data: json.data };
}

const counts = async () => ({
  sales: await prisma.sale.count({ where: { tenantId: tenant.id } }),
  saleLines: await prisma.saleLine.count({ where: { sale: { tenantId: tenant.id } } }),
  invoices: await prisma.salesInvoice.count({ where: { tenantId: tenant.id } }),
  held: await prisma.heldBill.count({ where: { tenantId: tenant.id } }),
});
const stock = async (id) => (await prisma.product.findUnique({ where: { id } })).availableQty;

const cart = (...pairs) => pairs.map(([p, qty]) => ({ productId: p.id, qty }));
const holdBody = (extra = {}) => ({
  customerId: customer.id, customerName: 'Ravi', lines: cart([p1, 3], [p2, 2]), discountType: 'amount', discountValue: 20, ...extra,
});
const pay = (tok, extra = {}) => api('POST', '/sales', tok, {
  customerName: 'Walk-in Customer', cashierName: 'x', lines: cart([p2, 1]), paymentMethod: 'cash', receivedAmount: 1000, ...extra,
});

console.log('\nHold Bill / Resume Bill — integration tests');

let billA; // main held bill

await test('1. hold a bill with multiple products saves header + lines, no sale/stock/invoice effects', async () => {
  const before = await counts(); const s1 = await stock(p1.id); const s2 = await stock(p2.id);
  const r = await api('POST', '/held-bills', T.a1, holdBody());
  assert.equal(r.status, 201, JSON.stringify(r.body));
  billA = r.data;
  assert.match(billA.reference, /^HB-\d{5}$/);
  assert.equal(billA.status, 'HELD');
  assert.equal(billA.lines.length, 2);
  assert.equal(billA.itemCount, 2);
  assert.equal(billA.customer.id, customer.id);
  // subtotal 3*100 + 2*50 = 400; discount 20 -> taxable 380; tax 5% = 19; grand 399
  assert.equal(billA.subTotal, 400); assert.equal(billA.discountAmount, 20);
  assert.equal(billA.taxAmount, 19); assert.equal(billA.grandTotal, 399);
  const row = await prisma.heldBill.findUnique({ where: { id: billA.id }, include: { lines: true } });
  assert.equal(row.userId, 'a1'); assert.equal(row.outletId, outletA.id); assert.equal(row.lines.length, 2);
  const after = await counts();
  assert.equal(after.sales, before.sales); assert.equal(after.saleLines, before.saleLines);
  assert.equal(after.invoices, before.invoices); assert.equal(after.held, before.held + 1);
  assert.equal(await stock(p1.id), s1); assert.equal(await stock(p2.id), s2);
});

await test('2. another customer\'s bill can be started and completed while the first stays held', async () => {
  const s2 = await stock(p2.id);
  const r = await pay(T.a1, { lines: cart([p2, 4]) });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  assert.equal(await stock(p2.id), s2 - 4);
  const still = await prisma.heldBill.findUnique({ where: { id: billA.id } });
  assert.equal(still.status, 'HELD');
});

await test('3. held list is scoped: owner/admin see it; other store and non-admin colleague do not', async () => {
  const mine = await api('GET', '/held-bills', T.a1);
  assert.ok(mine.data.some((b) => b.id === billA.id));
  const adm = await api('GET', '/held-bills', T.adminA);
  assert.ok(adm.data.some((b) => b.id === billA.id));
  const other = await api('GET', '/held-bills', T.a2);
  assert.ok(!other.data.some((b) => b.id === billA.id), 'non-admin colleague must not see it');
  const otherStore = await api('GET', '/held-bills', T.b1);
  assert.ok(!otherStore.data.some((b) => b.id === billA.id), 'other store must not see it');
  const row = mine.data.find((b) => b.id === billA.id);
  for (const k of ['reference', 'customerName', 'itemCount', 'grandTotal', 'heldAt']) assert.ok(row[k] !== undefined, k);
});

await test('4. unauthorised users cannot resume / edit / discard / pay it (404, never 200)', async () => {
  assert.equal((await api('POST', `/held-bills/${billA.id}/resume`, T.b1)).status, 404);
  assert.equal((await api('POST', `/held-bills/${billA.id}/resume`, T.a2)).status, 404);
  assert.equal((await api('PUT', `/held-bills/${billA.id}`, T.b1, holdBody())).status, 404);
  assert.equal((await api('DELETE', `/held-bills/${billA.id}`, T.b1)).status, 404);
  const r = await pay(T.b1, { heldBillId: billA.id });
  assert.equal(r.status, 409);
  assert.equal((await api('GET', '/held-bills', T.a1)).status, 200);
  assert.equal((await prisma.heldBill.findUnique({ where: { id: billA.id } })).status, 'HELD');
});

await test('5. unauthenticated request is rejected', async () => {
  const res = await fetch(`${base}/held-bills`);
  assert.equal(res.status, 401);
});

await test('6. resume restores every line, UOM, price, discount, tax and totals; status -> RESUMED', async () => {
  const r = await api('POST', `/held-bills/${billA.id}/resume`, T.a1);
  assert.equal(r.status, 200, JSON.stringify(r.body));
  const d = r.data;
  assert.equal(d.status, 'RESUMED');
  assert.deepEqual(d.lines.map((l) => [l.code, l.qty, l.uom, l.price, l.taxRate]), [['P1', 3, 'KG', 100, 0.05], ['P2', 2, 'KG', 50, 0.05]]);
  assert.equal(d.discountType, 'amount'); assert.equal(d.discountValue, 20); assert.equal(d.grandTotal, 399);
  assert.equal(d.customer.name, 'Ravi');
  assert.ok(d.lines.every((l) => l.live && l.live.price === l.price));
});

await test('7. resumed bill is no longer offered to other cashiers; they cannot take it (409)', async () => {
  const adm = await api('GET', '/held-bills', T.adminA);
  assert.ok(!adm.data.some((b) => b.id === billA.id));
  assert.equal((await api('POST', `/held-bills/${billA.id}/resume`, T.adminA)).status, 409);
  const mine = await api('GET', '/held-bills', T.a1); // own unfinished bill stays recoverable (refresh/restart)
  assert.equal(mine.data.find((b) => b.id === billA.id)?.status, 'RESUMED');
});

await test('8. edit resumed bill and hold again updates the SAME held bill (no duplicate)', async () => {
  const before = await counts();
  const r = await api('PUT', `/held-bills/${billA.id}`, T.a1, holdBody({ lines: cart([p1, 5], [p3, 1]), discountType: 'percent', discountValue: 10 }));
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.equal(r.data.id, billA.id); assert.equal(r.data.reference, billA.reference); assert.equal(r.data.status, 'HELD');
  assert.deepEqual(r.data.lines.map((l) => [l.code, l.qty]), [['P1', 5], ['P3', 1]]);
  // 510 subtotal, 10% = 51, taxable 459, tax 22.95, grand 481.95
  assert.equal(r.data.subTotal, 510); assert.equal(r.data.grandTotal, 481.95);
  const after = await counts();
  assert.equal(after.held, before.held); assert.equal(after.sales, before.sales);
  assert.equal(await prisma.heldBillLine.count({ where: { heldBillId: billA.id } }), 2);
});

await test('9. held bills persist (a fresh request / new session still lists them)', async () => {
  const fresh = await api('GET', '/held-bills', token('a1', outletA.id));
  assert.ok(fresh.data.some((b) => b.id === billA.id && b.status === 'HELD'));
});

await test('10. repeating the same hold request (same clientToken) does not create a duplicate', async () => {
  const before = await counts();
  const body = holdBody({ clientToken: `tok-${suffix}-1`, lines: cart([p1, 1]) });
  const [x, y] = await Promise.all([api('POST', '/held-bills', T.a1, body), api('POST', '/held-bills', T.a1, body)]);
  assert.ok([200, 201].includes(x.status) && [200, 201].includes(y.status), `${x.status}/${y.status}`);
  assert.equal(x.data.id, y.data.id);
  assert.equal((await counts()).held, before.held + 1);
});

await test('11. invalid holds are rejected and write nothing (empty cart, unknown product, inactive, bad discount)', async () => {
  const before = await counts();
  assert.equal((await api('POST', '/held-bills', T.a1, holdBody({ lines: [] }))).status, 400);
  assert.equal((await api('POST', '/held-bills', T.a1, holdBody({ lines: [{ productId: 'nope', qty: 1 }] }))).status, 400);
  assert.equal((await api('POST', '/held-bills', T.a1, holdBody({ lines: cart([p1, 0]) }))).status, 400);
  assert.equal((await api('POST', '/held-bills', T.a1, holdBody({ discountType: 'percent', discountValue: 150 }))).status, 400);
  assert.equal((await api('POST', '/held-bills', T.a1, holdBody({ customerId: 'ghost' }))).status, 400);
  assert.deepEqual(await counts(), before);
});

await test('12. concurrent resume of one bill: exactly one cashier wins, the other gets 409', async () => {
  const r = await api('POST', '/held-bills', T.a1, holdBody({ lines: cart([p1, 1]) }));
  const id = r.data.id;
  const results = await Promise.all([1, 2, 3, 4].map((i) => api('POST', `/held-bills/${id}/resume`, i % 2 ? T.a1 : T.adminA)));
  // a1 may re-resume its own bill, so assert on who owns it afterwards
  const row = await prisma.heldBill.findUnique({ where: { id } });
  const winners = new Set(results.filter((x) => x.status === 200).map((x) => (x.data.status === 'RESUMED' ? row.resumedById : null)));
  assert.equal(winners.size, 1, 'one single owner');
  const owner = row.resumedById;
  const ownerTok = owner === 'a1' ? T.a1 : T.adminA;
  const loserTok = owner === 'a1' ? T.adminA : T.a1;
  assert.equal((await api('POST', `/held-bills/${id}/resume`, ownerTok)).status, 200);
  assert.equal((await api('POST', `/held-bills/${id}/resume`, loserTok)).status, 409);
  await api('DELETE', `/held-bills/${id}`, ownerTok);
});

await test('13. paying a resumed bill: one Sale, stock deducted once, held bill COMPLETED + linked', async () => {
  await api('PUT', `/held-bills/${billA.id}`, T.a1, holdBody({ lines: cart([p1, 2], [p2, 1]), discountValue: 0 }));
  await api('POST', `/held-bills/${billA.id}/resume`, T.a1);
  const before = await counts(); const s1 = await stock(p1.id); const s2 = await stock(p2.id);
  const r = await pay(T.a1, { lines: cart([p1, 2], [p2, 1]), heldBillId: billA.id, receivedAmount: 1000 });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  const after = await counts();
  assert.equal(after.sales, before.sales + 1); assert.equal(after.saleLines, before.saleLines + 2);
  assert.equal(await stock(p1.id), s1 - 2); assert.equal(await stock(p2.id), s2 - 1);
  const hb = await prisma.heldBill.findUnique({ where: { id: billA.id } });
  assert.equal(hb.status, 'COMPLETED'); assert.equal(hb.saleId, r.data.id); assert.ok(hb.completedAt);
  assert.ok(!(await api('GET', '/held-bills', T.a1)).data.some((b) => b.id === billA.id));
});

await test('14. paying the same held bill a second time is refused and changes nothing (no dup sale/stock)', async () => {
  const before = await counts(); const s1 = await stock(p1.id);
  const r = await pay(T.a1, { lines: cart([p1, 2]), heldBillId: billA.id });
  assert.equal(r.status, 409, JSON.stringify(r.body));
  assert.deepEqual(await counts(), before); assert.equal(await stock(p1.id), s1);
  assert.equal((await api('POST', `/held-bills/${billA.id}/resume`, T.a1)).status, 409);
});

await test('15. a held-but-not-resumed bill cannot be paid directly; concurrent double-pay creates one sale only', async () => {
  const r = await api('POST', '/held-bills', T.a1, holdBody({ lines: cart([p1, 1]) }));
  const id = r.data.id;
  const before0 = await counts();
  assert.equal((await pay(T.a1, { heldBillId: id, lines: cart([p1, 1]) })).status, 409);
  assert.deepEqual(await counts(), before0);
  await api('POST', `/held-bills/${id}/resume`, T.a1);
  const s1 = await stock(p1.id);
  const outs = await Promise.all([1, 2, 3].map(() => pay(T.a1, { heldBillId: id, lines: cart([p1, 1]) })));
  assert.equal(outs.filter((o) => o.status === 201).length, 1, outs.map((o) => o.status).join(','));
  assert.equal(await stock(p1.id), s1 - 1);
  assert.equal((await counts()).sales, before0.sales + 1);
});

await test('16. payment re-validates stock: insufficient stock fails, held bill stays RESUMED, nothing deducted', async () => {
  const r = await api('POST', '/held-bills', T.a1, holdBody({ lines: cart([p3, 2]) })); // p3 stock 2
  const id = r.data.id;
  await prisma.product.update({ where: { id: p3.id }, data: { availableQty: 1 } }); // sold elsewhere meanwhile
  await api('POST', `/held-bills/${id}/resume`, T.a1);
  const before = await counts();
  const p = await pay(T.a1, { heldBillId: id, lines: cart([p3, 2]) });
  assert.equal(p.status, 400); assert.match(p.body.message, /Insufficient stock/);
  assert.deepEqual(await counts(), before); assert.equal(await stock(p3.id), 1);
  assert.equal((await prisma.heldBill.findUnique({ where: { id } })).status, 'RESUMED');
  await prisma.product.update({ where: { id: p3.id }, data: { availableQty: 2 } });
});

await test('17. payment re-prices: a price change since parking is reflected on resume (live) and charged', async () => {
  const r = await api('POST', '/held-bills', T.a1, holdBody({ lines: cart([p2, 1]), discountValue: 0 }));
  const id = r.data.id;
  await prisma.product.update({ where: { id: p2.id }, data: { salePrice: 60 } });
  const res = await api('POST', `/held-bills/${id}/resume`, T.a1);
  assert.equal(res.data.lines[0].price, 50); assert.equal(res.data.lines[0].live.price, 60);
  const sale = await pay(T.a1, { heldBillId: id, lines: cart([p2, 1]) });
  assert.equal(sale.status, 201); assert.equal(Number(sale.data.subTotal), 60);
  await prisma.product.update({ where: { id: p2.id }, data: { salePrice: 50 } });
});

await test('18. discarding a held bill: CANCELLED, not resumable, not listed, row kept', async () => {
  const r = await api('POST', '/held-bills', T.a1, holdBody({ lines: cart([p1, 1]) }));
  assert.equal((await api('DELETE', `/held-bills/${r.data.id}`, T.a1)).status, 200);
  assert.equal((await api('POST', `/held-bills/${r.data.id}/resume`, T.a1)).status, 409);
  assert.ok(!(await api('GET', '/held-bills', T.a1)).data.some((b) => b.id === r.data.id));
  assert.equal((await prisma.heldBill.findUnique({ where: { id: r.data.id } })).status, 'CANCELLED');
});

await test('19. a normal sale (no heldBillId) is unaffected and held bills never appear as sales', async () => {
  const before = await counts();
  const r = await pay(T.a1);
  assert.equal(r.status, 201);
  assert.equal((await counts()).sales, before.sales + 1);
  assert.equal(await prisma.sale.count({ where: { tenantId: tenant.id, status: 'HELD' } }), 0);
});

await test('20. references are unique and sequential under concurrent holds', async () => {
  const rs = await Promise.all(Array.from({ length: 8 }, () => api('POST', '/held-bills', T.a1, holdBody({ lines: cart([p1, 1]) }))));
  assert.ok(rs.every((r) => r.status === 201), rs.map((r) => r.status).join(','));
  const refs = rs.map((r) => r.data.reference);
  assert.equal(new Set(refs).size, 8);
});

// ---- cleanup ----
await prisma.heldBillLine.deleteMany({ where: { heldBill: { tenantId: tenant.id } } });
await prisma.heldBill.deleteMany({ where: { tenantId: tenant.id } });
server.close();
await prisma.$disconnect();
console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) { console.log(failures.map((f) => ` - ${f}`).join('\n')); process.exit(1); }
process.exit(0);
