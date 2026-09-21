import { z } from 'zod';

export const PROMOTION_TYPE_OPTIONS = [
  { value: '', label: 'Select Promotion Type', disabled: true },
  { value: 'Percentage Off', label: 'Percentage Off' },
  { value: 'Amount Off', label: 'Amount Off' },
  { value: 'Buy X Get Y', label: 'Buy X Get Y' },
  { value: 'Bundle Offer', label: 'Bundle Offer' },
];

export const APPLIES_TO_OPTIONS = [
  { value: '', label: 'Select Option', disabled: true },
  { value: 'all', label: 'All Items' },
  { value: 'specific', label: 'Specific Items' },
  { value: 'category', label: 'Category' },
];

export const DISCOUNT_TYPE_OPTIONS = [
  { value: '', label: 'Select Discount Type', disabled: true },
  { value: 'Percentage', label: 'Percentage' },
  { value: 'Flat Amount', label: 'Flat Amount' },
  { value: 'Free Item', label: 'Free Item' },
  { value: 'Special Price', label: 'Special Price' },
];

export const DISCOUNT_UNIT_OPTIONS = [
  { value: '%', label: '%' },
  { value: '₹', label: '₹' },
];

export const MAXIMUM_USAGE_OPTIONS = [
  { value: 'no-limit', label: 'No Limit' },
  { value: 'once-per-customer', label: 'Once Per Customer' },
  { value: 'once-per-bill', label: 'Once Per Bill' },
];

// Plain-language explanation of what each Maximum Usage option actually
// does at billing time — shown as a caption under the field on the create
// form and folded into the live preview's Terms & Conditions, so the choice
// reads the same wherever it's referenced.
export const MAXIMUM_USAGE_DESCRIPTIONS = {
  'no-limit': 'No restriction — this promotion can be applied on every eligible item, for every customer, on any number of bills.',
  'once-per-customer': 'Each customer can redeem this promotion only once in total, even across separate bills or visits.',
  'once-per-bill': 'This promotion can be applied only once per bill — a customer can still use it again on a different bill.',
};

// Same "DD Mon YYYY" shape FormDatePicker's formatPickerDate() produces, so
// the default value already matches what the picker itself would write —
// unlike the old "DD/MM/YYYY" default, which FormDatePicker's own parser
// couldn't read back (it only understands "DD Mon YYYY"), silently showing
// the field as if nothing were selected until the user touched it.
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

/** Accepts "DD Mon YYYY" (the date picker's own format) or "DD/MM/YYYY"
 * (an old default some saved records may still carry) and returns a real
 * Date, or null if the string doesn't match either shape. Exported so
 * PromotionPage/CreatePromotionPage can convert form strings to real dates
 * before sending them to the backend (which expects ISO dates). */
export function parsePromotionDate(value) {
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

export function formatPromotionDate(date) {
  return date ? formatDate(date) : '';
}

// A plain (optional) non-negative decimal amount, entered as free text
// (money fields allow a "." so they can't use FormTextField's `numeric`
// digit-stripping prop) — validated here instead so "12.5.3", "-5" or
// "abc" are caught before they ever reach the backend.
const decimalAmount = (message) => z.string().trim()
  .refine((v) => v === '' || (/^\d+(\.\d{1,2})?$/.test(v) && Number(v) >= 0), message);

export const createPromotionSchema = z
  .object({
    promotionName: z.string().trim().min(1, 'Promotion name is required'),
    promotionType: z.string().trim().min(1, 'Select a promotion type'),
    description: z.string().trim().optional(),
    appliesTo: z.string().trim().min(1, 'Select who this applies to'),
    discountType: z.string().trim().min(1, 'Select a discount type'),
    discountValue: decimalAmount('Enter a valid, non-negative discount value')
      .refine((v) => v !== '', 'Enter a discount value'),
    discountUnit: z.string(),
    maximumUsage: z.string(),
    minimumBillAmount: decimalAmount('Enter a valid, non-negative amount'),
    startDate: z.string().trim().min(1, 'Start date is required'),
    endDate: z.string().trim(),
    noExpiry: z.boolean(),
    usageLimitEnabled: z.boolean(),
    usageLimitCount: z.string().trim().refine((v) => v === '' || /^\d+$/.test(v), 'Enter a whole number'),
    onePerCustomer: z.boolean(),
    combinable: z.boolean(),
    showInInvoice: z.boolean(),
    // Only meaningful when appliesTo is 'specific' / 'category' respectively
    // — see the superRefine below. Holds product codes / category names
    // picked in PromotionItemPickerDialog.
    selectedItems: z.array(z.string()).default([]),
    selectedCategories: z.array(z.string()).default([]),
  })
  .superRefine((values, ctx) => {
    if (!values.noExpiry && !values.endDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['endDate'], message: 'End date is required' });
    }
    if (!values.noExpiry && values.endDate && values.startDate) {
      const start = parsePromotionDate(values.startDate);
      const end = parsePromotionDate(values.endDate);
      if (start && end && end < start) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['endDate'], message: 'End date cannot be before start date' });
      }
    }
    if (values.appliesTo === 'specific' && values.selectedItems.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['selectedItems'], message: 'Select at least one item' });
    }
    if (values.appliesTo === 'category' && values.selectedCategories.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['selectedCategories'], message: 'Select at least one category' });
    }
    if (values.discountType === 'Percentage' && values.discountUnit === '%' && Number(values.discountValue) > 100) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['discountValue'], message: 'Percentage discount cannot exceed 100%' });
    }
    if (values.usageLimitEnabled && (!values.usageLimitCount || Number(values.usageLimitCount) <= 0)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['usageLimitCount'], message: 'Enter a usage limit greater than 0' });
    }
  });

export const createPromotionDefaultValues = {
  promotionName: '',
  promotionType: '',
  description: '',
  appliesTo: 'all',
  discountType: '',
  discountValue: '',
  discountUnit: '%',
  maximumUsage: 'no-limit',
  minimumBillAmount: '',
  startDate: todayFormatted(),
  endDate: addMonthsFormatted(1),
  noExpiry: false,
  usageLimitEnabled: false,
  usageLimitCount: '0',
  onePerCustomer: false,
  combinable: true,
  showInInvoice: true,
  selectedItems: [],
  selectedCategories: [],
};
