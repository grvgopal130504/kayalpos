import { z } from 'zod';

export const COMPANY_TYPE_OPTIONS = [
  { value: '', label: 'Select Company Type', disabled: true },
  { value: 'Private Limited', label: 'Private Limited' },
  { value: 'Public Limited', label: 'Public Limited' },
  { value: 'Partnership', label: 'Partnership' },
  { value: 'Proprietorship', label: 'Proprietorship' },
  { value: 'LLP', label: 'LLP' },
];

export const COUNTRY_OPTIONS = [
  { value: '', label: 'Select Country', disabled: true },
  { value: 'India', label: 'India' },
  { value: 'United Arab Emirates', label: 'United Arab Emirates' },
  { value: 'Singapore', label: 'Singapore' },
];

export const STATE_OPTIONS = [
  { value: '', label: 'Select State', disabled: true },
  { value: 'Tamil Nadu', label: 'Tamil Nadu' },
  { value: 'Karnataka', label: 'Karnataka' },
  { value: 'Kerala', label: 'Kerala' },
  { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
  { value: 'Maharashtra', label: 'Maharashtra' },
];

export const CURRENCY_OPTIONS = [
  { value: '', label: 'Select Currency', disabled: true },
  { value: 'INR - Indian Rupee', label: 'INR - Indian Rupee' },
  { value: 'USD - US Dollar', label: 'USD - US Dollar' },
  { value: 'AED - UAE Dirham', label: 'AED - UAE Dirham' },
];

export const createCompanySchema = z.object({
  companyCode: z.string().trim().min(1, 'Company code is required'),
  companyName: z.string().trim().min(1, 'Company name is required'),
  displayName: z.string().trim().optional(),
  registrationNo: z.string().trim().optional(),
  gstin: z.string().trim().min(1, 'GSTIN is required'),
  panNo: z.string().trim().optional(),
  email: z.string().trim().optional(),
  website: z.string().trim().optional(),

  companyType: z.string().trim().optional(),
  financialYearStart: z.string().trim().min(1, 'Financial year start is required'),
  country: z.string().trim().min(1, 'Select a country'),
  state: z.string().trim().min(1, 'Select a state'),
  currency: z.string().trim().min(1, 'Select a currency'),
  phone: z.string().trim().optional(),
  mobile: z.string().trim().optional(),
  fax: z.string().trim().optional(),
});

export const createCompanyDefaultValues = {
  companyCode: 'COMP001',
  companyName: 'Kayal Agro Foods Pvt Ltd',
  displayName: 'Kayal Agro Foods',
  registrationNo: 'U15499TZ2020PTC032456',
  gstin: '33AABCK1234M1Z5',
  panNo: 'AABCK1234M',
  email: 'info@kayalagro.com',
  website: 'www.kayalagro.com',

  companyType: 'Private Limited',
  financialYearStart: '01-April',
  country: 'India',
  state: 'Tamil Nadu',
  currency: 'INR - Indian Rupee',
  phone: '+91 422 2345678',
  mobile: '+91 94422 33445',
  fax: '+91 422 2345679',
};
