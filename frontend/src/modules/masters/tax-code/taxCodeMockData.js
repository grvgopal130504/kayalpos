/**
 * TEMPORARY mock data for the Tax Code master. There's no Tax Code
 * backend module yet, so this static snapshot stands in for
 * `useGetTaxCodesQuery()`. Replace with real API data once that module
 * exists — do not add more mock data here in the meantime. Only the
 * first page (10 rows) of the 18-row catalog is mocked here.
 */

export const TAX_TYPE_OPTIONS = ['GST', 'IGST', 'CESS', 'VAT'];
export const TAX_CATEGORY_OPTIONS = ['GST', 'IGST', 'CESS', 'VAT'];

export const TAX_CODES = [
  { code: 'GST0', name: 'GST 0%', type: 'GST', category: 'GST', rate: 0.00, calculationType: 'On Gross', appliesTo: 'Sales & Purchase', status: 'Active', effectiveFrom: '01-Apr-2023' },
  { code: 'GST5', name: 'GST 5%', type: 'GST', category: 'GST', rate: 5.00, calculationType: 'On Gross', appliesTo: 'Sales & Purchase', status: 'Active', effectiveFrom: '01-Jul-2017' },
  { code: 'GST12', name: 'GST 12%', type: 'GST', category: 'GST', rate: 12.00, calculationType: 'On Gross', appliesTo: 'Sales & Purchase', status: 'Active', effectiveFrom: '01-Jul-2017' },
  { code: 'GST18', name: 'GST 18%', type: 'GST', category: 'GST', rate: 18.00, calculationType: 'On Gross', appliesTo: 'Sales & Purchase', status: 'Active', effectiveFrom: '01-Jul-2017' },
  { code: 'GST28', name: 'GST 28%', type: 'GST', category: 'GST', rate: 28.00, calculationType: 'On Gross', appliesTo: 'Sales & Purchase', status: 'Active', effectiveFrom: '01-Jul-2017' },
  { code: 'IGST18', name: 'IGST 18%', type: 'GST', category: 'IGST', rate: 18.00, calculationType: 'On Gross', appliesTo: 'Inter-State Sales', status: 'Active', effectiveFrom: '01-Jul-2017' },
  { code: 'IGST28', name: 'IGST 28%', type: 'GST', category: 'IGST', rate: 28.00, calculationType: 'On Gross', appliesTo: 'Inter-State Sales', status: 'Active', effectiveFrom: '01-Jul-2017' },
  { code: 'CESS1', name: 'CESS 1%', type: 'CESS', category: 'CESS', rate: 1.00, calculationType: 'On Gross', appliesTo: 'Sales & Purchase', status: 'Active', effectiveFrom: '01-Jul-2017' },
  { code: 'CESS2', name: 'CESS 2%', type: 'CESS', category: 'CESS', rate: 2.00, calculationType: 'On Gross', appliesTo: 'Sales & Purchase', status: 'Inactive', effectiveFrom: '01-Jul-2017' },
  { code: 'VAT5', name: 'VAT 5%', type: 'VAT', category: 'VAT', rate: 5.00, calculationType: 'On Gross', appliesTo: 'Sales', status: 'Inactive', effectiveFrom: '01-Apr-2020' },
];

export const taxCodeTotalRecords = 18;
export const taxCodeTotalPages = 2;

export const STATS = {
  totalTaxCodes: 18,
  activeTaxCodes: 16,
  inactiveTaxCodes: 2,
  averageTaxRate: 11.42,
};
