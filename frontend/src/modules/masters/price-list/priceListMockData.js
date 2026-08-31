/**
 * TEMPORARY mock data for the Price List master. There's no Price List
 * backend module yet, so this static snapshot stands in for
 * `useGetPriceListsQuery()`. Replace with real API data once that module
 * exists — do not add more mock data here in the meantime.
 */

export const PRICE_LIST_TYPE_OPTIONS = ['Sales Price List', 'Promotional'];
export const APPLICABLE_TO_OPTIONS = [
  'All Customers', 'Wholesale Customers', 'Retail Customers', 'E-Commerce',
  'Distributors', 'Employees', 'Export Customers',
];

export const PRICE_LISTS = [
  { code: 'PL001', name: 'Main Outlet Price List', type: 'Sales Price List', applicableTo: 'All Customers', basePriceList: 'Standard Price', currency: 'INR', status: 'Active', effectiveFrom: '01-Apr-2023', effectiveTo: '-', itemCount: 1245 },
  { code: 'PL002', name: 'Wholesale Price List', type: 'Sales Price List', applicableTo: 'Wholesale Customers', basePriceList: 'Standard Price', currency: 'INR', status: 'Active', effectiveFrom: '01-Apr-2023', effectiveTo: '-', itemCount: 1245 },
  { code: 'PL003', name: 'Retail Price List', type: 'Sales Price List', applicableTo: 'Retail Customers', basePriceList: 'Standard Price', currency: 'INR', status: 'Active', effectiveFrom: '01-Apr-2023', effectiveTo: '-', itemCount: 1245 },
  { code: 'PL004', name: 'Online Store Price List', type: 'Sales Price List', applicableTo: 'E-Commerce', basePriceList: 'Standard Price', currency: 'INR', status: 'Active', effectiveFrom: '01-Jun-2023', effectiveTo: '-', itemCount: 1210 },
  { code: 'PL005', name: 'Distributor Price List', type: 'Sales Price List', applicableTo: 'Distributors', basePriceList: 'Standard Price', currency: 'INR', status: 'Active', effectiveFrom: '01-Apr-2023', effectiveTo: '-', itemCount: 1230 },
  { code: 'PL006', name: 'Staff Price List', type: 'Sales Price List', applicableTo: 'Employees', basePriceList: 'Standard Price', currency: 'INR', status: 'Active', effectiveFrom: '01-Apr-2023', effectiveTo: '-', itemCount: 1150 },
  { code: 'PL007', name: 'Export Price List (USD)', type: 'Sales Price List', applicableTo: 'Export Customers', basePriceList: 'Standard Price', currency: 'USD', status: 'Active', effectiveFrom: '01-Apr-2023', effectiveTo: '-', itemCount: 1210 },
  { code: 'PL008', name: 'Promotional Price List', type: 'Promotional', applicableTo: 'All Customers', basePriceList: 'Main Outlet Price List', currency: 'INR', status: 'Inactive', effectiveFrom: '01-May-2023', effectiveTo: '31-May-2023', itemCount: 856 },
];

export const STATS = {
  totalPriceLists: 8,
  activePriceLists: 7,
  inactivePriceLists: 1,
  totalItemsInPriceLists: 8481,
};
