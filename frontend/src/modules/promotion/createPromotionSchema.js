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

function todayFormatted() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function addMonthsFormatted(months) {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export const createPromotionSchema = z
  .object({
    promotionName: z.string().trim().min(1, 'Promotion name is required'),
    promotionType: z.string().trim().min(1, 'Select a promotion type'),
    description: z.string().trim().optional(),
    appliesTo: z.string().trim().min(1, 'Select who this applies to'),
    discountType: z.string().trim().min(1, 'Select a discount type'),
    discountValue: z.string().trim().min(1, 'Enter a discount value'),
    discountUnit: z.string(),
    maximumUsage: z.string(),
    minimumBillAmount: z.string().trim(),
    startDate: z.string().trim().min(1, 'Start date is required'),
    endDate: z.string().trim(),
    noExpiry: z.boolean(),
    usageLimitEnabled: z.boolean(),
    usageLimitCount: z.string().trim(),
    onePerCustomer: z.boolean(),
    combinable: z.boolean(),
    showInInvoice: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (!values.noExpiry && !values.endDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['endDate'], message: 'End date is required' });
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
};
