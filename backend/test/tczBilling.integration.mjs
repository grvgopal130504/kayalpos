// Integration test for the Line Sale -> TCZ_OPOS / TCZ_POS1 / TCZ_POS2 dual-write
// and the createSale hardening (bill-number concurrency, aggregated stock check,
// concurrency-safe stock update, clientToken idempotency).
//
// Runs the REAL express app against a real Postgres. It creates its own
// throwaway tenants/outlets/products and writes real rows, so it REFUSES to run
// unless DATABASE_URL points at a local database (never the shared Azure one).
//
//   1. Start a local Postgres and apply the migrations to an EMPTY database
//      (e.g. DATABASE_URL=postgresql://postgres@localhost:5432/nexora_test
//      npx prisma migrate deploy)
//   2. DATABASE_URL=... npm run test:tcz-billing
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
const mkTenant = (tag) => prisma.tenant.create({ data: { name: `T${tag}-${suffix}`, slug: `t${tag}-${suffix}` } });
const tenant = await mkTenant('1');
const tenant2 = await mkTenant('2');
const outletA = await prisma.outlet.create({ data: { tenantId: tenant.id, code: 'A', name: 'Outlet A' } });
const outlet2 = await prisma.outlet.create({ data: { tenantId: tenant2.id, code: 'A', name: 'Outlet 2A' } });

const mkProduct = (t, code, price, qty, name) => prisma.product.create({
  data: { tenantId: t.id, code, name: name || `Item ${code}`, group: 'G', uom: 'KG', salePrice: price, availableQty: qty },
});
const p1 = await mkProduct(tenant, 'P1', 100, 1000);
const p2 = await mkProduct(tenant, 'P2', 50, 1000);
const pDup = await mkProduct(tenant, 'PD', 10, 4);
const pRace = await mkProduct(tenant, 'PR', 10, 5);
const pLong = await mkProduct(tenant, 'PL', 10, 10, `L${'x'.repeat(299)}`); // name too long for TCZ_POS1.ItemName (varchar 255)
const p2t = await mkProduct(tenant2, 'P1', 100, 1000);
const customer = await prisma.customer.create({
  data: { tenantId: tenant.id, code: 'C1', name: 'Ravi', mobile: '9999999999', customerType: 'Retail' },
});

const token = (t, outletId, id = 'u1') => jwt.sign(
  { id, tenantId: t.id, username: id, name: `Name ${id}`, role: 'ADMIN', outletId },
  process.env.JWT_SECRET,
);
const TA = token(tenant, outletA.id);
const T2 = token(tenant2, outlet2.id, 'u2');

async function api(method, path, tok, body) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, body: json, data: json.data };
}

const n = (v) => (v === null || v === undefined ? v : Number(v));
const stock = async (id) => (await prisma.product.findUnique({ where: { id } })).availableQty;
const setStock = (id, qty) => prisma.product.update({ where: { id }, data: { availableQty: qty } });
const counts = async (t = tenant) => ({
  sales: await prisma.sale.count({ where: { tenantId: t.id } }),
  saleLines: await prisma.saleLine.count({ where: { sale: { tenantId: t.id } } }),
  tczHeaders: await prisma.tczOpos.count({ where: { tenantId: t.id } }),
  tczLines: await prisma.tczPos1.count({ where: { header: { tenantId: t.id } } }),
  tczOffers: await prisma.tczPos2.count({ where: { header: { tenantId: t.id } } }),
});
const tczFor = (saleId) => prisma.tczOpos.findUnique({ where: { saleId }, include: { lines: { orderBy: { lineId: 'asc' } }, offers: true } });
const cart = (...pairs) => pairs.map(([p, qty]) => ({ productId: p.id, qty }));
const pay = (tok, extra = {}) => api('POST', '/sales', tok, {
  customerName: 'Walk-in Customer', cashierName: 'cashier1', lines: cart([p2, 1]), paymentMethod: 'cash', receivedAmount: 1000, ...extra,
});
let tok = 0;
const newToken = () => `test-token-${suffix}-${(tok += 1)}`;
const NULL_HEADER_FIELDS = ['discountType', 'discountAmount', 'taxableValue', 'taxableValueTotal', 'totalRevenue',
  'salesType', 'canceled', 'hold', 'docStatus', 'return', 'free', 'batch', 'changeLog', 'slpCode1', 'slpName1'];

console.log('\nLine Sale -> TCZ billing — integration tests');

await test('1. cash sale, 2 items + amount discount: Sale and TCZ header/lines agree', async () => {
  const s1 = await stock(p1.id); const s2 = await stock(p2.id);
  const r = await pay(TA, {
    customerId: customer.id, customerName: 'Ravi', lines: cart([p1, 2], [p2, 1]),
    discountType: 'amount', discountValue: 20, receivedAmount: 500, clientToken: newToken(),
  });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  // subtotal 250, discount 20 -> taxable 230, tax 5% = 11.5, grand 241.5, change 258.5
  assert.equal(n(r.data.grandTotal), 241.5);
  const t = await tczFor(r.data.id);
  assert.ok(t, 'TCZ header exists');
  assert.equal(t.docNum, r.data.billNo);
  assert.equal(t.tenantId, tenant.id); assert.equal(t.outletId, outletA.id); assert.equal(t.saleId, r.data.id);
  assert.equal(t.object, 'TCZ_OPOS'); assert.equal(t.createdBy, 'cashier1');
  assert.equal(t.customerName, 'Ravi'); assert.equal(t.customerMobileNumber, '9999999999');
  assert.equal(t.bpName, 'Ravi'); assert.equal(t.bpCode, 'C1');
  assert.equal(t.headDiscTyp, 'amount'); assert.equal(n(t.headerDiscount), 20);
  assert.equal(n(t.grandTotal), 241.5);
  // change was given back: the cash column holds what was KEPT, not what was handed over
  assert.equal(n(t.cash), 241.5); assert.equal(n(t.paid), 241.5); assert.equal(n(t.balance), 0);
  assert.equal(n(t.card), 0); assert.equal(n(t.upi), 0); assert.equal(n(t.wallet), 0); assert.equal(n(t.creditCard), 0);
  for (const f of NULL_HEADER_FIELDS) assert.equal(t[f], null, `${f} must stay NULL (meaning undefined)`);
  assert.equal(n(t.points), 0); assert.equal(n(t.earnedPoints), 0); assert.equal(n(t.redeemValue), 0); assert.equal(n(t.roundOff), 0);
  assert.ok(t.createDate instanceof Date && t.createTime instanceof Date);
  // CreateDate = exact instant; CreateTime = the IST (UTC+05:30) wall-clock time of that same instant, to the millisecond.
  assert.equal(t.createTime.getTime(), (t.createDate.getTime() + 5.5 * 3600 * 1000) % 86400000, 'CreateTime must be the IST time of day of CreateDate');
  assert.ok(Math.abs(t.createDate.getTime() - Date.now()) < 60000, 'CreateDate is the real checkout instant');
  // lines
  assert.equal(t.lines.length, 2);
  assert.deepEqual(t.lines.map((l) => l.lineId), [1, 2]);
  const [l1, l2] = t.lines;
  assert.equal(l1.itemCode, 'P1'); assert.equal(n(l1.price), 100); assert.equal(n(l1.quantity), 2); assert.equal(n(l1.lineTotal), 200);
  assert.equal(n(l1.taxableValue), 184); assert.equal(n(l1.taxValue), 9.2); assert.equal(n(l1.inStock), s1);
  assert.equal(l2.itemCode, 'P2'); assert.equal(n(l2.lineTotal), 50); assert.equal(n(l2.taxableValue), 46); assert.equal(n(l2.taxValue), 2.3);
  assert.equal(n(l2.inStock), s2);
  assert.equal(l1.productId, p1.id); assert.equal(l1.tax, null); assert.equal(l1.taxCode, null);
  assert.equal(n(l1.disCount), 0); assert.equal(n(l1.disCountValue), 0);
  assert.equal(Math.round((n(l1.taxValue) + n(l2.taxValue)) * 100) / 100, n(r.data.taxAmount));
  assert.equal(t.offers.length, 0, 'TCZ_POS2 stays empty');
  // Sale side unchanged
  const sale = await prisma.sale.findUnique({ where: { id: r.data.id }, include: { lines: true } });
  assert.equal(sale.lines.length, 2); assert.equal(n(sale.receivedAmount), 500); assert.equal(n(sale.changeAmount), 258.5);
  assert.equal(await stock(p1.id), s1 - 2); assert.equal(await stock(p2.id), s2 - 1);
});

await test('2. percent discount maps to HeadDiscTyp / HeaderDiscount (the % value, not the amount)', async () => {
  const r = await pay(TA, { lines: cart([p1, 3]), discountType: 'percent', discountValue: 10, receivedAmount: 283.5 });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  // 300 - 30 = 270, tax 13.5, grand 283.5
  assert.equal(n(r.data.grandTotal), 283.5);
  const t = await tczFor(r.data.id);
  assert.equal(t.headDiscTyp, 'percent'); assert.equal(n(t.headerDiscount), 10);
  assert.equal(n(t.cash), 283.5); assert.equal(n(t.paid), 283.5); assert.equal(n(t.balance), 0);
  assert.equal(t.discountAmount, null);
});

await test('3. no discount: HeaderDiscount is 0 and Sale defaults are preserved', async () => {
  const r = await pay(TA);
  assert.equal(r.status, 201);
  const t = await tczFor(r.data.id);
  assert.equal(t.headDiscTyp, 'amount'); assert.equal(n(t.headerDiscount), 0);
  assert.equal(t.customerName, 'Walk-in Customer'); assert.equal(t.bpName, null); assert.equal(t.bpCode, null);
  assert.equal(t.customerMobileNumber, null);
});

await test('4. cash / card / upi / wallet map to their own column only', async () => {
  for (const method of ['cash', 'card', 'upi', 'wallet']) {
    const r = await pay(TA, { lines: cart([p1, 1]), paymentMethod: method, receivedAmount: 105 }); // grand 105
    assert.equal(r.status, 201, `${method}: ${JSON.stringify(r.body)}`);
    const t = await tczFor(r.data.id);
    for (const col of ['cash', 'card', 'upi', 'wallet']) assert.equal(n(t[col]), col === method ? 105 : 0, `${method}->${col}`);
    assert.equal(n(t.creditCard), 0); assert.equal(n(t.paid), 105); assert.equal(n(t.balance), 0);
    assert.equal((await prisma.sale.findUnique({ where: { id: r.data.id } })).paymentMethod, method);
  }
});

await test('5. credit / store-credit / gift-card / cheque / bank-transfer are NOT mapped to any TCZ tender column and are kept on Sale', async () => {
  for (const method of ['credit', 'store-credit', 'gift-card', 'cheque', 'bank-transfer']) {
    const r = await pay(TA, { lines: cart([p1, 1]), paymentMethod: method, receivedAmount: 105, paymentReference: `REF-${method}` });
    assert.equal(r.status, 201, `${method}: ${JSON.stringify(r.body)}`);
    const t = await tczFor(r.data.id);
    for (const col of ['cash', 'card', 'upi', 'wallet', 'creditCard']) assert.equal(n(t[col]), 0, `${method} must not land in ${col}`);
    // amount received is not discarded: Paid reflects it, and the Sale row keeps method + reference + amount
    assert.equal(n(t.paid), 105); assert.equal(n(t.balance), 0);
    const sale = await prisma.sale.findUnique({ where: { id: r.data.id } });
    assert.equal(sale.paymentMethod, method); assert.equal(n(sale.receivedAmount), 105); assert.equal(sale.paymentReference, `REF-${method}`);
  }
});

await test('6. under-payment: Paid = received, Balance = grand - received (matches the app\'s outstanding logic)', async () => {
  const r = await pay(TA, { lines: cart([p1, 1]), paymentMethod: 'cash', receivedAmount: 40 }); // grand 105
  assert.equal(r.status, 201);
  const t = await tczFor(r.data.id);
  assert.equal(n(t.cash), 40); assert.equal(n(t.paid), 40); assert.equal(n(t.balance), 65);
  const credit = await pay(TA, { lines: cart([p1, 1]), paymentMethod: 'credit', receivedAmount: 0 });
  const tc = await tczFor(credit.data.id);
  assert.equal(n(tc.paid), 0); assert.equal(n(tc.balance), 105);
});

await test('7. same product on two lines is validated on the TOTAL (3+3 with 4 in stock is rejected, nothing written)', async () => {
  await setStock(pDup.id, 4);
  const before = await counts();
  const r = await pay(TA, { lines: cart([pDup, 3], [pDup, 3]) });
  assert.equal(r.status, 400, JSON.stringify(r.body));
  assert.match(r.body.message, /Insufficient stock for Item PD — only 4 KG available/);
  assert.deepEqual(await counts(), before);
  assert.equal(await stock(pDup.id), 4);
});

await test('8. 2+2 of a 4-stock product on two lines succeeds: stock 0, two Sale lines, two TCZ lines (LineId 1,2)', async () => {
  const r = await pay(TA, { lines: cart([pDup, 2], [pDup, 2]) });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  assert.equal(await stock(pDup.id), 0);
  assert.equal(r.data.lines.length, 2);
  const t = await tczFor(r.data.id);
  assert.deepEqual(t.lines.map((l) => [l.lineId, n(l.quantity)]), [[1, 2], [2, 2]]);
  assert.deepEqual(t.lines.map((l) => n(l.inStock)), [4, 4]); // stock on hand when the bill was priced
});

await test('9. insufficient stock on one line of several rolls everything back (no Sale, no TCZ, no stock change)', async () => {
  await setStock(pDup.id, 1);
  const before = await counts(); const s1 = await stock(p1.id);
  const r = await pay(TA, { lines: cart([p1, 2], [pDup, 5]) });
  assert.equal(r.status, 400);
  assert.deepEqual(await counts(), before);
  assert.equal(await stock(p1.id), s1); assert.equal(await stock(pDup.id), 1);
});

await test('10. a failure while writing the TCZ rows rolls back Sale, SaleLines, TCZ header and stock', async () => {
  const before = await counts(); const s1 = await stock(p1.id); const sl = await stock(pLong.id);
  const next = (await api('GET', '/sales/next-bill-no', TA)).data.billNo;
  const r = await pay(TA, { lines: cart([p1, 1], [pLong, 1]), clientToken: newToken() });
  assert.ok(r.status >= 500, `expected a server error, got ${r.status}`);
  assert.deepEqual(await counts(), before);
  assert.equal(await stock(p1.id), s1); assert.equal(await stock(pLong.id), sl);
  // the bill number was not consumed
  const ok = await pay(TA);
  assert.equal(ok.status, 201); assert.equal(ok.data.billNo, next);
});

await test('11. a failure after the Sale is created (held bill not available) rolls everything back', async () => {
  const before = await counts(); const s1 = await stock(p1.id);
  const r = await pay(TA, { lines: cart([p1, 1]), heldBillId: 'does-not-exist', clientToken: newToken() });
  assert.equal(r.status, 409, JSON.stringify(r.body));
  assert.deepEqual(await counts(), before);
  assert.equal(await stock(p1.id), s1);
});

await test('12. idempotency: the same clientToken twice returns the SAME bill; stock and rows change once', async () => {
  const s1 = await stock(p1.id); const before = await counts();
  const clientToken = newToken();
  const a = await pay(TA, { lines: cart([p1, 2]), clientToken });
  const b = await pay(TA, { lines: cart([p1, 2]), clientToken });
  assert.equal(a.status, 201); assert.equal(b.status, 201, JSON.stringify(b.body));
  assert.equal(b.data.id, a.data.id); assert.equal(b.data.billNo, a.data.billNo);
  assert.equal(b.data.lines.length, 1);
  const after = await counts();
  assert.equal(after.sales, before.sales + 1); assert.equal(after.tczHeaders, before.tczHeaders + 1);
  assert.equal(await stock(p1.id), s1 - 2);
});

await test('13. idempotency under concurrency: 6 simultaneous requests with one token create exactly one bill', async () => {
  const s1 = await stock(p1.id); const before = await counts();
  const clientToken = newToken();
  const rs = await Promise.all(Array.from({ length: 6 }, () => pay(TA, { lines: cart([p1, 1]), clientToken })));
  assert.ok(rs.every((r) => r.status === 201), rs.map((r) => `${r.status}${r.status === 201 ? '' : JSON.stringify(r.body)}`).join(' | '));
  assert.equal(new Set(rs.map((r) => r.data.id)).size, 1);
  const after = await counts();
  assert.equal(after.sales, before.sales + 1); assert.equal(after.tczHeaders, before.tczHeaders + 1);
  assert.equal(await stock(p1.id), s1 - 1);
});

await test('14. the same token in a DIFFERENT tenant is a different bill (tokens are tenant-scoped)', async () => {
  const clientToken = newToken();
  const a = await pay(TA, { lines: cart([p1, 1]), clientToken });
  const b = await api('POST', '/sales', T2, {
    customerName: 'Walk-in Customer', cashierName: 'c2', lines: cart([p2t, 1]), paymentMethod: 'cash', receivedAmount: 500, clientToken,
  });
  assert.equal(a.status, 201); assert.equal(b.status, 201, JSON.stringify(b.body));
  assert.notEqual(a.data.id, b.data.id);
  assert.equal((await tczFor(b.data.id)).tenantId, tenant2.id);
});

await test('15. bill numbers: 12 concurrent bills for one tenant get 12 unique, gap-free numbers and no errors', async () => {
  const before = await prisma.sale.count({ where: { tenantId: tenant.id } });
  const rs = await Promise.all(Array.from({ length: 12 }, () => pay(TA, { lines: cart([p2, 1]), clientToken: newToken() })));
  assert.ok(rs.every((r) => r.status === 201), rs.map((r) => r.status).join(','));
  const nums = rs.map((r) => Number(r.data.billNo.replace('LS-', ''))).sort((x, y) => x - y);
  assert.equal(new Set(nums).size, 12);
  assert.deepEqual(nums, Array.from({ length: 12 }, (_, i) => before + 1 + i));
  const headers = await prisma.tczOpos.findMany({ where: { tenantId: tenant.id } });
  assert.equal(new Set(headers.map((h) => h.docNum)).size, headers.length);
});

await test('16. concurrent oversell: 8 simultaneous bills for 1 unit each of a 5-stock product -> exactly 5 succeed, stock never negative', async () => {
  await setStock(pRace.id, 5);
  const before = await counts();
  const rs = await Promise.all(Array.from({ length: 8 }, () => pay(TA, { lines: cart([pRace, 1]), clientToken: newToken() })));
  const ok = rs.filter((r) => r.status === 201); const bad = rs.filter((r) => r.status !== 201);
  assert.equal(ok.length, 5, rs.map((r) => r.status).join(','));
  assert.ok(bad.every((r) => r.status === 400 || r.status === 409), bad.map((r) => r.status).join(','));
  assert.equal(await stock(pRace.id), 0);
  const after = await counts();
  assert.equal(after.sales, before.sales + 5); assert.equal(after.tczHeaders, before.tczHeaders + 5);
});

await test('17. a product sold across concurrent multi-line bills never goes negative', async () => {
  await setStock(pRace.id, 6);
  const rs = await Promise.all(Array.from({ length: 4 }, () => pay(TA, { lines: cart([pRace, 2], [pRace, 1]), clientToken: newToken() })));
  assert.equal(rs.filter((r) => r.status === 201).length, 2, rs.map((r) => r.status).join(','));
  assert.equal(await stock(pRace.id), 0);
});

await test('18. hold -> resume -> pay: held bill completes, Sale + TCZ rows written, stock reduced once', async () => {
  const s1 = await stock(p1.id);
  const held = await api('POST', '/held-bills', TA, {
    customerName: 'Walk-in Customer', lines: cart([p1, 2]), discountType: 'amount', discountValue: 0,
  });
  assert.equal(held.status, 201, JSON.stringify(held.body));
  assert.equal((await api('POST', `/held-bills/${held.data.id}/resume`, TA)).status, 200);
  const clientToken = newToken();
  const r = await pay(TA, { lines: cart([p1, 2]), heldBillId: held.data.id, clientToken });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  assert.ok(await tczFor(r.data.id));
  const hb = await prisma.heldBill.findUnique({ where: { id: held.data.id } });
  assert.equal(hb.status, 'COMPLETED'); assert.equal(hb.saleId, r.data.id);
  assert.equal(await stock(p1.id), s1 - 2);
  // paying the same held bill again with a NEW token is refused and changes nothing
  const before = await counts();
  const again = await pay(TA, { lines: cart([p1, 2]), heldBillId: held.data.id, clientToken: newToken() });
  assert.equal(again.status, 409);
  assert.deepEqual(await counts(), before);
  assert.equal(await stock(p1.id), s1 - 2);
});

await test('19. validation: a too-short clientToken is rejected (400) and writes nothing', async () => {
  const before = await counts();
  const r = await pay(TA, { clientToken: 'short' });
  assert.equal(r.status, 400);
  assert.deepEqual(await counts(), before);
});

await test('20. requests without a clientToken still work exactly as before (backward compatible)', async () => {
  const r = await pay(TA, { lines: cart([p2, 2]) });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  const t = await tczFor(r.data.id);
  assert.equal(t.clientToken, null); assert.equal(t.lines.length, 1);
});

await test('21. existing Sale readers still work and include the new sales (cash report, next bill no)', async () => {
  const rep = await api('GET', '/sales/cash-summary', TA);
  assert.equal(rep.status, 200, JSON.stringify(rep.body));
  const nb = await api('GET', '/sales/next-bill-no', TA);
  assert.equal(nb.status, 200);
  const salesCount = await prisma.sale.count({ where: { tenantId: tenant.id } });
  assert.equal(nb.data.billNo, `LS-${String(salesCount + 1).padStart(5, '0')}`);
});

await test('22. every TCZ header has a Sale, every Sale from these tests has a TCZ header, and no orphan lines/offers exist', async () => {
  const c = await counts();
  assert.equal(c.tczHeaders, c.sales);
  assert.equal(c.tczOffers, 0);
  const salesWithoutTcz = await prisma.sale.count({ where: { tenantId: tenant.id, tczBill: null } });
  assert.equal(salesWithoutTcz, 0);
  const orphanLines = await prisma.$queryRaw`SELECT count(*)::int AS c FROM "TCZ_POS1" l LEFT JOIN "TCZ_OPOS" h ON h."DocEntry" = l."DocEntry" WHERE h."DocEntry" IS NULL`;
  assert.equal(orphanLines[0].c, 0);
});

// ---- cleanup ----
server.close();
await prisma.$disconnect();
console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) { console.log(failures.map((f) => ` - ${f}`).join('\n')); process.exit(1); }
process.exit(0);
