import { ApiError } from '../../middleware/errorHandler.js';

// Writes the TCZ_OPOS (header) / TCZ_POS1 (lines) records for one Line Sale
// bill. It is only ever called from createSale (sale.service.js) with that
// function's own transaction client, AFTER the Sale/SaleLine rows exist, so the
// Sale, its lines, the held-bill close-out, the stock decrement and these rows
// commit or roll back as one unit. Nothing in here reads or changes Sale logic.
//
// TCZ_POS2 (offer / discount details) is intentionally never written: the app
// does not apply promotions at checkout yet.

const OBJECT = 'TCZ_OPOS';

const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;
const round6 = (value) => Math.round((Number(value) || 0) * 1e6) / 1e6;

// Business time zone for TCZ bill times: Tamil Nadu, India (IST, UTC+05:30, no
// daylight saving). TCZ_OPOS.CreateDate keeps the exact instant (timestamptz);
// TCZ_OPOS.CreateTime is the wall-clock time of day in THIS zone (TIME, no zone),
// so a bill printed at 11:50 in Tamil Nadu reads 11:50 whatever time zone the
// server or the database session runs in. The business date of a bill is
// (CreateDate AT TIME ZONE 'Asia/Kolkata')::date. The backfill SQL and the verify
// script use the same zone name; keep the three in step.
export const TCZ_TIME_ZONE = 'Asia/Kolkata';
const istClock = new Intl.DateTimeFormat('en-GB', {
  timeZone: TCZ_TIME_ZONE, hourCycle: 'h23', hour: '2-digit', minute: '2-digit', second: '2-digit',
});

/**
 * The IST wall-clock time of day of `date`, as a Date on 1970-01-01 whose UTC
 * fields carry that wall-clock time. That is the shape Prisma needs for a
 * `@db.Time` column: it writes the Date's UTC time of day, so the stored TIME is
 * the IST time (e.g. 18:30:00.000Z -> 00:00:00.000, the start of the next IST day).
 * Milliseconds are preserved. Independent of the process time zone.
 */
export function istTimeOfDay(date) {
  const ms = date.getTime();
  if (!Number.isFinite(ms)) throw new TypeError('istTimeOfDay needs a valid Date');
  const part = Object.fromEntries(istClock.formatToParts(date).map((p) => [p.type, p.value]));
  const milli = ((ms % 1000) + 1000) % 1000;
  return new Date(Date.UTC(1970, 0, 1, Number(part.hour) % 24, Number(part.minute), Number(part.second), milli));
}

// Tenders whose meaning matches a TCZ_OPOS payment column one-to-one. Every
// other tender the app accepts (credit, store-credit, gift-card, cheque,
// bank-transfer) has NO TCZ column: those amounts stay on the Sale row
// (paymentMethod / receivedAmount) and are NOT put in any TCZ tender column.
// For them Cash/Card/UPI/Wallet are all 0 while Paid/Balance still reflect what
// was received, so Paid - (Cash+Card+UPI+Wallet) is the amount tendered by a
// method TCZ has no column for; Sale.paymentMethod (via SaleId) says which.
const TENDER_COLUMN = { cash: 'cash', card: 'card', upi: 'upi', wallet: 'wallet' };

/**
 * Fields deliberately NOT written (left NULL, never a guessed value) because
 * nothing in the schema or app defines their meaning:
 *  - header: DiscountType, DiscountAmount, TaxableValue, TaxableValueTotal,
 *    TotalRevenue, SalesType, Canceled, Hold, DocStatus, Return, Free, Batch,
 *    ChangeLog, SlpCode1/2 and SlpName1/2 (no salesperson on a Line Sale)
 *  - lines: Tax, TaxCode (the app applies one flat rate to every line, which
 *    does not necessarily match Product.taxCode, and the unit of Tax is unknown)
 * Loyalty (Points/EarnedPoints/RedeemValue) and RoundOff are left at their
 * column default of 0, which is accurate: Line Sale has no loyalty or rounding.
 *
 * `sale` is the just-created Sale row, so header money is mirrored from the
 * exact (2dp) values that were stored, never recomputed.
 */
export async function writeTczBill(tx, {
  sale, customer, productById, lineData, subTotal, taxable,
  discountType, discountValue, clientToken, stockBefore,
}) {
  const now = new Date();
  const grand = round2(sale.grandTotal);
  const received = round2(sale.receivedAmount);
  const paid = Math.min(received, grand);
  const balance = Math.max(round2(grand - received), 0);

  const tender = { cash: 0, card: 0, upi: 0, wallet: 0 };
  const column = TENDER_COLUMN[sale.paymentMethod];
  if (column) tender[column] = paid;

  const header = await tx.tczOpos.create({
    data: {
      tenantId: sale.tenantId,
      outletId: sale.outletId || null,
      saleId: sale.id,
      clientToken: clientToken || null,
      docNum: sale.billNo,
      createDate: now,
      // IST (Asia/Kolkata) wall-clock time of the SAME instant as createDate.
      createTime: istTimeOfDay(now),
      createdBy: sale.cashierName,
      object: OBJECT,
      customerMobileNumber: customer?.mobile || null,
      customerName: sale.customerName,
      bpName: customer?.name || null,
      bpCode: customer?.code || null,
      headDiscTyp: discountType,
      headerDiscount: discountValue,
      grandTotal: grand,
      cash: tender.cash,
      card: tender.card,
      upi: tender.upi,
      wallet: tender.wallet,
      paid,
      balance,
      // Explicit NULLs (not the column defaults of 0): meaning undefined, see above.
      discountType: null,
      discountAmount: null,
      taxableValue: null,
      taxableValueTotal: null,
      totalRevenue: null,
    },
  });

  const lines = lineData.map((line, index) => {
    const product = productById.get(line.productId);
    // Same apportioning createSale uses for Sale.taxAmount.
    const lineTaxable = subTotal > 0 ? (line.amount / subTotal) * taxable : 0;
    return {
      docEntry: header.docEntry,
      lineId: index + 1,
      productId: line.productId,
      object: OBJECT,
      itemCode: line.code,
      itemName: line.name,
      barCode: line.code,
      price: round2(line.price),
      quantity: line.qty,
      // = SaleLine.amount (price x qty, before bill discount and tax)
      lineTotal: round2(line.amount),
      inStock: stockBefore.get(line.productId) ?? product.availableQty,
      taxableValue: round6(lineTaxable),
      taxValue: round6(lineTaxable * Number(line.taxRate)),
      // Left NULL on purpose (see above); the schema default of 0 would claim a 0% rate.
      tax: null,
      taxCode: null,
    };
  });

  if (lines.length === 0) throw new ApiError(500, 'A bill cannot be saved without lines');
  await tx.tczPos1.createMany({ data: lines });

  return header;
}
