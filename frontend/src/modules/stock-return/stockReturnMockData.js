/**
 * TEMPORARY mock data for the Stock Return module. There's no Stock
 * Return backend module yet, so this static list stands in for
 * `useGetReturnsQuery()`. RETURNS also drives the next return number on the
 * Create screen (`nextReturnCode()` in CreateStockReturnPage takes the max
 * existing code) — keep RRT-00030 as the highest code when adding more
 * rows. Replace all of this with real API data once that module exists.
 */

export const SUMMARY = {
  totalReturns: { value: 30, caption: 'All Time' },
  draftReturns: { value: 6, caption: 'Not Yet Sent' },
  acceptedReturns: { value: 24, caption: 'Completed' },
  acceptedThisMonth: { value: 11, caption: 'This Month' },
  valueReturned: { value: 216400, caption: 'This Month' },
};

const HAND_AUTHORED_RETURNS = [
  {
    code: 'RRT-00030', date: '25 May 2026', supplier: 'Anna Nagar Distributors', returnType: 'Damaged Goods',
    referenceNo: 'RCPT-00027', items: 4, totalValue: 8250.0, status: 'draft',
  },
  {
    code: 'RRT-00029', date: '24 May 2026', supplier: 'Sri Krishna Traders', returnType: 'Excess Supply',
    referenceNo: 'RCPT-00025', items: 6, totalValue: 13650.5, status: 'accepted',
  },
  {
    code: 'RRT-00028', date: '21 May 2026', supplier: 'Metro Wholesale Foods', returnType: 'Wrong Item Supplied',
    referenceNo: 'RCPT-00022', items: 3, totalValue: 5600.0, status: 'accepted',
  },
  {
    code: 'RRT-00027', date: '18 May 2026', supplier: 'Coimbatore Agro Traders', returnType: 'Expired Stock',
    referenceNo: 'RCPT-00019', items: 9, totalValue: 21200.75, status: 'accepted',
  },
];

const FILLER_SUPPLIERS = [
  'Kayal Foods Pvt Ltd', 'Saravana Wholesale Mart', 'Ganesh Agro Distributors', 'Tirupur Grocery Suppliers',
  'Coastal Spice Traders', 'Nilgiris Fresh Produce',
];
const FILLER_TYPES = ['Damaged Goods', 'Excess Supply', 'Wrong Item Supplied', 'Expired Stock'];

function generateFillerReturns(count, startNum) {
  return Array.from({ length: count }, (_, i) => {
    const num = startNum - i;
    return {
      code: `RRT-${String(num).padStart(5, '0')}`,
      date: '0' + ((i % 9) + 1) + ' May 2026',
      supplier: FILLER_SUPPLIERS[i % FILLER_SUPPLIERS.length],
      returnType: FILLER_TYPES[i % FILLER_TYPES.length],
      referenceNo: `RCPT-${String(400 - i).padStart(5, '0')}`,
      items: 2 + ((i * 3) % 12),
      totalValue: Number((3500 + (i * 2917) % 20000).toFixed(2)),
      status: i % 5 === 0 ? 'draft' : 'accepted',
    };
  });
}

export const RETURNS = [
  ...HAND_AUTHORED_RETURNS,
  ...generateFillerReturns(26, 26),
];

export const TOTAL_RETURN_COUNT = 30;

const RETURN_BY_CODE = Object.fromEntries(RETURNS.map((r) => [r.code, r]));

/**
 * Full detail shape for a return code, for the View/Edit pages — same
 * fallback logic StockReturnPage already uses inline: only
 * RETURN_DETAILS.code (RRT-00030) has the full hand-authored fields, so
 * every other row reuses that shape with its own RETURNS fields swapped
 * in, since there's no backend yet to hold real per-return detail records.
 */
export function getReturnDetails(code) {
  const row = RETURN_BY_CODE[code];
  if (!row) return null;
  if (code === RETURN_DETAILS.code) return RETURN_DETAILS;
  return {
    ...RETURN_DETAILS,
    code: row.code,
    date: row.date,
    supplier: row.supplier,
    returnType: row.returnType,
    referenceNo: row.referenceNo,
    items: row.items,
    totalValue: row.totalValue,
    status: row.status,
  };
}

export const RETURN_DETAILS = {
  code: 'RRT-00030',
  date: '25 May 2026',
  status: 'draft',
  supplier: 'Anna Nagar Distributors',
  returnType: 'Damaged Goods',
  referenceType: 'Stock Receipt',
  referenceNo: 'RCPT-00027',
  referenceDate: '18 May 2026',
  fromOutlet: 'Main Warehouse',
  contactPerson: 'Suresh Rajan',
  mobileNo: '9876501234',
  returnReason: 'Items received with damaged packaging during transit.',
  items: 4,
  totalValue: 8250.0,
  vehicleNo: 'TN 39 AB 4521',
  transporter: 'VRL Logistics',
};
