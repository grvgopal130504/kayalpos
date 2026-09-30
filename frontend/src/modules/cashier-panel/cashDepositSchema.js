import { z } from 'zod';

export const PURPOSE_OPTIONS = [
  { value: 'bank-deposit', label: 'Bank Deposit' },
  { value: 'owner-deposit', label: 'Owner Deposit' },
  { value: 'float-adjustment', label: 'Float Adjustment' },
  { value: 'other', label: 'Other Purpose' },
];

const decimalString = (message) => z.string().trim()
  .refine((v) => /^\d+(\.\d{1,2})?$/.test(v) && Number(v) > 0, message);

// Every field below is validated client-side for immediate feedback, and
// re-validated server-side by createCashDepositSchema (backend/src/
// modules/cash-deposit/cashDeposit.schema.js) — including the "amount
// can't exceed available drawer cash" check, which this form has no way to
// pre-verify without the same live query the server already runs, so the
// client check here is a courtesy, never the only guard. bankAccount is
// only required when purpose is "Bank Deposit" — enforced by both this
// schema's refine and the server's.
export const cashDepositFormSchema = z.object({
  purpose: z.enum(['bank-deposit', 'owner-deposit', 'float-adjustment', 'other'], {
    errorMap: () => ({ message: 'Select a deposit purpose' }),
  }),
  amount: decimalString('Enter a deposit amount greater than zero'),
  bankAccount: z.string().trim().max(100, 'Bank / account cannot exceed 100 characters').optional(),
  remarks: z.string().trim().max(200, 'Remarks cannot exceed 200 characters').optional(),
}).refine(
  (data) => data.purpose !== 'bank-deposit' || Boolean(data.bankAccount?.trim()),
  { message: 'Bank / account is required for a bank deposit', path: ['bankAccount'] },
);

export function cashDepositDefaultValues() {
  return { purpose: 'bank-deposit', amount: '', bankAccount: '', remarks: '' };
}

export function cashDepositFormValuesToPayload(values) {
  return {
    purpose: values.purpose,
    amount: Number(values.amount) || 0,
    bankAccount: values.bankAccount?.trim() || '',
    remarks: values.remarks?.trim() || '',
  };
}
