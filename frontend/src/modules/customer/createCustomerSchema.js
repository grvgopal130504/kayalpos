import { z } from 'zod';

export const CUSTOMER_TYPE_OPTIONS = [
  { value: '', label: 'Select Customer Type', disabled: true },
  { value: 'retail', label: 'Retail' },
  { value: 'wholesale', label: 'Wholesale' },
  { value: 'corporate', label: 'Corporate' },
];

export const GROUP_OPTIONS = [
  { value: '', label: 'Select Group', disabled: true },
  { value: 'general', label: 'General' },
  { value: 'vip', label: 'VIP' },
  { value: 'wholesale', label: 'Wholesale' },
];

export const PRICE_CATEGORY_OPTIONS = [
  { value: '', label: 'Select Price Category', disabled: true },
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
  { value: 'discounted', label: 'Discounted' },
];

export const OPENING_BALANCE_TYPE_OPTIONS = [
  { value: 'Cr', label: 'Cr' },
  { value: 'Dr', label: 'Dr' },
];

export const SALES_REP_OPTIONS = [
  { value: '', label: 'Select Sales Rep', disabled: true },
  { value: 'arun', label: 'Arun Kumar' },
  { value: 'divya', label: 'Divya Rani' },
  { value: 'karthik', label: 'Karthik S' },
];

export const TERRITORY_OPTIONS = [
  { value: '', label: 'Select Territory', disabled: true },
  { value: 'north', label: 'North Zone' },
  { value: 'south', label: 'South Zone' },
  { value: 'east', label: 'East Zone' },
  { value: 'west', label: 'West Zone' },
];

export const SAVE_OPTION_VALUES = [
  { value: 'continue', label: 'Save and Continue' },
  { value: 'close', label: 'Save and Close' },
];

export const createCustomerSchema = z.object({
  customerName: z.string().trim().min(1, 'Customer name is required'),
  mobileNumber: z.string().trim().min(1, 'Mobile number is required'),
  email: z.string().trim().optional(),
  gstin: z.string().trim().optional(),
  customerType: z.string().trim().min(1, 'Select a customer type'),
  group: z.string().trim().optional(),
  priceCategory: z.string().trim().optional(),
  creditLimit: z.string().trim(),
  openingBalance: z.string().trim(),
  openingBalanceType: z.string().trim(),
  address: z.string().trim().optional(),
  salesRepresentative: z.string().trim().optional(),
  territory: z.string().trim().optional(),
  activeCustomer: z.boolean(),
  allowCreditSale: z.boolean(),
  priceInclusive: z.boolean(),
  smsNotification: z.boolean(),
  notes: z.string().trim().optional(),
  saveOption: z.string(),
});

export const createCustomerDefaultValues = {
  customerName: '',
  mobileNumber: '',
  email: '',
  gstin: '',
  customerType: '',
  group: '',
  priceCategory: '',
  creditLimit: '0.00',
  openingBalance: '0.00',
  openingBalanceType: 'Cr',
  address: '',
  salesRepresentative: '',
  territory: '',
  activeCustomer: true,
  allowCreditSale: true,
  priceInclusive: false,
  smsNotification: true,
  notes: '',
  saveOption: 'continue',
};
