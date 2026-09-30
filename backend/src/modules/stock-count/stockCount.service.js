import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../middleware/errorHandler.js';

const CODE_PREFIX = 'CNT';
const CODE_LENGTH = 5;

function round2(n) {
  return Math.round(n * 100) / 100;
}

async function nextCountCode(tenantId) {
  const count = await prisma.stockCount.count({ where: { tenantId } });
  return `${CODE_PREFIX}-${String(count + 1).padStart(CODE_LENGTH, '0')}`;
}

export async function nextCodePreview(tenantId) {
  return nextCountCode(tenantId);
}

// Unlike a Product-master join, there is none here — systemQty/countedQty/
// unitCost are all the real figures the user typed off the physical count.
// What IS recomputed server-side (never trusted from the client) is each
// line's varianceQty/varianceValue and the document's aggregate totals,
// using the same formula CountSummaryTotals previews client-side:
// varianceQty = countedQty - systemQty, varianceValue = varianceQty *
// unitCost.
function computeItems(items) {
  let totalSystemQty = 0;
  let totalCountedQty = 0;
  let totalVarianceQty = 0;
  let totalVarianceValue = 0;
  let totalCountValue = 0;

  const rows = items.map((item) => {
    const systemQty = Number(item.systemQty) || 0;
    const countedQty = Number(item.countedQty);
    const unitCost = Number(item.unitCost) || 0;
    const varianceQty = round2(countedQty - systemQty);
    const varianceValue = round2(varianceQty * unitCost);

    totalSystemQty += systemQty;
    totalCountedQty += countedQty;
    totalVarianceQty += varianceQty;
    totalVarianceValue += varianceValue;
    totalCountValue += countedQty * unitCost;

    return {
      itemCode: item.itemCode,
      itemName: item.itemName,
      hsnCode: item.hsnCode || null,
      uom: item.uom || null,
      systemQty,
      countedQty,
      unitCost,
      varianceQty,
      varianceValue,
      remarks: item.remarks || null,
    };
  });

  return {
    rows,
    totals: {
      totalItems: rows.length,
      totalSystemQty: round2(totalSystemQty),
      totalCountedQty: round2(totalCountedQty),
      totalVarianceQty: round2(totalVarianceQty),
      totalVarianceValue: round2(totalVarianceValue),
      totalCountValue: round2(totalCountValue),
    },
  };
}

export async function listStockCounts(tenantId, { status, search } = {}) {
  const where = { tenantId };
  if (status && status !== 'all' && status !== 'All') {
    where.status = String(status).toLowerCase();
  }
  if (search) {
    const q = String(search);
    where.OR = [
      { code: { contains: q, mode: 'insensitive' } },
      { warehouse: { contains: q, mode: 'insensitive' } },
    ];
  }

  const rows = await prisma.stockCount.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { items: true },
    take: 1000,
  });
  return rows;
}

export async function getStockCount(tenantId, id) {
  const row = await prisma.stockCount.findFirst({ where: { id, tenantId }, include: { items: true } });
  if (!row) throw new ApiError(404, 'Stock count not found');
  return row;
}

export async function createStockCount(tenantId, data, actor) {
  return prisma.$transaction(async (tx) => {
    const code = data.code || (await nextCountCode(tenantId));

    const { rows, totals } = computeItems(data.items);

    const { items, status, ...rest } = data;

    const row = await tx.stockCount.create({
      data: {
        ...rest,
        tenantId,
        code,
        totalItems: totals.totalItems,
        totalSystemQty: totals.totalSystemQty,
        totalCountedQty: totals.totalCountedQty,
        totalVarianceQty: totals.totalVarianceQty,
        totalVarianceValue: totals.totalVarianceValue,
        totalCountValue: totals.totalCountValue,
        status,
        createdBy: actor?.name || 'Admin',
        items: { create: rows },
      },
      include: { items: true },
    });
    return row;
  });
}

export async function updateStockCount(tenantId, id, data, actor) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.stockCount.findFirst({ where: { id, tenantId } });
    if (!existing) throw new ApiError(404, 'Stock count not found');

    const { rows, totals } = computeItems(data.items);
    const { items, status, code, ...rest } = data;

    // Items are a full replace on every edit (delete then recreate) — the
    // form always resubmits the complete grid, same approach the other
    // modules' edit flows use.
    await tx.stockCountItem.deleteMany({ where: { countId: id } });

    const row = await tx.stockCount.update({
      where: { id },
      data: {
        ...rest,
        totalItems: totals.totalItems,
        totalSystemQty: totals.totalSystemQty,
        totalCountedQty: totals.totalCountedQty,
        totalVarianceQty: totals.totalVarianceQty,
        totalVarianceValue: totals.totalVarianceValue,
        totalCountValue: totals.totalCountValue,
        status,
        items: { create: rows },
      },
      include: { items: true },
    });
    return row;
  });
}

export async function deleteStockCount(tenantId, id) {
  const existing = await prisma.stockCount.findFirst({ where: { id, tenantId } });
  if (!existing) throw new ApiError(404, 'Stock count not found');
  await prisma.stockCount.delete({ where: { id } });
  return { id };
}

/**
 * Powers the Stock Count page's top 5-tile summary strip — every figure
 * here is a real aggregate across this tenant's actual StockCount rows,
 * computed at request time (never a stored/cached counter that could
 * drift). "Completed (This Month)" and "Variance Value (This Month)" are
 * scoped to counts whose updatedAt falls within the current calendar month
 * (server clock) and whose status is 'completed' — a tenant with no counts
 * completed this month honestly shows 0 rather than a placeholder figure.
 * (There is no dedicated completedOn column — same reasoning as Stock
 * Wastage's own summary: Approved/Completed By is plain user-typed text,
 * not a server-stamped terminal-state field, so updatedAt is the honest
 * proxy for "when this row last moved".)
 */
export async function getStockCountSummary(tenantId) {
  const rows = await prisma.stockCount.findMany({
    where: { tenantId },
    select: {
      status: true, totalVarianceValue: true, updatedAt: true,
    },
  });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const draftCounts = rows.filter((row) => row.status === 'draft').length;
  const completedCounts = rows.filter((row) => row.status === 'completed').length;
  const completedThisMonthRows = rows.filter(
    (row) => row.status === 'completed' && row.updatedAt && new Date(row.updatedAt) >= monthStart,
  );

  return {
    totalCounts: rows.length,
    draftCounts,
    completedCounts,
    completedThisMonth: completedThisMonthRows.length,
    varianceValue: round2(completedThisMonthRows.reduce((sum, row) => sum + Number(row.totalVarianceValue), 0)),
  };
}
