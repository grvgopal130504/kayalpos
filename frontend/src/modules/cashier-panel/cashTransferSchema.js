import { z } from 'zod';

export const PURPOSE_OPTIONS = [
  { value: 'bank-deposit', label: 'Bank Deposit' },
  { value: 'petty-cash', label: 'Petty Cash' },
  { value: 'change-fund', label: 'Change Fund' },
  { value: 'other', label: 'Other Purpose' },
];

const decimalString = (message) => z.string().trim()
  .refine((v) => /^\d+(\.\d{1,2})?$/.test(v) && Number(v) > 0, message);

// Every field below is validated client-side for immediate feedback, and
// re-validated server-side by createCashTransferSchema (backend/src/
// modules/cash-transfer/cashTransfer.schema.js) — including the "amount
// can't exceed available drawer cash" check, which this form has no way
// to pre-verify without the same live query the server already runs, so
// the client check here is a courtesy, never the only guard. toLocation is
// always required — a transfer is meaningless without knowing where the
// cash went ("from" is always the drawer itself and isn't asked for).
export const cashTransferFormSchema = z.object({
  purpose: z.enum(['bank-deposit', 'petty-cash', 'change-fund', 'other'], {
    errorMap: () => ({ message: 'Select a transfer purpose' }),
  }),
  toLocation: z.string().trim().min(2, 'Enter where the cash is being transferred to').max(100, 'Destination cannot exceed 100 characters'),
  amount: decimalString('Enter a transfer amount greater than zero'),
  remarks: z.string().trim().max(200, 'Remarks cannot exceed 200 characters').optional(),
});

export function cashTransferDefaultValues() {
  return { purpose: 'bank-deposit', toLocation: '', amount: '', remarks: '' };
}

export function cashTransferFormValuesToPayload(values) {
  return {
    purpose: values.purpose,
    toLocation: values.toLocation.trim(),
    amount: Number(values.amount) || 0,
    remarks: values.remarks?.trim() || '',
  };
}
