/**
 * Walk-in Customer handling for Line Sale.
 *
 * Nexora stores every sale against a Customer row (TczOpos.customerId), but
 * the Line Sale screen's "Walk-in Customer" option is a UI-only sentinel
 * (frontend's WALK_IN_CUSTOMER, id: 'walk-in') — it was never a real row, so
 * walk-in sales were saved with customerId: null and a bare customerName
 * string. That's fine for display, but means walk-in sales can never be
 * looked up/joined the same way a registered customer's can, and nothing
 * stops a null customerId sale from slipping through unidentified.
 *
 * This resolves a single, reused Customer row per tenant — code "WALKIN" —
 * created lazily on first use rather than via a seed/migration, so tenants
 * that never run a walk-in sale never get one. No schema change: the
 * existing (tenantId, code) unique index (see Customer model) is reused as
 * the "one per tenant" guarantee, the same way every other master module
 * already gets a unique generated code. A dedicated boolean column would be
 * marginally more explicit, but isn't needed — findOrCreate below is both
 * the lookup and the safety net, and `code: 'WALKIN'` is never the kind of
 * value a cashier would accidentally type into the search box.
 */
import { prisma } from '../../config/prisma.js';

export const WALKIN_CUSTOMER_CODE = 'WALKIN';

/**
 * Returns the tenant's dedicated Walk-in Customer row, creating it the first
 * time it's needed. Safe under concurrency: two requests racing to create it
 * for the same brand-new tenant will have one of them hit the existing
 * (tenantId, code) unique index and simply re-fetch the row the other one
 * just inserted, rather than erroring out or creating a duplicate.
 *
 * Pass a transaction client (`tx`) when calling this from inside
 * sale.service.js's createSale transaction, so the lookup/create is part of
 * the same atomic unit of work as the sale itself.
 */
export async function getOrCreateWalkInCustomer(client, tenantId) {
  const db = client || prisma;

  const existing = await db.customer.findFirst({ where: { tenantId, code: WALKIN_CUSTOMER_CODE } });
  if (existing) return existing;

  try {
    return await db.customer.create({
      data: {
        tenantId,
        code: WALKIN_CUSTOMER_CODE,
        name: 'Walk-in Customer',
        // Customer.mobile is required (non-null, 10-digit format on the
        // create API's own Zod schema) — this row is created directly via
        // Prisma, bypassing that schema, but keeps the same shape so it
        // behaves like any other customer row wherever mobile is displayed.
        mobile: '0000000000',
        customerType: 'Walk-in',
        creditLimit: 0,
        openingBalance: 0,
        openingBalanceType: 'Cr',
        // Conservative defaults — no credit sales, no SMS marketing to a
        // shared placeholder number. Nothing in the app currently enforces
        // allowCreditSale or awards loyalty points at all (see sale.service
        // / customer.schema), so there's no existing rule to also wire up
        // here; these are just the row's own stored defaults.
        allowCreditSale: false,
        priceInclusive: false,
        smsNotification: false,
        status: 'ACTIVE',
      },
    });
  } catch (err) {
    // P2002 (unique constraint) = another concurrent request just created
    // the same tenant's Walk-in row first. Re-fetch and use that one instead
    // of failing the sale.
    if (err?.code === 'P2002') {
      const row = await db.customer.findFirst({ where: { tenantId, code: WALKIN_CUSTOMER_CODE } });
      if (row) return row;
    }
    throw err;
  }
}
