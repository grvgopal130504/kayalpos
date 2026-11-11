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

// Default "customer" on a fresh/unassigned bill — offered as the first
// Autocomplete option on the billing screen's customer search and used
// whenever no real customer has been picked yet.
export const WALK_IN_CUSTOMER = { id: 'walk-in', name: 'Walk-in Customer', phone: '-', loyaltyPoints: 0 };

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

// Small fixed palette so each product's avatar/badge gets a stable color
// derived from its own code, without needing a "color" column on the
// Product table. Shared by the item catalog (ItemsPanel) and the Current
// Sale cart table (CurrentSaleTable) so the same item always shows the same
// color in both places.
const AVATAR_COLORS = ['#F26B21', '#22A06B', '#8B5CF6', '#F5A623', '#2563EB', '#D97706', '#E5484D'];
export function colorForCode(code) {
  let hash = 0;
  for (let i = 0; i < code.length; i += 1) hash = (hash * 31 + code.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[hash];
}

// Two-letter badge text for a cart/catalog row — the first two letters of
// the product code (e.g. "BS001" -> "BS"), uppercased. Falls back to the
// item name's initials if the code is too short to carry two letters of
// its own.
export function initialsForCode(code, name) {
  const fromCode = (code || '').replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase();
  if (fromCode.length === 2) return fromCode;
  return (name || '??').slice(0, 2).toUpperCase();
}
