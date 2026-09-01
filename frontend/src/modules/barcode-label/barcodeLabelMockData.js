/**
 * TEMPORARY mock data for the Barcode & Label module. There's no Barcode &
 * Label backend module yet, so this static list + summary stand in for
 * `useGetLabelBatchesQuery()` / `useGetLabelBatchQuery(id)`. Replace with
 * real API data once that module exists — do not add more mock data here
 * in the meantime.
 *
 * Unlike Quotation/Order/Invoice, a "Barcode & Label" record is a saved
 * print-job configuration rather than a priced document, so its status
 * lifecycle is Draft -> Pending Print -> Printed instead of a payment/
 * fulfillment flow.
 */

export const SUMMARY = {
  totalBatches: { value: 38, caption: 'This Month' },
  totalLabelsPrinted: { value: 4260, caption: 'This Month' },
  printed: { value: 21, caption: 'This Month' },
  draft: { value: 8, caption: 'This Month' },
  pendingPrint: { value: 9, caption: 'This Month' },
};

const HAND_AUTHORED = [
  { code: 'LBL-00038', date: '26 May 2026', labelName: 'Grocery Aisle Refresh', itemCategory: 'Grocery', totalLabels: 120, status: 'printed', createdBy: 'Admin' },
  { code: 'LBL-00037', date: '25 May 2026', labelName: 'New Stock Arrival', itemCategory: 'Beverages', totalLabels: 60, status: 'pending-print', createdBy: 'Admin' },
  { code: 'LBL-00036', date: '24 May 2026', labelName: 'Weekend Promo Tags', itemCategory: 'Snacks', totalLabels: 200, status: 'printed', createdBy: 'Admin' },
  { code: 'LBL-00035', date: '21 May 2026', labelName: 'Dairy Section Reprint', itemCategory: 'Dairy', totalLabels: 45, status: 'draft', createdBy: 'Admin' },
  { code: 'LBL-00034', date: '20 May 2026', labelName: 'Household Essentials', itemCategory: 'Household', totalLabels: 90, status: 'pending-print', createdBy: 'Admin' },
];

const FILLER_LABEL_NAMES = [
  'Bakery Counter Tags', 'Frozen Foods Batch', 'Personal Care Aisle', 'Stationery Refresh', 'Cleaning Supplies Tags',
  'Rice & Pulses Batch', 'Spice Rack Reprint', 'Baby Care Labels', 'Snack Counter Tags', 'Beverage Cooler Batch',
];
const FILLER_CATEGORIES = ['Grocery', 'Beverages', 'Snacks', 'Dairy', 'Household', 'Personal Care', 'Bakery', 'Frozen Foods'];
const FILLER_STATUSES = ['printed', 'draft', 'pending-print', 'printed', 'pending-print'];

function pad(n) {
  return String(n).padStart(2, '0');
}

const filler = Array.from({ length: 33 }, (_, i) => {
  const n = 33 - i; // LBL-00033 down to LBL-00001
  const code = `LBL-${String(n).padStart(5, '0')}`;
  const labelName = FILLER_LABEL_NAMES[i % FILLER_LABEL_NAMES.length];
  const itemCategory = FILLER_CATEGORIES[i % FILLER_CATEGORIES.length];
  const status = FILLER_STATUSES[i % FILLER_STATUSES.length];
  const day = 19 - (i % 19);
  const safeDay = day > 0 ? day : day + 28;
  const month = i < 19 ? 'May 2026' : i < 33 ? 'Apr 2026' : 'Mar 2026';
  return {
    code,
    date: `${pad(safeDay)} ${month}`,
    labelName,
    itemCategory,
    totalLabels: 20 + ((i * 17) % 180),
    status,
    createdBy: 'Admin',
  };
});

export const BATCHES = [...HAND_AUTHORED, ...filler]
  .sort((a, b) => Number(b.code.slice(4)) - Number(a.code.slice(4)));

const SAMPLE_ITEMS = [
  { code: 'ITM-0001', name: 'Rice 10kg', hsn: '1006', uom: 'Nos', barcode: '8901234567890', printQty: 1.00 },
  { code: 'ITM-0002', name: 'Sugar 1kg', hsn: '1701', uom: 'Nos', barcode: '8901234567891', printQty: 1.00 },
  { code: 'ITM-0003', name: 'Toor Dal 1kg', hsn: '0713', uom: 'Nos', barcode: '8901234567892', printQty: 1.00 },
  { code: 'ITM-0004', name: 'Tea Powder 250g', hsn: '0902', uom: 'Nos', barcode: '8901234567893', printQty: 1.00 },
  { code: 'ITM-0005', name: 'Sunflower Oil 1L', hsn: '1512', uom: 'Nos', barcode: '8901234567894', printQty: 1.00 },
];

const DEFAULT_TERMS = [
  'This label is valid till the date mentioned above.',
  'Prices are subject to change without prior notice.',
  'Goods once sold will not be taken back.',
  'Payment to be made as per the agreed terms.',
];

// Full detail record for the selected batch, matching the other modules'
// *_DETAILS shape/pattern.
export const BATCH_DETAILS = {
  code: 'LBL-00038',
  date: '26 May 2026',
  status: 'printed',
  labelName: 'Grocery Aisle Refresh',
  labelType: 'Barcode',
  labelSize: '50mm x 25mm',
  printTemplate: 'Standard 3-Column',
  itemCategory: 'Grocery',
  brand: 'Multiple Brands',
  totalLabels: 120,
  salesPerson: 'Admin',
  createdBy: 'Admin',
  printedOn: '26 May 2026',
  items: SAMPLE_ITEMS,
  terms: DEFAULT_TERMS,
};

// Per-status "selected batch" detail record + right-panel copy, driving
// the Draft/Pending Print/Printed status pages.
export const STATUS_DETAILS = {
  draft: {
    ...BATCH_DETAILS,
    code: 'LBL-00035',
    date: '21 May 2026',
    status: 'draft',
    labelName: 'Dairy Section Reprint',
    itemCategory: 'Dairy',
    totalLabels: 45,
    printedOn: undefined,
  },
  'pending-print': {
    ...BATCH_DETAILS,
    code: 'LBL-00037',
    date: '25 May 2026',
    status: 'pending-print',
    labelName: 'New Stock Arrival',
    itemCategory: 'Beverages',
    totalLabels: 60,
    printedOn: undefined,
  },
  printed: BATCH_DETAILS,
};

const BATCH_BY_CODE = Object.fromEntries(BATCHES.map((b) => [b.code, b]));

/**
 * Full detail shape for a batch code, for the View/Edit pages — same
 * fallback logic BarcodeLabelOverviewPage/BarcodeLabelStatusPage already
 * use inline: only BATCH_DETAILS.code (LBL-00038) has hand-authored
 * items/terms, so every other row reuses that shape with its own BATCHES
 * fields swapped in, since there's no backend yet to hold real per-batch
 * detail records.
 */
export function getBatchDetails(code) {
  const row = BATCH_BY_CODE[code];
  if (!row) return null;
  if (row.code === BATCH_DETAILS.code) return BATCH_DETAILS;
  return {
    ...BATCH_DETAILS,
    code: row.code,
    date: row.date,
    status: row.status,
    labelName: row.labelName,
    itemCategory: row.itemCategory,
    totalLabels: row.totalLabels,
    createdBy: row.createdBy,
    ...(row.status === 'printed' ? { printedOn: row.date } : { printedOn: undefined }),
  };
}

// 4-tile summary strip per status page.
export const STATUS_STATS = {
  draft: {
    count: { value: 8, caption: 'This Month' },
    extra: [
      { label: 'Total Draft Labels', value: 340, currency: false, caption: 'This Month' },
      { label: 'Awaiting Configuration', value: 5, currency: false, caption: 'This Month' },
      { label: 'From Filters', value: 3, currency: false, caption: 'This Month' },
    ],
  },
  'pending-print': {
    count: { value: 9, caption: 'This Month' },
    extra: [
      { label: 'Total Pending Labels', value: 580, currency: false, caption: 'This Month' },
      { label: 'Ready to Print', value: 7, currency: false, caption: 'This Month' },
      { label: 'Avg. Labels / Batch', value: 64, currency: false, caption: 'This Month' },
    ],
  },
  printed: {
    count: { value: 21, caption: 'This Month' },
    extra: [
      { label: 'Total Printed Labels', value: 3340, currency: false, caption: 'This Month' },
      { label: 'Printed This Week', value: 6, currency: false, caption: 'This Week' },
      { label: 'Reprint Requests', value: 2, currency: false, caption: 'This Month' },
    ],
  },
};
