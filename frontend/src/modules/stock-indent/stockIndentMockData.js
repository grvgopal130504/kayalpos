/**
 * TEMPORARY mock data for the Stock Indent module. There's no Stock Indent
 * backend module yet, so this static list + summary stand in for
 * `useGetIndentsQuery()` / `useGetIndentQuery(id)`. Replace with real API
 * data once that module exists — do not add more mock data here in the
 * meantime.
 *
 * A stock indent is an internal material request rather than a priced
 * sales document, so its status lifecycle is an approval workflow (Draft
 * -> Pending Approval -> Approved, with Rejected as the alternate branch)
 * instead of a payment/fulfillment flow.
 */

export const SUMMARY = {
  totalIndents: { value: 31, caption: 'This Month' },
  totalEstimatedValue: { value: 186420.50, caption: 'This Month' },
  approved: { value: 16, caption: 'This Month' },
  pendingApproval: { value: 8, caption: 'This Month' },
  rejected: { value: 3, caption: 'This Month' },
};

const HAND_AUTHORED = [
  { code: 'IND-00031', date: '26 May 2026', department: 'Kitchen & Bakery', fromOutlet: 'RS Puram Outlet', toOutlet: 'Main Warehouse', requiredDate: '29 May 2026', estimatedValue: 12450.75, status: 'draft', createdBy: 'Admin' },
  { code: 'IND-00030', date: '25 May 2026', department: 'Housekeeping', fromOutlet: 'Anna Nagar Outlet', toOutlet: 'Main Warehouse', requiredDate: '28 May 2026', estimatedValue: 4580.30, status: 'pending-approval', createdBy: 'Admin' },
  { code: 'IND-00029', date: '24 May 2026', department: 'Front Office', fromOutlet: 'RS Puram Outlet', toOutlet: 'Head Office', requiredDate: '27 May 2026', estimatedValue: 2230.00, status: 'approved', createdBy: 'Admin' },
  { code: 'IND-00028', date: '21 May 2026', department: 'Maintenance', fromOutlet: 'Market Street Outlet', toOutlet: 'Main Warehouse', requiredDate: '24 May 2026', estimatedValue: 8780.20, status: 'rejected', createdBy: 'Admin' },
  { code: 'IND-00027', date: '20 May 2026', department: 'Kitchen & Bakery', fromOutlet: 'Anna Nagar Outlet', toOutlet: 'Main Warehouse', requiredDate: '23 May 2026', estimatedValue: 15450.40, status: 'approved', createdBy: 'Admin' },
];

const FILLER_DEPARTMENTS = [
  'Kitchen & Bakery', 'Housekeeping', 'Front Office', 'Maintenance', 'Store & Inventory',
  'Security', 'Marketing', 'Admin',
];
const FILLER_OUTLETS = ['RS Puram Outlet', 'Anna Nagar Outlet', 'Market Street Outlet', 'Peelamedu Outlet'];
const FILLER_STATUSES = ['approved', 'draft', 'pending-approval', 'approved', 'rejected'];

function pad(n) {
  return String(n).padStart(2, '0');
}

const filler = Array.from({ length: 26 }, (_, i) => {
  const n = 26 - i; // IND-00026 down to IND-00001
  const code = `IND-${String(n).padStart(5, '0')}`;
  const department = FILLER_DEPARTMENTS[i % FILLER_DEPARTMENTS.length];
  const fromOutlet = FILLER_OUTLETS[i % FILLER_OUTLETS.length];
  const status = FILLER_STATUSES[i % FILLER_STATUSES.length];
  const day = 19 - (i % 19);
  const safeDay = day > 0 ? day : day + 28;
  const month = i < 19 ? 'May 2026' : i < 26 ? 'Apr 2026' : 'Mar 2026';
  const requiredDay = Math.min(safeDay + 3, 28);
  return {
    code,
    date: `${pad(safeDay)} ${month}`,
    department,
    fromOutlet,
    toOutlet: 'Main Warehouse',
    requiredDate: `${pad(requiredDay)} ${month}`,
    estimatedValue: Math.round((800 + ((i * 733) % 18000) + 200) * 100) / 100,
    status,
    createdBy: 'Admin',
  };
});

export const INDENTS = [...HAND_AUTHORED, ...filler]
  .sort((a, b) => Number(b.code.slice(4)) - Number(a.code.slice(4)));

const SAMPLE_ITEMS = [
  { code: 'ITM-0001', name: 'Rice 10kg', hsn: '1006', uom: 'Nos', requiredQty: 5.00, availableQty: 12.00, issueWarehouse: 'Main Warehouse', remarks: '' },
  { code: 'ITM-0002', name: 'Sugar 1kg', hsn: '1701', uom: 'Nos', requiredQty: 10.00, availableQty: 25.00, issueWarehouse: 'Main Warehouse', remarks: '' },
  { code: 'ITM-0003', name: 'Toor Dal 1kg', hsn: '0713', uom: 'Nos', requiredQty: 8.00, availableQty: 15.00, issueWarehouse: 'Main Warehouse', remarks: '' },
];

const DEFAULT_TERMS = [
  'This indent is valid till the date mentioned above.',
  'Materials once issued will not be taken back.',
  'Indent is subject to availability of stock.',
  'Use of materials should be as per company policy.',
];

// Full detail record for the selected indent, matching the other
// modules' *_DETAILS shape/pattern.
export const INDENT_DETAILS = {
  code: 'IND-00031',
  date: '26 May 2026',
  status: 'draft',
  department: 'Kitchen & Bakery',
  fromOutlet: 'RS Puram Outlet',
  toOutlet: 'Main Warehouse',
  requestor: 'Suresh Babu',
  priority: 'High',
  location: 'RS Puram Outlet',
  costCenter: 'Kitchen Operations',
  requiredDate: '29 May 2026',
  estimatedValue: 12450.75,
  createdBy: 'Admin',
  approvedOn: undefined,
  approvedBy: undefined,
  items: SAMPLE_ITEMS,
  terms: DEFAULT_TERMS,
};

// Per-status "selected indent" detail record + right-panel copy, driving
// the Draft/Pending Approval/Approved/Rejected status pages.
export const STATUS_DETAILS = {
  draft: INDENT_DETAILS,
  'pending-approval': {
    ...INDENT_DETAILS,
    code: 'IND-00030',
    date: '25 May 2026',
    status: 'pending-approval',
    department: 'Housekeeping',
    fromOutlet: 'Anna Nagar Outlet',
    requestor: 'Priya Enterprises',
    priority: 'Medium',
    location: 'Anna Nagar Outlet',
    requiredDate: '28 May 2026',
    estimatedValue: 4580.30,
  },
  approved: {
    ...INDENT_DETAILS,
    code: 'IND-00029',
    date: '24 May 2026',
    status: 'approved',
    department: 'Front Office',
    fromOutlet: 'RS Puram Outlet',
    toOutlet: 'Head Office',
    requestor: 'Ramesh Kumar',
    priority: 'Low',
    location: 'RS Puram Outlet',
    requiredDate: '27 May 2026',
    estimatedValue: 2230.00,
    approvedOn: '25 May 2026',
    approvedBy: 'Admin',
  },
  rejected: {
    ...INDENT_DETAILS,
    code: 'IND-00028',
    date: '21 May 2026',
    status: 'rejected',
    department: 'Maintenance',
    fromOutlet: 'Market Street Outlet',
    requestor: 'Anand Retail',
    priority: 'Medium',
    location: 'Market Street Outlet',
    requiredDate: '24 May 2026',
    estimatedValue: 8780.20,
  },
};

const INDENT_BY_CODE = Object.fromEntries(INDENTS.map((ind) => [ind.code, ind]));

/**
 * Full detail shape for an indent code, for the View/Edit pages — same
 * fallback logic StockIndentOverviewPage/StockIndentStatusPage already use
 * inline: only INDENT_DETAILS.code (IND-00031) has hand-authored items,
 * so every other row reuses that shape with its own INDENTS fields swapped
 * in, since there's no backend yet to hold real per-indent detail records.
 */
export function getIndentDetails(code) {
  const row = INDENT_BY_CODE[code];
  if (!row) return null;
  if (code === INDENT_DETAILS.code) return INDENT_DETAILS;
  return {
    ...INDENT_DETAILS,
    code: row.code,
    date: row.date,
    status: row.status,
    department: row.department,
    fromOutlet: row.fromOutlet,
    toOutlet: row.toOutlet,
    requiredDate: row.requiredDate,
    estimatedValue: row.estimatedValue,
    createdBy: row.createdBy,
    ...(row.status === 'approved' ? { approvedOn: row.date, approvedBy: 'Admin' } : { approvedOn: undefined, approvedBy: undefined }),
  };
}

// 4-tile summary strip per status page.
export const STATUS_STATS = {
  draft: {
    count: { value: 6, caption: 'This Month' },
    extra: [
      { label: 'Total Draft Value', value: 42340.20, currency: true, caption: 'This Month' },
      { label: 'Awaiting Submission', value: 6, currency: false, caption: 'This Month' },
      { label: 'From Outlets', value: 4, currency: false, caption: 'This Month' },
    ],
  },
  'pending-approval': {
    count: { value: 8, caption: 'This Month' },
    extra: [
      { label: 'Total Pending Value', value: 68540.60, currency: true, caption: 'This Month' },
      { label: 'Awaiting Manager Review', value: 5, currency: false, caption: 'This Month' },
      { label: 'Avg. Approval Time', value: '1.4 Days', currency: false, caption: 'This Month', isText: true },
    ],
  },
  approved: {
    count: { value: 16, caption: 'This Month' },
    extra: [
      { label: 'Total Approved Value', value: 128940.90, currency: true, caption: 'This Month' },
      { label: 'Issued This Week', value: 6, currency: false, caption: 'This Week' },
      { label: 'Fully Fulfilled', value: '88%', currency: false, caption: 'This Month', isText: true },
    ],
  },
  rejected: {
    count: { value: 3, caption: 'This Month' },
    extra: [
      { label: 'Total Rejected Value', value: 15230.40, currency: true, caption: 'This Month' },
      { label: 'Resubmitted', value: 1, currency: false, caption: 'This Month' },
      { label: 'Avg. Review Time', value: '0.8 Days', currency: false, caption: 'This Month', isText: true },
    ],
  },
};
