import { z } from 'zod';
import { DENOMINATION_CATALOG, computeTotalOpeningCash } from './shiftOpeningSchema';

// Reuses the exact same fixed denomination catalog as the Shift Opening
// form's "Opening Cash Details" grid — a shift's closing count is the same
// physical notes/coins, just counted at close instead of open. Re-exported
// under a closing-specific name so ShiftClosingDenominationTable's imports
// read naturally, but it's the same DENOMINATION_CATALOG array.
export const CLOSING_DENOMINATION_CATALOG = DENOMINATION_CATALOG;

export function defaultClosingDenominationRows() {
  return DENOMINATION_CATALOG.map((row) => ({ ...row, pieces: '0', amount: '0.00' }));
}

// computeTotalOpeningCash is a generic "sum this denomination grid" helper
// — nothing about it is opening-specific — so the closing form reuses it
// directly rather than duplicating the same reduce.
export const computeTotalClosingCash = computeTotalOpeningCash;

const wholeNumberString = (message) => z.string().trim()
  .refine((v) => v === '' || /^\d+$/.test(v), message);

const decimalString = (message) => z.string().trim()
  .refine((v) => v === '' || (/^\d+(\.\d{1,2})?$/.test(v) && Number(v) >= 0), message);

const denominationRowSchema = z.object({
  key: z.string(),
  label: z.string(),
  unitValue: z.number().nullable(),
  pieces: wholeNumberString('Enter a whole number of pieces'),
  amount: decimalString('Enter a valid amount'),
});

// Every field below is validated client-side for immediate feedback, and
// re-validated server-side by closeShiftSchema (backend/src/modules/
// shift-session/shiftSession.schema.js) — the client check is a courtesy,
// never the only guard.
export const shiftClosingSchema = z
  .object({
    remarks: z.string().trim().optional(),
    denominations: z.array(denominationRowSchema),
  })
  .superRefine((values, ctx) => {
    if (computeTotalClosingCash(values.denominations) <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['denominations'],
        message: 'Total closing cash must be greater than zero — count at least one note or coin',
      });
    }
  });

export function shiftClosingDefaultValues() {
  return {
    remarks: '',
    denominations: defaultClosingDenominationRows(),
  };
}

// Converts the form's string-based values into the JSON payload
// closeShiftSchema expects.
export function shiftClosingFormValuesToPayload(values) {
  return {
    remarks: values.remarks?.trim() || '',
    denominations: values.denominations.map((row) => ({
      key: row.key,
      label: row.label,
      unitValue: row.unitValue,
      pieces: row.unitValue != null ? Number(row.pieces) || 0 : 0,
      amount: row.unitValue != null
        ? row.unitValue * (Number(row.pieces) || 0)
        : (Number(row.amount) || 0),
    })),
  };
}
