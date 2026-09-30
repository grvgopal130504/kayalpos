/**
 * Frontend-owned option lists for the Price List master. `type` and
 * `applicableTo` are kept as free-text DB columns (see the doc comment on
 * the PriceList model in backend/prisma/schema.prisma) so these lists can
 * grow without a backend redeploy — same "list lives in the frontend"
 * convention as Product.brand/taxCode, TaxCode.type/category, HsnSac.chapter.
 * The actual price list rows and stats come from the real API
 * (see api/priceListApi.js) — no static row data lives here any more.
 */

export const PRICE_LIST_TYPE_OPTIONS = ['Sales Price List', 'Promotional'];
export const APPLICABLE_TO_OPTIONS = [
  'All Customers', 'Wholesale Customers', 'Retail Customers', 'E-Commerce',
  'Distributors', 'Employees', 'Export Customers',
];

export const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];
