import { z } from 'zod';

// Read-only report — there is no create schema here. A "shortage / excess"
// entry is just the non-zero-variance subset of a CLOSED ShiftSession
// row's real reconciliation (see shiftSession.service.js's closeShift,
// and cashReconciliation.service.js's getCashReconciliationReport, which
// reports on the full set including exact matches) — this module only
// re-reads and filters that same real data. Same shape/semantics as
// cashReconciliationQuerySchema.
export const shortageExcessQuerySchema = z.object({
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  page: z.coerce.number().int('Page must be a whole number').positive('Page must be at least 1').default(1),
  pageSize: z.coerce.number().int('Page size must be a whole number').positive('Page size must be at least 1')
    .max(100, 'Page size cannot exceed 100').default(10),
});
