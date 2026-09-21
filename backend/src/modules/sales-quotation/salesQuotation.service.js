import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../middleware/errorHandler.js';

const CODE_PREFIX = 'QUO';
const CODE_LENGTH = 5;

// SGST + CGST split (2.5% + 2.5% = 5% total), matching the reference
// design's quotation detail cards and the flat 5% GST rate Sale itself uses
// for Line Sale bills (see sale.service.js's TAX_RATE).
const HALF_TAX_RATE = 0.025;

function round2(n) {
  return Math.round(n * 100) / 100;
}

async function nextQuotationCode(tenantId) {
  const count = await prisma.salesQuotation.count({ where: { tenantId } });
  return `${CODE_PREFIX}-${String(count + 1).padStart(CODE_LENGTH, '0')}`;
}

export async function nextCodePreview(tenantId) {
  return nextQuotationCode(tenantId);
}

/**
 * The DB only ever stores 'draft' | 'pending' | 'converted' (see the
 * SalesQuotation model comment in schema.prisma) — 'expired' is derived
 * live here, the same rule Promotion/GiftVoucher use for their own status:
 * a 'pending' quotation whose validTill has passed reads as 'expired', but
 * a draft that was never sent can't expire and a converted quotation is
 * already resolved either way.
 */
export function computeStatus(row) {
  if (row.status === 'pending' && new Date(row.validTill) < new Date()) return 'expired';
  return row.status;
}

// `dbStatus` is included alongside the live-computed `status` so the Edit
// Quotation form can tell a real 'draft'/'pending' apart from a 'pending'
// that's merely displaying as 'expired' today — editing never needs to know
// about the derived value, only the real stored one.
function toApiShape(row) {
  return { ...row, status: computeStatus(row), dbStatus: row.status };
}

/**
 * Recomputes every money figure from the line items server-side — never
 * trusts whatever totals the client's form happened to display. Mirrors
 * QuotationTotalsCard's own math exactly (line discount % first, then the
 * extra/overall discount on top, then SGST+CGST on the taxable amount) so
 * what the form showed while typing matches what actually gets saved.
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

export async function listSalesQuotations(tenantId, { status, search } = {}) {
  const where = { tenantId };
  if (search) {
    const q = String(search);
    where.OR = [
      { code: { contains: q, mode: 'insensitive' } },
      { customerName: { contains: q, mode: 'insensitive' } },
    ];
  }

  const rows = await prisma.salesQuotation.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { items: true },
    take: 1000,
  });
  const shaped = rows.map(toApiShape);

  // Status filtering happens after the live computation above (not in the
  // Prisma `where`), since 'expired' isn't a real column — see computeStatus().
  if (status && status !== 'all' && status !== 'All') {
    return shaped.filter((row) => row.status === String(status).toLowerCase());
  }
  return shaped;
}

export async function getSalesQuotation(tenantId, id) {
  const row = await prisma.salesQuotation.findFirst({ where: { id, tenantId }, include: { items: true } });
  if (!row) throw new ApiError(404, 'Sales quotation not found');
  return toApiShape(row);
}

export async function createSalesQuotation(tenantId, data, actor) {
  return prisma.$transaction(async (tx) => {
    const customer = await tx.customer.findFirst({ where: { id: data.customerId, tenantId } });
    if (!customer) throw new ApiError(400, 'Selected customer was not found');

    const code = data.code || (await nextQuotationCode(tenantId));
    const totals = computeTotals(data.items, data.extraDiscount);

    const {
      items, extraDiscount, customerId, status, ...rest
    } = data;

    const row = await tx.salesQuotation.create({
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
    return toApiShape(row);
  });
}

// `actor` isn't used yet (the header has no "last edited by" column), kept
// as a parameter so the route can pass req.user uniformly with create's
// signature and it's ready if that's added later.
export async function updateSalesQuotation(tenantId, id, data, actor) { // eslint-disable-line no-unused-vars
  return prisma.$transaction(async (tx) => {
    const existing = await tx.salesQuotation.findFirst({ where: { id, tenantId } });
    if (!existing) throw new ApiError(404, 'Sales quotation not found');

    const customer = await tx.customer.findFirst({ where: { id: data.customerId, tenantId } });
    if (!customer) throw new ApiError(400, 'Selected customer was not found');

    const totals = computeTotals(data.items, data.extraDiscount);
    const {
      items, extraDiscount, customerId, status, code, ...rest
    } = data;

    // Items are a full replace on every edit (delete then recreate) — the
    // form always resubmits the complete grid, so there's no "which rows
    // changed" diff to compute, same approach the create path uses.
    await tx.salesQuotationItem.deleteMany({ where: { quotationId: id } });

    const row = await tx.salesQuotation.update({
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
        // A quotation already 'converted' can't be edited back into
        // draft/pending through this form (that status isn't offered by
        // createSalesQuotationSchema in the first place), so this only ever
        // flips between draft/pending.
        status,
        items: { create: totals.lineData.map(itemCreateData) },
      },
      include: { items: true },
    });
    return toApiShape(row);
  });
}

export async function deleteSalesQuotation(tenantId, id) {
  const existing = await prisma.salesQuotation.findFirst({ where: { id, tenantId } });
  if (!existing) throw new ApiError(404, 'Sales quotation not found');
  await prisma.salesQuotation.delete({ where: { id } });
  return { id };
}

/**
 * Powers the Sales Quotation page's top 5-tile summary strip — every figure
 * here is a real aggregate across this tenant's actual SalesQuotation rows,
 * computed at request time (never a stored/cached counter that could drift).
 */
export async function getSalesQuotationSummary(tenantId) {
  const rows = await prisma.salesQuotation.findMany({
    where: { tenantId },
    select: { status: true, validTill: true, grandTotal: true },
  });
  const shaped = rows.map((row) => ({ ...row, status: computeStatus(row) }));

  const totalAmount = shaped.reduce((sum, row) => sum + Number(row.grandTotal), 0);
  const countByStatus = (status) => shaped.filter((row) => row.status === status).length;

  return {
    totalQuotations: shaped.length,
    totalAmount: round2(totalAmount),
    draft: countByStatus('draft'),
    pending: countByStatus('pending'),
    converted: countByStatus('converted'),
    expired: countByStatus('expired'),
  };
}

/**
 * Powers the Draft/Converted/Expired status pages' 4-tile strip (count +
 * three real aggregates) for one status at a time — count, total quotation
 * value, average quotation value, and total line items across that status's
 * quotations. All computed from real rows; a status with zero quotations
 * honestly returns zeros rather than any placeholder figure.
 */
export async function getSalesQuotationStatusSummary(tenantId, status) {
  const rows = await prisma.salesQuotation.findMany({
    where: { tenantId },
    include: { items: true },
  });
  const shaped = rows
    .map((row) => ({ ...row, status: computeStatus(row) }))
    .filter((row) => row.status === status);

  const count = shaped.length;
  const totalAmount = shaped.reduce((sum, row) => sum + Number(row.grandTotal), 0);
  const totalItems = shaped.reduce((sum, row) => sum + row.items.length, 0);
  const averageAmount = count > 0 ? totalAmount / count : 0;

  return {
    count,
    totalAmount: round2(totalAmount),
    averageAmount: round2(averageAmount),
    totalItems,
  };
}
