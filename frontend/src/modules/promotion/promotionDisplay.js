/**
 * Shared "real Promotion row -> PromotionDetailsCard shape" mapping, used by
 * both PromotionPage (the selected-row detail panel) and PromotionViewPage
 * (the standalone view screen) so the two never drift into showing
 * different labels for the same record.
 *
 * `usageSummary` is honestly reported from the real `usageCount` column —
 * it always reads 0 today because nothing in the app applies a promotion's
 * discount to a Sale yet (Line Sale has no "apply promotion" step). Once
 * that wiring exists and increments usageCount, this card will reflect it
 * automatically instead of needing another change here.
 */

import { MAXIMUM_USAGE_OPTIONS, MAXIMUM_USAGE_DESCRIPTIONS } from './createPromotionSchema';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ITEM_CHIP_COLORS = ['#F26B21', '#F5A623', '#8B5CF6', '#D97706', '#E5484D', '#2563EB', '#22A06B'];
const APPLIES_TO_LABELS = { all: 'All Items', specific: 'Specific Items', category: 'Category' };

function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  return `${String(d.getDate()).padStart(2, '0')} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function formatDiscountDisplay(promotion) {
  if (promotion.discountType === 'Free Item') return 'Free';
  if (promotion.discountType === 'Special Price') return 'Special Price';
  const value = Number(promotion.discountValue);
  if (!value) return '—';
  return promotion.discountUnit === '₹' ? `₹${value.toFixed(2)}` : `${value}%`;
}

function buildItemChip(code, index, productNameByCode) {
  const name = productNameByCode[code] || code;
  return { code, name, initial: name.charAt(0).toUpperCase(), color: ITEM_CHIP_COLORS[index % ITEM_CHIP_COLORS.length] };
}

function buildCategoryChip(category, index) {
  return { code: category, name: category, initial: category.charAt(0).toUpperCase(), color: ITEM_CHIP_COLORS[index % ITEM_CHIP_COLORS.length] };
}

const PERFORMANCE_COLORS = ['#22A06B', '#2563EB', '#F5A623', '#8B5CF6', '#E5484D'];

/** Groups real promotions by promotionType for the "Promotion Performance"
 * donut. Sliced by COUNT of promotions of that type — not discount money,
 * since nothing tracks real redemption amounts yet (see the module doc
 * comment in PromotionPage.jsx). Returns [] when there are no promotions,
 * so the caller can show an honest empty state instead of a fake chart. */
export function buildPerformanceByType(promotions) {
  const counts = new Map();
  promotions.forEach((p) => counts.set(p.promotionType, (counts.get(p.promotionType) || 0) + 1));
  return [...counts.entries()].map(([type, value], i) => ({
    id: type, label: type, value, color: PERFORMANCE_COLORS[i % PERFORMANCE_COLORS.length],
  }));
}

/** Top 5 real promotions by usageCount (all 0 today — see the same doc
 * comment). Returns [] when there are no promotions. */
export function buildTopPromotions(promotions) {
  return [...promotions]
    .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
    .slice(0, 5)
    .map((p) => ({ name: p.name, usage: p.usageCount || 0, discountGiven: 0 }));
}

/** Real upcoming promotions, sorted by start date, for the "Upcoming
 * Promotion Schedule" table. */
export function buildUpcomingSchedule(promotions) {
  return promotions
    .filter((p) => p.status === 'upcoming')
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .map((p) => ({ date: formatDate(p.startDate), name: p.name, type: p.promotionType, discount: formatDiscountDisplay(p) }));
}

/** Minimal, honest audit trail for one promotion, derived from the real
 * timestamps Postgres already keeps (createdAt/updatedAt) plus its computed
 * status — not a fabricated multi-step log, since nothing in the app
 * records promotion edits as discrete events yet. */
export function buildPromotionHistory(promotion) {
  if (!promotion) return [];
  const rows = [{ date: formatDateTime(promotion.createdAt), action: 'Created', user: '—' }];
  if (promotion.updatedAt && promotion.updatedAt !== promotion.createdAt) {
    rows.push({ date: formatDateTime(promotion.updatedAt), action: 'Updated', user: '—' });
  }
  if (promotion.status === 'expired' && promotion.endDate) {
    rows.push({ date: formatDateTime(promotion.endDate), action: 'Expired', user: 'System' });
  }
  return rows;
}

function formatDateTime(value) {
  if (!value) return '';
  const d = new Date(value);
  const time = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${formatDate(value)} ${time}`;
}

/** Builds the flat row shape PromotionTable reads, from a real API record. */
export function toPromotionRow(promotion) {
  return {
    id: promotion.id,
    code: promotion.code,
    name: promotion.name,
    type: promotion.promotionType,
    appliesTo: promotion.appliesTo === 'specific' ? 'Item' : promotion.appliesTo === 'category' ? 'Category' : 'Bill',
    discount: formatDiscountDisplay(promotion),
    startDate: formatDate(promotion.startDate),
    endDate: promotion.noExpiry ? 'No Expiry' : formatDate(promotion.endDate),
    status: promotion.status,
    usage: promotion.usageCount || 0,
  };
}

/** Builds the rich detail shape PromotionDetailsCard reads, from a real
 * API record plus a `code -> name` map for the currently-loaded Product
 * catalog (used to label item chips; category chips just show the group
 * name directly). */
export function toPromotionDetails(promotion, productNameByCode = {}) {
  const usageLabel = MAXIMUM_USAGE_OPTIONS.find((o) => o.value === promotion.maximumUsage)?.label || 'No Limit';
  return {
    id: promotion.id,
    code: promotion.code,
    name: promotion.name,
    status: promotion.status,
    usageColumnLabel: 'Usage (Till Date)',
    fields: [
      { label: 'Promotion Type', value: promotion.promotionType },
      { label: 'Discount Type', value: promotion.discountType },
      { label: 'Applies To', value: APPLIES_TO_LABELS[promotion.appliesTo] || 'All Items' },
      { label: 'Discount Value', value: formatDiscountDisplay(promotion) },
      { label: 'Start Date', value: formatDate(promotion.startDate) },
      { label: 'Minimum Bill Amount', value: `₹${Number(promotion.minimumBillAmount || 0).toFixed(2)}` },
      { label: 'End Date', value: promotion.noExpiry ? 'No Expiry' : formatDate(promotion.endDate) },
      { label: 'Maximum Usage', value: usageLabel },
    ],
    items: promotion.appliesTo === 'specific'
      ? (promotion.selectedItems || []).map((code, i) => buildItemChip(code, i, productNameByCode))
      : promotion.appliesTo === 'category'
        ? (promotion.selectedCategories || []).map((cat, i) => buildCategoryChip(cat, i))
        : [],
    terms: [
      'Offer applicable on listed items only.',
      'Not valid with other promotions.',
      MAXIMUM_USAGE_DESCRIPTIONS[promotion.maximumUsage] || MAXIMUM_USAGE_DESCRIPTIONS['no-limit'],
      'Offer valid only during the selected period.',
      'Management reserves the right to modify or cancel this promotion at any time.',
    ],
    usageSummary: {
      title: 'Usage Summary',
      rows: [
        { label: 'Total Used', value: promotion.usageCount || 0, currency: false },
        { label: 'Total Transactions', value: 0, currency: false },
        { label: 'Discount Given', value: 0, currency: true },
        { label: 'Average Discount / Bill', value: 0, currency: true },
      ],
    },
  };
}
