import { z } from 'zod';

export const WAREHOUSE_TYPE_OPTIONS = [
  { value: '', label: 'Select Warehouse Type', disabled: true },
  { value: 'General Warehouse', label: 'General Warehouse' },
  { value: 'Cold Storage', label: 'Cold Storage' },
  { value: 'Bonded Warehouse', label: 'Bonded Warehouse' },
  { value: 'Distribution Center', label: 'Distribution Center' },
];

export const LOCATION_OPTIONS = [
  { value: '', label: 'Select Location', disabled: true },
  { value: 'Coimbatore', label: 'Coimbatore' },
  { value: 'Chennai', label: 'Chennai' },
  { value: 'Madurai', label: 'Madurai' },
  { value: 'Salem', label: 'Salem' },
];

export const COMPANY_OPTIONS = [
  { value: '', label: 'Select Company', disabled: true },
  { value: 'Kayal Agro Foods Pvt Ltd', label: 'Kayal Agro Foods Pvt Ltd' },
];

export const OUTLET_OPTIONS = [
  { value: '', label: 'Select Outlet', disabled: true },
  { value: 'Kayal Agro Foods - Main Outlet', label: 'Kayal Agro Foods - Main Outlet' },
];

export const STATE_OPTIONS = [
  { value: '', label: 'Select State', disabled: true },
  { value: 'Tamil Nadu', label: 'Tamil Nadu' },
  { value: 'Karnataka', label: 'Karnataka' },
  { value: 'Kerala', label: 'Kerala' },
  { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
  { value: 'Maharashtra', label: 'Maharashtra' },
];

export const COUNTRY_OPTIONS = [
  { value: '', label: 'Select Country', disabled: true },
  { value: 'India', label: 'India' },
  { value: 'United Arab Emirates', label: 'United Arab Emirates' },
  { value: 'Singapore', label: 'Singapore' },
];

export const STATUS_OPTIONS = [
  { value: '', label: 'Select Status', disabled: true },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

export const CAPACITY_UNIT_OPTIONS = [
  { value: 'SQFT', label: 'SQFT' },
  { value: 'SQM', label: 'SQM' },
  { value: 'CBM', label: 'CBM' },
];

export const createWarehouseSchema = z.object({
  warehouseCode: z.string().trim().min(1, 'Warehouse code is required'),
  warehouseName: z.string().trim().min(1, 'Warehouse name is required'),
  company: z.string().trim().min(1, 'Select a company'),
  outlet: z.string().trim().min(1, 'Select an outlet'),
  address: z.string().trim().min(1, 'Address is required'),
  landmark: z.string().trim().optional(),

  warehouseType: z.string().trim().min(1, 'Select a warehouse type'),
  location: z.string().trim().optional(),
  state: z.string().trim().min(1, 'Select a state'),
  country: z.string().trim().min(1, 'Select a country'),
  pincode: z.string().trim().min(1, 'Pincode is required'),
  status: z.string().trim().min(1, 'Select a status'),

  totalCapacity: z.string().trim().min(1, 'Total capacity is required'),
  usedCapacity: z.string().trim().optional(),
  capacityUnit: z.string().trim().min(1, 'Select a unit'),

  inchargeName: z.string().trim().optional(),
  inchargePhone: z.string().trim().optional(),
});

export const createWarehouseDefaultValues = {
  warehouseCode: 'WH001',
  warehouseName: 'Kayal Agro Foods - Main Warehouse',
  company: 'Kayal Agro Foods Pvt Ltd',
  outlet: 'Kayal Agro Foods - Main Outlet',
  address: 'Door No. 12/3, Industrial Estate,\nS.F. No. 45/2B, Avinashi Road,\nCoimbatore - 641 037, Tamil Nadu, India.',
  landmark: 'Near KV School',

  warehouseType: 'General Warehouse',
  location: 'Coimbatore',
  state: 'Tamil Nadu',
  country: 'India',
  pincode: '641 037',
  status: 'Active',

  totalCapacity: '50000.00',
  usedCapacity: '12500.00',
  capacityUnit: 'SQFT',

  inchargeName: 'R. Kannan',
  inchargePhone: '+91 94422 33445',
};
