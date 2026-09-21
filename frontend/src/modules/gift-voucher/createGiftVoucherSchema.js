import { z } from 'zod';

export const VOUCHER_TYPE_OPTIONS = [
  { value: '', label: 'Select Voucher Type', disabled: true },
  { value: 'Fixed Amount', label: 'Fixed Amount' },
  { value: 'Percentage Discount', label: 'Percentage Discount' },
  { value: 'Digital Gift Card', label: 'Digital Gift Card' },
  { value: 'Physical Gift Card', label: 'Physical Gift Card' },
];

export const MAXIMUM_USAGE_OPTIONS = [
  { value: 'no-limit', label: 'No Limit' },
  { value: 'once', label: 'Once' },
  { value: 'limited', label: 'Limited Count' },
];

export const YES_NO_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

// Same "DD Mon YYYY" shape FormDatePicker's formatPickerDate() produces, so
// the default value already matches what the picker itself would write —
// mirrors the fix already made for Promotion's createPromotionSchema.js
// (the old "DD/MM/YYYY" default couldn't be parsed back by the picker).
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(d) {
  return `${String(d.getDate()).padStart(2, '0')} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function todayFormatted() {
  return formatDate(new Date());
}

function addMonthsFormatted(months) {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return formatDate(d);
}

/** Accepts "DD Mon YYYY" (the date picker's own format) or "DD/MM/YYYY" (an
 * old default some saved records may still carry) and returns a real Date,
 * or null if the string doesn't match either shape. Exported so
 * GiftVoucherPage/CreateGiftVoucherPage can convert form strings to real
 * dates before sending them to the backend (which expects ISO dates). */
export function parseGiftVoucherDate(value) {
  if (!value || typeof value !== 'string') return null;
  const slash = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim());
  if (slash) return new Date(Number(slash[3]), Number(slash[2]) - 1, Number(slash[1]));
  const named = /^(\d{1,2})\s+([A-Za-z]{3})\w*\s+(\d{4})$/.exec(value.trim());
  if (named) {
    const monthIndex = MONTH_NAMES.findIndex((m) => m.toLowerCase() === named[2].slice(0, 3).toLowerCase());
    if (monthIndex !== -1) return new Date(Number(named[3]), monthIndex, Number(named[1]));
  }
  return null;
}

export function formatGiftVoucherDate(date) {
  return date ? formatDate(date) : '';
}

// A plain (optional) non-negative decimal amount, entered as free text
// (money fields allow a "." so they can't use FormTextField's `numeric`
// digit-stripping prop) — validated here instead so "12.5.3", "-5" or "abc"
// are caught before they ever reach the backend.
const decimalAmount = (message) => z.string().trim()
  .refine((v) => v === '' || (/^\d+(\.\d{1,2})?$/.test(v) && Number(v) >= 0), message);

export const createGiftVoucherSchema = z
  .object({
    voucherName: z.string().trim().min(1, 'Voucher name is required'),
    voucherType: z.string().trim().min(1, 'Select a voucher type'),
    voucherValue: decimalAmount('Enter a valid, non-negative value')
      .refine((v) => v !== '', 'Enter a voucher value'),
    description: z.string().trim().optional(),
    validFrom: z.string().trim().min(1, 'Valid From date is required'),
    validTill: z.string().trim(),
    noExpiry: z.boolean(),
    minimumBillAmount: decimalAmount('Enter a valid, non-negative amount'),
    maximumUsage: z.string(),
    oneTimePerCustomer: z.string(),
    partialRedemptionAllowed: z.string(),
    allowMultipleInOneBill: z.string(),
    applicableTo: z.string().trim().min(1, 'Select who this applies to'),
    active: z.boolean(),
    sendSms: z.boolean(),
    sendEmail: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (!values.noExpiry && !values.validTill) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['validTill'], message: 'Valid Till date is required' });
    }
    if (!values.noExpiry && values.validTill && values.validFrom) {
      const start = parseGiftVoucherDate(values.validFrom);
      const end = parseGiftVoucherDate(values.validTill);
      if (start && end && end < start) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['validTill'], message: 'Valid Till date cannot be before Valid From date' });
      }
    }
    if (values.voucherType === 'Percentage Discount' && Number(values.voucherValue) > 100) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['voucherValue'], message: 'Percentage value cannot exceed 100%' });
    }
  });

export const createGiftVoucherDefaultValues = {
  voucherName: '',
  voucherType: '',
  voucherValue: '',
  description: '',
  validFrom: todayFormatted(),
  validTill: addMonthsFormatted(1),
  noExpiry: false,
  minimumBillAmount: '0.00',
  maximumUsage: 'no-limit',
  oneTimePerCustomer: 'no',
  partialRedemptionAllowed: 'yes',
  allowMultipleInOneBill: 'yes',
  applicableTo: 'all',
  active: true,
  sendSms: false,
  sendEmail: false,
};
