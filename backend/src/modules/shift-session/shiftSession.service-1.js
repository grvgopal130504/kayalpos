import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../middleware/errorHandler.js';

function round2(n) {
  return Math.round(n * 100) / 100;
}

// Sequential per-outlet shift number ("01", "02", ...) — same "count of
// existing rows + 1" convention as every other module's nextCode, scoped to
// outlet rather than tenant since shift numbering resets per cash drawer,
// not per tenant.
async function nextShiftNo(tenantId, outletId) {
  const count = await prisma.shiftSession.count({ where: { tenantId, outletId } });
  return String(count + 1).padStart(2, '0');
}

// Never trust the client's own arithmetic for the total — recompute every
// row from its unitValue/pieces (or, for the Coins row, its typed amount)
// and sum server-side. Mirrors StockCount's computeItems() reasoning.
function computeTotalOpeningCash(denominations) {
  return round2(
    denominations.reduce((sum, row) => {
      const amount = row.unitValue != null
        ? Number(row.unitValue) * Math.max(0, Math.round(Number(row.pieces) || 0))
        : Number(row.amount) || 0;
      return sum + amount;
    }, 0),
  );
}

function normalizedDenominationRows(denominations) {
  return denominations.map((row) => {
    const pieces = row.unitValue != null ? Math.max(0, Math.round(Number(row.pieces) || 0)) : 0;
    const amount = row.unitValue != null ? Number(row.unitValue) * pieces : Number(row.amount) || 0;
    return {
      label: row.label,
      unitValue: row.unitValue,
      pieces,
      amount: round2(amount),
    };
  });
}

/** Turns a Prisma unique-constraint violation into a friendly 409 instead of a raw 500. */
function prismaKnownError(err) {
  if (err?.code === 'P2002') {
    return new ApiError(409, 'That shift number is already in use for this outlet — try again', err.meta);
  }
  return err;
}

/**
 * Feeds the Shift Opening page's status strip and its "block a second open
 * shift" guard: whether this outlet currently has an OPEN shift, the most
 * recently CLOSED shift (for "Last Closed Shift" / carrying its closing
 * cash forward as this shift's previousClosingCash), and a live preview of
 * the next shift number. A tenant/outlet with no shift history yet honestly
 * shows null/0 rather than a placeholder figure.
 */
export async function getShiftStatus(tenantId, outletId) {
  const [currentShift, lastClosedShift, shiftNo] = await Promise.all([
    prisma.shiftSession.findFirst({
      where: { tenantId, outletId, status: 'OPEN' },
      orderBy: { openedAt: 'desc' },
      include: { denominations: true },
    }),
    prisma.shiftSession.findFirst({
      where: { tenantId, outletId, status: 'CLOSED' },
      orderBy: { closedAt: 'desc' },
    }),
    nextShiftNo(tenantId, outletId),
  ]);

  // Only computed when there's a shift to close — a live preview of what
  // closeShift() itself will compute, so the Shift Closing form's Expected
  // Cash figure matches exactly what gets stored on submit. Deliberately
  // NOT folded into the Promise.all above — the pool's real cap is max: 5
  // (see config/prisma.js) and this needs 4 more queries; running it only
  // after the first batch resolves keeps this request under the cap at
  // every point in time.
  let currentShiftExpectedCash = null;
  if (currentShift) {
    const [cashSalesAgg, withdrawalsAgg, depositsAgg, transfersAgg] = await Promise.all([
      prisma.sale.aggregate({
        where: {
          tenantId, outletId, paymentMethod: 'cash', createdAt: { gte: currentShift.openedAt },
        },
        _sum: { receivedAmount: true },
      }),
      prisma.cashWithdrawal.aggregate({
        where: { tenantId, shiftSessionId: currentShift.id },
        _sum: { amount: true },
      }),
      prisma.cashDeposit.aggregate({
        where: { tenantId, shiftSessionId: currentShift.id },
        _sum: { amount: true },
      }),
      prisma.cashTransfer.aggregate({
        where: { tenantId, shiftSessionId: currentShift.id },
        _sum: { amount: true },
      }),
    ]);
    currentShiftExpectedCash = round2(
      Number(currentShift.openingCash)
      + Number(cashSalesAgg._sum.receivedAmount || 0)
      - Number(withdrawalsAgg._sum.amount || 0)
      - Number(depositsAgg._sum.amount || 0)
      - Number(transfersAgg._sum.amount || 0),
    );
  }

  return {
    currentShift,
    currentShiftExpectedCash,
    lastClosedShift,
    nextShiftNo: shiftNo,
    previousClosingCash: lastClosedShift ? Number(lastClosedShift.closingCash ?? 0) : 0,
    serverTime: new Date().toISOString(),
  };
}

export async function getShiftSession(tenantId, outletId, id) {
  const row = await prisma.shiftSession.findFirst({
    where: { id, tenantId, outletId },
    include: { denominations: true },
  });
  if (!row) throw new ApiError(404, 'Shift session not found');
  return row;
}

/**
 * Opens a new shift for the caller's outlet. `actor` is req.user (the
 * decoded JWT) — outletId/cashierId/cashierName always come from there,
 * never from the request body. Re-checks for an already-open shift inside
 * the same transaction as the insert (belt-and-braces alongside the
 * [tenantId, outletId, shiftNo] unique index) so two near-simultaneous
 * "Open Shift" clicks from the same outlet can't both succeed.
 */
export async function openShift(tenantId, outletId, data, actor) {
  return prisma.$transaction(async (tx) => {
    const existingOpen = await tx.shiftSession.findFirst({ where: { tenantId, outletId, status: 'OPEN' } });
    if (existingOpen) {
      throw new ApiError(
        409,
        `Shift ${existingOpen.shiftNo} is already open for this outlet. Close it before opening a new one.`,
      );
    }

    const totalOpeningCash = computeTotalOpeningCash(data.denominations);
    if (totalOpeningCash <= 0) {
      throw new ApiError(400, 'Total opening cash must be greater than zero');
    }

    const lastClosed = await tx.shiftSession.findFirst({
      where: { tenantId, outletId, status: 'CLOSED' },
      orderBy: { closedAt: 'desc' },
    });
    const previousClosingCash = lastClosed ? Number(lastClosed.closingCash ?? 0) : 0;

    const shiftNo = data.shiftNo || (await nextShiftNo(tenantId, outletId));

    const shift = await tx.shiftSession.create({
      data: {
        tenantId,
        outletId,
        shiftNo,
        shiftName: data.shiftName || null,
        shiftDate: data.shiftDate,
        startTime: data.startTime,
        endTime: data.endTime || null,
        description: data.description || null,
        cashierId: actor.id,
        cashierName: actor.name,
        openingCash: totalOpeningCash,
        previousClosingCash,
        notes: data.notes || null,
        attachmentName: data.attachmentName || null,
        agreedTerms: true,
        status: 'OPEN',
        openedAt: new Date(),
        denominations: { create: normalizedDenominationRows(data.denominations) },
      },
      include: { denominations: true },
    });

    return shift;
  }).catch((err) => { throw prismaKnownError(err); });
}

/**
 * Closes the outlet's currently OPEN shift. `actor` is req.user — same
 * "never trust the body for who/where" rule openShift follows. Everything
 * that ends up on the closed row is computed here, inside the same
 * transaction as the update, from real rows — never from client-sent
 * totals:
 * - actualClosingCash: recomputed from the counted denominations, exactly
 *   like computeTotalOpeningCash does for opening (Math.max/round on
 *   pieces, unitValue * pieces or the typed amount for the Coins row).
 * - expectedClosingCash: this shift's openingCash + real cash-tender Sale
 *   receipts since it opened − this shift's withdrawals − deposits −
 *   transfers — the same drawer-cash formula createCashWithdrawal /
 *   createCashDeposit / createCashTransfer already enforce, scoped to
 *   this exact shift (not a calendar date) since that's the only window
 *   that means anything at close time.
 * - closingVariance: actualClosingCash − expectedClosingCash (positive =
 *   more cash counted than expected, negative = a shortage).
 * - closingTotalSales: every Sale (any tender) recorded since openedAt.
 * All four are stored on the row rather than recomputed later, so a
 * shift's reconciliation stays fixed once closed.
 */
export async function closeShift(tenantId, outletId, data, actor) {
  return prisma.$transaction(async (tx) => {
    const shift = await tx.shiftSession.findFirst({ where: { tenantId, outletId, status: 'OPEN' } });
    if (!shift) {
      throw new ApiError(400, 'There is no open shift to close for this outlet');
    }

    const actualClosingCash = computeTotalOpeningCash(data.denominations);
    if (actualClosingCash <= 0) {
      throw new ApiError(400, 'Total closing cash must be greater than zero');
    }

    const [cashSalesAgg, withdrawalsAgg, depositsAgg, transfersAgg, allSalesAgg] = await Promise.all([
      tx.sale.aggregate({
        where: {
          tenantId, outletId, paymentMethod: 'cash', createdAt: { gte: shift.openedAt },
        },
        _sum: { receivedAmount: true },
      }),
      tx.cashWithdrawal.aggregate({ where: { tenantId, shiftSessionId: shift.id }, _sum: { amount: true } }),
      tx.cashDeposit.aggregate({ where: { tenantId, shiftSessionId: shift.id }, _sum: { amount: true } }),
      tx.cashTransfer.aggregate({ where: { tenantId, shiftSessionId: shift.id }, _sum: { amount: true } }),
      tx.sale.aggregate({
        where: { tenantId, outletId, createdAt: { gte: shift.openedAt } },
        _sum: { grandTotal: true },
      }),
    ]);

    const expectedClosingCash = round2(
      Number(shift.openingCash)
      + Number(cashSalesAgg._sum.receivedAmount || 0)
      - Number(withdrawalsAgg._sum.amount || 0)
      - Number(depositsAgg._sum.amount || 0)
      - Number(transfersAgg._sum.amount || 0),
    );
    const closingTotalSales = round2(Number(allSalesAgg._sum.grandTotal || 0));
    const closingVariance = round2(actualClosingCash - expectedClosingCash);

    const closed = await tx.shiftSession.update({
      where: { id: shift.id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        closingCash: actualClosingCash,
        expectedClosingCash,
        closingVariance,
        closingTotalSales,
        closingRemarks: data.remarks || null,
        closingDenominations: { create: normalizedDenominationRows(data.denominations) },
      },
      include: { closingDenominations: true },
    });

    return closed;
  }).catch((err) => { throw prismaKnownError(err); });
}
