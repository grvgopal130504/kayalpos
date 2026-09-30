import { z } from 'zod';

// Kept in one place so the service's report grouping/labeling and this
// validation stay in sync — see cashDeposit.service.js's PURPOSE_DEFS.
export const CASH_DEPOSIT_PURPOSES = ['bank-deposit', 'owner-deposit', 'float-adjustment', 'other'];

// outletId/shiftSessionId/cashierId/cashierName are deliberately NOT
// accepted here — same rule as createCashWithdrawalSchema: the route always
// takes outletId/actor from req.user (the verified JWT) and the service
// resolves the caller's own currently OPEN shift, never a client-supplied
// one (see createCashDeposit). amount is re-checked server-side against the
// shift's real available cash — a client-side cap is a courtesy, never the
// only guard. bankAccount is required only for a Bank Deposit, since that's
// the only purpose where "which account it landed in" is meaningful.
export const createCashDepositSchema = z.object({
  purpose: z.enum(CASH_DEPOSIT_PURPOSES, {
    errorMap: () => ({ message: 'Select a deposit purpose' }),
  }),
  amount: z.coerce.number().positive('Deposit amount must be greater than zero'),
  bankAccount: z.string().trim().max(100, 'Bank / account cannot exceed 100 characters').optional().or(z.literal('')),
  remarks: z.string().trim().max(200, 'Remarks cannot exceed 200 characters').optional().or(z.literal('')),
}).refine(
  (data) => data.purpose !== 'bank-deposit' || Boolean(data.bankAccount?.trim()),
  { message: 'Bank / account is required for a bank deposit', path: ['bankAccount'] },
);

// Query params for the Cash Deposit report (GET /cash-deposits/summary) —
// same shape/semantics as cashWithdrawalQuerySchema.
export const cashDepositQuerySchema = z.object({
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  page: z.coerce.number().int('Page must be a whole number').positive('Page must be at least 1').default(1),
  pageSize: z.coerce.number().int('Page size must be a whole number').positive('Page size must be at least 1')
    .max(100, 'Page size cannot exceed 100').default(10),
});
