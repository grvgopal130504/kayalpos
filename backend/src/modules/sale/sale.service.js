import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../middleware/errorHandler.js';

// Flat GST rate applied to every line for now — matches the frontend's
// lineSaleMockData.TAX_RATE (0.05) until Product's taxCode resolves to a
// real per-product rate via the Tax Code master.
const TAX_RATE = 0.05;

/**
 * Preview of the bill number the NEXT sale will get (e.g. "LS-00001"),
 * mirrors crudFactory's nextCode() convention. Used for the Line Sale
 * screen's Bill No. field before a sale is actually saved — same "preview,
 * not a reservation" caveat as useNextCodePreview on the frontend.
 */
export async function nextBillNo(tenantId) {
  const count = await prisma.sale.count({ where: { tenantId } });
  return `LS-${String(count + 1).padStart(5, '0')}`;
}

/**
 * Creates a sale: re-reads every Product fresh inside one transaction
 * (never trusts the client's cached price/name/stock), verifies stock,
 * computes subtotal/discount/tax/grand total server-side, writes the Sale +
 * SaleLine rows, and decrements each Product's availableQty — all atomic, so
 * a mid-way failure (insufficient stock on line 3 of 5) leaves nothing
 * half-written.
 */
export async function createSale({
  tenantId, outletId, cashierName, customerId, customerName, lines,
  discountType, discountValue, paymentMethod, receivedAmount,
}) {
  return prisma.$transaction(async (tx) => {
    if (customerId) {
      const customer = await tx.customer.findFirst({ where: { id: customerId, tenantId } });
      if (!customer) throw new ApiError(400, 'Selected customer was not found');
    }

    const productIds = [...new Set(lines.map((line) => line.productId))];
    const products = await tx.product.findMany({ where: { id: { in: productIds }, tenantId } });
    const productById = new Map(products.map((p) => [p.id, p]));

    let subTotal = 0;
    const lineData = lines.map((line) => {
      const product = productById.get(line.productId);
      if (!product) throw new ApiError(400, 'One of the items in this sale no longer exists');
      if (product.status !== 'ACTIVE') throw new ApiError(400, `${product.name} is inactive and cannot be sold`);
      if (product.availableQty < line.qty) {
        throw new ApiError(400, `Insufficient stock for ${product.name} — only ${product.availableQty} ${product.uom} available`);
      }

      const price = Number(product.salePrice);
      const amount = price * line.qty;
      subTotal += amount;

      return {
        productId: product.id,
        code: product.code,
        name: product.name,
        uom: product.uom,
        qty: line.qty,
        price,
        taxRate: TAX_RATE,
        amount,
      };
    });

    const discountAmount = discountType === 'percent'
      ? (subTotal * discountValue) / 100
      : Math.min(discountValue, subTotal);
    const taxable = Math.max(subTotal - discountAmount, 0);
    const taxAmount = lineData.reduce((sum, line) => {
      const lineTaxable = subTotal > 0 ? (line.amount / subTotal) * taxable : 0;
      return sum + lineTaxable * Number(line.taxRate);
    }, 0);
    const grandTotal = taxable + taxAmount;
    const changeAmount = receivedAmount - grandTotal;

    const billNo = await nextBillNoWithinTx(tx, tenantId);

    const sale = await tx.sale.create({
      data: {
        tenantId,
        outletId: outletId || null,
        billNo,
        customerId: customerId || null,
        customerName: customerName || 'Walk-in Customer',
        cashierName,
        subTotal,
        discountType,
        discountValue,
        discountAmount,
        taxAmount,
        grandTotal,
        paymentMethod,
        receivedAmount,
        changeAmount,
        lines: { create: lineData },
      },
      include: { lines: true },
    });

    await Promise.all(lineData.map((line) => tx.product.update({
      where: { id: line.productId },
      data: { availableQty: { decrement: line.qty } },
    })));

    return sale;
  });
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Powers the Promotion page's "Discount Trend" and "Discount by Outlet"
 * cards. Both are built from real Sale rows' `discountAmount` — the
 * bill-level discount a cashier actually applied at checkout (Line Sale's
 * discount fields) — NOT from a Promotion's own usage count, since nothing
 * in the app applies a Promotion's discount to a Sale yet. That's an honest
 * distinction, not a technicality: this reports "how much discount the
 * business gave out and where", which is real and available today, rather
 * than pretending to report promotion-specific redemptions that aren't
 * tracked anywhere.
 */
export async function getDiscountSummary(tenantId) {
  const since = new Date();
  since.setDate(since.getDate() - 6);
  since.setHours(0, 0, 0, 0);

  const [sales, outlets] = await Promise.all([
    prisma.sale.findMany({
      where: { tenantId, createdAt: { gte: since } },
      select: { discountAmount: true, createdAt: true, outletId: true },
    }),
    prisma.outlet.findMany({ where: { tenantId }, select: { id: true, name: true } }),
  ]);
  const outletNameById = Object.fromEntries(outlets.map((o) => [o.id, o.name]));

  const dayBuckets = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dayBuckets.push({ key: d.toDateString(), label: `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`, total: 0 });
  }
  const bucketByKey = Object.fromEntries(dayBuckets.map((b) => [b.key, b]));

  const outletTotals = new Map();
  sales.forEach((sale) => {
    const amount = Number(sale.discountAmount || 0);
    const dayKey = new Date(sale.createdAt).toDateString();
    if (bucketByKey[dayKey]) bucketByKey[dayKey].total += amount;

    const outletKey = sale.outletId || 'unassigned';
    outletTotals.set(outletKey, (outletTotals.get(outletKey) || 0) + amount);
  });

  const byOutlet = [...outletTotals.entries()]
    .map(([outletId, total]) => ({
      outletId,
      name: outletId === 'unassigned' ? 'Unassigned' : (outletNameById[outletId] || 'Unknown Outlet'),
      total: Math.round(total * 100) / 100,
    }))
    .filter((row) => row.total > 0)
    .sort((a, b) => b.total - a.total);

  return {
    trend: { categories: dayBuckets.map((b) => b.label), values: dayBuckets.map((b) => Math.round(b.total * 100) / 100) },
    byOutlet,
  };
}

/**
 * Powers the Customer page's top summary tiles ("Total Sales (This Month)"
 * and "Outstanding Amount") — both computed across every real Sale row for
 * the tenant, never fabricated. "Outstanding" is `grandTotal -
 * receivedAmount` per sale (floored at 0) — the only honest proxy available
 * today, since there's no separate Payment/ledger module yet; a cash sale's
 * receivedAmount always covers its grandTotal, so only under-paid/credit
 * sales contribute here.
 */
export async function getSalesOverviewSummary(tenantId) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const sales = await prisma.sale.findMany({
    where: { tenantId },
    select: { grandTotal: true, receivedAmount: true, createdAt: true },
  });

  let totalSalesThisMonth = 0;
  let outstandingAmount = 0;
  sales.forEach((sale) => {
    const grand = Number(sale.grandTotal);
    const received = Number(sale.receivedAmount);
    outstandingAmount += Math.max(grand - received, 0);
    if (new Date(sale.createdAt) >= startOfMonth) totalSalesThisMonth += grand;
  });

  return {
    totalSalesThisMonth: Math.round(totalSalesThisMonth * 100) / 100,
    outstandingAmount: Math.round(outstandingAmount * 100) / 100,
  };
}

/**
 * Powers the Customer list table's per-row "Total Purchase"/"Outstanding"
 * columns — one query for every customer's aggregate instead of one query
 * per row. Keyed by customerId; a customer with no sales simply has no
 * entry (the caller treats that as all-zero).
 */
export async function getCustomerPurchaseSummaries(tenantId) {
  const sales = await prisma.sale.findMany({
    where: { tenantId, customerId: { not: null } },
    select: { customerId: true, grandTotal: true, receivedAmount: true },
  });

  const map = {};
  sales.forEach((sale) => {
    const key = sale.customerId;
    const grand = Number(sale.grandTotal);
    const received = Number(sale.receivedAmount);
    if (!map[key]) map[key] = { totalPurchase: 0, outstanding: 0, transactionCount: 0 };
    map[key].totalPurchase += grand;
    map[key].outstanding += Math.max(grand - received, 0);
    map[key].transactionCount += 1;
  });
  Object.values(map).forEach((entry) => {
    entry.totalPurchase = Math.round(entry.totalPurchase * 100) / 100;
    entry.outstanding = Math.round(entry.outstanding * 100) / 100;
  });
  return map;
}

/**
 * Powers the Customer detail panel/view page's "Total Purchase"/"Outstanding
 * Amount" fields and its real "Recent Transactions" list — every row here is
 * an actual Sale this customer was billed on, not a fabricated invoice
 * history.
 */
export async function getCustomerPurchaseSummary(tenantId, customerId) {
  const customer = await prisma.customer.findFirst({ where: { id: customerId, tenantId } });
  if (!customer) throw new ApiError(404, 'Customer not found');

  const sales = await prisma.sale.findMany({
    where: { tenantId, customerId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, billNo: true, createdAt: true, grandTotal: true, receivedAmount: true, paymentMethod: true,
    },
  });

  let totalPurchase = 0;
  let outstanding = 0;
  sales.forEach((sale) => {
    const grand = Number(sale.grandTotal);
    const received = Number(sale.receivedAmount);
    totalPurchase += grand;
    outstanding += Math.max(grand - received, 0);
  });

  const recentTransactions = sales.slice(0, 20).map((sale) => {
    const grand = Number(sale.grandTotal);
    const received = Number(sale.receivedAmount);
    return {
      date: sale.createdAt,
      type: 'Sale',
      invoiceNo: sale.billNo,
      amount: grand,
      payment: sale.paymentMethod,
      status: received >= grand ? 'paid' : 'due',
    };
  });

  return {
    totalPurchase: Math.round(totalPurchase * 100) / 100,
    outstanding: Math.round(outstanding * 100) / 100,
    transactionCount: sales.length,
    recentTransactions,
  };
}

// Same count-based scheme as nextBillNo(), but run with the transaction's own
// client so the count and the row it names are consistent within one
// transaction (avoids two concurrent sales both reading count=N and trying
// to claim the same billNo — the @@unique([tenantId, billNo]) constraint
// would still catch that as a last resort, just with an uglier 500 instead).
async function nextBillNoWithinTx(tx, tenantId) {
  const count = await tx.sale.count({ where: { tenantId } });
  return `LS-${String(count + 1).padStart(5, '0')}`;
}
