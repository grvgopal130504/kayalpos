/**
 * Static, frontend-owned option lists for the Selling Price master — same
 * "list lives in the frontend" convention as Product's own
 * group/type/UOM lists (see productMockData.js). Item, Outlet and Tax Code
 * options are now real (useGetProductsQuery/useGetOutletsQuery/
 * useGetTaxCodesQuery — see the backend-wired SellingPricePage.jsx), so
 * this file only keeps what genuinely has no backend master yet: Price
 * List (no Price List module exists in this app) and Rounding (a display
 * preference, not a stored calculation rule).
 */

export const PRICE_LIST_OPTIONS = [
  { value: '', label: 'Select Price List', disabled: true },
  { value: 'Main Outlet Price List', label: 'Main Outlet Price List' },
  { value: 'Wholesale Price List', label: 'Wholesale Price List' },
  { value: 'Online Price List', label: 'Online Price List' },
];

export const ROUNDING_OPTIONS = [
  { value: 'Round to 2 Decimal', label: 'Round to 2 Decimal' },
  { value: 'Round to 1 Decimal', label: 'Round to 1 Decimal' },
  { value: 'Round to Nearest Rupee', label: 'Round to Nearest Rupee' },
  { value: 'No Rounding', label: 'No Rounding' },
];

// Preset margin percentages the "Margin From MRP Quick Calculator" table
// offers — clicking a row applies that margin to the calculator.
export const MARGIN_QUICK_STEPS = [5, 10, 15, 20, 25];

// Mirrors the Prisma PricingMethod enum (see
// backend/src/modules/selling-price/sellingPrice.schema.js's PRICING_METHODS).
export const PRICING_METHOD_OPTIONS = [
  { value: 'FIXED', label: 'Fixed Selling Price' },
  { value: 'MARGIN_FROM_MRP', label: 'Margin % From MRP' },
  { value: 'MARGIN_FROM_COST', label: 'Margin % From Cost' },
];

export const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];
