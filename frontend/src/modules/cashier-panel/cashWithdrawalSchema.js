import { z } from 'zod';

export const PURPOSE_OPTIONS = [
  { value: 'bank-deposit', label: 'Bank Deposit' },
  { value: 'owner-withdrawal', label: 'Owner Withdrawal' },
  { value: 'petty-cash', label: 'Petty Cash' },
  { value: 'other', label: 'Other Purpose' },
];

const decimalString = (message) => z.string().trim()
  .refine((v) => /^\d+(\.\d{1,2})?$/.test(v) && Number(v) > 0, message);

// Every field below is validated client-side for immediate feedback, and
// re-validated server-side by createCashWithdrawalSchema (backend/src/
// modules/cash-withdrawal/cashWithdrawal.schema.js) — including the
// "amount can't exceed available drawer cash" check, which this form has
// no way to pre-verify without the same live query the server already
// runs, so the client check here is a courtesy, never the only guard.
export const cashWithdrawalFormSchema = z.object({
  purpose: z.enum(['bank-deposit', 'owner-withdrawal', 'petty-cash', 'other'], {
    errorMap: () => ({ message: 'Select a withdrawal purpose' }),
  }),
  amount: decimalString('Enter a withdrawal amount greater than zero'),
  remarks: z.string().trim().max(200, 'Remarks cannot exceed 200 characters').optional(),
});

export function cashWithdrawalDefaultValues() {
  return { purpose: 'bank-deposit', amount: '', remarks: '' };
}

export function cashWithdrawalFormValuesToPayload(values) {
  return {
    purpose: values.purpose,
    amount: Number(values.amount) || 0,
    remarks: values.remarks?.trim() || '',
  };
}
