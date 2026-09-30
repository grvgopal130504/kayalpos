/**
 * Frontend-owned option lists for the Supplier master. `group`/`city`/
 * `state` are kept as free-text DB columns (see supplier.schema.js) so these
 * lists can grow without a backend redeploy — same "list lives in the
 * frontend" convention as Product.brand/taxCode. The actual supplier rows
 * come from the real API (see api/supplierApi.js) — no static row data
 * lives here any more.
 */

export const SUPPLIER_GROUP_OPTIONS = [
  'General Suppliers', 'Packaged Goods', 'Beverages', 'Dry Goods', 'Household Items',
  'Electronics', 'Dairy Products', 'Organic Products', 'Stationery', 'Construction Materials',
];
export const CITY_OPTIONS = ['Coimbatore', 'Erode', 'Tirupur', 'Salem', 'Chennai', 'Bangalore', 'Madurai'];
export const STATE_OPTIONS = ['Tamil Nadu', 'Karnataka'];

export const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];
