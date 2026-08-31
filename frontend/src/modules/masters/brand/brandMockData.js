/**
 * TEMPORARY mock data for the Brand master. There's no Brand backend
 * module yet, so this static snapshot stands in for
 * `useGetBrandsQuery()`. Replace with real API data once that module
 * exists — do not add more mock data here in the meantime.
 */

export const CATEGORY_OPTIONS = ['Grocery', 'Beverages', 'Biscuits & Snacks', 'Personal Care', 'Dairy', 'Noodles & Pasta'];

export const BRANDS = [
  { code: 'BR001', name: 'Aashirvaad', description: 'Aashirvaad brand products', category: 'Grocery', totalItems: 125, status: 'Active', createdOn: '01-Sep-2026' },
  { code: 'BR002', name: 'Tata', description: 'Tata brand products', category: 'Grocery', totalItems: 98, status: 'Active', createdOn: '28-Aug-2026' },
  { code: 'BR003', name: 'Nestle', description: 'Nestle brand products', category: 'Beverages', totalItems: 76, status: 'Active', createdOn: '25-Aug-2026' },
  { code: 'BR004', name: 'Parle', description: 'Parle brand products', category: 'Biscuits & Snacks', totalItems: 54, status: 'Active', createdOn: '20-Aug-2026' },
  { code: 'BR005', name: 'Dabur', description: 'Dabur brand products', category: 'Personal Care', totalItems: 63, status: 'Active', createdOn: '18-Aug-2026' },
  { code: 'BR006', name: 'Colgate', description: 'Colgate brand products', category: 'Personal Care', totalItems: 47, status: 'Active', createdOn: '15-Aug-2026' },
  { code: 'BR007', name: 'Amul', description: 'Amul brand products', category: 'Dairy', totalItems: 39, status: 'Inactive', createdOn: '10-Aug-2026' },
  { code: 'BR008', name: 'Maggi', description: 'Maggi brand products', category: 'Noodles & Pasta', totalItems: 28, status: 'Active', createdOn: '05-Aug-2026' },
];

export const STATS = {
  totalBrands: 8,
  activeBrands: 7,
  inactiveBrands: 1,
  totalItemsUnderBrands: 530,
};
