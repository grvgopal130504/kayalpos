/**
 * Shared mappers between the real Barcode & Label API shape (Decimal fields
 * serialized as strings, dates as ISO strings — see backend/src/modules/
 * barcode-label's service) and the shapes BarcodeLabelTable / LabelDetailsCard
 * / BarcodeLabelSummaryCards / the status pages already expect. Every figure
 * here comes straight from a real BarcodeLabelBatch row — a tenant with no
 * batches yet honestly shows zeros/empty lists, never a placeholder number.
 */
import {
  LABEL_TYPE_OPTIONS, LABEL_SIZE_OPTIONS, PRINT_TEMPLATE_OPTIONS, BARCODE_TYPE_OPTIONS,
} from './createBarcodeLabelSchema';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  return `${String(d.getDate()).padStart(2, '0')} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function num(value) {
  return value === null || value === undefined ? 0 : Number(value);
}

function valueToLabelMap(options) {
  return Object.fromEntries(options.filter((o) => o.value).map((o) => [o.value, o.label]));
}
const LABEL_TYPE_VALUE_TO_LABEL = valueToLabelMap(LABEL_TYPE_OPTIONS);
const LABEL_SIZE_VALUE_TO_LABEL = valueToLabelMap(LABEL_SIZE_OPTIONS);
const PRINT_TEMPLATE_VALUE_TO_LABEL = valueToLabelMap(PRINT_TEMPLATE_OPTIONS);
const BARCODE_TYPE_VALUE_TO_LABEL = valueToLabelMap(BARCODE_TYPE_OPTIONS);

const STATUS_LABEL = { draft: 'Draft', 'pending-print': 'Pending Print', printed: 'Printed' };

export function statusLabel(status) {
  return STATUS_LABEL[status] || status;
}

/** Row shape for BarcodeLabelTable. */
export function toBatchRow(row) {
  return {
    id: row.id,
    code: row.code,
    date: formatDate(row.createdAt),
    labelName: row.labelName,
    itemCategory: row.itemCategory || '-',
    totalLabels: num(row.totalLabels),
    status: row.status,
    createdBy: row.createdBy,
  };
}

/** Full detail shape for LabelDetailsCard / BarcodeLabelViewPage. */
export function toBatchDetails(row) {
  return {
    id: row.id,
    code: row.code,
    date: formatDate(row.createdAt),
    status: row.status,
    labelName: row.labelName,
    labelType: LABEL_TYPE_VALUE_TO_LABEL[row.labelType] || row.labelType,
    labelSize: LABEL_SIZE_VALUE_TO_LABEL[row.labelSize] || row.labelSize,
    printTemplate: row.printTemplate ? (PRINT_TEMPLATE_VALUE_TO_LABEL[row.printTemplate] || row.printTemplate) : '-',
    barcodeType: BARCODE_TYPE_VALUE_TO_LABEL[row.barcodeType] || row.barcodeType,
    itemCategory: row.itemCategory || '-',
    brand: row.brand || '-',
    totalLabels: num(row.totalLabels),
    totalItems: row.totalItems,
    createdBy: row.createdBy,
    printedOn: row.printedOn ? formatDate(row.printedOn) : '-',
    remarks: row.remarks || '-',
    notes: row.notes || '',
    items: (row.items || []).map((item) => ({
      code: item.itemCode,
      name: item.itemName,
      hsn: item.hsnCode || '-',
      uom: item.uom || '-',
      barcode: item.barcode || '-',
      printQty: num(item.printQty),
    })),
  };
}

/** 5-tile "Barcode & Label" summary strip — captions are honestly "All Time"
 * since getBarcodeLabelSummary() aggregates every batch ever created, not a
 * monthly window. */
export function buildSummary(summary) {
  const caption = 'All Time';
  return {
    totalBatches: { value: summary?.totalBatches || 0, caption },
    totalLabelsPrinted: { value: summary?.totalLabelsPrinted || 0, caption },
    printed: { value: summary?.printed || 0, caption },
    draft: { value: summary?.draft || 0, caption },
    pendingPrint: { value: summary?.pendingPrint || 0, caption },
  };
}

const STATUS_EXTRA_LABELS = {
  draft: ['Total Draft Labels', 'Average Labels / Batch', 'Total Line Items'],
  'pending-print': ['Total Pending Labels', 'Average Labels / Batch', 'Total Line Items'],
  printed: ['Total Printed Labels', 'Average Labels / Batch', 'Total Line Items'],
};

/** 4-tile status-page strip (count + 3 real aggregates) for one status. */
export function buildStatusStats(status, statusSummary) {
  const labels = STATUS_EXTRA_LABELS[status] || STATUS_EXTRA_LABELS.draft;
  const caption = 'All Time';
  return {
    count: { value: statusSummary?.count || 0, caption },
    extra: [
      { label: labels[0], value: statusSummary?.totalLabels || 0, caption },
      { label: labels[1], value: statusSummary?.averageLabels || 0, caption },
      { label: labels[2], value: statusSummary?.totalItems || 0, caption },
    ],
  };
}

function itemToFormRow(item) {
  return {
    selected: true,
    itemCode: item.itemCode || '',
    itemName: item.itemName || '',
    hsnCode: item.hsnCode || '',
    uom: item.uom || '',
    barcode: item.barcode || '',
    printQty: item.printQty !== null && item.printQty !== undefined ? String(item.printQty) : '',
    fromSerialBatch: item.fromSerialBatch || '',
    toSerialBatch: item.toSerialBatch || '',
  };
}

/** Converts a real API batch row into the Create/Edit form's default values
 * — used only in edit mode (see CreateBarcodeLabelPage). Every item the
 * batch actually holds was, by definition, a selected row when it was
 * saved, so each one comes back checked. */
export function batchToFormValues(row, emptyItemRow) {
  return {
    labelName: row.labelName || '',
    labelType: row.labelType || 'barcode',
    labelSize: row.labelSize || '',
    printTemplate: row.printTemplate || '',
    labelsAcross: row.labelsAcross !== null && row.labelsAcross !== undefined ? String(row.labelsAcross) : '',
    labelsDown: row.labelsDown !== null && row.labelsDown !== undefined ? String(row.labelsDown) : '',
    remarks: row.remarks || '',
    itemCategory: row.itemCategory || '',
    item: row.item || '',
    uom: row.uom || '',
    brand: row.brand || '',
    warehouse: row.warehouse || '',
    batchNo: row.batchNo || '',
    fromItemCode: row.fromItemCode || '',
    toItemCode: row.toItemCode || '',
    barcodeType: row.barcodeType || 'ean-13',
    additionalFilter: row.additionalFilter || '',
    sortBy: row.sortBy || 'item-name',
    notes: row.notes || '',
    items: row.items?.length ? row.items.map(itemToFormRow) : [emptyItemRow()],
  };
}

/** Converts the form's string-based values into the JSON payload the
 * backend's createBarcodeLabelSchema/updateBarcodeLabelSchema expect — only
 * the rows the user actually checked are sent, matching
 * LabelPrintSummaryCard's own selected-only totals; an unchecked row never
 * reaches the "select at least one item" validation as a candidate. */
export function formValuesToPayload(values, { status }) {
  const items = values.items
    .filter((row) => row.selected)
    .map((row) => ({
      itemCode: row.itemCode.trim(),
      itemName: row.itemName.trim(),
      hsnCode: row.hsnCode?.trim() || '',
      uom: row.uom?.trim() || '',
      barcode: row.barcode?.trim() || '',
      printQty: Number(row.printQty),
      fromSerialBatch: row.fromSerialBatch?.trim() || '',
      toSerialBatch: row.toSerialBatch?.trim() || '',
    }));

  return {
    labelName: values.labelName.trim(),
    labelType: values.labelType,
    labelSize: values.labelSize,
    printTemplate: values.printTemplate?.trim() || '',
    labelsAcross: values.labelsAcross ? Number(values.labelsAcross) : null,
    labelsDown: values.labelsDown ? Number(values.labelsDown) : null,
    remarks: values.remarks?.trim() || '',
    itemCategory: values.itemCategory?.trim() || '',
    item: values.item?.trim() || '',
    uom: values.uom?.trim() || '',
    brand: values.brand?.trim() || '',
    warehouse: values.warehouse?.trim() || '',
    batchNo: values.batchNo?.trim() || '',
    fromItemCode: values.fromItemCode?.trim() || '',
    toItemCode: values.toItemCode?.trim() || '',
    barcodeType: values.barcodeType,
    additionalFilter: values.additionalFilter?.trim() || '',
    sortBy: values.sortBy,
    notes: values.notes?.trim() || '',
    status,
    items,
  };
}
