import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../middleware/errorHandler.js';

const CODE_PREFIX = 'WST';
const CODE_LENGTH = 5;

function round2(n) {
  return Math.round(n * 100) / 100;
}

async function nextWastageCode(tenantId) {
  const count = await prisma.stockWastage.count({ where: { tenantId } });
  return `${CODE_PREFIX}-${String(count + 1).padStart(CODE_LENGTH, '0')}`;
}

export async function nextCodePreview(tenantId) {
  return nextWastageCode(tenantId);
}

// outletId is a plain client-supplied id, not a formal Prisma relation (see
// the StockWastage model's own comment on why) — so it's validated here,
// against a real Outlet row for this tenant, before ever being trusted.
// Returns the outlet's name for the snapshot column, or throws a 400 naming
// exactly which reference was invalid.
async function assertOutletIsValid(tx, tenantId, outletId) {
  const outlet = await tx.outlet.findFirst({ where: { id: outletId, tenantId } });
  if (!outlet) throw new ApiError(400, 'Outlet / Location references an outlet that does not exist');
  return outlet.name;
}

// Unlike a Product-master join, there is none here — availableQty/
// wastageQty/unitCost are all the real figures the user typed off the
// shelf/stock check. What IS recomputed server-side (never trusted from the
// client) is each line's totalValue and the document's aggregate totals,
// using the same formula WastageSummaryTotals previews client-side:
// wastageQty * unitCost — no discount/tax on a stock write-off.
function computeItems(items) {
  let totalWastageQty = 0;
  let totalValue = 0;

  const rows = items.map((item) => {
    const availableQty = Number(item.availableQty) || 0;
    const wastageQty = Number(item.wastageQty);
    const unitCost = Number(item.unitCost) || 0;
    const lineValue = round2(wastageQty * unitCost);

    totalWastageQty += wastageQty;
    totalValue += lineValue;

    return {
      itemCode: item.itemCode,
      itemName: item.itemName,
      hsnCode: item.hsnCode || null,
      uom: item.uom || null,
      batchNo: item.batchNo || null,
      expiryDate: item.expiryDate || null,
      availableQty,
      wastageQty,
      unitCost,
      totalValue: lineValue,
      remarks: item.remarks || null,
    };
  });

  return {
    rows,
    totals: {
      totalItems: rows.length,
      totalWastageQty: round2(totalWastageQty),
      totalValue: round2(totalValue),
    },
  };
}

export async function listStockWastages(tenantId, { status, search } = {}) {
  const where = { tenantId };
  if (status && status !== 'all' && status !== 'All') {
    where.status = String(status).toLowerCase();
  }
  if (search) {
    const q = String(search);
    where.OR = [
      { code: { contains: q, mode: 'insensitive' } },
      { outletName: { contains: q, mode: 'insensitive' } },
    ];
  }

  const rows = await prisma.stockWastage.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { items: true },
    take: 1000,
  });
  return rows;
}

export async function getStockWastage(tenantId, id) {
  const row = await prisma.stockWastage.findFirst({ where: { id, tenantId }, include: { items: true } });
  if (!row) throw new ApiError(404, 'Stock wastage not found');
  return row;
}

export async function createStockWastage(tenantId, data, actor) {
  return prisma.$transaction(async (tx) => {
    const code = data.code || (await nextWastageCode(tenantId));

    const outletName = await assertOutletIsValid(tx, tenantId, data.outletId);

    const { rows, totals } = computeItems(data.items);

    const {
      items, status, outletId, ...rest
    } = data;

    const row = await tx.stockWastage.create({
      data: {
        ...rest,
        tenantId,
        code,
        outletId,
        outletName,
        totalItems: totals.totalItems,
        totalWastageQty: totals.totalWastageQty,
        totalValue: totals.totalValue,
        status,
        createdBy: actor?.name || 'Admin',
        items: { create: rows },
      },
      include: { items: true },
    });
    return row;
  });
}

export async function updateStockWastage(tenantId, id, data, actor) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.stockWastage.findFirst({ where: { id, tenantId } });
    if (!existing) throw new ApiError(404, 'Stock wastage not found');

    const outletName = await assertOutletIsValid(tx, tenantId, data.outletId);

    const { rows, totals } = computeItems(data.items);
    const {
      items, status, code, outletId, ...rest
    } = data;

    // Items are a full replace on every edit (delete then recreate) — the
    // form always resubmits the complete grid, same approach the other
    // modules' edit flows use.
    await tx.stockWastageItem.deleteMany({ where: { wastageId: id } });

    const row = await tx.stockWastage.update({
      where: { id },
      data: {
        ...rest,
        outletId,
        outletName,
        totalItems: totals.totalItems,
        totalWastageQty: totals.totalWastageQty,
        totalValue: totals.totalValue,
        status,
        items: { create: rows },
      },
      include: { items: true },
    });
    return row;
  });
}

export async function deleteStockWastage(tenantId, id) {
  const existing = await prisma.stockWastage.findFirst({ where: { id, tenantId } });
  if (!existing) throw new ApiError(404, 'Stock wastage not found');
  await prisma.stockWastage.delete({ where: { id } });
  return { id };
}

/**
 * Powers the Stock Wastage page's top 5-tile summary strip — every figure
 * here is a real aggregate across this tenant's actual StockWastage rows,
 * computed at request time (never a stored/cached counter that could
 * drift). "Approved (This Month)" and "Value Wasted (This Month)" are
 * scoped to wastages whose updatedAt falls within the current calendar
 * month (server clock) and whose status is 'approved' — a tenant with no
 * wastages approved this month honestly shows 0 rather than a placeholder
 * figure. (There is no dedicated approvedOn column — unlike Stock Return's
 * acceptedOn — because Stock Wastage's Approved By is plain user-typed text,
 * not a server-stamped terminal-state field, so updatedAt is the honest
 * proxy for "when this row last moved", same as any other write.)
 */
export async function getStockWastageSummary(tenantId) {
  const rows = await prisma.stockWastage.findMany({
    where: { tenantId },
    select: {
      status: true, totalValue: true, updatedAt: true,
    },
  });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const draftWastages = rows.filter((row) => row.status === 'draft').length;
  const approvedWastages = rows.filter((row) => row.status === 'approved').length;
  const approvedThisMonth = rows.filter(
    (row) => row.status === 'approved' && row.updatedAt && new Date(row.updatedAt) >= monthStart,
  );

  return {
    totalWastages: rows.length,
    draftWastages,
    approvedWastages,
    approvedThisMonth: approvedThisMonth.length,
    valueWasted: round2(approvedThisMonth.reduce((sum, row) => sum + Number(row.totalValue), 0)),
  };
}
