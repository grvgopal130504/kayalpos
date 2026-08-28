/**
 * TEMPORARY mock catalog + starting cart for the Line Sale (POS billing)
 * screen. The Item and Sale modules haven't been built on the backend yet,
 * so this static list stands in for `useSearchItemsQuery()` /
 * `useGetOpenSaleQuery()`. Replace with real API data once those modules
 * exist — do not add more mock data here in the meantime.
 */

export const TAX_RATE = 0.05; // GST 5%, matches the "Tax Summary — GST 5%" line in the reference design

export const ITEM_CATALOG = [
  {
    id: 'KPR25', code: 'KPR25', name: 'Kayal Ponni Rice 25kg', batch: 'BATCH-2405',
    uom: 'Bag', stock: 120, mrp: 1950, price: 1850, initial: 'P', color: '#F26B21',
  },
  {
    id: 'KIR25', code: 'KIR25', name: 'Kayal Idly Rice 25kg', batch: 'BATCH-2405',
    uom: 'Bag', stock: 85, mrp: 1800, price: 1700, initial: 'I', color: '#22A06B',
  },
  {
    id: 'KSW25', code: 'KSW25', name: 'Kayal Sambar Wheat 25kg', batch: 'BATCH-2405',
    uom: 'Bag', stock: 60, mrp: 1650, price: 1550, initial: 'S', color: '#8B5CF6',
  },
  {
    id: 'KGH01', code: 'KGH01', name: 'Kayal Ghee 1L', batch: '-',
    uom: 'Nos', stock: 48, mrp: 620, price: 580, initial: 'G', color: '#F5A623',
  },
  {
    id: 'KGO01', code: 'KGO01', name: 'Kayal Groundnut Oil 1L', batch: '-',
    uom: 'Nos', stock: 110, mrp: 180, price: 165, initial: 'O', color: '#2563EB',
  },
  {
    id: 'KTD01', code: 'KTD01', name: 'Kayal Toor Dhal 1kg', batch: '-',
    uom: 'Pcs', stock: 75, mrp: 145, price: 135, initial: 'T', color: '#D97706',
  },
  {
    id: 'KSG01', code: 'KSG01', name: 'Kayal Sugar 1kg', batch: '-',
    uom: 'Pcs', stock: 150, mrp: 52, price: 48, initial: 'S', color: '#E5484D',
  },
  {
    id: 'KCP01', code: 'KCP01', name: 'Kayal Chilli Powder 200g', batch: 'BATCH-2403',
    uom: 'Pcs', stock: 40, mrp: 95, price: 88, initial: 'C', color: '#E5484D',
  },
  {
    id: 'KAF01', code: 'KAF01', name: 'Kayal Appam Idiyappam Flour 1kg', batch: 'BATCH-2404',
    uom: 'Pcs', stock: 65, mrp: 78, price: 72, initial: 'A', color: '#8B5CF6',
  },
];

// Item codes pre-loaded into "Current Sale" so the page opens matching the
// reference (qty here is the starting quantity for that cart line).
export const INITIAL_CART = [
  { code: 'KPR25', qty: 1 },
  { code: 'KGH01', qty: 2 },
  { code: 'KGO01', qty: 2 },
  { code: 'KTD01', qty: 1 },
  { code: 'KSG01', qty: 3 },
];

export const PAYMENT_METHODS = [
  { key: 'cash', label: 'Cash', color: '#22A06B' },
  { key: 'upi', label: 'UPI', color: '#8B5CF6' },
  { key: 'card', label: 'Card', color: '#2563EB' },
  { key: 'wallet', label: 'Wallet', color: '#F5A623' },
  { key: 'credit', label: 'Credit', color: '#E5484D' },
];

export function stockColor(stock) {
  if (stock <= 60) return 'warning.main';
  if (stock <= 20) return 'error.main';
  return 'success.main';
}

export function generateBillNo(date = new Date()) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `LS-${dd}${mm}${yy}-00018`;
}
