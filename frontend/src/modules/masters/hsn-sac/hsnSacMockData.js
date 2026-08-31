/**
 * TEMPORARY mock data for the HSN / SAC master. There's no HSN/SAC
 * backend module yet, so this static snapshot stands in for
 * `useGetHsnSacQuery()`. Replace with real API data once that module
 * exists — do not add more mock data here in the meantime. Only the
 * first page (10 rows) of the 42-row catalog is mocked here.
 */

export const TYPE_OPTIONS = ['HSN', 'SAC'];
export const CHAPTER_OPTIONS = [
  '10 - Cereals',
  '11 - Products of the Milling Industry',
  '17 - Sugars and Sugar Confectionery',
  '21 - Miscellaneous Edible Preparations',
  '22 - Beverages, Spirits and Vinegar',
  '24 - Tobacco and Manufactured Tobacco',
  '48 - Paper and Paperboard',
  '99 - Services',
];
export const TAX_RATE_OPTIONS = [0, 5, 12, 18, 28];

export const HSN_SAC_CODES = [
  { code: '10019010', description: 'Wheat and meslin', type: 'HSN', chapter: '10 - Cereals', taxRate: 5.00, uqc: 'KGS', status: 'Active', effectiveFrom: '01-Jul-2017' },
  { code: '11010010', description: 'Wheat Flour (Atta)', type: 'HSN', chapter: '11 - Products of the Milling Industry', taxRate: 5.00, uqc: 'KGS', status: 'Active', effectiveFrom: '01-Jul-2017' },
  { code: '17019990', description: 'Sugar (Other)', type: 'HSN', chapter: '17 - Sugars and Sugar Confectionery', taxRate: 5.00, uqc: 'KGS', status: 'Active', effectiveFrom: '01-Jul-2017' },
  { code: '21069099', description: 'Food Preparations (Other)', type: 'HSN', chapter: '21 - Miscellaneous Edible Preparations', taxRate: 18.00, uqc: 'NOS', status: 'Active', effectiveFrom: '01-Jul-2017' },
  { code: '22030010', description: 'Aerated Waters', type: 'HSN', chapter: '22 - Beverages, Spirits and Vinegar', taxRate: 18.00, uqc: 'LTR', status: 'Active', effectiveFrom: '01-Jul-2017' },
  { code: '24022000', description: 'Cigarettes', type: 'HSN', chapter: '24 - Tobacco and Manufactured Tobacco', taxRate: 28.00, uqc: 'NOS', status: 'Active', effectiveFrom: '01-Jul-2017' },
  { code: '48010010', description: 'Newsprint', type: 'HSN', chapter: '48 - Paper and Paperboard', taxRate: 12.00, uqc: 'KGS', status: 'Active', effectiveFrom: '01-Jul-2017' },
  { code: '995433', description: 'Business Support Services', type: 'SAC', chapter: '99 - Services', taxRate: 18.00, uqc: 'NOS', status: 'Active', effectiveFrom: '01-Jul-2017' },
  { code: '996511', description: 'Renting of Residential Dwelling', type: 'SAC', chapter: '99 - Services', taxRate: 12.00, uqc: 'NOS', status: 'Active', effectiveFrom: '01-Jul-2017' },
  { code: '998313', description: 'Outdoor Catering Services', type: 'SAC', chapter: '99 - Services', taxRate: 5.00, uqc: 'NOS', status: 'Active', effectiveFrom: '01-Jul-2017' },
];

export const hsnSacTotalRecords = 42;
export const hsnSacTotalPages = 5;

export const STATS = {
  totalHsnCodes: 32,
  activeHsnCodes: 30,
  totalSacCodes: 10,
  activeSacCodes: 10,
  averageTaxRate: 11.43,
};
