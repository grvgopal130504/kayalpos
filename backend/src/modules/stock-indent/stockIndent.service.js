import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../middleware/errorHandler.js';

const CODE_PREFIX = 'IND';
const CODE_LENGTH = 5;

function round2(n) {
  return Math.round(n * 100) / 100;
}

async function nextIndentCode(tenantId) {
  const count = await prisma.stockIndent.count({ where: { tenantId } });
  return `${CODE_PREFIX}-${String(count + 1).padStart(CODE_LENGTH, '0')}`;
}

export async function nextCodePreview(tenantId) {
  return nextIndentCode(tenantId);
}

// fromOutletId/toOutletId/locationId are plain client-supplied ids, not
// formal Prisma relations (see the StockIndent model's own comment on why)
// — so they're validated here, against a real Outlet row for this tenant,
// before ever being trusted. Returns the outlet's name for the snapshot
// column, or throws a 400 naming exactly which reference was invalid.
async function assertOutletIsValid(tx, tenantId, outletId, label) {
  const outlet = await tx.outlet.findFirst({ where: { id: outletId, tenantId } });
  if (!outlet) throw new ApiError(400, `${label} references an outlet that does not exist`);
  return outlet.name;
}

// Each line's availableQty/unitValue are frozen lookups against the real
// Product master (matched by itemCode, scoped to this tenant) at save
// time — never trusted from the client, never a live join on read. An item
// code with no matching product honestly gets 0 for both rather than a
// fabricated number, same "frozen snapshot" rule the sales-cycle documents
// apply to their own line amounts.
async function computeItems(tx, tenantId, items) {
  const codes = items.map((item) => item.itemCode);
  const products = await tx.product.findMany({ where: { tenantId, code: { in: codes } } });
  const byCode = new Map(products.map((p) => [p.code, p]));

  let totalRequiredQty = 0;
  let totalEstimatedValue = 0;

  const rows = items.map((item) => {
    const product = byCode.get(item.itemCode);
    const availableQty = product ? Number(product.availableQty) : 0;
    const unitValue = product ? Number(product.salePrice) : 0;
    const requiredQty = Number(item.requiredQty);
    const amount = round2(requiredQty * unitValue);

    totalRequiredQty += requiredQty;
    totalEstimatedValue += amount;

    return {
      itemCode: item.itemCode,
      itemName: item.itemName,
      hsnCode: item.hsnCode || null,
      uom: item.uom || null,
      requiredQty,
      availableQty,
      unitValue,
      amount,
      issueWarehouse: item.issueWarehouse || null,
      remarks: item.remarks || null,
    };
  });

  return {
    rows,
    totals: {
      totalItems: rows.length,
      totalRequiredQty: round2(totalRequiredQty),
      totalEstimatedValue: round2(totalEstimatedValue),
    },
  };
}

export async function listStockIndents(tenantId, { status, search } = {}) {
  const where = { tenantId };
  // A plain stored status column (no live date-derived state here, unlike
  // Sales Quotation/Invoice's 'expired'/'overdue'), so it can be filtered
  // directly in the query.
  if (status && status !== 'all' && status !== 'All') {
    where.status = String(status).toLowerCase();
  }
  if (search) {
    const q = String(search);
    where.OR = [
      { code: { contains: q, mode: 'insensitive' } },
      { department: { contains: q, mode: 'insensitive' } },
    ];
  }

  const rows = await prisma.stockIndent.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { items: true },
    take: 1000,
  });
  return rows;
}

export async function getStockIndent(tenantId, id) {
  const row = await prisma.stockIndent.findFirst({ where: { id, tenantId }, include: { items: true } });
  if (!row) throw new ApiError(404, 'Stock indent not found');
  return row;
}

export async function createStockIndent(tenantId, data, actor) {
  return prisma.$transaction(async (tx) => {
    const code = data.code || (await nextIndentCode(tenantId));

    const fromOutletName = await assertOutletIsValid(tx, tenantId, data.fromOutletId, 'From Outlet');
    const toOutletName = await assertOutletIsValid(tx, tenantId, data.toOutletId, 'To Outlet');
    const locationName = data.locationId
      ? await assertOutletIsValid(tx, tenantId, data.locationId, 'Location')
      : null;

    const { rows, totals } = await computeItems(tx, tenantId, data.items);

    const { items, status, fromOutletId, toOutletId, locationId, ...rest } = data;

    const row = await tx.stockIndent.create({
      data: {
        ...rest,
        tenantId,
        code,
        fromOutletId,
        fromOutletName,
        toOutletId,
        toOutletName,
        locationId: locationId || null,
        locationName,
        totalItems: totals.totalItems,
        totalRequiredQty: totals.totalRequiredQty,
        totalEstimatedValue: totals.totalEstimatedValue,
        status,
        createdBy: actor?.name || 'Admin',
        items: { create: rows },
      },
      include: { items: true },
    });
    return row;
  });
}

// `actor` isn't used yet (the header has no "last edited by" column), kept
// as a parameter so the route can pass req.user uniformly with create's
// signature and it's ready if that's added later.
export async function updateStockIndent(tenantId, id, data, actor) { // eslint-disable-line no-unused-vars
  return prisma.$transaction(async (tx) => {
    const existing = await tx.stockIndent.findFirst({ where: { id, tenantId } });
    if (!existing) throw new ApiError(404, 'Stock indent not found');

    const fromOutletName = await assertOutletIsValid(tx, tenantId, data.fromOutletId, 'From Outlet');
    const toOutletName = await assertOutletIsValid(tx, tenantId, data.toOutletId, 'To Outlet');
    const locationName = data.locationId
      ? await assertOutletIsValid(tx, tenantId, data.locationId, 'Location')
      : null;

    const { rows, totals } = await computeItems(tx, tenantId, data.items);
    const { items, status, code, fromOutletId, toOutletId, locationId, ...rest } = data;

    // Items are a full replace on every edit (delete then recreate) — the
    // form always resubmits the complete grid, so there's no "which rows
    // changed" diff to compute, same approach the other modules' edit flows
    // use.
    await tx.stockIndentItem.deleteMany({ where: { indentId: id } });

    const row = await tx.stockIndent.update({
      where: { id },
      data: {
        ...rest,
        fromOutletId,
        fromOutletName,
        toOutletId,
        toOutletName,
        locationId: locationId || null,
        locationName,
        totalItems: totals.totalItems,
        totalRequiredQty: totals.totalRequiredQty,
        totalEstimatedValue: totals.totalEstimatedValue,
        status,
        items: { create: rows },
      },
      include: { items: true },
    });
    return row;
  });
}

export async function deleteStockIndent(tenantId, id) {
  const existing = await prisma.stockIndent.findFirst({ where: { id, tenantId } });
  if (!existing) throw new ApiError(404, 'Stock indent not found');
  await prisma.stockIndent.delete({ where: { id } });
  return { id };
}

/**
 * Powers the Stock Indent page's top 5-tile summary strip — every figure
 * here is a real aggregate across this tenant's actual StockIndent rows,
 * computed at request time (never a stored/cached counter that could
 * drift). "Approved"/"Rejected" honestly read zero today since nothing sets
 * those statuses yet (see the StockIndent model's own comment).
 */
export async function getStockIndentSummary(tenantId) {
  const rows = await prisma.stockIndent.findMany({
    where: { tenantId },
    select: { status: true, totalEstimatedValue: true },
  });

  const countByStatus = (status) => rows.filter((row) => row.status === status).length;
  const totalEstimatedValue = rows.reduce((sum, row) => sum + Number(row.totalEstimatedValue), 0);

  return {
    totalIndents: rows.length,
    totalEstimatedValue: round2(totalEstimatedValue),
    approved: countByStatus('approved'),
    pendingApproval: countByStatus('pending-approval'),
    rejected: countByStatus('rejected'),
  };
}

/**
 * Powers the Draft/Pending Approval/Approved/Rejected status pages' 4-tile
 * strip (count + three real aggregates) for one status at a time — count,
 * total estimated value, average indent value, and total line items across
 * that status's indents. All computed from real rows; a status with zero
 * indents (currently true of 'approved'/'rejected' — see the StockIndent
 * model comment on why nothing sets them yet) honestly returns zeros rather
 * than any placeholder figure.
 */
export async function getStockIndentStatusSummary(tenantId, status) {
  const rows = await prisma.stockIndent.findMany({
    where: { tenantId, status },
    include: { items: true },
  });

  const count = rows.length;
  const totalEstimatedValue = rows.reduce((sum, row) => sum + Number(row.totalEstimatedValue), 0);
  const totalItems = rows.reduce((sum, row) => sum + row.items.length, 0);
  const averageIndentValue = count > 0 ? totalEstimatedValue / count : 0;

  return {
    count,
    totalEstimatedValue: round2(totalEstimatedValue),
    averageIndentValue: round2(averageIndentValue),
    totalItems,
  };
}
