import { z } from 'zod';
import { formatPickerDate, parsePickerDate } from '../../components/form/FormDatePicker';

// Fixed denomination catalog — same set the old mock UI shipped with.
// "Coins" bundles ₹1/₹2/₹5 into one row with no single face value, so its
// amount is entered directly instead of computed from pieces (matches
// ShiftOpeningDenominationTable / the backend's own denomination schema).
export const DENOMINATION_CATALOG = [
  { key: 'd2000', label: '₹ 2,000', unitValue: 2000 },
  { key: 'd500', label: '₹ 500', unitValue: 500 },
  { key: 'd200', label: '₹ 200', unitValue: 200 },
  { key: 'd100', label: '₹ 100', unitValue: 100 },
  { key: 'd50', label: '₹ 50', unitValue: 50 },
  { key: 'd20', label: '₹ 20', unitValue: 20 },
  { key: 'd10', label: '₹ 10', unitValue: 10 },
  { key: 'coins', label: 'Coins (₹1, ₹2, ₹5)', unitValue: null },
];

export function defaultDenominationRows() {
  return DENOMINATION_CATALOG.map((row) => ({ ...row, pieces: '0', amount: '0.00' }));
}

function todayFormatted() {
  return formatPickerDate(new Date());
}

// HH:MM, 24-hour — matches the native <input type="time"> the form uses.
export function nowFormattedTime() {
  return new Date().toTimeString().slice(0, 5);
}

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

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

export function computeTotalOpeningCash(denominations) {
  return denominations.reduce((sum, row) => {
    const amount = row.unitValue != null ? row.unitValue * (Number(row.pieces) || 0) : (Number(row.amount) || 0);
    return sum + amount;
  }, 0);
}

// Every field below is validated client-side for immediate feedback, and
// re-validated server-side by createShiftOpeningSchema (backend/src/modules/
// shift-session/shiftSession.schema.js) — the client check is a courtesy,
// never the only guard.
export const shiftOpeningSchema = z
  .object({
    shiftDate: z.string().trim().min(1, 'Shift date is required'),
    shiftNo: z.string().trim().min(1, 'Shift number is required'),
    shiftName: z.string().trim().optional(),
    startTime: z.string().trim().min(1, 'Shift start time is required').regex(TIME_RE, 'Enter a valid time'),
    endTime: z.string().trim().optional().refine((v) => !v || TIME_RE.test(v), 'Enter a valid time'),
    description: z.string().trim().optional(),
    notes: z.string().trim().optional(),
    agreedTerms: z.boolean(),
    denominations: z.array(denominationRowSchema),
  })
  .superRefine((values, ctx) => {
    if (values.endTime && values.startTime && values.endTime <= values.startTime) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['endTime'], message: 'End time must be after the start time' });
    }
    if (!values.agreedTerms) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['agreedTerms'],
        message: 'You must agree to the terms & conditions to open the shift',
      });
    }
    if (computeTotalOpeningCash(values.denominations) <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['denominations'],
        message: 'Total opening cash must be greater than zero — count at least one note or coin',
      });
    }
  });

export function shiftOpeningDefaultValues({ shiftNo = '', shiftName = 'Morning Shift', startTime } = {}) {
  return {
    shiftDate: todayFormatted(),
    shiftNo,
    shiftName,
    startTime: startTime || nowFormattedTime(),
    endTime: '',
    description: '',
    notes: '',
    agreedTerms: false,
    denominations: defaultDenominationRows(),
  };
}

// Converts the form's string-based values into the JSON payload
// createShiftOpeningSchema expects. attachmentName is passed through as
// plain metadata (there's no upload endpoint yet — same "local file picker
// only" scope decision Stock Count/Stock Wastage/Stock Return make for
// their own Attachment fields).
export function shiftOpeningFormValuesToPayload(values, { attachmentName } = {}) {
  const shiftDate = parsePickerDate(values.shiftDate);

  return {
    shiftDate: shiftDate ? shiftDate.toISOString() : undefined,
    shiftNo: values.shiftNo.trim(),
    shiftName: values.shiftName?.trim() || '',
    startTime: values.startTime.trim(),
    endTime: values.endTime?.trim() || '',
    description: values.description?.trim() || '',
    notes: values.notes?.trim() || '',
    attachmentName: attachmentName?.trim() || '',
    agreedTerms: values.agreedTerms,
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
