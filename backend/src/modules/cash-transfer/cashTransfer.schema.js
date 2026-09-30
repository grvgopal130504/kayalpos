import { z } from 'zod';

// Kept in one place so the service's report grouping/labeling and this
// validation stay in sync — see cashTransfer.service.js's PURPOSE_DEFS.
export const CASH_TRANSFER_PURPOSES = ['bank-deposit', 'petty-cash', 'change-fund', 'other'];

// outletId/shiftSessionId/cashierId/cashierName are deliberately NOT
// accepted here — same rule as createCashWithdrawalSchema/
// createCashDepositSchema: the route always takes outletId/actor from
// req.user (the verified JWT) and the service resolves the caller's own
// currently OPEN shift, never a client-supplied one (see
// createCashTransfer). amount is re-checked server-side against the
// shift's real available cash — a client-side cap is a courtesy, never
// the only guard. toLocation is always required (unlike CashDeposit's
// bankAccount, which only applies to a Bank Deposit) since a transfer is
// meaningless without knowing where the cash went — "from" is always the
// drawer itself and never asked for.
export const createCashTransferSchema = z.object({
  purpose: z.enum(CASH_TRANSFER_PURPOSES, {
    errorMap: () => ({ message: 'Select a transfer purpose' }),
  }),
  toLocation: z.string().trim().min(2, 'Enter where the cash is being transferred to').max(100, 'Destination cannot exceed 100 characters'),
  amount: z.coerce.number().positive('Transfer amount must be greater than zero'),
  remarks: z.string().trim().max(200, 'Remarks cannot exceed 200 characters').optional().or(z.literal('')),
});

// Query params for the Cash Transfer report (GET /cash-transfers/summary)
// — same shape/semantics as cashWithdrawalQuerySchema/cashDepositQuerySchema.
export const cashTransferQuerySchema = z.object({
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  page: z.coerce.number().int('Page must be a whole number').positive('Page must be at least 1').default(1),
  pageSize: z.coerce.number().int('Page size must be a whole number').positive('Page size must be at least 1')
    .max(100, 'Page size cannot exceed 100').default(10),
});
