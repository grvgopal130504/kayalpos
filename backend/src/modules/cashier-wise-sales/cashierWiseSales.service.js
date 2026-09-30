import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../middleware/errorHandler.js';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Colors cycle for any cashier beyond the first 8 — same "never run out of
// a slice color" reasoning as the other donut-fed reports in this module.
const PALETTE = ['#2563EB', '#22A06B', '#F26B21', '#8B5CF6', '#0EA5A4', '#E5484D', '#F5A623', '#6B7280'];

function round2(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

// Midnight-to-midnight bounds for one calendar day in the server's local
// time zone — same helper as every other cashier-panel report's service
// (duplicated rather than cross-imported; see shortageExcess.service.js's
// dayBounds for the reasoning).
function dayBounds(dateStr) {
  const start = dateStr ? new Date(`${dateStr}T00:00:00`) : new Date();
  if (Number.isNaN(start.getTime())) throw new ApiError(400, 'Invalid date');
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function formatDayLabel(date) {
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

// 2-hour buckets covering a full calendar day, matching the reference
// trend chart's 12 categories ("00:00" .. "22:00").
const TREND_BUCKET_COUNT = 12;
function trendCategories() {
  return Array.from({ length: TREND_BUCKET_COUNT }, (_, i) => `${String(i * 2).padStart(2, '0')}:00`);
}

/**
 * Powers the Cashier Panel's Cashier Wise Sales report — the one report on
 * this panel that isn't scoped to the signed-in cashier's own shift: it
 * compares every cashier at the outlet side by side. Built directly from
 * real Sale/SaleLine/SalesReturn rows (there's no ShiftSession involved at
 * all, unlike Shift Closing/Cash Reconciliation/Shortage-Excess), grouped
 * by `Sale.cashierName` — the only per-cashier key that exists on Sale
 * (there is no cashierId foreign key). `SalesReturn` carries its own
 * `cashierName` column directly (the cashier who processed the return, not
 * necessarily the original sale's cashier), so returns are grouped the
 * same way without needing to join back through `sale`.
 *
 * There is no "cashier code" anywhere in the schema (User has no `code`
 * column) — the Cashier Code column is a stable, cosmetic-only label
 * assigned here by sorting every cashierName that has EVER sold at this
 * outlet alphabetically and numbering them C001, C002, ... This keeps a
 * given cashier's code the same across every request/date (never
 * recomputed from just the selected day's names), the same "cosmetic,
 * deterministic, never stored" spirit as this panel's SC-/CR-/SE-
 * reference-number prefixes.
 *
 * - stats.totalSalesAllCashiers / totalInvoices / avgInvoiceValue are
 *   all-time totals for the outlet, independent of `date`.
 * - stats.todaysSales is always the server's current calendar day.
 * - stats.selectedDateSales / summary / byCashier / cashiers / trend /
 *   topPerformers are all scoped to `date` (defaults to today).
 * - summary.netSales is totalSales − totalReturns (discounts are already
 *   reflected in each Sale's grandTotal, so they aren't subtracted again).
 * - `cashiers` is paginated (page/pageSize), sorted by that day's total
 *   sales, highest first; `byCashier`/`trend`/`topPerformers` are always
 *   computed from the FULL unpaginated set for the day, never just the
 *   current page.
 */
export async function getCashierWiseSalesReport(tenantId, outletId, params = {}) {
  const outletFilter = outletId ? { outletId } : {};
  const saleOutletFilter = outletId ? { sale: { outletId } } : {};
  const { start: dayStart, end: dayEnd } = dayBounds(params.date);
  const { start: todayStart, end: todayEnd } = dayBounds();
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;

  // Batch 1 — 5 concurrent queries, at the pool's real max: 5.
  const [
    allTimeAgg, allTimeQtyAgg, todayAgg, allTimeCashierNames, dayRows,
  ] = await Promise.all([
    prisma.sale.aggregate({
      where: { tenantId, ...outletFilter },
      _sum: { grandTotal: true },
      _count: true,
    }),
    prisma.saleLine.aggregate({
      where: { sale: { tenantId, ...outletFilter } },
      _sum: { qty: true },
    }),
    prisma.sale.aggregate({
      where: { tenantId, ...outletFilter, createdAt: { gte: todayStart, lte: todayEnd } },
      _sum: { grandTotal: true },
      _count: true,
    }),
    prisma.sale.findMany({
      where: { tenantId, ...outletFilter },
      select: { cashierName: true },
      distinct: ['cashierName'],
      orderBy: { cashierName: 'asc' },
    }),
    prisma.sale.findMany({
      where: { tenantId, ...outletFilter, createdAt: { gte: dayStart, lte: dayEnd } },
      select: {
        id: true, cashierName: true, grandTotal: true, discountAmount: true, taxAmount: true, createdAt: true,
      },
    }),
  ]);

  // Batch 2 — runs strictly sequentially, after batch 1 has resolved and
  // freed its connections, so the two batches together never exceed the
  // pool's max of 5 truly concurrent queries.
  const dayLines = await prisma.saleLine.findMany({
    where: { sale: { tenantId, ...outletFilter, createdAt: { gte: dayStart, lte: dayEnd } } },
    select: { qty: true, saleId: true },
  });
  const dayReturns = await prisma.salesReturn.findMany({
    where: { tenantId, ...saleOutletFilter, createdAt: { gte: dayStart, lte: dayEnd } },
    select: { cashierName: true, grandTotal: true },
  });

  // Stable, deterministic "Cashier Code" — alphabetical over every
  // cashierName that has ever sold at this outlet, never just the
  // selected day's names, so a cashier's code never changes day to day.
  const codeByCashier = new Map(
    allTimeCashierNames.map((row, index) => [row.cashierName, `C${String(index + 1).padStart(3, '0')}`]),
  );
  const colorByCashier = new Map(
    allTimeCashierNames.map((row, index) => [row.cashierName, PALETTE[index % PALETTE.length]]),
  );
  function codeFor(cashierName) {
    return codeByCashier.get(cashierName) || `C${String(codeByCashier.size + 1).padStart(3, '0')}`;
  }
  function colorFor(cashierName) {
    return colorByCashier.get(cashierName) || PALETTE[0];
  }

  const saleIdToCashier = new Map(dayRows.map((row) => [row.id, row.cashierName]));

  const qtyByCashier = new Map();
  dayLines.forEach((line) => {
    const cashierName = saleIdToCashier.get(line.saleId);
    if (!cashierName) return;
    qtyByCashier.set(cashierName, (qtyByCashier.get(cashierName) || 0) + line.qty);
  });

  const returnsByCashier = new Map();
  let totalReturns = 0;
  dayReturns.forEach((ret) => {
    const amount = Number(ret.grandTotal || 0);
    returnsByCashier.set(ret.cashierName, (returnsByCashier.get(ret.cashierName) || 0) + amount);
    totalReturns += amount;
  });

  // Per-cashier totals for the selected day, built once from the same
  // dayRows batch-1 already fetched — no extra query needed.
  const cashierTotals = new Map();
  let totalSales = 0;
  let totalDiscounts = 0;
  let taxCollected = 0;
  dayRows.forEach((row) => {
    const sales = Number(row.grandTotal || 0);
    const discount = Number(row.discountAmount || 0);
    const tax = Number(row.taxAmount || 0);
    totalSales += sales;
    totalDiscounts += discount;
    taxCollected += tax;

    const entry = cashierTotals.get(row.cashierName) || { totalSales: 0, transactions: 0, discount: 0 };
    entry.totalSales += sales;
    entry.transactions += 1;
    entry.discount += discount;
    cashierTotals.set(row.cashierName, entry);
  });

  const totalSalesRounded = round2(totalSales);
  const totalQuantity = [...qtyByCashier.values()].reduce((sum, q) => sum + q, 0);
  const totalDiscountsRounded = round2(totalDiscounts);
  const totalReturnsRounded = round2(totalReturns);
  const taxCollectedRounded = round2(taxCollected);
  const netSales = round2(totalSales - totalReturns);

  const cashierRowsFull = [...cashierTotals.entries()].map(([cashierName, entry]) => {
    const returns = round2(returnsByCashier.get(cashierName) || 0);
    const netSalesRow = round2(entry.totalSales - returns);
    const contributionPercent = totalSalesRounded > 0 ? round2((entry.totalSales / totalSales) * 100) : 0;
    return {
      code: codeFor(cashierName),
      name: cashierName,
      color: colorFor(cashierName),
      totalSales: round2(entry.totalSales),
      transactions: entry.transactions,
      invoices: entry.transactions,
      quantity: qtyByCashier.get(cashierName) || 0,
      avgInvoiceValue: entry.transactions > 0 ? round2(entry.totalSales / entry.transactions) : 0,
      discount: round2(entry.discount),
      returns,
      netSales: netSalesRow,
      contributionPercent,
    };
  }).sort((a, b) => b.totalSales - a.totalSales);

  const totalPages = Math.max(Math.ceil(cashierRowsFull.length / pageSize), 1);
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const cashierRowsPage = cashierRowsFull.slice(pageStart, pageStart + pageSize);

  const byCashier = cashierRowsFull.map((row) => ({
    id: row.code, label: `${row.name} (${row.code})`, value: row.totalSales, color: row.color,
  }));

  const topPerformers = cashierRowsFull.slice(0, 3).map((row, index) => ({
    rank: index + 1, code: row.code, name: row.name, label: `${row.name} (${row.code})`, value: row.totalSales,
  }));

  // Sales Trend (By Cashier) — 2-hour buckets across the selected day, one
  // line per cashier who sold at least once that day.
  const categories = trendCategories();
  const seriesByCashier = new Map(
    cashierRowsFull.map((row) => [row.name, {
      code: row.code, name: `${row.name} (${row.code})`, color: row.color, data: new Array(TREND_BUCKET_COUNT).fill(0),
    }]),
  );
  dayRows.forEach((row) => {
    const series = seriesByCashier.get(row.cashierName);
    if (!series) return;
    const bucket = Math.min(Math.floor(new Date(row.createdAt).getHours() / 2), TREND_BUCKET_COUNT - 1);
    series.data[bucket] = round2(series.data[bucket] + Number(row.grandTotal || 0));
  });
  const trend = { categories, series: [...seriesByCashier.values()] };

  const allTimeSales = Number(allTimeAgg._sum.grandTotal || 0);
  const allTimeInvoices = allTimeAgg._count;

  return {
    stats: {
      totalSalesAllCashiers: { value: round2(allTimeSales), transactions: allTimeInvoices },
      totalInvoices: { value: allTimeInvoices, quantity: allTimeQtyAgg._sum.qty || 0 },
      avgInvoiceValue: { value: allTimeInvoices > 0 ? round2(allTimeSales / allTimeInvoices) : 0 },
      todaysSales: { value: round2(Number(todayAgg._sum.grandTotal || 0)), transactions: todayAgg._count },
      selectedDateSales: { value: totalSalesRounded, date: formatDayLabel(dayStart) },
    },
    summary: {
      totalSales: totalSalesRounded,
      totalTransactions: dayRows.length,
      totalQuantity,
      totalInvoices: dayRows.length,
      totalDiscounts: totalDiscountsRounded,
      totalReturns: totalReturnsRounded,
      netSales,
      taxCollected: taxCollectedRounded,
    },
    byCashier,
    cashiers: cashierRowsPage,
    trend,
    topPerformers,
    totalPages,
    page: safePage,
    pageSize,
  };
}
