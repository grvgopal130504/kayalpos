/**
 * TEMPORARY mock data for the Sales Order module. The Sales Order backend
 * module doesn't exist yet, so this static list + summary stand in for
 * `useGetOrdersQuery()` / `useGetOrderQuery(id)`. Replace with real API
 * data once that module exists — do not add more mock data here in the
 * meantime.
 *
 * The 5 hand-authored orders reuse the exact SO-xxxxx codes, customers and
 * amounts already referenced as `convertedTo` on the converted rows in
 * salesQuotationMockData.js, so the two modules' mock data agree with each
 * other (SO-00045 really is what QUO-00086 turned into, etc).
 */

export const SUMMARY = {
  totalOrders: { value: 40, caption: 'This Month' },
  totalAmount: { value: 312560.4, caption: 'This Month' },
  confirmed: { value: 18, caption: 'This Month' },
  pending: { value: 15, caption: 'This Month' },
  delivered: { value: 7, caption: 'This Month' },
};

const HAND_AUTHORED = [
  { code: 'SO-00045', date: '26 May 2026', customer: 'Ramesh Kumar', amount: 12450.75, deliveryDate: '02 Jun 2026', status: 'delivered', createdBy: 'Admin', quotationRef: 'QUO-00086' },
  { code: 'SO-00044', date: '25 May 2026', customer: 'Priya Enterprises', amount: 45780.30, deliveryDate: '01 Jun 2026', status: 'confirmed', createdBy: 'Admin', quotationRef: 'QUO-00085' },
  { code: 'SO-00043', date: '24 May 2026', customer: 'Suresh Babu', amount: 6230.00, deliveryDate: '31 May 2026', status: 'delivered', createdBy: 'Admin', quotationRef: 'QUO-00084' },
  { code: 'SO-00042', date: '21 May 2026', customer: 'Anand Retail', amount: 15780.20, deliveryDate: '28 May 2026', status: 'pending', createdBy: 'Admin', quotationRef: 'QUO-00081' },
  { code: 'SO-00041', date: '20 May 2026', customer: 'Meena Super Store', amount: 32450.40, deliveryDate: '27 May 2026', status: 'confirmed', createdBy: 'Admin', quotationRef: 'QUO-00080' },
];

const FILLER_CUSTOMERS = [
  'Karthik Traders', 'Sri Amman Stores', 'Selvi Provisions', 'Murugan Retail', 'Annai Enterprises',
  'Devi Super Market', 'Raja Stores', 'Bharath Agency', 'Shanthi Traders', 'Velan Provision Mart',
  'Kumar & Sons', 'Nithya Stores', 'SVS Enterprises', 'Kaveri Retail', 'Ponni Traders',
];
const FILLER_STATUSES = ['pending', 'confirmed', 'delivered', 'pending', 'confirmed'];

function pad(n) {
  return String(n).padStart(2, '0');
}

const filler = Array.from({ length: 35 }, (_, i) => {
  const n = 40 - i; // SO-00040 down to SO-00006
  const code = `SO-${String(n).padStart(5, '0')}`;
  const customer = FILLER_CUSTOMERS[i % FILLER_CUSTOMERS.length];
  const status = FILLER_STATUSES[i % FILLER_STATUSES.length];
  const day = 19 - (i % 19);
  const safeDay = day > 0 ? day : day + 28;
  const month = i < 19 ? 'May 2026' : i < 40 ? 'Apr 2026' : 'Mar 2026';
  const deliveryDay = Math.min(safeDay + 7, 28);
  return {
    code,
    date: `${pad(safeDay)} ${month}`,
    customer,
    amount: Math.round((1500 + ((i * 811) % 38000) + 300) * 100) / 100,
    deliveryDate: `${pad(deliveryDay)} ${month}`,
    status,
    createdBy: 'Admin',
    quotationRef: null,
  };
});

export const ORDERS = [...HAND_AUTHORED, ...filler]
  .sort((a, b) => Number(b.code.slice(3)) - Number(a.code.slice(3)));

const ORDER_BY_CODE = Object.fromEntries(ORDERS.map((o) => [o.code, o]));

// Full detail record for the selected order, matching the Sales Quotation
// module's QUOTATION_DETAILS shape/pattern.
export const ORDER_DETAILS = {
  code: 'SO-00045',
  date: '26 May 2026',
  ref: 'QUO-00086',
  status: 'delivered',
  totalAmount: 12450.75,
  customer: {
    name: 'Ramesh Kumar',
    mobile: '9876543210',
    email: 'ramesh.kumar@email.com',
    address: '23, West Street, RS Puram, Coimbatore - 641002, Tamil Nadu',
  },
  deliveryDate: '02 Jun 2026',
  paymentTerms: 'Immediate',
  salesPerson: 'Admin',
  createdBy: 'Admin',
  items: [
    { code: 'ITM-0001', name: 'Ponni Rice 25kg', hsn: '1006', qty: 2.00, unitPrice: 1200.00, discount: 0.00, amount: 2400.00 },
    { code: 'ITM-0005', name: 'Toor Dal 1kg', hsn: '0713', qty: 5.00, unitPrice: 120.00, discount: 0.00, amount: 600.00 },
    { code: 'ITM-0012', name: 'Sunflower Oil 1L', hsn: '1512', qty: 10.00, unitPrice: 140.00, discount: 50.00, amount: 1350.00 },
    { code: 'ITM-0023', name: 'Sugar 1kg', hsn: '1701', qty: 5.00, unitPrice: 45.00, discount: 0.00, amount: 225.00 },
    { code: 'ITM-0045', name: 'Tea Powder 250g', hsn: '0902', qty: 3.00, unitPrice: 125.00, discount: 0.00, amount: 375.00 },
  ],
  totals: {
    subTotal: 4950.00,
    discount: 50.00,
    taxableAmount: 4900.00,
    sgst: { rate: 2.5, amount: 122.50 },
    cgst: { rate: 2.5, amount: 122.50 },
    grandTotal: 12450.75,
  },
  terms: [
    'This order is valid till the date mentioned above.',
    'Prices are subject to change without prior notice.',
    'Goods once sold will not be taken back.',
    'Payment to be made as per the agreed terms.',
  ],
};

const DEFAULT_TERMS = ORDER_DETAILS.terms;
const SAMPLE_ITEMS = ORDER_DETAILS.items;

// Per-status "selected order" detail record + right-panel copy, driving the
// Pending/Confirmed/Delivered status pages.
export const STATUS_DETAILS = {
  pending: {
    code: 'SO-00042',
    date: '21 May 2026',
    ref: 'QUO-00081',
    status: 'pending',
    totalAmount: 15780.20,
    customer: {
      name: 'Anand Retail',
      mobile: '9900112233',
      email: 'anand.retail@email.com',
      address: '18, Market Street, Coimbatore - 641005, Tamil Nadu',
    },
    deliveryDate: '28 May 2026',
    paymentTerms: '15 Days',
    salesPerson: 'Admin',
    createdBy: 'Admin',
    items: SAMPLE_ITEMS,
    totals: {
      subTotal: 6200.00,
      discount: 0.00,
      taxableAmount: 6200.00,
      sgst: { rate: 2.5, amount: 155.00 },
      cgst: { rate: 2.5, amount: 155.00 },
      grandTotal: 15780.20,
    },
    terms: DEFAULT_TERMS,
  },
  confirmed: {
    code: 'SO-00044',
    date: '25 May 2026',
    ref: 'QUO-00085',
    status: 'confirmed',
    totalAmount: 45780.30,
    customer: {
      name: 'Priya Enterprises',
      mobile: '9887766554',
      email: 'priya.enterprises@email.com',
      address: '7, Anna Nagar Main Road, Coimbatore - 641006, Tamil Nadu',
    },
    deliveryDate: '01 Jun 2026',
    paymentTerms: '30 Days',
    salesPerson: 'Admin',
    createdBy: 'Admin',
    items: SAMPLE_ITEMS,
    totals: {
      subTotal: 18200.00,
      discount: 200.00,
      taxableAmount: 18000.00,
      sgst: { rate: 2.5, amount: 450.00 },
      cgst: { rate: 2.5, amount: 450.00 },
      grandTotal: 45780.30,
    },
    terms: DEFAULT_TERMS,
  },
  delivered: {
    code: 'SO-00045',
    date: '26 May 2026',
    ref: 'QUO-00086',
    status: 'delivered',
    totalAmount: 12450.75,
    customer: ORDER_DETAILS.customer,
    deliveryDate: '02 Jun 2026',
    paymentTerms: 'Immediate',
    salesPerson: 'Admin',
    deliveredOn: '02 Jun 2026',
    items: SAMPLE_ITEMS,
    totals: ORDER_DETAILS.totals,
    terms: DEFAULT_TERMS,
  },
};

/**
 * Full detail shape for an order code, for the View/Edit pages — same
 * fallback logic SalesOrderOverviewPage/SalesOrderStatusPage already use
 * inline: only ORDER_DETAILS.code (SO-00045) has hand-authored items/totals,
 * so every other row reuses that shape with its own ORDERS fields swapped
 * in, since there's no backend yet to hold real per-order detail records.
 */
export function getOrderDetails(code) {
  const row = ORDER_BY_CODE[code];
  if (!row) return null;
  if (code === ORDER_DETAILS.code) return ORDER_DETAILS;
  return {
    ...ORDER_DETAILS,
    code: row.code,
    date: row.date,
    status: row.status,
    totalAmount: row.amount,
    deliveryDate: row.deliveryDate,
    customer: { ...ORDER_DETAILS.customer, name: row.customer },
    ...(row.status === 'delivered' ? { deliveredOn: row.deliveryDate } : {}),
  };
}

// 4-tile summary strip per status page.
export const STATUS_STATS = {
  pending: {
    count: { value: 15, caption: 'This Month' },
    extra: [
      { label: 'Total Pending Amount', value: 186540.60, currency: true, caption: 'This Month' },
      { label: 'Awaiting Confirmation', value: 9, currency: false, caption: 'This Month' },
      { label: 'From Quotations', value: 11, currency: false, caption: 'This Month' },
    ],
  },
  confirmed: {
    count: { value: 18, caption: 'This Month' },
    extra: [
      { label: 'Total Confirmed Amount', value: 210320.10, currency: true, caption: 'This Month' },
      { label: 'Ready for Delivery', value: 10, currency: false, caption: 'This Month' },
      { label: 'Avg. Order Value', value: 11684.45, currency: true, caption: 'This Month' },
    ],
  },
  delivered: {
    count: { value: 7, caption: 'This Month' },
    extra: [
      { label: 'Total Delivered Amount', value: 92450.90, currency: true, caption: 'This Month' },
      { label: 'Delivered This Week', value: 3, currency: false, caption: 'This Week' },
      { label: 'On-Time Delivery', value: '96%', currency: false, caption: 'This Month', isText: true },
    ],
  },
};
