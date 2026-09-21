import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../middleware/errorHandler.js';

const CODE_PREFIX = 'SO';
const CODE_LENGTH = 5;

// SGST + CGST split (2.5% + 2.5% = 5% total), matching the reference design's
// order detail cards / OrderTotalsCard, and the same rate Sale and Sales
// Quotation already use.
const HALF_TAX_RATE = 0.025;

function round2(n) {
  return Math.round(n * 100) / 100;
}

async function nextOrderCode(tenantId) {
  const count = await prisma.salesOrder.count({ where: { tenantId } });
  return `${CODE_PREFIX}-${String(count + 1).padStart(CODE_LENGTH, '0')}`;
}

export async function nextCodePreview(tenantId) {
  return nextOrderCode(tenantId);
}

/**
 * Recomputes every money figure from the line items server-side — never
 * trusts whatever totals the client's form happened to display. Mirrors
 * OrderTotalsCard's own math exactly (line discount % first, then the
 * extra/overall discount on top, then SGST+CGST on the taxable amount), and
 * is identical to Sales Quotation's own computeTotals() since both forms
 * share the same items-grid shape and tax convention.
 */
function computeTotals(items, extraDiscount) {
  let subTotal = 0;
  let lineDiscountTotal = 0;

  const lineData = items.map((item) => {
    const lineTotal = item.qty * item.unitPrice;
    const discountAmount = round2(lineTotal * (item.discountPercent / 100));
    const amount = Math.max(round2(lineTotal - discountAmount), 0);
    subTotal += lineTotal;
    lineDiscountTotal += discountAmount;
    return { ...item, discountAmount, amount };
  });

  const discountAmount = round2(lineDiscountTotal + extraDiscount);
  const taxableAmount = Math.max(round2(subTotal - discountAmount), 0);
  const sgstAmount = round2(taxableAmount * HALF_TAX_RATE);
  const cgstAmount = round2(taxableAmount * HALF_TAX_RATE);
  const grandTotal = round2(taxableAmount + sgstAmount + cgstAmount);

  return {
    lineData,
    subTotal: round2(subTotal),
    discountAmount,
    taxableAmount,
    sgstAmount,
    cgstAmount,
    grandTotal,
  };
}

function itemCreateData(item) {
  return {
    itemCode: item.itemCode,
    itemName: item.itemName,
    hsnCode: item.hsnCode || null,
    qty: item.qty,
    unit: item.unit || null,
    unitPrice: item.unitPrice,
    discountPercent: item.discountPercent,
    discountAmount: item.discountAmount,
    taxCode: item.taxCode || null,
    amount: item.amount,
  };
}

export async function listSalesOrders(tenantId, { status, search } = {}) {
  const where = { tenantId };
  // Unlike Sales Quotation's live-derived 'expired', an order's status is a
  // plain stored column, so it can be filtered directly in the query.
  if (status && status !== 'all' && status !== 'All') {
    where.status = String(status).toLowerCase();
  }
  if (search) {
    const q = String(search);
    where.OR = [
      { code: { contains: q, mode: 'insensitive' } },
      { customerName: { contains: q, mode: 'insensitive' } },
    ];
  }

  const rows = await prisma.salesOrder.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { items: true },
    take: 1000,
  });
  return rows;
}

export async function getSalesOrder(tenantId, id) {
  const row = await prisma.salesOrder.findFirst({ where: { id, tenantId }, include: { items: true } });
  if (!row) throw new ApiError(404, 'Sales order not found');
  return row;
}

// If a Quotation Ref. is supplied, it must actually name a real quotation of
// this tenant's — never accept a stray string that looks like a code but
// isn't. Blank is fine (the field is optional).
async function assertQuotationRefIsValid(tx, tenantId, quotationRef) {
  if (!quotationRef) return;
  const quotation = await tx.salesQuotation.findFirst({ where: { tenantId, code: quotationRef } });
  if (!quotation) throw new ApiError(400, `Quotation reference "${quotationRef}" was not found`);
}

export async function createSalesOrder(tenantId, data, actor) {
  return prisma.$transaction(async (tx) => {
    const customer = await tx.customer.findFirst({ where: { id: data.customerId, tenantId } });
    if (!customer) throw new ApiError(400, 'Selected customer was not found');
    await assertQuotationRefIsValid(tx, tenantId, data.quotationRef);

    const code = data.code || (await nextOrderCode(tenantId));
    const totals = computeTotals(data.items, data.extraDiscount);

    const {
      items, extraDiscount, customerId, status, ...rest
    } = data;

    const row = await tx.salesOrder.create({
      data: {
        ...rest,
        tenantId,
        code,
        customerId,
        customerName: customer.name,
        extraDiscount,
        subTotal: totals.subTotal,
        discountAmount: totals.discountAmount,
        taxableAmount: totals.taxableAmount,
        sgstAmount: totals.sgstAmount,
        cgstAmount: totals.cgstAmount,
        grandTotal: totals.grandTotal,
        status,
        createdBy: actor?.name || 'Admin',
        items: { create: totals.lineData.map(itemCreateData) },
      },
      include: { items: true },
    });
    return row;
  });
}

// `actor` isn't used yet (the header has no "last edited by" column), kept
// as a parameter so the route can pass req.user uniformly with create's
// signature and it's ready if that's added later.
export async function updateSalesOrder(tenantId, id, data, actor) { // eslint-disable-line no-unused-vars
  return prisma.$transaction(async (tx) => {
    const existing = await tx.salesOrder.findFirst({ where: { id, tenantId } });
    if (!existing) throw new ApiError(404, 'Sales order not found');

    const customer = await tx.customer.findFirst({ where: { id: data.customerId, tenantId } });
    if (!customer) throw new ApiError(400, 'Selected customer was not found');
    await assertQuotationRefIsValid(tx, tenantId, data.quotationRef);

    const totals = computeTotals(data.items, data.extraDiscount);
    const {
      items, extraDiscount, customerId, status, code, ...rest
    } = data;

    // Items are a full replace on every edit (delete then recreate) — the
    // form always resubmits the complete grid, so there's no "which rows
    // changed" diff to compute, same approach Sales Quotation's edit uses.
    await tx.salesOrderItem.deleteMany({ where: { orderId: id } });

    const row = await tx.salesOrder.update({
      where: { id },
      data: {
        ...rest,
        customerId,
        customerName: customer.name,
        extraDiscount,
        subTotal: totals.subTotal,
        discountAmount: totals.discountAmount,
        taxableAmount: totals.taxableAmount,
        sgstAmount: totals.sgstAmount,
        cgstAmount: totals.cgstAmount,
        grandTotal: totals.grandTotal,
        status,
        items: { create: totals.lineData.map(itemCreateData) },
      },
      include: { items: true },
    });
    return row;
  });
}

export async function deleteSalesOrder(tenantId, id) {
  const existing = await prisma.salesOrder.findFirst({ where: { id, tenantId } });
  if (!existing) throw new ApiError(404, 'Sales order not found');
  await prisma.salesOrder.delete({ where: { id } });
  return { id };
}

/**
 * Powers the Sales Order page's top 5-tile summary strip — every figure here
 * is a real aggregate across this tenant's actual SalesOrder rows, computed
 * at request time (never a stored/cached counter that could drift).
 */
export async function getSalesOrderSummary(tenantId) {
  const rows = await prisma.salesOrder.findMany({
    where: { tenantId },
    select: { status: true, grandTotal: true },
  });

  const totalAmount = rows.reduce((sum, row) => sum + Number(row.grandTotal), 0);
  const countByStatus = (status) => rows.filter((row) => row.status === status).length;

  return {
    totalOrders: rows.length,
    totalAmount: round2(totalAmount),
    confirmed: countByStatus('confirmed'),
    pending: countByStatus('pending'),
    delivered: countByStatus('delivered'),
  };
}

/**
 * Powers the Pending/Confirmed/Delivered status pages' 4-tile strip (count +
 * three real aggregates) for one status at a time — count, total order
 * value, average order value, and total line items across that status's
 * orders. All computed from real rows; a status with zero orders (currently
 * true of 'delivered' — see the SalesOrder model comment on why nothing sets
 * it yet) honestly returns zeros rather than any placeholder figure.
 */
export async function getSalesOrderStatusSummary(tenantId, status) {
  const rows = await prisma.salesOrder.findMany({
    where: { tenantId, status },
    include: { items: true },
  });

  const count = rows.length;
  const totalAmount = rows.reduce((sum, row) => sum + Number(row.grandTotal), 0);
  const totalItems = rows.reduce((sum, row) => sum + row.items.length, 0);
  const averageAmount = count > 0 ? totalAmount / count : 0;

  return {
    count,
    totalAmount: round2(totalAmount),
    averageAmount: round2(averageAmount),
    totalItems,
  };
}
