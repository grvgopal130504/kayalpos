/**
 * TEMPORARY mock data for the Stock Transfer module. There's no Stock
 * Transfer backend module yet, so this static list + summary stand in for
 * `useGetTransfersQuery()` / `useGetTransferQuery(id)`. Replace with real
 * API data once that module exists — do not add more mock data here in
 * the meantime.
 *
 * A stock transfer moves goods between outlets/warehouses rather than
 * being a priced sales document, so its status lifecycle is a
 * goods-movement workflow (Draft -> In Transit -> Received, with
 * Cancelled as the alternate branch) instead of a payment/approval flow.
 */

export const SUMMARY = {
  totalTransfers: { value: 27, caption: 'This Month' },
  totalEstimatedValue: { value: 154680.90, caption: 'This Month' },
  received: { value: 14, caption: 'This Month' },
  inTransit: { value: 7, caption: 'This Month' },
  cancelled: { value: 2, caption: 'This Month' },
};

const HAND_AUTHORED = [
  { code: 'TRF-00031', date: '26 May 2026', fromOutlet: 'RS Puram Outlet', toOutlet: 'Main Warehouse', indentRef: 'IND-00031', requiredBy: '29 May 2026', estimatedValue: 9450.75, status: 'draft', createdBy: 'Admin' },
  { code: 'TRF-00030', date: '25 May 2026', fromOutlet: 'Anna Nagar Outlet', toOutlet: 'Main Warehouse', indentRef: 'IND-00030', requiredBy: '28 May 2026', estimatedValue: 4580.30, status: 'in-transit', createdBy: 'Admin' },
  { code: 'TRF-00029', date: '24 May 2026', fromOutlet: 'Main Warehouse', toOutlet: 'RS Puram Outlet', indentRef: 'IND-00029', requiredBy: '27 May 2026', estimatedValue: 2230.00, status: 'received', createdBy: 'Admin' },
  { code: 'TRF-00028', date: '21 May 2026', fromOutlet: 'Market Street Outlet', toOutlet: 'Main Warehouse', indentRef: 'IND-00028', requiredBy: '24 May 2026', estimatedValue: 6780.20, status: 'cancelled', createdBy: 'Admin' },
  { code: 'TRF-00027', date: '20 May 2026', fromOutlet: 'Main Warehouse', toOutlet: 'Anna Nagar Outlet', indentRef: 'IND-00027', requiredBy: '23 May 2026', estimatedValue: 13450.40, status: 'received', createdBy: 'Admin' },
];

const FILLER_OUTLETS = ['RS Puram Outlet', 'Anna Nagar Outlet', 'Market Street Outlet', 'Peelamedu Outlet', 'Main Warehouse'];
const FILLER_STATUSES = ['received', 'draft', 'in-transit', 'received', 'cancelled'];

function pad(n) {
  return String(n).padStart(2, '0');
}

const filler = Array.from({ length: 22 }, (_, i) => {
  const n = 22 - i; // TRF-00022 down to TRF-00001
  const code = `TRF-${String(n).padStart(5, '0')}`;
  const fromOutlet = FILLER_OUTLETS[i % FILLER_OUTLETS.length];
  const toOutlet = FILLER_OUTLETS[(i + 2) % FILLER_OUTLETS.length];
  const status = FILLER_STATUSES[i % FILLER_STATUSES.length];
  const day = 19 - (i % 19);
  const safeDay = day > 0 ? day : day + 28;
  const month = i < 19 ? 'May 2026' : i < 22 ? 'Apr 2026' : 'Mar 2026';
  const requiredDay = Math.min(safeDay + 3, 28);
  return {
    code,
    date: `${pad(safeDay)} ${month}`,
    fromOutlet,
    toOutlet,
    indentRef: null,
    requiredBy: `${pad(requiredDay)} ${month}`,
    estimatedValue: Math.round((700 + ((i * 691) % 15000) + 200) * 100) / 100,
    status,
    createdBy: 'Admin',
  };
});

export const TRANSFERS = [...HAND_AUTHORED, ...filler]
  .sort((a, b) => Number(b.code.slice(4)) - Number(a.code.slice(4)));

const SAMPLE_ITEMS = [
  { code: 'ITM-0001', name: 'Rice 10kg', hsn: '1006', uom: 'Nos', availableQty: 12.00, transferQty: 5.00, unitCost: 55.00, totalCost: 275.00 },
  { code: 'ITM-0002', name: 'Sugar 1kg', hsn: '1701', uom: 'Nos', availableQty: 25.00, transferQty: 10.00, unitCost: 42.00, totalCost: 420.00 },
  { code: 'ITM-0003', name: 'Toor Dal 1kg', hsn: '0713', uom: 'Nos', availableQty: 15.00, transferQty: 8.00, unitCost: 118.00, totalCost: 944.00 },
];

const DEFAULT_TERMS = [
  'Stock once transferred cannot be reverted.',
  'Materials are transferred as per company policy.',
  'Ensure availability before initiating transfer.',
  'This is not a sale transaction.',
];

// Full detail record for the selected transfer, matching the other
// modules' *_DETAILS shape/pattern.
export const TRANSFER_DETAILS = {
  code: 'TRF-00031',
  date: '26 May 2026',
  status: 'draft',
  fromOutlet: 'RS Puram Outlet',
  toOutlet: 'Main Warehouse',
  indentRef: 'IND-00031',
  priority: 'High',
  costCenter: 'Kitchen Operations',
  requiredBy: '29 May 2026',
  estimatedValue: 9450.75,
  createdBy: 'Admin',
  receivedOn: undefined,
  receivedBy: undefined,
  items: SAMPLE_ITEMS,
  terms: DEFAULT_TERMS,
};

// Per-status "selected transfer" detail record + right-panel copy, driving
// the Draft/In Transit/Received/Cancelled status pages.
export const STATUS_DETAILS = {
  draft: TRANSFER_DETAILS,
  'in-transit': {
    ...TRANSFER_DETAILS,
    code: 'TRF-00030',
    date: '25 May 2026',
    status: 'in-transit',
    fromOutlet: 'Anna Nagar Outlet',
    toOutlet: 'Main Warehouse',
    indentRef: 'IND-00030',
    priority: 'Medium',
    requiredBy: '28 May 2026',
    estimatedValue: 4580.30,
  },
  received: {
    ...TRANSFER_DETAILS,
    code: 'TRF-00029',
    date: '24 May 2026',
    status: 'received',
    fromOutlet: 'Main Warehouse',
    toOutlet: 'RS Puram Outlet',
    indentRef: 'IND-00029',
    priority: 'Low',
    requiredBy: '27 May 2026',
    estimatedValue: 2230.00,
    receivedOn: '25 May 2026',
    receivedBy: 'Admin',
  },
  cancelled: {
    ...TRANSFER_DETAILS,
    code: 'TRF-00028',
    date: '21 May 2026',
    status: 'cancelled',
    fromOutlet: 'Market Street Outlet',
    toOutlet: 'Main Warehouse',
    indentRef: 'IND-00028',
    priority: 'Medium',
    requiredBy: '24 May 2026',
    estimatedValue: 6780.20,
  },
};

// 4-tile summary strip per status page.
export const STATUS_STATS = {
  draft: {
    count: { value: 4, caption: 'This Month' },
    extra: [
      { label: 'Total Draft Value', value: 28340.20, currency: true, caption: 'This Month' },
      { label: 'Awaiting Dispatch', value: 4, currency: false, caption: 'This Month' },
      { label: 'From Indents', value: 3, currency: false, caption: 'This Month' },
    ],
  },
  'in-transit': {
    count: { value: 7, caption: 'This Month' },
    extra: [
      { label: 'Total In-Transit Value', value: 52340.60, currency: true, caption: 'This Month' },
      { label: 'Dispatched Today', value: 2, currency: false, caption: 'This Month' },
      { label: 'Avg. Transit Time', value: '1.2 Days', currency: false, caption: 'This Month', isText: true },
    ],
  },
  received: {
    count: { value: 14, caption: 'This Month' },
    extra: [
      { label: 'Total Received Value', value: 98940.90, currency: true, caption: 'This Month' },
      { label: 'Received This Week', value: 5, currency: false, caption: 'This Week' },
      { label: 'Fully Matched', value: '91%', currency: false, caption: 'This Month', isText: true },
    ],
  },
  cancelled: {
    count: { value: 2, caption: 'This Month' },
    extra: [
      { label: 'Total Cancelled Value', value: 9230.40, currency: true, caption: 'This Month' },
      { label: 'Re-initiated', value: 1, currency: false, caption: 'This Month' },
      { label: 'Avg. Review Time', value: '0.6 Days', currency: false, caption: 'This Month', isText: true },
    ],
  },
};
