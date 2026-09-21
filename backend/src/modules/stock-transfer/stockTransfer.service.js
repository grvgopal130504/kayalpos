import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../middleware/errorHandler.js';

const CODE_PREFIX = 'TRF';
const CODE_LENGTH = 5;

function round2(n) {
  return Math.round(n * 100) / 100;
}

async function nextTransferCode(tenantId) {
  const count = await prisma.stockTransfer.count({ where: { tenantId } });
  return `${CODE_PREFIX}-${String(count + 1).padStart(CODE_LENGTH, '0')}`;
}

export async function nextCodePreview(tenantId) {
  return nextTransferCode(tenantId);
}

// fromOutletId/toOutletId are plain client-supplied ids, not formal Prisma
// relations (see the StockTransfer model's own comment on why) — so they're
// validated here, against a real Outlet row for this tenant, before ever
// being trusted. Returns the outlet's name for the snapshot column, or
// throws a 400 naming exactly which reference was invalid.
async function assertOutletIsValid(tx, tenantId, outletId, label) {
  const outlet = await tx.outlet.findFirst({ where: { id: outletId, tenantId } });
  if (!outlet) throw new ApiError(400, `${label} references an outlet that does not exist`);
  return outlet.name;
}

// indentRef is a plain text snapshot of a real StockIndent's code, not a
// formal relation (same rule as fromOutletId/toOutletId above) — when
// provided it must match a real, approved StockIndent for this tenant.
// Nothing in the app can move a StockIndent to 'approved' yet (see that
// model's own comment), so this will honestly reject every value until the
// approval workflow exists — that's the correct behavior, not a bug.
async function assertIndentRefIsValid(tx, tenantId, indentRef) {
  if (!indentRef) return null;
  const indent = await tx.stockIndent.findFirst({ where: { code: indentRef, tenantId, status: 'approved' } });
  if (!indent) throw new ApiError(400, 'Stock Indent reference must be a real, approved indent');
  return indentRef;
}

// Each line's availableQty/unitCost are frozen lookups against the real
// Product master (matched by itemCode, scoped to this tenant) at save
// time — never trusted from the client, never a live join on read. An item
// code with no matching product honestly gets 0 for both rather than a
// fabricated number, same "frozen snapshot" rule Stock Indent applies to
// its own line amounts.
async function computeItems(tx, tenantId, items) {
  const codes = items.map((item) => item.itemCode);
  const products = await tx.product.findMany({ where: { tenantId, code: { in: codes } } });
  const byCode = new Map(products.map((p) => [p.code, p]));

  let totalTransferQty = 0;
  let totalEstimatedValue = 0;

  const rows = items.map((item) => {
    const product = byCode.get(item.itemCode);
    const availableQty = product ? Number(product.availableQty) : 0;
    const unitCost = product ? Number(product.salePrice) : 0;
    const transferQty = Number(item.transferQty);
    const totalCost = round2(transferQty * unitCost);

    totalTransferQty += transferQty;
    totalEstimatedValue += totalCost;

    return {
      itemCode: item.itemCode,
      itemName: item.itemName,
      hsnCode: item.hsnCode || null,
      uom: item.uom || null,
      transferQty,
      availableQty,
      unitCost,
      totalCost,
      remarks: item.remarks || null,
    };
  });

  return {
    rows,
    totals: {
      totalItems: rows.length,
      totalTransferQty: round2(totalTransferQty),
      totalEstimatedValue: round2(totalEstimatedValue),
    },
  };
}

export async function listStockTransfers(tenantId, { status, search } = {}) {
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
      { fromOutletName: { contains: q, mode: 'insensitive' } },
    ];
  }

  const rows = await prisma.stockTransfer.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { items: true },
    take: 1000,
  });
  return rows;
}

export async function getStockTransfer(tenantId, id) {
  const row = await prisma.stockTransfer.findFirst({ where: { id, tenantId }, include: { items: true } });
  if (!row) throw new ApiError(404, 'Stock transfer not found');
  return row;
}

export async function createStockTransfer(tenantId, data, actor) {
  return prisma.$transaction(async (tx) => {
    const code = data.code || (await nextTransferCode(tenantId));

    const fromOutletName = await assertOutletIsValid(tx, tenantId, data.fromOutletId, 'From Outlet');
    const toOutletName = await assertOutletIsValid(tx, tenantId, data.toOutletId, 'To Outlet');
    const indentRef = await assertIndentRefIsValid(tx, tenantId, data.indentRef);

    const { rows, totals } = await computeItems(tx, tenantId, data.items);

    const {
      items, status, fromOutletId, toOutletId, indentRef: _indentRef, ...rest
    } = data;

    const row = await tx.stockTransfer.create({
      data: {
        ...rest,
        tenantId,
        code,
        fromOutletId,
        fromOutletName,
        toOutletId,
        toOutletName,
        indentRef,
        totalItems: totals.totalItems,
        totalTransferQty: totals.totalTransferQty,
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
export async function updateStockTransfer(tenantId, id, data, actor) { // eslint-disable-line no-unused-vars
  return prisma.$transaction(async (tx) => {
    const existing = await tx.stockTransfer.findFirst({ where: { id, tenantId } });
    if (!existing) throw new ApiError(404, 'Stock transfer not found');

    const fromOutletName = await assertOutletIsValid(tx, tenantId, data.fromOutletId, 'From Outlet');
    const toOutletName = await assertOutletIsValid(tx, tenantId, data.toOutletId, 'To Outlet');
    const indentRef = await assertIndentRefIsValid(tx, tenantId, data.indentRef);

    const { rows, totals } = await computeItems(tx, tenantId, data.items);
    const {
      items, status, code, fromOutletId, toOutletId, indentRef: _indentRef, ...rest
    } = data;

    // Items are a full replace on every edit (delete then recreate) — the
    // form always resubmits the complete grid, so there's no "which rows
    // changed" diff to compute, same approach the other modules' edit flows
    // use.
    await tx.stockTransferItem.deleteMany({ where: { transferId: id } });

    const row = await tx.stockTransfer.update({
      where: { id },
      data: {
        ...rest,
        fromOutletId,
        fromOutletName,
        toOutletId,
        toOutletName,
        indentRef,
        totalItems: totals.totalItems,
        totalTransferQty: totals.totalTransferQty,
        totalEstimatedValue: totals.totalEstimatedValue,
        status,
        items: { create: rows },
      },
      include: { items: true },
    });
    return row;
  });
}

export async function deleteStockTransfer(tenantId, id) {
  const existing = await prisma.stockTransfer.findFirst({ where: { id, tenantId } });
  if (!existing) throw new ApiError(404, 'Stock transfer not found');
  await prisma.stockTransfer.delete({ where: { id } });
  return { id };
}

/**
 * Powers the Stock Transfer page's top 5-tile summary strip — every figure
 * here is a real aggregate across this tenant's actual StockTransfer rows,
 * computed at request time (never a stored/cached counter that could
 * drift). "Received"/"Cancelled" honestly read zero today since nothing
 * sets those statuses yet (see the StockTransfer model's own comment).
 */
export async function getStockTransferSummary(tenantId) {
  const rows = await prisma.stockTransfer.findMany({
    where: { tenantId },
    select: { status: true, totalEstimatedValue: true },
  });

  const countByStatus = (status) => rows.filter((row) => row.status === status).length;
  const totalEstimatedValue = rows.reduce((sum, row) => sum + Number(row.totalEstimatedValue), 0);

  return {
    totalTransfers: rows.length,
    totalEstimatedValue: round2(totalEstimatedValue),
    received: countByStatus('received'),
    inTransit: countByStatus('in-transit'),
    cancelled: countByStatus('cancelled'),
  };
}

/**
 * Powers the Draft/In Transit/Received/Cancelled status pages' 4-tile strip
 * (count + three real aggregates) for one status at a time — count, total
 * estimated value, average transfer value, and total line items across
 * that status's transfers. All computed from real rows; a status with zero
 * transfers (currently true of 'received'/'cancelled' — see the
 * StockTransfer model comment on why nothing sets them yet) honestly
 * returns zeros rather than any placeholder figure.
 */
export async function getStockTransferStatusSummary(tenantId, status) {
  const rows = await prisma.stockTransfer.findMany({
    where: { tenantId, status },
    include: { items: true },
  });

  const count = rows.length;
  const totalEstimatedValue = rows.reduce((sum, row) => sum + Number(row.totalEstimatedValue), 0);
  const totalItems = rows.reduce((sum, row) => sum + row.items.length, 0);
  const averageTransferValue = count > 0 ? totalEstimatedValue / count : 0;

  return {
    count,
    totalEstimatedValue: round2(totalEstimatedValue),
    averageTransferValue: round2(averageTransferValue),
    totalItems,
  };
}
