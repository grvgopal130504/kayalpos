import { z } from 'zod';

export const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

export const EARN_POINTS_ON_OPTIONS = [
  { value: '', label: 'Select Option', disabled: true },
  { value: 'total-bill', label: 'Total Bill Amount' },
  { value: 'specific-items', label: 'Specific Items' },
  { value: 'specific-category', label: 'Specific Category' },
  { value: 'visit', label: 'Every Visit' },
];

export const POINTS_TYPE_OPTIONS = [
  { value: '', label: 'Select Type', disabled: true },
  { value: 'fixed', label: 'Fixed Points' },
  { value: 'percentage', label: 'Percentage of Bill' },
];

export const REDEMPTION_TYPE_OPTIONS = [
  { value: '', label: 'Select Option', disabled: true },
  { value: 'discount', label: 'Discount on Bill' },
  { value: 'cashback', label: 'Cashback' },
  { value: 'free-item', label: 'Free Item' },
];

export const APPLY_ON_OPTIONS = [
  { value: '', label: 'Select Option', disabled: true },
  { value: 'all', label: 'All Items' },
  { value: 'specific', label: 'Specific Items' },
  { value: 'category', label: 'Category' },
];

export const MEMBERSHIP_VALIDITY_OPTIONS = [
  { value: '', label: 'Select Option', disabled: true },
  { value: 'lifetime', label: 'Lifetime' },
  { value: 'fixed-period', label: 'Fixed Period' },
];

export const POINTS_EXPIRY_OPTIONS = [
  { value: '', label: 'Select Option', disabled: true },
  { value: 'never', label: 'Never' },
  { value: '6-months', label: '6 Months' },
  { value: '12-months', label: '12 Months' },
  { value: '24-months', label: '24 Months' },
];

// A plain (optional) non-negative decimal amount, entered as free text
// (money/points fields allow a "." so they can't use FormTextField's
// `numeric` digit-stripping prop) — validated here instead so "12.5.3",
// "-5" or "abc" are caught before they ever reach the backend.
const decimalAmount = (message) => z.string().trim()
  .refine((v) => v === '' || (/^\d+(\.\d{1,2})?$/.test(v) && Number(v) >= 0), message);

const wholeNumber = (message) => z.string().trim()
  .refine((v) => v === '' || /^\d+$/.test(v), message);

export const createLoyaltyProgramSchema = z
  .object({
    programName: z.string().trim().min(1, 'Program name is required'),
    description: z.string().trim().optional(),
    status: z.string().trim().min(1, 'Select a status'),
    earnPointsOn: z.string().trim().min(1, 'Select how points are earned'),
    pointsType: z.string().trim().min(1, 'Select a points type'),
    pointsValue: decimalAmount('Enter a valid, non-negative points value')
      .refine((v) => v !== '', 'Enter points value'),
    redemptionType: z.string().trim().min(1, 'Select a redemption type'),
    redemptionValue: decimalAmount('Enter a valid, non-negative redemption value')
      .refine((v) => v !== '', 'Enter redemption value'),
    minimumPointsRequired: wholeNumber('Enter a whole number')
      .refine((v) => v !== '', 'Enter minimum points required'),
    maximumDiscountPerTransaction: decimalAmount('Enter a valid, non-negative amount'),
    applyOn: z.string().trim().min(1, 'Select who this applies to'),
    membershipValidity: z.string().trim().min(1, 'Select membership validity'),
    validityPeriodMonths: wholeNumber('Enter a whole number'),
    pointsExpiry: z.string().trim().min(1, 'Select points expiry'),
    welcomePointsEnabled: z.boolean(),
    welcomePointsValue: wholeNumber('Enter a whole number'),
    allowPointsRedemption: z.boolean(),
    showLoyaltyDetailsInInvoice: z.boolean(),
    allowNegativePoints: z.boolean(),
    pointsExpiryNotification: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.membershipValidity === 'fixed-period' && (!values.validityPeriodMonths || Number(values.validityPeriodMonths) <= 0)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['validityPeriodMonths'], message: 'Enter a validity period greater than 0' });
    }
    if (values.welcomePointsEnabled && (!values.welcomePointsValue || Number(values.welcomePointsValue) <= 0)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['welcomePointsValue'], message: 'Enter a welcome points value greater than 0' });
    }
    if (values.pointsType === 'percentage' && Number(values.pointsValue) > 100) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['pointsValue'], message: 'Percentage cannot exceed 100%' });
    }
  });

export const createLoyaltyProgramDefaultValues = {
  programName: '',
  description: '',
  status: 'Active',
  earnPointsOn: '',
  pointsType: '',
  pointsValue: '0',
  redemptionType: '',
  redemptionValue: '0.00',
  minimumPointsRequired: '0',
  maximumDiscountPerTransaction: '0.00',
  applyOn: '',
  membershipValidity: '',
  validityPeriodMonths: '0',
  pointsExpiry: '',
  welcomePointsEnabled: false,
  welcomePointsValue: '0',
  allowPointsRedemption: true,
  showLoyaltyDetailsInInvoice: true,
  allowNegativePoints: false,
  pointsExpiryNotification: true,
};
