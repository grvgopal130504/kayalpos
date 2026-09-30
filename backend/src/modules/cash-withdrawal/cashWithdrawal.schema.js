import { z } from 'zod';

// Kept in one place so the service's report grouping/labeling and this
// validation stay in sync — see cashWithdrawal.service.js's PURPOSE_DEFS.
export const CASH_WITHDRAWAL_PURPOSES = ['bank-deposit', 'owner-withdrawal', 'petty-cash', 'other'];

// outletId/shiftSessionId/cashierId/cashierName are deliberately NOT
// accepted here — the route always takes outletId/actor from req.user (the
// verified JWT) and the service resolves the caller's own currently OPEN
// shift, never a client-supplied one (see createCashWithdrawal). amount is
// re-checked server-side against the shift's real available cash — a
// client-side cap is a courtesy, never the only guard.
export const createCashWithdrawalSchema = z.object({
  purpose: z.enum(CASH_WITHDRAWAL_PURPOSES, {
    errorMap: () => ({ message: 'Select a withdrawal purpose' }),
  }),
  amount: z.coerce.number().positive('Withdrawal amount must be greater than zero'),
  remarks: z.string().trim().max(200, 'Remarks cannot exceed 200 characters').optional().or(z.literal('')),
});

// Query params for the Cash Withdrawal report (GET /cash-withdrawals/summary)
// — same shape/semantics as the Sale module's *SalesQuerySchema.
export const cashWithdrawalQuerySchema = z.object({
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  page: z.coerce.number().int('Page must be a whole number').positive('Page must be at least 1').default(1),
  pageSize: z.coerce.number().int('Page size must be a whole number').positive('Page size must be at least 1')
    .max(100, 'Page size cannot exceed 100').default(10),
});
