/**
 * TEMPORARY mock data for the Stock Wastage module. There's no Stock
 * Wastage backend module yet, so this static list stands in for
 * `useGetWastagesQuery()`. WASTAGES also drives the next wastage number on
 * the Create screen (`nextWastageCode()` in CreateStockWastagePage takes
 * the max existing code) — keep WST-00030 as the highest code when adding
 * more rows. Replace all of this with real API data once that module
 * exists.
 */

export const SUMMARY = {
  totalWastages: { value: 30, caption: 'All Time' },
  draftWastages: { value: 6, caption: 'Not Yet Approved' },
  approvedWastages: { value: 24, caption: 'Completed' },
  approvedThisMonth: { value: 10, caption: 'This Month' },
  valueWasted: { value: 84250, caption: 'This Month' },
};

const HAND_AUTHORED_WASTAGES = [
  {
    code: 'WST-00030', date: '25 May 2026', outlet: 'Anna Nagar Outlet', wastageType: 'Expired',
    items: 5, wastageValue: 6250.0, status: 'draft',
  },
  {
    code: 'WST-00029', date: '24 May 2026', outlet: 'RS Puram Outlet', wastageType: 'Damaged',
    items: 3, wastageValue: 2850.5, status: 'approved',
  },
  {
    code: 'WST-00028', date: '21 May 2026', outlet: 'Main Warehouse', wastageType: 'Spoilage',
    items: 8, wastageValue: 9600.0, status: 'approved',
  },
  {
    code: 'WST-00027', date: '18 May 2026', outlet: 'Peelamedu Outlet', wastageType: 'Expired',
    items: 6, wastageValue: 5200.75, status: 'approved',
  },
];

const FILLER_OUTLETS = [
  'Saravanampatti Outlet', 'Singanallur Outlet', 'Gandhipuram Outlet', 'Race Course Outlet',
  'Ukkadam Warehouse', 'Podanur Warehouse',
];
const FILLER_TYPES = ['Expired', 'Damaged', 'Spoilage', 'Breakage'];

function generateFillerWastages(count, startNum) {
  return Array.from({ length: count }, (_, i) => {
    const num = startNum - i;
    return {
      code: `WST-${String(num).padStart(5, '0')}`,
      date: '0' + ((i % 9) + 1) + ' May 2026',
      outlet: FILLER_OUTLETS[i % FILLER_OUTLETS.length],
      wastageType: FILLER_TYPES[i % FILLER_TYPES.length],
      items: 1 + ((i * 3) % 10),
      wastageValue: Number((800 + (i * 917) % 8000).toFixed(2)),
      status: i % 5 === 0 ? 'draft' : 'approved',
    };
  });
}

export const WASTAGES = [
  ...HAND_AUTHORED_WASTAGES,
  ...generateFillerWastages(26, 26),
];

export const TOTAL_WASTAGE_COUNT = 30;

const WASTAGE_BY_CODE = Object.fromEntries(WASTAGES.map((w) => [w.code, w]));

/**
 * Full detail shape for a wastage code, for the View/Edit pages — same
 * fallback logic StockWastagePage already uses inline: only
 * WASTAGE_DETAILS.code (WST-00030) has the full hand-authored fields, so
 * every other row reuses that shape with its own WASTAGES fields swapped
 * in, since there's no backend yet to hold real per-wastage detail
 * records.
 */
export function getWastageDetails(code) {
  const row = WASTAGE_BY_CODE[code];
  if (!row) return null;
  if (code === WASTAGE_DETAILS.code) return WASTAGE_DETAILS;
  return {
    ...WASTAGE_DETAILS,
    code: row.code,
    date: row.date,
    outletLocation: row.outlet,
    wastageType: row.wastageType,
    items: row.items,
    wastageValue: row.wastageValue,
    status: row.status,
  };
}

export const WASTAGE_DETAILS = {
  code: 'WST-00030',
  date: '25 May 2026',
  status: 'draft',
  outletLocation: 'Anna Nagar Outlet',
  wastageType: 'Expired',
  department: 'Grocery',
  costCenter: 'Store Operations',
  warehouse: 'Anna Nagar Backstore',
  binRack: 'B-12',
  wastageReason: 'Batch of dairy items crossed expiry date before sale.',
  preparedBy: 'Suresh Rajan',
  approvedBy: '—',
  items: 5,
  wastageValue: 6250.0,
};
