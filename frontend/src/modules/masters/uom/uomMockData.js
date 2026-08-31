/**
 * TEMPORARY mock data for the UOM / UOM Group master. There's no UOM
 * backend module yet, so this static snapshot stands in for
 * `useGetUomQuery()`. Replace with real API data once that module
 * exists — do not add more mock data here in the meantime. `uomTotalPages`
 * reflects the full 22-row catalog; only the first page (10 rows) is
 * mocked in `UOMS`.
 */

export const UOM_GROUPS = [
  { code: 'GRP01', name: 'Weight', description: 'Weight based units', totalUoms: 5, status: 'Active' },
  { code: 'GRP02', name: 'Quantity', description: 'General quantity units', totalUoms: 6, status: 'Active' },
  { code: 'GRP03', name: 'Length', description: 'Length based units', totalUoms: 4, status: 'Active' },
  { code: 'GRP04', name: 'Volume', description: 'Volume based units', totalUoms: 5, status: 'Active' },
  { code: 'GRP05', name: 'Piece', description: 'Piece based units', totalUoms: 3, status: 'Active' },
  { code: 'GRP06', name: 'Area', description: 'Area based units', totalUoms: 3, status: 'Active' },
];

export const BASE_UOM_OPTIONS = ['KG', 'G', 'PC', 'LTR'];

export const UOMS = [
  { code: 'KG', name: 'Kilogram', group: 'Weight', baseUom: 'KG', conversionFactor: 1, status: 'Active' },
  { code: 'G', name: 'Gram', group: 'Weight', baseUom: 'KG', conversionFactor: 0.001, status: 'Active' },
  { code: 'GM', name: 'Gram', group: 'Weight', baseUom: 'G', conversionFactor: 1, status: 'Active' },
  { code: 'TON', name: 'Ton', group: 'Weight', baseUom: 'KG', conversionFactor: 1000, status: 'Active' },
  { code: 'LB', name: 'Pound', group: 'Weight', baseUom: 'KG', conversionFactor: 0.453592, status: 'Active' },
  { code: 'PC', name: 'Piece', group: 'Piece', baseUom: 'PC', conversionFactor: 1, status: 'Active' },
  { code: 'DZ', name: 'Dozen', group: 'Piece', baseUom: 'PC', conversionFactor: 12, status: 'Active' },
  { code: 'BOX', name: 'Box', group: 'Piece', baseUom: 'PC', conversionFactor: 24, status: 'Active' },
  { code: 'LTR', name: 'Litre', group: 'Volume', baseUom: 'LTR', conversionFactor: 1, status: 'Active' },
  { code: 'ML', name: 'Millilitre', group: 'Volume', baseUom: 'LTR', conversionFactor: 0.001, status: 'Active' },
];

export const uomTotalRecords = 22;
export const uomTotalPages = 3;

export const STATS = {
  totalUomGroups: 6,
  activeUomGroups: 6,
  totalUoms: 22,
  activeUoms: 21,
  activeUomsAlt: 6,
};
