/**
 * TEMPORARY mock data for the Sales Quotation module. The Sales Quotation
 * module hasn't been built on the backend yet, so this static list +
 * summary stand in for `useGetQuotationsQuery()` / `useGetQuotationQuery(id)`.
 * Replace with real API data once that module exists — do not add more mock
 * data here in the meantime.
 *
 * The first 10 rows (QUO-00077 .. QUO-00086) plus the 6 draft rows in
 * DRAFT_EXTRA are hand-authored to match the reference screenshots exactly
 * (names, amounts, dates, statuses). The rest are generated filler so
 * pagination/search have something real to work against — the filler pool
 * only cycles through pending/converted/expired so the draft count stays
 * fixed at exactly 8 (matching the Draft status page reference).
 */

export const SUMMARY = {
  totalQuotations: { value: 86, caption: 'This Month' },
  totalAmount: { value: 648250.75, caption: 'This Month' },
  converted: { value: 32, caption: 'This Month' },
  pending: { value: 54, caption: 'This Month' },
  expired: { value: 14, caption: 'This Month' },
};

const HAND_AUTHORED = [
  { code: 'QUO-00086', date: '26 May 2026', customer: 'Ramesh Kumar', amount: 12450.75, validTill: '31 May 2026', status: 'converted', createdBy: 'Admin', convertedOn: '26 May 2026', convertedTo: 'SO-00045' },
  { code: 'QUO-00085', date: '25 May 2026', customer: 'Priya Enterprises', amount: 45780.30, validTill: '01 Jun 2026', status: 'converted', createdBy: 'Admin', convertedOn: '25 May 2026', convertedTo: 'SO-00044' },
  { code: 'QUO-00084', date: '24 May 2026', customer: 'Suresh Babu', amount: 6230.00, validTill: '30 May 2026', status: 'converted', createdBy: 'Admin', convertedOn: '24 May 2026', convertedTo: 'SO-00043' },
  { code: 'QUO-00083', date: '23 May 2026', customer: 'Kavitha Stores', amount: 5197.50, validTill: '29 May 2026', status: 'draft', createdBy: 'Admin' },
  { code: 'QUO-00082', date: '22 May 2026', customer: 'Vijay Traders', amount: 1250.00, validTill: '28 May 2026', status: 'expired', createdBy: 'Admin' },
  { code: 'QUO-00081', date: '21 May 2026', customer: 'Anand Retail', amount: 15780.20, validTill: '27 May 2026', status: 'converted', createdBy: 'Admin', convertedOn: '21 May 2026', convertedTo: 'SO-00042' },
  { code: 'QUO-00080', date: '20 May 2026', customer: 'Meena Super Store', amount: 32450.40, validTill: '26 May 2026', status: 'converted', createdBy: 'Admin', convertedOn: '20 May 2026', convertedTo: 'SO-00041' },
  { code: 'QUO-00079', date: '19 May 2026', customer: 'Balaji Provision', amount: 3560.00, validTill: '25 May 2026', status: 'draft', createdBy: 'Admin' },
  { code: 'QUO-00078', date: '18 May 2026', customer: 'Ganesh Agency', amount: 8760.75, validTill: '24 May 2026', status: 'expired', createdBy: 'Admin' },
  { code: 'QUO-00077', date: '17 May 2026', customer: 'Lakshmi Stores', amount: 21450.80, validTill: '23 May 2026', status: 'pending', createdBy: 'Admin' },
];

// The 6 remaining Draft quotations, matching the Draft status page
// reference exactly — together with QUO-00083/QUO-00079 above this makes
// exactly 8 draft quotations, matching "Showing 1 to 8 of 8 entries".
const DRAFT_EXTRA = [
  { code: 'QUO-00075', date: '16 May 2026', customer: 'Sakthi Traders', amount: 12875.20, validTill: '23 May 2026', status: 'draft', createdBy: 'Admin' },
  { code: 'QUO-00072', date: '15 May 2026', customer: 'Sri Venkateshwara Stores', amount: 8450.75, validTill: '22 May 2026', status: 'draft', createdBy: 'Admin' },
  { code: 'QUO-00070', date: '14 May 2026', customer: 'Green Land Traders', amount: 15780.00, validTill: '21 May 2026', status: 'draft', createdBy: 'Admin' },
  { code: 'QUO-00065', date: '12 May 2026', customer: 'Mahalakshmi Enterprises', amount: 21450.30, validTill: '20 May 2026', status: 'draft', createdBy: 'Admin' },
  { code: 'QUO-00061', date: '10 May 2026', customer: 'Sri Sai Provision Store', amount: 9870.00, validTill: '19 May 2026', status: 'draft', createdBy: 'Admin' },
  { code: 'QUO-00055', date: '07 May 2026', customer: 'Nandhini Stores', amount: 10056.00, validTill: '16 May 2026', status: 'draft', createdBy: 'Admin' },
];
const DRAFT_EXTRA_CODES = new Set(DRAFT_EXTRA.map((d) => d.code));

const FILLER_CUSTOMERS = [
  'Karthik Traders', 'Sri Amman Stores', 'Selvi Provisions', 'Murugan Retail', 'Annai Enterprises',
  'Devi Super Market', 'Raja Stores', 'Bharath Agency', 'Shanthi Traders', 'Velan Provision Mart',
  'Kumar & Sons', 'Nithya Stores', 'SVS Enterprises', 'Kaveri Retail', 'Ponni Traders',
  'Sakthi Provisions', 'Amman Super Store', 'Elango Stores', 'Vasantham Retail', 'Chola Traders',
  'Mahalakshmi Agency', 'Green Valley Mart', 'Sathya Stores', 'Om Sakthi Traders', 'City Grocers',
  'Krishna Provisions', 'Malar Stores', 'Aravind Retail', 'Sundar Agency', 'Priya Super Market',
];
// No 'draft' or 'converted' here on purpose — draft rows are all
// hand-authored above (fixed at exactly 8) and converted rows are limited
// to the 5 hand-authored ones (matching the Converted status page
// reference), so filler only ever lands in pending/expired.
const FILLER_STATUSES = ['pending', 'expired', 'pending'];

function pad(n) {
  return String(n).padStart(2, '0');
}

const filler = Array.from({ length: 76 }, (_, i) => {
  const n = 76 - i; // QUO-00076 down to QUO-00001
  const code = `QUO-${String(n).padStart(5, '0')}`;
  if (DRAFT_EXTRA_CODES.has(code)) return null;
  const customer = FILLER_CUSTOMERS[i % FILLER_CUSTOMERS.length];
  const status = FILLER_STATUSES[i % FILLER_STATUSES.length];
  const day = 16 - (i % 16);
  const safeDay = day > 0 ? day : day + 28;
  const month = i < 16 ? 'May 2026' : i < 44 ? 'Apr 2026' : i < 60 ? 'Mar 2026' : 'Feb 2026';
  const validDay = Math.min(safeDay + 6, 28);
  return {
    code,
    date: `${pad(safeDay)} ${month}`,
    customer,
    amount: Math.round((1200 + ((i * 733) % 42000) + 250) * 100) / 100,
    validTill: `${pad(validDay)} ${month}`,
    status,
    createdBy: 'Admin',
  };
}).filter(Boolean);

export const QUOTATIONS = [...HAND_AUTHORED, ...DRAFT_EXTRA, ...filler]
  .sort((a, b) => Number(b.code.slice(4)) - Number(a.code.slice(4)));

// Full detail record for the selected quotation, matching the "All
// Quotations" reference screenshot exactly. SalesQuotationOverviewPage
// falls back to reusing this shape (swapping in the clicked row's fields)
// when a different row is selected, since we don't have full mock detail
// records for every generated row.
export const QUOTATION_DETAILS = {
  code: 'QUO-00086',
  date: '26 May 2026',
  ref: '-',
  status: 'converted',
  totalAmount: 12450.75,
  customer: {
    name: 'Ramesh Kumar',
    mobile: '9876543210',
    email: 'ramesh.kumar@email.com',
    address: '23, West Street, RS Puram, Coimbatore - 641002, Tamil Nadu',
  },
  validTill: '31 May 2026',
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
    'This quotation is valid till the date mentioned above.',
    'Prices are subject to change without prior notice.',
    'Goods once sold will not be taken back.',
    'Payment to be made as per the agreed terms.',
  ],
};

const DEFAULT_TERMS = QUOTATION_DETAILS.terms;

// Same 5 line items used across the mock detail records — only the
// selected quotation's totals differ per status.
const SAMPLE_ITEMS = QUOTATION_DETAILS.items;

// Per-status "selected quotation" detail record + right-panel copy, driving
// the Draft/Converted/Expired status pages. Only Draft has a reference
// screenshot; Converted/Expired reuse the same shape with plausible values.
export const STATUS_DETAILS = {
  draft: {
    code: 'QUO-00083',
    date: '23 May 2026',
    ref: '-',
    status: 'draft',
    totalAmount: 5197.50,
    customer: {
      name: 'Kavitha Stores',
      mobile: '9966332211',
      email: 'kavitha.stores@email.com',
      address: '12, Bharathi Street, Coimbatore - 641001, Tamil Nadu, India',
    },
    validTill: '29 May 2026',
    paymentTerms: 'Immediate',
    salesPerson: 'Admin',
    createdBy: 'Admin',
    items: SAMPLE_ITEMS,
    totals: {
      subTotal: 4950.00,
      discount: 0.00,
      taxableAmount: 4950.00,
      sgst: { rate: 2.5, amount: 123.75 },
      cgst: { rate: 2.5, amount: 123.75 },
      grandTotal: 5197.50,
    },
    terms: DEFAULT_TERMS,
  },
  converted: {
    code: 'QUO-00086',
    date: '26 May 2026',
    ref: '-',
    status: 'converted',
    totalAmount: 12450.75,
    customer: QUOTATION_DETAILS.customer,
    validTill: '31 May 2026',
    paymentTerms: 'Immediate',
    salesPerson: 'Admin',
    convertedOn: '26 May 2026',
    convertedTo: 'SO-00045',
    items: SAMPLE_ITEMS,
    totals: QUOTATION_DETAILS.totals,
    terms: DEFAULT_TERMS,
  },
  expired: {
    code: 'QUO-00082',
    date: '22 May 2026',
    ref: '-',
    status: 'expired',
    totalAmount: 1250.00,
    customer: {
      name: 'Vijay Traders',
      mobile: '9887766554',
      email: 'vijay.traders@email.com',
      address: '45, Market Road, Coimbatore - 641009, Tamil Nadu',
    },
    validTill: '28 May 2026',
    paymentTerms: 'Immediate',
    salesPerson: 'Admin',
    createdBy: 'Admin',
    items: [
      { code: 'ITM-0023', name: 'Sugar 1kg', hsn: '1701', qty: 10.00, unitPrice: 45.00, discount: 0.00, amount: 450.00 },
      { code: 'ITM-0045', name: 'Tea Powder 250g', hsn: '0902', qty: 6.00, unitPrice: 125.00, discount: 0.00, amount: 750.00 },
    ],
    totals: {
      subTotal: 1200.00,
      discount: 0.00,
      taxableAmount: 1200.00,
      sgst: { rate: 2.5, amount: 25.00 },
      cgst: { rate: 2.5, amount: 25.00 },
      grandTotal: 1250.00,
    },
    terms: DEFAULT_TERMS,
  },
};

// 4-tile summary strip per status page, matching the Draft status page
// reference for `draft`. Converted/Expired use plausible analogous figures
// since the Sales Quotation backend module doesn't exist yet.
export const STATUS_STATS = {
  draft: {
    count: { value: 8, caption: 'This Month' },
    extra: [
      { label: 'Total Draft Amount', value: 128540.75, currency: true, caption: 'This Month' },
      { label: 'Expiring Soon', value: 3, currency: false, caption: 'Within 7 Days' },
      { label: 'Converted to Order', value: 5, currency: false, caption: 'This Month' },
    ],
  },
  // Matches the Converted status page reference exactly — only 5
  // quotations have ever been converted, so the underlying QUOTATIONS
  // dataset (see FILLER_STATUSES above) keeps that count fixed at 5
  // rather than reusing SUMMARY.converted (28) from the "All Quotations"
  // tiles, which is independent placeholder data.
  converted: {
    count: { value: 5, caption: 'This Month' },
    extra: [
      { label: 'Total Converted Amount', value: 245870.40, currency: true, caption: 'This Month' },
      { label: 'Converted to Order', value: 5, currency: false, caption: 'This Month' },
      { label: 'Conversion Rate', value: '100%', currency: false, caption: 'This Month', isText: true },
    ],
  },
  expired: {
    count: SUMMARY.expired,
    extra: [
      { label: 'Total Expired Amount', value: 68420.25, currency: true, caption: 'This Month' },
      { label: 'Expired This Week', value: 4, currency: false, caption: 'This Week' },
      { label: 'Follow-ups Pending', value: 6, currency: false, caption: 'This Month' },
    ],
  },
};
