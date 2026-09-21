import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../middleware/errorHandler.js';

const CODE_PREFIX = 'RRT';
const CODE_LENGTH = 5;

function round2(n) {
  return Math.round(n * 100) / 100;
}

async function nextReturnCode(tenantId) {
  const count = await prisma.stockReturn.count({ where: { tenantId } });
  return `${CODE_PREFIX}-${String(count + 1).padStart(CODE_LENGTH, '0')}`;
}

export async function nextCodePreview(tenantId) {
  return nextReturnCode(tenantId);
}

// supplierId is a plain client-supplied id, not a formal Prisma relation
// (see the StockReturn model's own comment on why) — so it's validated
// here, against a real Supplier row for this tenant, before ever being
// trusted. Returns the supplier's name for the snapshot column, or throws a
// 400 naming exactly which reference was invalid.
async function assertSupplierIsValid(tx, tenantId, supplierId) {
  const supplier = await tx.supplier.findFirst({ where: { id: supplierId, tenantId } });
  if (!supplier) throw new ApiError(400, 'Supplier references a supplier that does not exist');
  return supplier.name;
}

// Same validated-reference pattern as Stock Receipt/Stock Indent/Stock
// Transfer's own fromOutletId/toOutletId.
async function assertOutletIsValid(tx, tenantId, outletId, label) {
  const outlet = await tx.outlet.findFirst({ where: { id: outletId, tenantId } });
  if (!outlet) throw new ApiError(400, `${label} references an outlet that does not exist`);
  return outlet.name;
}

// Unlike a Product-master join, there is none here — returnedQty/unitCost/
// discount/tax are all the real figures the user typed for the returned
// goods. What IS recomputed server-side (never trusted from the client) is
// each line's totalCost and the document's aggregate totals, using the same
// formula ReturnSummaryTotals previews client-side: returnedQty * unitCost,
// less the line discount, plus tax on the discounted amount.
function computeItems(items) {
  let totalReturnedQty = 0;
  let totalDiscount = 0;
  let totalTax = 0;
  let totalValue = 0;

  const rows = items.map((item) => {
    const returnedQty = Number(item.returnedQty);
    const unitCost = Number(item.unitCost) || 0;
    const discountPct = Number(item.discount) || 0;
    const taxPct = Number(item.tax) || 0;

    const base = returnedQty * unitCost;
    const discountAmount = (base * discountPct) / 100;
    const afterDiscount = base - discountAmount;
    const taxAmount = (afterDiscount * taxPct) / 100;
    const totalCost = round2(afterDiscount + taxAmount);

    totalReturnedQty += returnedQty;
    totalDiscount += discountAmount;
    totalTax += taxAmount;
    totalValue += totalCost;

    return {
      itemCode: item.itemCode,
      itemName: item.itemName,
      hsnCode: item.hsnCode || null,
      uom: item.uom || null,
      returnedQty,
      unitCost,
      discount: discountPct,
      tax: taxPct,
      totalCost,
      warehouse: item.warehouse || null,
      batchNo: item.batchNo || null,
      expiryDate: item.expiryDate || null,
      remarks: item.remarks || null,
    };
  });

  return {
    rows,
    totals: {
      totalItems: rows.length,
      totalReturnedQty: round2(totalReturnedQty),
      totalDiscount: round2(totalDiscount),
      totalTax: round2(totalTax),
      totalValue: round2(totalValue),
    },
  };
}

export async function listStockReturns(tenantId, { status, search } = {}) {
  const where = { tenantId };
  if (status && status !== 'all' && status !== 'All') {
    where.status = String(status).toLowerCase();
  }
  if (search) {
    const q = String(search);
    where.OR = [
      { code: { contains: q, mode: 'insensitive' } },
      { supplierName: { contains: q, mode: 'insensitive' } },
      { referenceNo: { contains: q, mode: 'insensitive' } },
    ];
  }

  const rows = await prisma.stockReturn.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { items: true },
    take: 1000,
  });
  return rows;
}

export async function getStockReturn(tenantId, id) {
  const row = await prisma.stockReturn.findFirst({ where: { id, tenantId }, include: { items: true } });
  if (!row) throw new ApiError(404, 'Stock return not found');
  return row;
}

// When status is 'accepted' the return has, by definition, just been
// finalized — so acceptedBy/acceptedOn are stamped right here, same pattern
// as Stock Receipt's receivedFields.
function acceptedFields(status, actor, existing) {
  if (status !== 'accepted') return { acceptedBy: null, acceptedOn: null };
  if (existing?.status === 'accepted') return { acceptedBy: existing.acceptedBy, acceptedOn: existing.acceptedOn };
  return { acceptedBy: actor?.name || 'Admin', acceptedOn: new Date() };
}

export async function createStockReturn(tenantId, data, actor) {
  return prisma.$transaction(async (tx) => {
    const code = data.code || (await nextReturnCode(tenantId));

    const supplierName = await assertSupplierIsValid(tx, tenantId, data.supplierId);
    const fromOutletName = await assertOutletIsValid(tx, tenantId, data.fromOutletId, 'From Outlet / HO');

    const { rows, totals } = computeItems(data.items);

    const {
      items, status, supplierId, fromOutletId, ...rest
    } = data;

    const row = await tx.stockReturn.create({
      data: {
        ...rest,
        tenantId,
        code,
        supplierId,
        supplierName,
        fromOutletId,
        fromOutletName,
        totalItems: totals.totalItems,
        totalReturnedQty: totals.totalReturnedQty,
        totalDiscount: totals.totalDiscount,
        totalTax: totals.totalTax,
        totalValue: totals.totalValue,
        status,
        createdBy: actor?.name || 'Admin',
        ...acceptedFields(status, actor, null),
        items: { create: rows },
      },
      include: { items: true },
    });
    return row;
  });
}

export async function updateStockReturn(tenantId, id, data, actor) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.stockReturn.findFirst({ where: { id, tenantId } });
    if (!existing) throw new ApiError(404, 'Stock return not found');

    const supplierName = await assertSupplierIsValid(tx, tenantId, data.supplierId);
    const fromOutletName = await assertOutletIsValid(tx, tenantId, data.fromOutletId, 'From Outlet / HO');

    const { rows, totals } = computeItems(data.items);
    const {
      items, status, code, supplierId, fromOutletId, ...rest
    } = data;

    // Items are a full replace on every edit (delete then recreate) — the
    // form always resubmits the complete grid, same approach the other
    // modules' edit flows use.
    await tx.stockReturnItem.deleteMany({ where: { returnId: id } });

    const row = await tx.stockReturn.update({
      where: { id },
      data: {
        ...rest,
        supplierId,
        supplierName,
        fromOutletId,
        fromOutletName,
        totalItems: totals.totalItems,
        totalReturnedQty: totals.totalReturnedQty,
        totalDiscount: totals.totalDiscount,
        totalTax: totals.totalTax,
        totalValue: totals.totalValue,
        status,
        ...acceptedFields(status, actor, existing),
        items: { create: rows },
      },
      include: { items: true },
    });
    return row;
  });
}

export async function deleteStockReturn(tenantId, id) {
  const existing = await prisma.stockReturn.findFirst({ where: { id, tenantId } });
  if (!existing) throw new ApiError(404, 'Stock return not found');
  await prisma.stockReturn.delete({ where: { id } });
  return { id };
}

/**
 * Powers the Stock Return page's top 5-tile summary strip — every figure
 * here is a real aggregate across this tenant's actual StockReturn rows,
 * computed at request time (never a stored/cached counter that could
 * drift). "Accepted (This Month)" and "Value Returned (This Month)" are
 * scoped to returns whose acceptedOn falls within the current calendar
 * month (server clock) — a tenant with no returns accepted this month
 * honestly shows 0 rather than a placeholder figure.
 */
export async function getStockReturnSummary(tenantId) {
  const rows = await prisma.stockReturn.findMany({
    where: { tenantId },
    select: {
      status: true, totalValue: true, acceptedOn: true,
    },
  });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const draftReturns = rows.filter((row) => row.status === 'draft').length;
  const acceptedReturns = rows.filter((row) => row.status === 'accepted').length;
  const acceptedThisMonth = rows.filter(
    (row) => row.status === 'accepted' && row.acceptedOn && new Date(row.acceptedOn) >= monthStart,
  );

  return {
    totalReturns: rows.length,
    draftReturns,
    acceptedReturns,
    acceptedThisMonth: acceptedThisMonth.length,
    valueReturned: round2(acceptedThisMonth.reduce((sum, row) => sum + Number(row.totalValue), 0)),
  };
}
