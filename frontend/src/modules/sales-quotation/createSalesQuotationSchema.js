import { z } from 'zod';
import { formatPickerDate, parsePickerDate } from '../../components/form/FormDatePicker';

// `customerId` options now come from the real Customer API (see
// CreateSalesQuotationPage, which builds them from useGetCustomersQuery)
// rather than a hardcoded list — the Sales Quotation backend module
// actually exists now, so there's no reason to keep a fixed customer list
// here the way the old mock-data version did.

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
  return formatPickerDate(new Date());
}

function addDaysFormatted(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return formatPickerDate(d);
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

// A row where none of the fields that matter (code/name/qty/price) have
// been touched is a genuinely empty spare row — the form always starts
// with 5 of them — not something the user is trying to submit. Both the
// per-row validation below and CreateSalesQuotationPage's submit handler
// (which strips these before building the API payload) treat it this way.
export function isBlankItemRow(row) {
  return !row?.itemCode?.trim() && !row?.itemName?.trim() && !row?.qty?.trim() && !row?.unitPrice?.trim();
}

// A plain (optional) non-negative decimal amount, entered as free text
// (money/qty fields allow a "." so they can't use FormTextField's `numeric`
// digit-stripping prop) — same convention as Gift Voucher/Loyalty's own
// decimalAmount() helper.
const decimalString = (message) => z.string().trim()
  .refine((v) => v === '' || (/^\d+(\.\d{1,3})?$/.test(v) && Number(v) >= 0), message);

const itemRowSchema = z.object({
  itemCode: z.string().trim().optional(),
  itemName: z.string().trim().optional(),
  hsnCode: z.string().trim().optional(),
  qty: decimalString('Enter a valid quantity'),
  unit: z.string().trim().optional(),
  unitPrice: decimalString('Enter a valid, non-negative unit price'),
  discountPercent: decimalString('Enter a valid discount percent')
    .refine((v) => v === '' || Number(v) <= 100, 'Discount cannot exceed 100%'),
  taxCode: z.string().trim().optional(),
});

export const createSalesQuotationSchema = z
  .object({
    customerId: z.string().trim().min(1, 'Select a customer'),
    contactPerson: z.string().trim().optional(),
    mobile: z.string().trim().optional(),
    email: z.string().trim().email('Enter a valid email address').optional().or(z.literal('')),
    address: z.string().trim().optional(),
    quotationDate: z.string().trim().min(1, 'Quotation date is required'),
    validTill: z.string().trim().min(1, 'Valid till date is required'),
    paymentTerms: z.string().trim().optional(),
    salesPerson: z.string().trim().min(1, 'Select a sales person'),
    currency: z.string().trim(),
    referenceNo: z.string().trim().optional(),
    referenceDate: z.string().trim().optional(),
    priceList: z.string().trim().optional(),
    remarks: z.string().trim().optional(),
    notes: z.string().trim().optional(),
    extraDiscount: decimalString('Enter a valid, non-negative discount'),
    items: z.array(itemRowSchema),
  })
  .superRefine((values, ctx) => {
    const filledRows = [];
    values.items.forEach((row, index) => {
      if (isBlankItemRow(row)) return;
      filledRows.push(row);
      if (!row.itemCode?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['items', index, 'itemCode'], message: 'Item code is required' });
      }
      if (!row.itemName?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['items', index, 'itemName'], message: 'Item name is required' });
      }
      if (!row.qty?.trim() || Number(row.qty) <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['items', index, 'qty'], message: 'Qty must be greater than 0' });
      }
      if (!row.unitPrice?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['items', index, 'unitPrice'], message: 'Unit price is required' });
      }
    });
    if (filledRows.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['items'], message: 'Add at least one item' });
    }

    if (values.quotationDate && values.validTill) {
      const start = parsePickerDate(values.quotationDate);
      const end = parsePickerDate(values.validTill);
      if (start && end && end < start) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['validTill'], message: 'Valid till date cannot be before the quotation date' });
      }
    }
    if (values.referenceDate && values.quotationDate) {
      const ref = parsePickerDate(values.referenceDate);
      const start = parsePickerDate(values.quotationDate);
      if (ref && start && ref > start) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['referenceDate'], message: 'Reference date cannot be after the quotation date' });
      }
    }
  });

export const createSalesQuotationDefaultValues = {
  customerId: '',
  contactPerson: '',
  mobile: '',
  email: '',
  address: '',
  quotationDate: todayFormatted(),
  validTill: addDaysFormatted(14),
  paymentTerms: 'immediate',
  salesPerson: '',
  currency: 'INR',
  referenceNo: '',
  referenceDate: '',
  priceList: '',
  remarks: '',
  notes: '',
  extraDiscount: '0',
  items: [emptyItemRow(), emptyItemRow(), emptyItemRow(), emptyItemRow(), emptyItemRow()],
};
