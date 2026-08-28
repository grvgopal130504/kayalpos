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

function todayFormatted() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function addMonthsFormatted(months) {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export const createGiftVoucherSchema = z
  .object({
    voucherName: z.string().trim().min(1, 'Voucher name is required'),
    voucherType: z.string().trim().min(1, 'Select a voucher type'),
    voucherValue: z.string().trim().min(1, 'Enter a voucher value'),
    description: z.string().trim().optional(),
    validFrom: z.string().trim().min(1, 'Valid From date is required'),
    validTill: z.string().trim(),
    noExpiry: z.boolean(),
    minimumBillAmount: z.string().trim(),
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
