/**
 * TEMPORARY mock data for the Batch / Serial Number master. There's no
 * Batch/Serial backend module yet, so this static snapshot stands in for
 * `useGetBatchSerialsQuery()`. Replace with real API data once that module
 * exists — do not add more mock data here in the meantime.
 */

export const BATCH_SERIAL_TYPE_OPTIONS = ['Batch', 'Serial'];
export const WAREHOUSE_OPTIONS = ['Main Outlet', 'Coimbatore Branch', 'Erode Branch', 'Madurai Outlet'];

export const BATCH_SERIALS = [
  { itemCode: 'ITEM001', itemName: 'Parle-G Biscuit 500g', number: 'B2505001', type: 'Batch', mfgDate: '01-May-2026', expiryDate: '01-Nov-2026', warehouse: 'Main Outlet', qty: 120, uom: 'Pcs', status: 'Active' },
  { itemCode: 'ITEM001', itemName: 'Parle-G Biscuit 500g', number: 'B2505002', type: 'Batch', mfgDate: '05-May-2026', expiryDate: '05-Nov-2026', warehouse: 'Coimbatore Branch', qty: 80, uom: 'Pcs', status: 'Active' },
  { itemCode: 'ITEM002', itemName: 'Amul Milk 1 Ltr', number: 'S2505000001', type: 'Serial', mfgDate: '10-May-2026', expiryDate: null, warehouse: 'Main Outlet', qty: 1, uom: 'Pcs', status: 'Active' },
  { itemCode: 'ITEM002', itemName: 'Amul Milk 1 Ltr', number: 'S2505000002', type: 'Serial', mfgDate: '10-May-2026', expiryDate: null, warehouse: 'Main Outlet', qty: 1, uom: 'Pcs', status: 'Active' },
  { itemCode: 'ITEM003', itemName: 'Tata Salt 1kg', number: 'B2504005', type: 'Batch', mfgDate: '20-Apr-2026', expiryDate: '20-Apr-2028', warehouse: 'Erode Branch', qty: 200, uom: 'Pcs', status: 'Active' },
  { itemCode: 'ITEM004', itemName: 'Maggi 2 Minute 70g', number: 'B2505006', type: 'Batch', mfgDate: '12-May-2026', expiryDate: '12-Nov-2026', warehouse: 'Madurai Outlet', qty: 150, uom: 'Pcs', status: 'Active' },
  { itemCode: 'ITEM005', itemName: 'Dabur Honey 500g', number: 'S2505000003', type: 'Serial', mfgDate: '15-May-2026', expiryDate: null, warehouse: 'Main Outlet', qty: 1, uom: 'Pcs', status: 'Active' },
  { itemCode: 'ITEM006', itemName: 'Philips LED Bulb 9W', number: 'S2505000004', type: 'Serial', mfgDate: '18-May-2026', expiryDate: null, warehouse: 'Coimbatore Branch', qty: 1, uom: 'Pcs', status: 'Active' },
];

export const batchSerialTotalRecords = BATCH_SERIALS.length;
export const batchSerialTotalPages = 1;

export const DEFAULT_DATE_RANGE = { from: '2026-05-01', to: '2026-05-25' };

export const STATS = {
  totalBatches: 5,
  totalSerials: 4,
  totalItemsTracked: 6,
  warehousesOutlets: 4,
  totalAvailableQty: 554.0,
};
