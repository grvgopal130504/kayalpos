import { z } from 'zod';
import { formatPickerDate, parsePickerDate } from '../../../components/form/FormDatePicker';
import { PRICING_METHOD_OPTIONS } from './sellingPriceMockData';

export const PRICING_METHODS = PRICING_METHOD_OPTIONS.map((o) => o.value);

// Client-side validation mirrors the server's createSellingPriceSchema (see
// backend/src/modules/selling-price/sellingPrice.schema.js) — every rule
// here has a matching check there, so a request that passes this form can't
// be rejected by the server for a reason the user wasn't already shown.
// Numeric fields are kept as form strings (same convention as Product's
// createProductSchema) and converted with Number() in
// sellingPriceFormValuesToPayload below. `productId`/`taxRate` are hidden
// fields filled in by the Item/Tax Code pickers (see SellingPricePage.jsx),
// not typed directly.
export const sellingPriceFormSchema = z.object({
  productId: z.string().trim().min(1, 'Select an item'),
  // Display-only mirror of productId, bound to ItemCodeAutocomplete (which
  // matches products by `code`, not `id`) — see SellingPricePage.jsx.
  productCode: z.string().trim().min(1, 'Select an item'),
  priceList: z.string().trim().min(1, 'Select a price list'),
  outletId: z.string().trim().min(1, 'Select an outlet / branch'),
  mrp: z.string().trim().min(1, 'MRP is required')
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, 'Enter a valid non-negative amount'),
  purchaseCost: z.string().trim().min(1, 'Purchase cost is required')
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, 'Enter a valid non-negative amount'),
  taxCode: z.string().trim().optional(),
  taxRate: z.string().trim().optional(),
  pricingMethod: z.enum(PRICING_METHODS, { errorMap: () => ({ message: 'Select a pricing method' }) }),
  marginPercent: z.string().trim().optional(),
  fixedSellingPrice: z.string().trim().optional(),
  rounding: z.string().trim().min(1, 'Select a rounding rule'),
  priceUpdateReason: z.string().trim().max(250, 'Reason cannot exceed 250 characters').optional(),
  effectiveFrom: z.string().trim().min(1, 'Select the effective from date'),
  effectiveTo: z.string().trim().optional(),
  approvalRequired: z.boolean().default(false),
  status: z.string().trim().min(1, 'Select a status'),
}).superRefine((data, ctx) => {
  if (data.pricingMethod === 'MARGIN_FROM_MRP' || data.pricingMethod === 'MARGIN_FROM_COST') {
    const margin = Number(data.marginPercent);
    if (data.marginPercent === undefined || data.marginPercent === '' || Number.isNaN(margin) || margin < 0 || margin > 100) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['marginPercent'], message: 'Enter a margin % between 0 and 100' });
    }
  }
  if (data.pricingMethod === 'FIXED') {
    const price = Number(data.fixedSellingPrice);
    if (data.fixedSellingPrice === undefined || data.fixedSellingPrice === '' || Number.isNaN(price) || price < 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['fixedSellingPrice'], message: 'Enter a valid non-negative selling price' });
    }
  }
  const from = parsePickerDate(data.effectiveFrom);
  const to = data.effectiveTo ? parsePickerDate(data.effectiveTo) : null;
  if (data.effectiveTo && to && from && to < from) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['effectiveTo'], message: 'Effective To cannot be before Effective From' });
  }
});

export const sellingPriceDefaultValues = {
  productId: '',
  productCode: '',
  priceList: '',
  outletId: '',
  mrp: '',
  purchaseCost: '',
  taxCode: '',
  taxRate: '0',
  pricingMethod: 'MARGIN_FROM_MRP',
  marginPercent: '10.00',
  fixedSellingPrice: '',
  rounding: 'Round to 2 Decimal',
  priceUpdateReason: '',
  effectiveFrom: formatPickerDate(new Date()),
  effectiveTo: '',
  approvalRequired: false,
  status: 'Active',
};

/**
 * Live preview of the same calculation sellingPrice.service.js's
 * computePricing() performs server-side — used only to drive the
 * Pricing Calculation panel's read-only Margin Amount / Selling Price
 * fields while the user types. The server recomputes these independently
 * from the raw inputs on save (see that file's doc comment on why) — this
 * is a preview for instant feedback, never the number that gets trusted.
 */
export function computePricingPreview({
  pricingMethod, mrp, purchaseCost, marginPercent, fixedSellingPrice, taxRate,
}) {
  const mrpNum = Number(mrp) || 0;
  const purchaseCostNum = Number(purchaseCost) || 0;
  const marginPercentNum = Number(marginPercent) || 0;
  const taxRateNum = Number(taxRate) || 0;

  let sellingPriceExclTax;
  let marginAmount;
  if (pricingMethod === 'FIXED') {
    sellingPriceExclTax = Number(fixedSellingPrice) || 0;
    marginAmount = mrpNum - sellingPriceExclTax;
  } else if (pricingMethod === 'MARGIN_FROM_COST') {
    marginAmount = (purchaseCostNum * marginPercentNum) / 100;
    sellingPriceExclTax = purchaseCostNum + marginAmount;
  } else {
    marginAmount = (mrpNum * marginPercentNum) / 100;
    sellingPriceExclTax = mrpNum - marginAmount;
  }
  const sellingPriceInclTax = sellingPriceExclTax * (1 + taxRateNum / 100);
  const taxAmount = sellingPriceInclTax - sellingPriceExclTax;

  return {
    marginAmount, sellingPriceExclTax, sellingPriceInclTax, taxAmount,
  };
}

// Maps a SellingPrice row as returned by the API (product/outlet joined in,
// status 'ACTIVE'/'INACTIVE', Decimal fields serialized to string,
// effectiveFrom/To as ISO date strings) to react-hook-form values, for
// editing an existing row via the calculator above the list.
export function sellingPriceToFormValues(row) {
  if (!row) return sellingPriceDefaultValues;
  return {
    productId: row.productId || row.product?.id || '',
    productCode: row.product?.code || '',
    priceList: row.priceList || '',
    outletId: row.outletId || '',
    mrp: row.mrp != null ? String(row.mrp) : '',
    purchaseCost: row.purchaseCost != null ? String(row.purchaseCost) : '',
    taxCode: row.taxCode || '',
    taxRate: row.taxRate != null ? String(row.taxRate) : '0',
    pricingMethod: row.pricingMethod || 'MARGIN_FROM_MRP',
    marginPercent: row.marginPercent != null ? String(row.marginPercent) : '0',
    fixedSellingPrice: row.pricingMethod === 'FIXED' && row.sellingPriceExclTax != null ? String(row.sellingPriceExclTax) : '',
    rounding: row.rounding || 'Round to 2 Decimal',
    priceUpdateReason: row.priceUpdateReason || '',
    effectiveFrom: row.effectiveFrom ? formatPickerDate(new Date(row.effectiveFrom)) : '',
    effectiveTo: row.effectiveTo ? formatPickerDate(new Date(row.effectiveTo)) : '',
    approvalRequired: Boolean(row.approvalRequired),
    status: String(row.status).toUpperCase() === 'INACTIVE' ? 'Inactive' : 'Active',
  };
}

// Converts the form's values into the real POST/PUT
// /masters/selling-price body.
export function sellingPriceFormValuesToPayload(values) {
  const effectiveFromDate = parsePickerDate(values.effectiveFrom);
  const effectiveToDate = values.effectiveTo ? parsePickerDate(values.effectiveTo) : null;

  return {
    productId: values.productId,
    priceList: values.priceList,
    outletId: values.outletId || null,
    mrp: Number(values.mrp),
    purchaseCost: Number(values.purchaseCost || 0),
    taxCode: values.taxCode?.trim() || undefined,
    taxRate: Number(values.taxRate || 0),
    pricingMethod: values.pricingMethod,
    marginPercent: values.pricingMethod === 'FIXED' ? 0 : Number(values.marginPercent || 0),
    fixedSellingPrice: values.pricingMethod === 'FIXED' ? Number(values.fixedSellingPrice || 0) : undefined,
    rounding: values.rounding,
    priceUpdateReason: values.priceUpdateReason?.trim() || undefined,
    effectiveFrom: effectiveFromDate ? effectiveFromDate.toISOString() : undefined,
    effectiveTo: effectiveToDate ? effectiveToDate.toISOString() : null,
    approvalRequired: Boolean(values.approvalRequired),
    status: values.status === 'Inactive' ? 'INACTIVE' : 'ACTIVE',
  };
}
