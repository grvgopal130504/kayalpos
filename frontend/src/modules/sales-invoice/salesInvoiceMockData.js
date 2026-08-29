/**
 * TEMPORARY mock data for the Sales Invoice module. The Sales Invoice
 * backend module doesn't exist yet, so this static list + summary stand in
 * for `useGetInvoicesQuery()` / `useGetInvoiceQuery(id)`. Replace with real
 * API data once that module exists — do not add more mock data here in the
 * meantime.
 *
 * The 5 hand-authored invoices reuse the exact SO-xxxxx codes/customers
 * already referenced in salesOrderMockData.js, so the two modules' mock
 * data agree with each other (INV-00056 really was raised against SO-00045,
 * etc).
 */

export const SUMMARY = {
  totalInvoices: { value: 52, caption: 'This Month' },
  totalAmount: { value: 428910.6, caption: 'This Month' },
  paid: { value: 24, caption: 'This Month' },
  draft: { value: 9, caption: 'This Month' },
  overdue: { value: 6, caption: 'This Month' },
};

const HAND_AUTHORED = [
  { code: 'INV-00056', date: '26 May 2026', customer: 'Ramesh Kumar', amount: 12450.75, dueDate: '25 Jun 2026', status: 'paid', createdBy: 'Admin', salesOrderRef: 'SO-00045' },
  { code: 'INV-00055', date: '25 May 2026', customer: 'Priya Enterprises', amount: 45780.30, dueDate: '24 Jun 2026', status: 'sent', createdBy: 'Admin', salesOrderRef: 'SO-00044' },
  { code: 'INV-00054', date: '24 May 2026', customer: 'Suresh Babu', amount: 6230.00, dueDate: '23 Jun 2026', status: 'paid', createdBy: 'Admin', salesOrderRef: 'SO-00043' },
  { code: 'INV-00053', date: '10 May 2026', customer: 'Anand Retail', amount: 15780.20, dueDate: '09 Jun 2026', status: 'overdue', createdBy: 'Admin', salesOrderRef: 'SO-00042' },
  { code: 'INV-00052', date: '20 May 2026', customer: 'Meena Super Store', amount: 32450.40, dueDate: '19 Jun 2026', status: 'draft', createdBy: 'Admin', salesOrderRef: 'SO-00041' },
];

const FILLER_CUSTOMERS = [
  'Karthik Traders', 'Sri Amman Stores', 'Selvi Provisions', 'Murugan Retail', 'Annai Enterprises',
  'Devi Super Market', 'Raja Stores', 'Bharath Agency', 'Shanthi Traders', 'Velan Provision Mart',
  'Kumar & Sons', 'Nithya Stores', 'SVS Enterprises', 'Kaveri Retail', 'Ponni Traders',
];
const FILLER_STATUSES = ['paid', 'sent', 'draft', 'overdue', 'paid'];

function pad(n) {
  return String(n).padStart(2, '0');
}

const filler = Array.from({ length: 47 }, (_, i) => {
  const n = 51 - i; // INV-00051 down to INV-00005
  const code = `INV-${String(n).padStart(5, '0')}`;
  const customer = FILLER_CUSTOMERS[i % FILLER_CUSTOMERS.length];
  const status = FILLER_STATUSES[i % FILLER_STATUSES.length];
  const day = 19 - (i % 19);
  const safeDay = day > 0 ? day : day + 28;
  const month = i < 19 ? 'May 2026' : i < 40 ? 'Apr 2026' : 'Mar 2026';
  const dueDay = Math.min(safeDay + 30, 28);
  return {
    code,
    date: `${pad(safeDay)} ${month}`,
    customer,
    amount: Math.round((1500 + ((i * 811) % 38000) + 300) * 100) / 100,
    dueDate: `${pad(dueDay)} ${month}`,
    status,
    createdBy: 'Admin',
    salesOrderRef: null,
  };
});

export const INVOICES = [...HAND_AUTHORED, ...filler]
  .sort((a, b) => Number(b.code.slice(4)) - Number(a.code.slice(4)));

// Full detail record for the selected invoice, matching the Sales
// Quotation/Sales Order modules' *_DETAILS shape/pattern.
export const INVOICE_DETAILS = {
  code: 'INV-00056',
  date: '26 May 2026',
  ref: 'SO-00045',
  status: 'paid',
  totalAmount: 12450.75,
  customer: {
    name: 'Ramesh Kumar',
    mobile: '9876543210',
    email: 'ramesh.kumar@email.com',
    address: '23, West Street, RS Puram, Coimbatore - 641002, Tamil Nadu',
  },
  dueDate: '25 Jun 2026',
  paymentTerms: '30 Days',
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
    'This invoice is valid till the date mentioned above.',
    'Prices are subject to change without prior notice.',
    'Goods once sold will not be taken back.',
    'Payment to be made as per the agreed terms.',
  ],
};

const DEFAULT_TERMS = INVOICE_DETAILS.terms;
const SAMPLE_ITEMS = INVOICE_DETAILS.items;

// Per-status "selected invoice" detail record + right-panel copy, driving
// the Draft/Sent/Paid/Overdue status pages.
export const STATUS_DETAILS = {
  draft: {
    code: 'INV-00052',
    date: '20 May 2026',
    ref: 'SO-00041',
    status: 'draft',
    totalAmount: 32450.40,
    customer: {
      name: 'Meena Super Store',
      mobile: '9911223344',
      email: 'meena.superstore@email.com',
      address: '14, Bazaar Street, Coimbatore - 641009, Tamil Nadu',
    },
    dueDate: '19 Jun 2026',
    paymentTerms: '30 Days',
    salesPerson: 'Admin',
    createdBy: 'Admin',
    items: SAMPLE_ITEMS,
    totals: {
      subTotal: 13000.00,
      discount: 100.00,
      taxableAmount: 12900.00,
      sgst: { rate: 2.5, amount: 322.50 },
      cgst: { rate: 2.5, amount: 322.50 },
      grandTotal: 32450.40,
    },
    terms: DEFAULT_TERMS,
  },
  sent: {
    code: 'INV-00055',
    date: '25 May 2026',
    ref: 'SO-00044',
    status: 'sent',
    totalAmount: 45780.30,
    customer: {
      name: 'Priya Enterprises',
      mobile: '9887766554',
      email: 'priya.enterprises@email.com',
      address: '7, Anna Nagar Main Road, Coimbatore - 641006, Tamil Nadu',
    },
    dueDate: '24 Jun 2026',
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
  paid: {
    code: 'INV-00056',
    date: '26 May 2026',
    ref: 'SO-00045',
    status: 'paid',
    totalAmount: 12450.75,
    customer: INVOICE_DETAILS.customer,
    dueDate: '25 Jun 2026',
    paymentTerms: '30 Days',
    salesPerson: 'Admin',
    createdBy: 'Admin',
    paidOn: '02 Jun 2026',
    items: SAMPLE_ITEMS,
    totals: INVOICE_DETAILS.totals,
    terms: DEFAULT_TERMS,
  },
  overdue: {
    code: 'INV-00053',
    date: '10 May 2026',
    ref: 'SO-00042',
    status: 'overdue',
    totalAmount: 15780.20,
    customer: {
      name: 'Anand Retail',
      mobile: '9900112233',
      email: 'anand.retail@email.com',
      address: '18, Market Street, Coimbatore - 641005, Tamil Nadu',
    },
    dueDate: '09 Jun 2026',
    paymentTerms: '30 Days',
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
};

// 4-tile summary strip per status page.
export const STATUS_STATS = {
  draft: {
    count: { value: 9, caption: 'This Month' },
    extra: [
      { label: 'Total Draft Amount', value: 98430.20, currency: true, caption: 'This Month' },
      { label: 'Awaiting Send', value: 9, currency: false, caption: 'This Month' },
      { label: 'From Sales Orders', value: 6, currency: false, caption: 'This Month' },
    ],
  },
  sent: {
    count: { value: 13, caption: 'This Month' },
    extra: [
      { label: 'Total Sent Amount', value: 186540.60, currency: true, caption: 'This Month' },
      { label: 'Awaiting Payment', value: 11, currency: false, caption: 'This Month' },
      { label: 'Avg. Invoice Value', value: 14349.28, currency: true, caption: 'This Month' },
    ],
  },
  paid: {
    count: { value: 24, caption: 'This Month' },
    extra: [
      { label: 'Total Paid Amount', value: 310240.90, currency: true, caption: 'This Month' },
      { label: 'Paid This Week', value: 5, currency: false, caption: 'This Week' },
      { label: 'On-Time Payment', value: '92%', currency: false, caption: 'This Month', isText: true },
    ],
  },
  overdue: {
    count: { value: 6, caption: 'This Month' },
    extra: [
      { label: 'Total Overdue Amount', value: 74250.30, currency: true, caption: 'This Month' },
      { label: 'Overdue > 15 Days', value: 3, currency: false, caption: 'This Month' },
      { label: 'Reminders Sent', value: 6, currency: false, caption: 'This Month' },
    ],
  },
};
