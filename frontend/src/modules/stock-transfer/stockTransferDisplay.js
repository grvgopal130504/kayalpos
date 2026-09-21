/**
 * Shared mappers between the real Stock Transfer API shape (Decimal fields
 * serialized as strings, dates as ISO strings, `status` a plain stored
 * column — see backend/src/modules/stock-transfer) and the shapes
 * StockTransferTable / TransferDetailsCard / StockTransferSummaryCards /
 * the status pages already expect. Every figure here comes straight from a
 * real StockTransfer row — a tenant with no transfers yet honestly shows
 * zeros/empty lists, never a placeholder number.
 */
import { formatPickerDate, parsePickerDate } from '../../components/form/FormDatePicker';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  return `${String(d.getDate()).padStart(2, '0')} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function num(value) {
  return value === null || value === undefined ? 0 : Number(value);
}

const STATUS_LABEL = {
  draft: 'Draft', 'in-transit': 'In Transit', received: 'Received', cancelled: 'Cancelled',
};

export function statusLabel(status) {
  return STATUS_LABEL[status] || status;
}

/** Row shape for StockTransferTable. */
export function toTransferRow(row) {
  return {
    id: row.id,
    code: row.code,
    date: formatDate(row.transferDate),
    fromOutlet: row.fromOutletName,
    toOutlet: row.toOutletName,
    estimatedValue: num(row.totalEstimatedValue),
    status: row.status,
    createdBy: row.createdBy,
  };
}

/** Full detail shape for TransferDetailsCard / TransferViewPage. */
export function toTransferDetails(row) {
  return {
    id: row.id,
    code: row.code,
    date: formatDate(row.transferDate),
    status: row.status,
    fromOutlet: row.fromOutletName,
    toOutlet: row.toOutletName,
    indentRef: row.indentRef || '-',
    department: row.department || '-',
    purpose: row.purpose || '-',
    priority: row.priority,
    referenceNo: row.referenceNo || '-',
    costCenter: row.costCenter || '-',
    totalItems: row.totalItems,
    totalTransferQty: num(row.totalTransferQty),
    estimatedValue: num(row.totalEstimatedValue),
    createdBy: row.createdBy,
    receivedBy: row.receivedBy || '-',
    receivedOn: row.receivedOn ? formatDate(row.receivedOn) : '-',
    remarks: row.remarks || '-',
    notes: row.notes || '',
    items: (row.items || []).map((item) => ({
      code: item.itemCode,
      name: item.itemName,
      hsn: item.hsnCode || '-',
      uom: item.uom || '-',
      transferQty: num(item.transferQty),
      availableQty: num(item.availableQty),
      unitCost: num(item.unitCost),
      totalCost: num(item.totalCost),
    })),
  };
}

/** 5-tile "Stock Transfer" summary strip — captions are honestly "All Time"
 * since getStockTransferSummary() aggregates every transfer ever created,
 * not a monthly window. */
export function buildSummary(summary) {
  const caption = 'All Time';
  return {
    totalTransfers: { value: summary?.totalTransfers || 0, caption },
    totalEstimatedValue: { value: summary?.totalEstimatedValue || 0, caption },
    received: { value: summary?.received || 0, caption },
    inTransit: { value: summary?.inTransit || 0, caption },
    cancelled: { value: summary?.cancelled || 0, caption },
  };
}

const STATUS_EXTRA_LABELS = {
  draft: ['Total Estimated Value', 'Average Transfer Value', 'Total Line Items'],
  'in-transit': ['Total Estimated Value', 'Average Transfer Value', 'Total Line Items'],
  received: ['Total Estimated Value', 'Average Transfer Value', 'Total Line Items'],
  cancelled: ['Total Estimated Value', 'Average Transfer Value', 'Total Line Items'],
};

/** 4-tile status-page strip (count + 3 real aggregates) for one status. */
export function buildStatusStats(status, statusSummary) {
  const labels = STATUS_EXTRA_LABELS[status] || STATUS_EXTRA_LABELS.draft;
  const caption = 'All Time';
  return {
    count: { value: statusSummary?.count || 0, caption },
    extra: [
      { label: labels[0], value: statusSummary?.totalEstimatedValue || 0, caption },
      { label: labels[1], value: statusSummary?.averageTransferValue || 0, caption },
      { label: labels[2], value: statusSummary?.totalItems || 0, caption },
    ],
  };
}

function itemToFormRow(item) {
  return {
    itemCode: item.itemCode || '',
    itemName: item.itemName || '',
    hsnCode: item.hsnCode || '',
    uom: item.uom || '',
    transferQty: item.transferQty !== null && item.transferQty !== undefined ? String(item.transferQty) : '',
    remarks: item.remarks || '',
  };
}

/** Converts a real API transfer row into the Create/Edit form's default
 * values — used only in edit mode (see CreateStockTransferPage). */
export function transferToFormValues(row, emptyItemRow) {
  return {
    transferDate: formatPickerDate(new Date(row.transferDate)),
    stockIndentRef: row.indentRef || '',
    fromOutlet: row.fromOutletId || '',
    toOutlet: row.toOutletId || '',
    department: row.department || '',
    purposeRemarks: row.purpose || '',
    priority: row.priority || '',
    referenceNo: row.referenceNo || '',
    costCenter: row.costCenter || '',
    remarks: row.remarks || '',
    notes: row.notes || '',
    items: row.items?.length ? row.items.map(itemToFormRow) : [emptyItemRow()],
  };
}

/** Converts the form's string-based values into the JSON payload the
 * backend's createStockTransferSchema/updateStockTransferSchema expect —
 * only rows with a non-blank Item Code are sent, same "filled row"
 * convention Stock Indent/Sales Quotation/Order/Invoice use. */
export function formValuesToPayload(values, { status, isBlankItemRow }) {
  const transferDate = parsePickerDate(values.transferDate);

  const items = values.items
    .filter((row) => !isBlankItemRow(row))
    .map((row) => ({
      itemCode: row.itemCode.trim(),
      itemName: row.itemName.trim(),
      hsnCode: row.hsnCode?.trim() || '',
      uom: row.uom?.trim() || '',
      transferQty: Number(row.transferQty),
      remarks: row.remarks?.trim() || '',
    }));

  return {
    transferDate: transferDate ? transferDate.toISOString() : undefined,
    indentRef: values.stockIndentRef?.trim() || '',
    fromOutletId: values.fromOutlet,
    toOutletId: values.toOutlet,
    department: values.department?.trim() || '',
    purpose: values.purposeRemarks?.trim() || '',
    priority: values.priority || 'medium',
    referenceNo: values.referenceNo?.trim() || '',
    costCenter: values.costCenter?.trim() || '',
    remarks: values.remarks?.trim() || '',
    notes: values.notes?.trim() || '',
    status,
    items,
  };
}
