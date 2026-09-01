/**
 * TEMPORARY mock data for the Stock Count module. There's no Stock Count
 * backend module yet, so this static list stands in for
 * `useGetCountsQuery()`. COUNTS also drives the next count number on the
 * Create screen (`nextCountCode()` in CreateStockCountPage takes the max
 * existing code) — keep CNT-00030 as the highest code when adding more
 * rows. Replace all of this with real API data once that module exists.
 */

export const SUMMARY = {
  totalCounts: { value: 30, caption: 'All Time' },
  draftCounts: { value: 6, caption: 'Not Yet Completed' },
  completedCounts: { value: 24, caption: 'Completed' },
  completedThisMonth: { value: 10, caption: 'This Month' },
  varianceValue: { value: 32450, caption: 'This Month' },
};

const HAND_AUTHORED_COUNTS = [
  {
    code: 'CNT-00030', date: '25 May 2026', warehouse: 'Main Warehouse', countType: 'Complete Count',
    items: 42, varianceValue: 5250.0, status: 'draft',
  },
  {
    code: 'CNT-00029', date: '24 May 2026', warehouse: 'RS Puram Outlet', countType: 'Partial Count',
    items: 18, varianceValue: -1850.5, status: 'completed',
  },
  {
    code: 'CNT-00028', date: '21 May 2026', warehouse: 'Anna Nagar Outlet', countType: 'Complete Count',
    items: 36, varianceValue: 3600.0, status: 'completed',
  },
  {
    code: 'CNT-00027', date: '18 May 2026', warehouse: 'Peelamedu Outlet', countType: 'Partial Count',
    items: 22, varianceValue: -920.75, status: 'completed',
  },
];

const FILLER_WAREHOUSES = [
  'Saravanampatti Outlet', 'Singanallur Outlet', 'Gandhipuram Outlet', 'Race Course Outlet',
  'Ukkadam Warehouse', 'Podanur Warehouse',
];
const FILLER_TYPES = ['Complete Count', 'Partial Count'];

function generateFillerCounts(count, startNum) {
  return Array.from({ length: count }, (_, i) => {
    const num = startNum - i;
    const variance = Number((((i * 733) % 6000) - 3000).toFixed(2));
    return {
      code: `CNT-${String(num).padStart(5, '0')}`,
      date: '0' + ((i % 9) + 1) + ' May 2026',
      warehouse: FILLER_WAREHOUSES[i % FILLER_WAREHOUSES.length],
      countType: FILLER_TYPES[i % FILLER_TYPES.length],
      items: 8 + ((i * 4) % 40),
      varianceValue: variance,
      status: i % 5 === 0 ? 'draft' : 'completed',
    };
  });
}

export const COUNTS = [
  ...HAND_AUTHORED_COUNTS,
  ...generateFillerCounts(26, 26),
];

export const TOTAL_COUNT_COUNT = 30;

const COUNT_BY_CODE = Object.fromEntries(COUNTS.map((c) => [c.code, c]));

/**
 * Full detail shape for a count code, for the View/Edit pages — same
 * fallback logic StockCountPage already uses inline: only
 * COUNT_DETAILS.code (CNT-00030) has the full hand-authored fields, so
 * every other row reuses that shape with its own COUNTS fields swapped
 * in, since there's no backend yet to hold real per-count detail records.
 */
export function getCountDetails(code) {
  const row = COUNT_BY_CODE[code];
  if (!row) return null;
  if (code === COUNT_DETAILS.code) return COUNT_DETAILS;
  return {
    ...COUNT_DETAILS,
    code: row.code,
    date: row.date,
    warehouse: row.warehouse,
    countType: row.countType,
    items: row.items,
    varianceValue: row.varianceValue,
    status: row.status,
  };
}

export const COUNT_DETAILS = {
  code: 'CNT-00030',
  date: '25 May 2026',
  status: 'draft',
  warehouse: 'Main Warehouse',
  countType: 'Complete Count',
  countBy: 'Item Wise Count',
  department: 'Grocery',
  costCenter: 'Store Operations',
  binRack: '—',
  countReason: 'Scheduled Monthly Count',
  startCountTime: '09:00 AM',
  endCountTime: '11:30 AM',
  preparedBy: 'Suresh Rajan',
  approvedBy: '—',
  items: 42,
  varianceValue: 5250.0,
};
