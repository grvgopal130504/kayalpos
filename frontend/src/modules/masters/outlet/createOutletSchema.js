import { z } from 'zod';

export const OUTLET_TYPE_OPTIONS = [
  { value: '', label: 'Select Outlet Type', disabled: true },
  { value: 'Retail Outlet', label: 'Retail Outlet' },
  { value: 'Warehouse Outlet', label: 'Warehouse Outlet' },
  { value: 'Franchise Outlet', label: 'Franchise Outlet' },
  { value: 'Online Outlet', label: 'Online Outlet' },
];

export const COMPANY_OPTIONS = [
  { value: '', label: 'Select Company', disabled: true },
  { value: 'Kayal Agro Foods Pvt Ltd', label: 'Kayal Agro Foods Pvt Ltd' },
];

export const STATE_OPTIONS = [
  { value: '', label: 'Select State', disabled: true },
  { value: 'Tamil Nadu', label: 'Tamil Nadu' },
  { value: 'Karnataka', label: 'Karnataka' },
  { value: 'Kerala', label: 'Kerala' },
  { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
  { value: 'Maharashtra', label: 'Maharashtra' },
];

export const CITY_OPTIONS = [
  { value: '', label: 'Select City', disabled: true },
  { value: 'Coimbatore', label: 'Coimbatore' },
  { value: 'Chennai', label: 'Chennai' },
  { value: 'Madurai', label: 'Madurai' },
  { value: 'Salem', label: 'Salem' },
];

export const STATUS_OPTIONS = [
  { value: '', label: 'Select Status', disabled: true },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

export const createOutletSchema = z.object({
  outletCode: z.string().trim().min(1, 'Outlet code is required'),
  outletName: z.string().trim().min(1, 'Outlet name is required'),
  registrationNo: z.string().trim().optional(),
  gstin: z.string().trim().min(1, 'GSTIN is required'),
  panNo: z.string().trim().optional(),
  email: z.string().trim().optional(),
  website: z.string().trim().optional(),

  outletType: z.string().trim().min(1, 'Select an outlet type'),
  company: z.string().trim().min(1, 'Select a company'),
  state: z.string().trim().min(1, 'Select a state'),
  city: z.string().trim().min(1, 'Select a city'),
  phone: z.string().trim().min(1, 'Phone is required'),
  mobile: z.string().trim().min(1, 'Mobile is required'),
  status: z.string().trim().min(1, 'Select a status'),
});

export const createOutletDefaultValues = {
  outletCode: 'OUT001',
  outletName: 'Kayal Agro Foods - Main Outlet',
  registrationNo: 'U15499TZ2020PTC032456',
  gstin: '33AABCK1234M1Z5',
  panNo: 'AABCK1234M',
  email: 'info@kayalagro.com',
  website: 'www.kayalagro.com',

  outletType: 'Retail Outlet',
  company: 'Kayal Agro Foods Pvt Ltd',
  state: 'Tamil Nadu',
  city: 'Coimbatore',
  phone: '+91 94422 33456',
  mobile: '+91 94422 33445',
  status: 'Active',
};
