import { z } from 'zod';

// Read-only report — there is no create schema here. A "drawer opening" IS
// a ShiftSession row (see shiftSession.service.js's openShift, reached
// from the Cashier Panel's Shift Opening screen); this module only reports
// on that same real data, the same way the Cash/Card/UPI Sales and Other
// Payments reports only read Sale rows created elsewhere at checkout. Same
// shape/semantics as cashWithdrawalQuerySchema/cashDepositQuerySchema.
export const cashDrawerOpeningQuerySchema = z.object({
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  page: z.coerce.number().int('Page must be a whole number').positive('Page must be at least 1').default(1),
  pageSize: z.coerce.number().int('Page size must be a whole number').positive('Page size must be at least 1')
    .max(100, 'Page size cannot exceed 100').default(10),
});
