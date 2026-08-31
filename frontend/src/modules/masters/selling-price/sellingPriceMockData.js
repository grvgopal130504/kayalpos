/**
 * TEMPORARY mock data for the Selling Price master. There's no Selling
 * Price backend module yet, so this static snapshot stands in for
 * `useGetSellingPricesQuery()`. Replace with real API data once that
 * module exists — do not add more mock data here in the meantime.
 */

// A single mock item stands in for the item picker's search result — the
// Item field is a select over this one option, and choosing it fills
// every read-mostly field below it (Item Code, Group, Brand, UOM, HSN/SAC,
// MRP, Purchase Cost), matching the reference's auto-fill behavior.
export const ITEM_OPTIONS = [
  {
    value: 'aashirvaad-atta-5kg',
    label: 'Aashirvaad Atta 5 KG',
    itemCode: '8901725123456',
    itemGroup: 'Grocery',
    brand: 'Aashirvaad',
    uom: 'KG',
    uomGroup: 'Weight',
    hsnSac: '11010010',
    taxCode: 'GST 5%',
    mrp: '300.00',
    purchaseCost: '220.00',
  },
];

export const PRICE_LIST_OPTIONS = [
  { value: '', label: 'Select Price List', disabled: true },
  { value: 'Main Outlet Price List', label: 'Main Outlet Price List' },
  { value: 'Wholesale Price List', label: 'Wholesale Price List' },
  { value: 'Online Price List', label: 'Online Price List' },
];

export const TAX_CODE_OPTIONS = [
  { value: 'GST 0%', label: 'GST 0%', rate: 0 },
  { value: 'GST 5%', label: 'GST 5%', rate: 5 },
  { value: 'GST 12%', label: 'GST 12%', rate: 12 },
  { value: 'GST 18%', label: 'GST 18%', rate: 18 },
  { value: 'GST 28%', label: 'GST 28%', rate: 28 },
];

export const OUTLET_OPTIONS = [
  { value: '', label: 'Select Outlet / Branch', disabled: true },
  { value: 'Main Outlet', label: 'Main Outlet' },
  { value: 'Anna Nagar Outlet', label: 'Anna Nagar Outlet' },
  { value: 'Market Street Outlet', label: 'Market Street Outlet' },
];

export const ROUNDING_OPTIONS = [
  { value: 'Round to 2 Decimal', label: 'Round to 2 Decimal' },
  { value: 'Round to 1 Decimal', label: 'Round to 1 Decimal' },
  { value: 'Round to Nearest Rupee', label: 'Round to Nearest Rupee' },
  { value: 'No Rounding', label: 'No Rounding' },
];

export const MARGIN_QUICK_STEPS = [5, 10, 15, 20, 25];

export const SELLING_PRICES = [
  {
    itemCode: '8901725123456',
    itemName: 'Aashirvaad Atta 5 KG',
    priceList: 'Main Outlet Price List',
    mrp: 300.00,
    pricingMethod: 'Margin % From MRP',
    marginPercent: 10.00,
    sellingPriceExclTax: 270.00,
    sellingPriceInclTax: 283.50,
    effectiveFrom: '01-Sep-2026',
    status: 'Active',
  },
];
