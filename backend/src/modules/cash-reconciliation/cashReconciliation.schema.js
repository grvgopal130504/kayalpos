import { z } from 'zod';

// Read-only report — there is no create schema here. A "cash
// reconciliation" is the reconciliation view of a CLOSED ShiftSession
// row: the same real System Cash (expectedClosingCash) vs. Counted Cash
// (closingCash) figures closeShift() already computed and stored at
// close time (see shiftSession.service.js's closeShift) — this module
// only re-reads that same real data, reshaped, the same read-only
// relationship shiftClosing has with those rows. Same shape/semantics as
// shiftClosingQuerySchema.
export const cashReconciliationQuerySchema = z.object({
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  page: z.coerce.number().int('Page must be a whole number').positive('Page must be at least 1').default(1),
  pageSize: z.coerce.number().int('Page size must be a whole number').positive('Page size must be at least 1')
    .max(100, 'Page size cannot exceed 100').default(10),
});
