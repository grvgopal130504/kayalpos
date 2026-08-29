import { z } from 'zod';
import { CUSTOMERS } from '../customer/customerMockData';
import { ORDERS } from '../sales-order/salesOrderMockData';
import { QUOTATIONS } from '../sales-quotation/salesQuotationMockData';

export const CUSTOMER_OPTIONS = [
  { value: '', label: 'Select Customer', disabled: true },
  ...CUSTOMERS.slice(0, 10).map((c) => ({ value: c.code, label: c.name })),
];

export const CONTACT_PERSON_OPTIONS = [
  { value: '', label: 'Select Contact Person', disabled: true },
  { value: 'owner', label: 'Owner' },
  { value: 'manager', label: 'Store Manager' },
  { value: 'purchase', label: 'Purchase In-Charge' },
];

export const PAYMENT_TERMS_OPTIONS = [
  { value: '', label: 'Select Payment Terms', disabled: true },
  { value: 'immediate', label: 'Immediate' },
  { value: '15-days', label: '15 Days' },
  { value: '30-days', label: '30 Days' },
  { value: '45-days', label: '45 Days' },
];

export const SALES_PERSON_OPTIONS = [
  { value: '', label: 'Select Sales Person', disabled: true },
  { value: 'admin', label: 'Admin' },
  { value: 'staff-1', label: 'Staff 1' },
  { value: 'staff-2', label: 'Staff 2' },
];

export const CURRENCY_OPTIONS = [
  { value: 'INR', label: 'INR - Indian Rupee' },
];

export const PRICE_LIST_OPTIONS = [
  { value: '', label: 'Select Price List', disabled: true },
  { value: 'standard', label: 'Standard Price List' },
  { value: 'wholesale', label: 'Wholesale Price List' },
  { value: 'retail', label: 'Retail Price List' },
];

// Confirmed/delivered sales orders an invoice can be raised against — the
// reference design's "Sales Order" field.
export const SALES_ORDER_OPTIONS = [
  { value: '', label: 'Select Sales Order' },
  ...ORDERS.filter((o) => o.status === 'confirmed' || o.status === 'delivered').map((o) => ({ value: o.code, label: o.code })),
];

// Converted quotations an invoice can be raised against directly — the
// reference design's "Quotation Reference" field.
export const QUOTATION_REFERENCE_OPTIONS = [
  { value: '', label: 'Select Quotation' },
  ...QUOTATIONS.filter((q) => q.status === 'converted').map((q) => ({ value: q.code, label: q.code })),
];

export const UNIT_OPTIONS = [
  { value: '', label: 'Unit' },
  { value: 'pcs', label: 'Pcs' },
  { value: 'kg', label: 'Kg' },
  { value: 'ltr', label: 'Ltr' },
  { value: 'box', label: 'Box' },
  { value: 'dozen', label: 'Dozen' },
];

export const TAX_CODE_OPTIONS = [
  { value: '', label: 'Tax' },
  { value: 'gst-5', label: 'GST 5%' },
  { value: 'gst-12', label: 'GST 12%' },
  { value: 'gst-18', label: 'GST 18%' },
  { value: 'gst-28', label: 'GST 28%' },
  { value: 'exempt', label: 'Exempt' },
];

function todayFormatted() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function addDaysFormatted(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export function emptyItemRow() {
  return {
    itemCode: '',
    itemName: '',
    hsnCode: '',
    qty: '',
    unit: '',
    unitPrice: '',
    discountPercent: '',
    taxCode: '',
  };
}

const itemRowSchema = z.object({
  itemCode: z.string().trim(),
  itemName: z.string().trim(),
  hsnCode: z.string().trim(),
  qty: z.string().trim(),
  unit: z.string().trim(),
  unitPrice: z.string().trim(),
  discountPercent: z.string().trim(),
  taxCode: z.string().trim(),
});

export const createSalesInvoiceSchema = z.object({
  customerId: z.string().trim().min(1, 'Select a customer'),
  contactPerson: z.string().trim().optional(),
  mobile: z.string().trim().optional(),
  email: z.string().trim().optional(),
  address: z.string().trim().optional(),
  invoiceDate: z.string().trim().min(1, 'Invoice date is required'),
  dueDate: z.string().trim().optional(),
  salesOrderRef: z.string().trim().optional(),
  quotationRef: z.string().trim().optional(),
  salesPerson: z.string().trim().min(1, 'Select a sales person'),
  currency: z.string().trim(),
  paymentTerms: z.string().trim().optional(),
  priceList: z.string().trim().optional(),
  deliveryDate: z.string().trim().optional(),
  referenceNo: z.string().trim().optional(),
  remarks: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  extraDiscount: z.string().trim(),
  items: z.array(itemRowSchema),
});

export const createSalesInvoiceDefaultValues = {
  customerId: '',
  contactPerson: '',
  mobile: '',
  email: '',
  address: '',
  invoiceDate: todayFormatted(),
  dueDate: addDaysFormatted(30),
  salesOrderRef: '',
  quotationRef: '',
  salesPerson: '',
  currency: 'INR',
  paymentTerms: '',
  priceList: '',
  deliveryDate: '',
  referenceNo: '',
  remarks: '',
  notes: '',
  extraDiscount: '0',
  items: [emptyItemRow(), emptyItemRow(), emptyItemRow(), emptyItemRow(), emptyItemRow()],
};
