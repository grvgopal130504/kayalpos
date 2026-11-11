/**
 * "Recent Customers" for the Line Sale customer search — the last few
 * registered customers a cashier selected (or just created), remembered
 * locally so they can be picked again in one tap without retyping a search.
 * Deliberately NOT an API/report feature: it's a small per-browser
 * convenience, so plain localStorage is enough (same pattern as
 * features/auth/authStorage.js) — no backend table, no cross-device sync.
 *
 * Keyed per logged-in user (falls back to a shared key if no user id is
 * available yet) so two cashiers on the same till don't see each other's
 * recent customers.
 */
const MAX_RECENT = 5;

function storageKey(userId) {
  return `nexora_recent_customers_${userId || 'shared'}`;
}

export function getRecentCustomers(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

// `customer` is the same {id, code, name, phone, loyaltyPoints} shape the
// Line Sale customer Autocomplete already uses elsewhere. Walk-in Customer
// is never recorded here — it's always offered separately as the default
// option, recording it as "recent" would just be noise.
export function addRecentCustomer(userId, customer) {
  if (!customer?.id || customer.id === 'walk-in') return;
  try {
    const existing = getRecentCustomers(userId).filter((c) => c.id !== customer.id);
    const next = [customer, ...existing].slice(0, MAX_RECENT);
    localStorage.setItem(storageKey(userId), JSON.stringify(next));
  } catch {
    // storage unavailable (private browsing, quota) — recent list just
    // won't persist this time; selection itself still works fine.
  }
}
