/**
 * TEMPORARY mock data for the Promotion module. The Promotion module hasn't
 * been built on the backend yet, so this static list + summary stand in for
 * `useGetPromotionsQuery()` / `useGetPromotionQuery(id)`. Replace with real
 * API data once that module exists — do not add more mock data here in the
 * meantime.
 *
 * Code ranges are kept non-overlapping by status so the three status pages
 * (and the overview page) never show duplicate PROMO-#### ids:
 *   0001-0012  active     0013-0016  upcoming     0017-0028  expired
 */

export const SUMMARY = {
  totalPromotions: { value: 28, caption: 'All Time' },
  activePromotions: { value: 12, caption: 'Currently Running' },
  upcomingPromotions: { value: 4, caption: 'Starts in Future' },
  expiredPromotions: { value: 12, caption: 'Already Ended' },
  couponsUsed: { value: 1265, caption: 'This Month' },
  discountGiven: { value: 48650, caption: 'This Month' },
};

const HAND_AUTHORED_ACTIVE = [
  {
    code: 'PROMO-0001', name: 'Buy 2 Get 1 Free', type: 'Buy X Get Y', appliesTo: 'Item',
    discount: 'Free', startDate: '20 May 2026', endDate: '31 May 2026', status: 'active', usage: 845,
  },
  {
    code: 'PROMO-0002', name: '10% Off on Rice', type: 'Percentage Off', appliesTo: 'Category',
    discount: '10%', startDate: '15 May 2026', endDate: '31 May 2026', status: 'active', usage: 658,
  },
  {
    code: 'PROMO-0003', name: 'Weekend Special 5%', type: 'Percentage Off', appliesTo: 'Bill',
    discount: '5%', startDate: '17 May 2026', endDate: '30 Jun 2026', status: 'active', usage: 412,
  },
  {
    code: 'PROMO-0004', name: 'Loyalty Member 2% Off', type: 'Percentage Off', appliesTo: 'Bill',
    discount: '2%', startDate: '01 Jan 2026', endDate: '31 Dec 2026', status: 'active', usage: 89,
  },
];

// Pad active out to 12 rows without hand-authoring all of them.
const ACTIVE_FILLER_TYPES = [
  { type: 'Percentage Off', appliesTo: 'Category', discount: '8%' },
  { type: 'Amount Off', appliesTo: 'Bill', discount: '₹100.00' },
  { type: 'Buy X Get Y', appliesTo: 'Item', discount: 'Free' },
  { type: 'Bundle Offer', appliesTo: 'Item', discount: 'Special Price' },
];
const ACTIVE_FILLER_NAMES = [
  'Monsoon Grocery Sale', 'Bulk Purchase Rebate', 'Combo Snack Pack', 'Republic Day Offer',
  'Clearance Stock Deal', 'Diwali Sweet Bundle', 'First Purchase Bonus', 'Referral Reward Offer',
];
const activeFiller = ACTIVE_FILLER_NAMES.map((name, i) => {
  const t = ACTIVE_FILLER_TYPES[i % ACTIVE_FILLER_TYPES.length];
  return {
    code: `PROMO-${String(i + 5).padStart(4, '0')}`,
    name,
    type: t.type,
    appliesTo: t.appliesTo,
    discount: t.discount,
    startDate: '01 Apr 2026',
    endDate: '30 Apr 2026',
    status: 'active',
    usage: Math.max(20, 70 - i * 5),
  };
});

export const ACTIVE_PROMOTIONS = [...HAND_AUTHORED_ACTIVE, ...activeFiller];

// The 4 upcoming promotions, matching the Upcoming Promotions reference
// exactly (name/discount/dates/usage=0 since none of them have started).
export const UPCOMING_PROMOTIONS = [
  {
    code: 'PROMO-0013', name: 'Mega Summer Offer', type: 'Percentage Off', appliesTo: 'Bill',
    discount: '15%', startDate: '01 Jun 2026', endDate: '15 Jun 2026', status: 'upcoming', usage: 0,
  },
  {
    code: 'PROMO-0014', name: 'Weekend Bonanza', type: 'Amount Off', appliesTo: 'Bill',
    discount: '₹75.00', startDate: '05 Jun 2026', endDate: '30 Jun 2026', status: 'upcoming', usage: 0,
  },
  {
    code: 'PROMO-0015', name: "Father's Day Special", type: 'Percentage Off', appliesTo: 'Category',
    discount: '10%', startDate: '15 Jun 2026', endDate: '21 Jun 2026', status: 'upcoming', usage: 0,
  },
  {
    code: 'PROMO-0016', name: 'Monsoon Saver', type: 'Bundle Offer', appliesTo: 'Item',
    discount: '—', startDate: '01 Jul 2026', endDate: '31 Jul 2026', status: 'upcoming', usage: 0,
  },
];

// The 12 expired promotions, matching the Expired Promotions reference
// exactly (name/type/applies-to/discount/dates/usage for the first 10 rows
// visible on page 1; the last 2 pad the count out to 12 for page 2).
export const EXPIRED_PROMOTIONS = [
  {
    code: 'PROMO-0017', name: 'Summer Dhamaka Offer', type: 'Percentage Off', appliesTo: 'Bill',
    discount: '20%', startDate: '01 May 2026', endDate: '31 May 2026', status: 'expired', usage: 245,
  },
  {
    code: 'PROMO-0018', name: 'Ramadan Special', type: 'Amount Off', appliesTo: 'Bill',
    discount: '₹100.00', startDate: '15 Apr 2026', endDate: '30 Apr 2026', status: 'expired', usage: 65,
  },
  {
    code: 'PROMO-0019', name: 'HOLI Special 15% Off', type: 'Percentage Off', appliesTo: 'Category',
    discount: '15%', startDate: '01 Mar 2026', endDate: '15 Mar 2026', status: 'expired', usage: 128,
  },
  {
    code: 'PROMO-0020', name: "Valentine's Day Offer", type: 'Percentage Off', appliesTo: 'Item',
    discount: '10%', startDate: '07 Feb 2026', endDate: '14 Feb 2026', status: 'expired', usage: 96,
  },
  {
    code: 'PROMO-0021', name: 'New Year Mega Offer', type: 'Bundle Offer', appliesTo: 'Item',
    discount: '—', startDate: '25 Dec 2025', endDate: '05 Jan 2026', status: 'expired', usage: 152,
  },
  {
    code: 'PROMO-0022', name: 'Anniversary Special', type: 'Amount Off', appliesTo: 'Bill',
    discount: '₹50.00', startDate: '10 Dec 2025', endDate: '20 Dec 2025', status: 'expired', usage: 48,
  },
  {
    code: 'PROMO-0023', name: 'Diwali Dhamaka', type: 'Percentage Off', appliesTo: 'Category',
    discount: '12%', startDate: '20 Oct 2025', endDate: '05 Nov 2025', status: 'expired', usage: 186,
  },
  {
    code: 'PROMO-0024', name: 'Dussehra Offer', type: 'Amount Off', appliesTo: 'Bill',
    discount: '₹75.00', startDate: '15 Oct 2025', endDate: '25 Oct 2025', status: 'expired', usage: 71,
  },
  {
    code: 'PROMO-0025', name: 'Back to School Offer', type: 'Percentage Off', appliesTo: 'Item',
    discount: '8%', startDate: '01 Aug 2025', endDate: '15 Aug 2025', status: 'expired', usage: 62,
  },
  {
    code: 'PROMO-0026', name: 'Monsoon Sale', type: 'Bundle Offer', appliesTo: 'Item',
    discount: '—', startDate: '01 Jul 2025', endDate: '31 Jul 2025', status: 'expired', usage: 205,
  },
  {
    code: 'PROMO-0027', name: 'Festival Combo Offer', type: 'Bundle Offer', appliesTo: 'Item',
    discount: 'Special Price', startDate: '10 May 2025', endDate: '20 May 2025', status: 'expired', usage: 76,
  },
  {
    code: 'PROMO-0028', name: 'New Year Discount', type: 'Percentage Off', appliesTo: 'Category',
    discount: '15%', startDate: '01 Jan 2025', endDate: '15 Jan 2025', status: 'expired', usage: 140,
  },
];

export const PROMOTIONS = [...ACTIVE_PROMOTIONS, ...UPCOMING_PROMOTIONS, ...EXPIRED_PROMOTIONS]
  .sort((a, b) => a.code.localeCompare(b.code));

const ITEM_LIBRARY = [
  { code: 'KPR25', name: 'Kayal Ponni Rice 25kg', initial: 'P', color: '#F26B21' },
  { code: 'KIR25', name: 'Kayal Idly Rice 25kg', initial: 'I', color: '#F5A623' },
  { code: 'KSW25', name: 'Kayal Samba Wheat 25kg', initial: 'S', color: '#8B5CF6' },
  { code: 'KTD01', name: 'Kayal Toor Dhal 1kg', initial: 'T', color: '#D97706' },
  { code: 'KSG01', name: 'Kayal Sugar 1kg', initial: 'S', color: '#E5484D' },
];

// Per-status "selected promotion" detail record + right-panel copy. Only
// one representative record per status (the Sales/Promotion backend
// doesn't exist yet, so every row can't have full mock detail data) —
// PromotionStatusPage falls back to this shape (swapping in the clicked
// row's name/code/status) when a different row is selected.
export const STATUS_DETAILS = {
  active: {
    code: 'PROMO-0001',
    name: 'Buy 2 Get 1 Free',
    status: 'active',
    usageColumnLabel: 'Usage (Till Date)',
    fields: [
      { label: 'Promotion Type', value: 'Buy X Get Y' }, { label: 'Buy Quantity', value: 2 },
      { label: 'Applies To', value: 'Specific Items' }, { label: 'Get Quantity', value: 1 },
      { label: 'Start Date', value: '20 May 2026' }, { label: 'Discount Type', value: 'Free Item' },
      { label: 'End Date', value: '31 May 2026' }, { label: 'Maximum Usage', value: 'No Limit' },
    ],
    items: ITEM_LIBRARY.slice(0, 3),
    terms: [
      'Offer applicable on listed items only.',
      'Free item will be of same or lesser value.',
      'Not valid with other promotions.',
      'Offer valid till 31 May 2026.',
    ],
    usageSummary: {
      title: 'Usage Summary',
      rows: [
        { label: 'Total Used', value: 845, currency: false },
        { label: 'Total Transactions', value: 312, currency: false },
        { label: 'Discount Given', value: 18450, currency: true },
        { label: 'Average Discount / Bill', value: 59.13, currency: true },
      ],
    },
  },
  upcoming: {
    code: 'PROMO-0013',
    name: 'Mega Summer Offer',
    status: 'upcoming',
    usageColumnLabel: 'Usage (Till Date)',
    fields: [
      { label: 'Promotion Type', value: 'Percentage Off' }, { label: 'Discount', value: '15%' },
      { label: 'Applies To', value: 'Bill' }, { label: 'Maximum Usage', value: 'No Limit' },
      { label: 'Start Date', value: '01 Jun 2026' }, { label: 'Minimum Bill Amount', value: '₹500.00' },
      { label: 'End Date', value: '15 Jun 2026' }, { label: 'Usage (Till Date)', value: 0 },
    ],
    items: ITEM_LIBRARY.slice(0, 4),
    terms: [
      'Offer applicable on listed items only.',
      'Minimum bill amount must be ₹500.',
      'Not valid with other promotions.',
      'Offer valid from 01 Jun 2026 to 15 Jun 2026.',
    ],
    usageSummary: {
      title: 'Usage Forecast',
      rows: [
        { label: 'Expected Transactions', value: 96, currency: false },
        { label: 'Expected Discount', value: 14400, currency: true },
        { label: 'Average Discount / Bill', value: 45, currency: true },
      ],
    },
  },
  expired: {
    code: 'PROMO-0017',
    name: 'Summer Dhamaka Offer',
    status: 'expired',
    usageColumnLabel: 'Usage (Till Expiry)',
    fields: [
      { label: 'Promotion Type', value: 'Percentage Off' }, { label: 'Discount', value: '20%' },
      { label: 'Applies To', value: 'Bill' }, { label: 'Maximum Usage', value: 'No Limit' },
      { label: 'Start Date', value: '01 May 2026' }, { label: 'Minimum Bill Amount', value: '₹0.00' },
      { label: 'End Date', value: '31 May 2026' }, { label: 'Usage (Till Expiry)', value: 245 },
    ],
    items: ITEM_LIBRARY.slice(0, 3),
    terms: [
      'Offer applicable on listed items only.',
      'Not valid with other promotions.',
      'No minimum purchase required.',
      'Offer valid from 01 May 2026 to 31 May 2026.',
    ],
    usageSummary: {
      title: 'Usage Summary',
      rows: [
        { label: 'Total Used', value: 245, currency: false },
        { label: 'Total Transactions', value: 82, currency: false },
        { label: 'Discount Given', value: 4900, currency: true },
        { label: 'Average Discount / Bill', value: 59.75, currency: true },
      ],
    },
  },
};

// 5-tile summary strip per status page. `count` reuses SUMMARY's matching
// total; `extra` supplies the other 4 tiles with status-appropriate labels
// and captions — upcoming promos haven't run yet ("Scheduled/Potential/
// Expected", "This Month"), expired promos are framed as final totals
// racked up before they ended ("Till Expiry").
export const STATUS_STATS = {
  active: {
    count: SUMMARY.activePromotions,
    extra: [
      { label: 'Coupon/Offers Used', value: 1265, currency: false, caption: 'This Month' },
      { label: 'Discount Given', value: 48650, currency: true, caption: 'This Month' },
      { label: 'Transactions', value: 312, currency: false, caption: 'This Month' },
      { label: 'Average Discount / Bill', value: 59.13, currency: true, caption: 'This Month' },
    ],
  },
  upcoming: {
    count: SUMMARY.upcomingPromotions,
    extra: [
      { label: 'Coupon/Offers Scheduled', value: 685, currency: false, caption: 'This Month' },
      { label: 'Potential Discount', value: 26350, currency: true, caption: 'This Month' },
      { label: 'Expected Transactions', value: 156, currency: false, caption: 'This Month' },
      { label: 'Average Discount / Bill', value: 45.78, currency: true, caption: 'This Month' },
    ],
  },
  expired: {
    count: SUMMARY.expiredPromotions,
    extra: [
      { label: 'Coupon/Offers Used', value: 1248, currency: false, caption: 'Till Expiry' },
      { label: 'Discount Given', value: 18920, currency: true, caption: 'Till Expiry' },
      { label: 'Transactions', value: 243, currency: false, caption: 'Till Expiry' },
      { label: 'Average Discount / Bill', value: 77.85, currency: true, caption: 'Till Expiry' },
    ],
  },
};

// "Upcoming Promotion Schedule" table on the Upcoming Promotions page —
// stands in for "Promotion History" (used on Active/Expired) since an
// upcoming promo has no history yet, just a start date to look forward to.
export const UPCOMING_SCHEDULE = UPCOMING_PROMOTIONS.map((p) => ({
  date: p.startDate, name: p.name, type: p.type, discount: p.discount,
}));

// Audit trail shown under the selected promotion on the Active Promotions
// status page ("Promotion History").
export const PROMOTION_HISTORY = [
  { date: '20 May 2026 09:15 AM', action: 'Promoted', user: 'Admin' },
  { date: '20 May 2026 09:20 AM', action: 'Updated', user: 'Admin' },
  { date: '22 May 2026 11:30 AM', action: 'Usage Limit Updated', user: 'Admin' },
];

// Audit trail shown on the Expired Promotions status page — ends with the
// system auto-expiring the promotion rather than a manual update.
export const EXPIRED_PROMOTION_HISTORY = [
  { date: '01 May 2026 09:10 AM', action: 'Created', user: 'Admin' },
  { date: '01 May 2026 09:15 AM', action: 'Promoted', user: 'Admin' },
  { date: '31 May 2026 11:59 PM', action: 'Expired', user: 'System' },
];

export const PROMOTION_DETAILS = {
  code: STATUS_DETAILS.active.code,
  name: STATUS_DETAILS.active.name,
  status: STATUS_DETAILS.active.status,
  items: STATUS_DETAILS.active.items,
  terms: STATUS_DETAILS.active.terms,
  fields: STATUS_DETAILS.active.fields,
  usageSummary: STATUS_DETAILS.active.usageSummary,
};

const PROMOTION_BY_CODE = Object.fromEntries(PROMOTIONS.map((p) => [p.code, p]));

/**
 * Full detail shape for a promotion code, for the View/Edit pages — reuses
 * the same fallback logic PromotionPage/PromotionStatusPage already use
 * inline: only one hand-authored detail record exists per status (the
 * Promotion backend doesn't exist yet), so every other row reuses that
 * status's STATUS_DETAILS shape with its own name/code/status swapped in.
 * Also carries over the raw PROMOTIONS list-row fields (type, appliesTo,
 * discount, startDate, endDate, usage) alongside the detail template, since
 * CreatePromotionPage's edit mode needs those flat values to prefill the
 * create form, while PromotionDetailsCard only reads the template fields.
 */
export function getPromotionDetails(code) {
  const row = PROMOTION_BY_CODE[code];
  if (!row) return null;
  const template = STATUS_DETAILS[row.status] || PROMOTION_DETAILS;
  const base = row.code === template.code
    ? template
    : { ...template, code: row.code, name: row.name, status: row.status };
  return {
    ...base,
    type: row.type,
    appliesTo: row.appliesTo,
    discount: row.discount,
    startDate: row.startDate,
    endDate: row.endDate,
    usage: row.usage,
  };
}

export const PROMOTION_PERFORMANCE = [
  { id: 'buy-x-get-y', label: 'Buy X Get Y', value: 18450, color: '#22A06B' },
  { id: 'percentage-off', label: 'Percentage Off', value: 16250, color: '#2563EB' },
  { id: 'amount-off', label: 'Amount Off', value: 9200, color: '#F5A623' },
  { id: 'bundle-offer', label: 'Bundle Offer', value: 4750, color: '#8B5CF6' },
];

export const TOP_PROMOTIONS = [
  { name: 'Buy 2 Get 1 Free', usage: 845, discountGiven: 18450 },
  { name: '10% Off on Rice', usage: 658, discountGiven: 16250 },
  { name: 'Weekend Special 5%', usage: 412, discountGiven: 9200 },
  { name: 'Mega Summer Offer', usage: 125, discountGiven: 4750 },
  { name: 'Loyalty Member 2% Off', usage: 89, discountGiven: 2000 },
];

export const DISCOUNT_TREND = {
  categories: ['1 May', '6 May', '11 May', '16 May', '21 May', '26 May', '31 May'],
  values: [8200, 9500, 7800, 12400, 10600, 16800, 18200],
};

export const OUTLET_USAGE = [
  { id: 'main', label: 'Main Outlet', value: 645, color: '#22A06B' },
  { id: 'saravanampatti', label: 'Saravanampatti', value: 285, color: '#2563EB' },
  { id: 'peelamedu', label: 'Peelamedu', value: 175, color: '#E5484D' },
  { id: 'singanallur', label: 'Singanallur', value: 110, color: '#8B5CF6' },
  { id: 'others', label: 'Others', value: 50, color: '#F5A623' },
];
