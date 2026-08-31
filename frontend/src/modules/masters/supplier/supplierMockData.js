/**
 * TEMPORARY mock data for the Supplier master. There's no Supplier
 * backend module yet, so this static snapshot stands in for
 * `useGetSuppliersQuery()`. Replace with real API data once that module
 * exists — do not add more mock data here in the meantime. Only the
 * first page (10 rows) of the 25-row catalog is mocked here.
 */

export const SUPPLIER_GROUP_OPTIONS = [
  'General Suppliers', 'Packaged Goods', 'Beverages', 'Dry Goods', 'Household Items',
  'Electronics', 'Dairy Products', 'Organic Products', 'Stationery', 'Construction Materials',
];
export const CITY_OPTIONS = ['Coimbatore', 'Erode', 'Tirupur', 'Salem', 'Chennai', 'Bangalore', 'Madurai'];
export const STATE_OPTIONS = ['Tamil Nadu', 'Karnataka'];

export const SUPPLIERS = [
  { code: 'SUPP001', name: 'Shree Ganesh Traders', group: 'General Suppliers', phone: '98844 12345', email: 'ganeshtraders@gmail.com', city: 'Coimbatore', state: 'Tamil Nadu', gstNo: '33AABCS1234F1Z5', paymentTerms: '30 Days', status: 'Active' },
  { code: 'SUPP002', name: 'Vijay Agencies', group: 'Packaged Goods', phone: '94422 56789', email: 'vijayagencies@gmail.com', city: 'Erode', state: 'Tamil Nadu', gstNo: '33AACFV2345G1Z2', paymentTerms: '15 Days', status: 'Active' },
  { code: 'SUPP003', name: 'S.K. Distributors', group: 'Beverages', phone: '98403 67890', email: 'skdistributors@gmail.com', city: 'Tirupur', state: 'Tamil Nadu', gstNo: '33AABFS3456H1Z3', paymentTerms: '30 Days', status: 'Active' },
  { code: 'SUPP004', name: 'Sri Lakshmi Foods', group: 'Dry Goods', phone: '97511 22334', email: 'srilakshmifoods@gmail.com', city: 'Salem', state: 'Tamil Nadu', gstNo: '33AABLS4567J1Z1', paymentTerms: '15 Days', status: 'Active' },
  { code: 'SUPP005', name: 'Metro Wholesalers', group: 'Household Items', phone: '98940 55667', email: 'metrowholesalers@gmail.com', city: 'Chennai', state: 'Tamil Nadu', gstNo: '33AABFM5678K1Z9', paymentTerms: '45 Days', status: 'Active' },
  { code: 'SUPP006', name: 'Global Enterprises', group: 'Electronics', phone: '90031 11223', email: 'globalenterprises@gmail.com', city: 'Bangalore', state: 'Karnataka', gstNo: '29AABFG6789L1Z0', paymentTerms: '30 Days', status: 'Active' },
  { code: 'SUPP007', name: 'Annapoorna Supplies', group: 'Dairy Products', phone: '99401 33445', email: 'annapoorna@gmail.com', city: 'Madurai', state: 'Tamil Nadu', gstNo: '33AABFA7890M1Z5', paymentTerms: '15 Days', status: 'Active' },
  { code: 'SUPP008', name: 'Green Leaf Organic', group: 'Organic Products', phone: '91500 77889', email: 'greenleaforganic@gmail.com', city: 'Coimbatore', state: 'Tamil Nadu', gstNo: '33AABFG8901N1Z8', paymentTerms: '30 Days', status: 'Inactive' },
  { code: 'SUPP009', name: 'Prime Stationery', group: 'Stationery', phone: '98420 99887', email: 'primestationery@gmail.com', city: 'Coimbatore', state: 'Tamil Nadu', gstNo: '33AABFP9012P1Z6', paymentTerms: '15 Days', status: 'Active' },
  { code: 'SUPP010', name: 'Nandha Traders', group: 'Construction Materials', phone: '97900 44556', email: 'nandhatraders@gmail.com', city: 'Erode', state: 'Tamil Nadu', gstNo: '33AABFN0123Q1Z4', paymentTerms: '30 Days', status: 'Active' },
];

export const supplierTotalRecords = 25;
export const supplierTotalPages = 3;

export const STATS = {
  totalSuppliers: 25,
  activeSuppliers: 23,
  inactiveSuppliers: 2,
  gstRegistered: 18,
  totalPayable: 1245678.50,
};
