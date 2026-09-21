import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../middleware/errorHandler.js';

function round2(n) {
  return Math.round(n * 100) / 100;
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * "SR-DDMMYY-00007"-style, sequenced per calendar day (matching the
 * reference design's numbering) — counts today's returns for this tenant
 * and takes the next slot. Run inside the same transaction as the actual
 * create so two concurrent returns on the same day can't claim the same
 * number (the @@unique([tenantId, returnNo]) constraint is the last-resort
 * backstop either way, same pattern as Sale's nextBillNoWithinTx).
 */
async function nextReturnNoWithin(client, tenantId, date = new Date()) {
  const since = startOfToday();
  const count = await client.salesReturn.count({ where: { tenantId, createdAt: { gte: since } } });
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `SR-${dd}${mm}${yy}-${String(count + 1).padStart(5, '0')}`;
}

export async function nextReturnNoPreview(tenantId) {
  return nextReturnNoWithin(prisma, tenantId);
}

/**
 * Sums qty already returned per SaleLine, scoped to this tenant through the
 * owning SalesReturn (SalesReturnItem itself carries no tenantId) — powers
 * both the lookup's "returnable qty" figures and createSalesReturn's
 * over-return guard, so the two can never disagree.
 */
async function getReturnedQtyByLine(client, tenantId, saleLineIds) {
  if (saleLineIds.length === 0) return {};
  const rows = await client.salesReturnItem.findMany({
    where: { saleLineId: { in: saleLineIds }, return: { tenantId } },
    select: { saleLineId: true, qty: true },
  });
  const map = {};
  rows.forEach((row) => {
    map[row.saleLineId] = (map[row.saleLineId] || 0) + row.qty;
  });
  return map;
}

/**
 * Powers "Find Original Invoice": looks the Sale up by its real billNo,
 * and for every line on it, computes what's still eligible to come back —
 * `saleQty - everything already returned against that exact line across
 * every prior SalesReturn`. A line fully returned already simply reports
 * returnableQty: 0, so the UI can't add it again. `alreadyRefunded` is the
 * real sum of every past return's grandTotal against this sale — never a
 * hardcoded 0.
 */
export async function lookupOriginalInvoice(tenantId, billNo) {
  const sale = await prisma.sale.findFirst({
    where: { tenantId, billNo },
    include: { lines: true },
  });
  if (!sale) throw new ApiError(404, 'No invoice found with that bill number');

  const lineIds = sale.lines.map((line) => line.id);
  const [returnedByLine, refundedAgg] = await Promise.all([
    getReturnedQtyByLine(prisma, tenantId, lineIds),
    prisma.salesReturn.aggregate({ where: { tenantId, saleId: sale.id }, _sum: { grandTotal: true } }),
  ]);

  const productIds = [...new Set(sale.lines.map((line) => line.productId))];
  const products = await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, mrp: true } });
  const mrpByProductId = Object.fromEntries(products.map((p) => [p.id, Number(p.mrp)]));

  const items = sale.lines.map((line) => {
    const alreadyReturned = returnedByLine[line.id] || 0;
    return {
      saleLineId: line.id,
      productId: line.productId,
      code: line.code,
      name: line.name,
      uom: line.uom,
      rate: Number(line.price),
      taxRate: Number(line.taxRate),
      mrp: mrpByProductId[line.productId] || Number(line.price),
      saleQty: line.qty,
      returnableQty: Math.max(line.qty - alreadyReturned, 0),
    };
  });

  return {
    saleId: sale.id,
    invoiceNo: sale.billNo,
    invoiceDate: sale.createdAt,
    totalAmount: Number(sale.grandTotal),
    paidAmount: Number(sale.receivedAmount),
    paymentMethod: sale.paymentMethod,
    customerId: sale.customerId,
    customerName: sale.customerName,
    alreadyRefunded: round2(Number(refundedAgg._sum.grandTotal || 0)),
    items,
  };
}

export async function createSalesReturn(tenantId, data, actor) {
  return prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findFirst({ where: { id: data.saleId, tenantId }, include: { lines: true } });
    if (!sale) throw new ApiError(400, 'Original invoice was not found');

    const lineById = new Map(sale.lines.map((line) => [line.id, line]));
    const saleLineIds = data.items.map((item) => item.saleLineId);
    const returnedByLine = await getReturnedQtyByLine(tx, tenantId, saleLineIds);

    const lineData = data.items.map((item) => {
      const line = lineById.get(item.saleLineId);
      if (!line) throw new ApiError(400, 'One of the selected items is not part of this invoice');

      const alreadyReturned = returnedByLine[line.id] || 0;
      const returnable = line.qty - alreadyReturned;
      if (item.qty > returnable) {
        throw new ApiError(400, `${line.name}: only ${returnable} ${line.uom} left to return`);
      }

      const rate = Number(line.price);
      const taxRate = Number(line.taxRate);
      const amount = round2(item.qty * rate);
      return {
        saleLineId: line.id,
        productId: line.productId,
        code: line.code,
        name: line.name,
        uom: line.uom,
        qty: item.qty,
        rate,
        taxRate,
        amount,
      };
    });

    const subTotal = round2(lineData.reduce((sum, line) => sum + line.amount, 0));
    const taxAmount = round2(lineData.reduce((sum, line) => sum + line.amount * line.taxRate, 0));
    const discountAmount = 0;
    const grandTotal = round2(subTotal - discountAmount + taxAmount);

    const returnNo = await nextReturnNoWithin(tx, tenantId);

    const row = await tx.salesReturn.create({
      data: {
        tenantId,
        returnNo,
        saleId: sale.id,
        customerId: sale.customerId,
        customerName: sale.customerName,
        cashierName: actor?.name || 'Admin',
        reason: data.reason,
        note: data.note || null,
        refundMode: data.refundMode,
        refundTo: data.refundMode === 'refund' ? data.refundTo : null,
        subTotal,
        discountAmount,
        taxAmount,
        grandTotal,
        items: { create: lineData },
      },
      include: { items: true },
    });

    // Reverses createSale's decrement — the returned goods physically come
    // back to stock (see the SalesReturn model's own comment in
    // schema.prisma for the same caveat availableQty already carries).
    await Promise.all(lineData.map((line) => tx.product.update({
      where: { id: line.productId },
      data: { availableQty: { increment: line.qty } },
    })));

    return row;
  });
}
