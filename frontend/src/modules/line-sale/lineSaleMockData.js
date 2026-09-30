/**
 * Small constants shared by the Line Sale (POS billing) screen. The item
 * catalog, cart, customer list and bill numbering are all real now (see
 * api/productApi, api/customerApi, api/saleApi) — this file only holds the
 * bits that genuinely aren't backed by their own module yet (the flat GST
 * rate, the fixed payment-method list) plus small pure helpers.
 */

// GST 5%, matches the "Tax Summary — GST 5%" line in the reference design.
// Applied flat to every line until Product's taxCode resolves to a real
// per-product rate via the Tax Code master (see backend/src/modules/sale's
// sale.service.js, which uses this same constant server-side).
export const TAX_RATE = 0.05;

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
