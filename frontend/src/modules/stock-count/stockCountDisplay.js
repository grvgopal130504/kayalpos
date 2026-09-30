/**
 * Shared mappers between the real Stock Count API shape (Decimal fields
 * serialized as strings, dates as ISO strings, `status` a plain stored
 * column — see backend/src/modules/stock-count) and the shapes
 * StockCountTable / StockCountDetailsCard / StockCountSummaryCards already
 * expect. Every figure here comes straight from a real StockCount row — a
 * tenant with no counts yet honestly shows zeros/empty lists, never a
 * placeholder number.
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

const STATUS_LABEL = { draft: 'Draft', completed: 'Completed' };
const COUNT_TYPE_LABEL = { complete: 'Complete Count', partial: 'Partial Count' };
const COUNT_BY_LABEL = { 'item-wise': 'Item Wise Count', 'location-wise': 'Location Wise Count' };

export function statusLabel(status) {
  return STATUS_LABEL[status] || status;
}

/** Row shape for StockCountTable. */
export function toCountRow(row) {
  return {
    id: row.id,
    code: row.code,
    date: formatDate(row.countDate),
    warehouse: row.warehouse,
    countType: COUNT_TYPE_LABEL[row.countType] || row.countType,
    items: row.totalItems,
    varianceValue: num(row.totalVarianceValue),
    status: row.status,
  };
}

/** Full detail shape for StockCountDetailsCard / CountViewPage. */
export function toCountDetails(row) {
  return {
    id: row.id,
    code: row.code,
    date: formatDate(row.countDate),
    status: row.status,
    warehouse: row.warehouse,
    countType: COUNT_TYPE_LABEL[row.countType] || row.countType,
    countBy: COUNT_BY_LABEL[row.countBy] || row.countBy,
    department: row.department || '-',
    costCenter: row.costCenter || '-',
    countReason: row.countReason || '-',
    startCountTime: row.startCountTime || '-',
    endCountTime: row.endCountTime || '-',
    preparedBy: row.preparedBy || '-',
    approvedBy: row.approvedBy || '-',
    items: row.totalItems,
    varianceValue: num(row.totalVarianceValue),
    referenceNo: row.referenceNo || '-',
    binRack: row.binRack || '-',
    notes: row.notes || '',
    otherNotes: row.otherNotes || '',
    lineItems: (row.items || []).map((item) => ({
      code: item.itemCode,
      name: item.itemName,
      hsn: item.hsnCode || '-',
      uom: item.uom || '-',
      systemQty: num(item.systemQty),
      countedQty: num(item.countedQty),
      varianceQty: num(item.varianceQty),
      unitCost: num(item.unitCost),
      varianceValue: num(item.varianceValue),
    })),
  };
}

/** 5-tile "Stock Count" summary strip — "This Month" captions reflect the
 * real current-calendar-month window getStockCountSummary() computes for
 * completedThisMonth/varianceValue; the other three are honestly "All Time"
 * since they aggregate every count ever created. */
export function buildSummary(summary) {
  return {
    totalCounts: { value: summary?.totalCounts || 0, caption: 'All Time' },
    draftCounts: { value: summary?.draftCounts || 0, caption: 'Not Yet Completed' },
    completedCounts: { value: summary?.completedCounts || 0, caption: 'Completed' },
    completedThisMonth: { value: summary?.completedThisMonth || 0, caption: 'This Month' },
    varianceValue: { value: summary?.varianceValue || 0, caption: 'This Month' },
  };
}

function itemToFormRow(item) {
  return {
    itemCode: item.itemCode || '',
    itemName: item.itemName || '',
    hsnCode: item.hsnCode || '',
    uom: item.uom || '',
    systemQty: item.systemQty !== null && item.systemQty !== undefined ? String(item.systemQty) : '0.00',
    countedQty: item.countedQty !== null && item.countedQty !== undefined ? String(item.countedQty) : '0.00',
    unitCost: item.unitCost !== null && item.unitCost !== undefined ? String(item.unitCost) : '0.00',
    remarks: item.remarks || '',
  };
}

// The create form's radios use plain value tokens ('complete'/'partial',
// 'item-wise'/'location-wise') while the backend stores whatever those
// tokens are — round-tripped as-is, so edit mode always seeds the correct
// radio without a label-to-value guess.
function toCountTypeValue(value) {
  return value === 'partial' ? 'partial' : 'complete';
}
function toCountByValue(value) {
  return value === 'location-wise' ? 'location-wise' : 'item-wise';
}

/** Converts a real API count row into the Create/Edit form's default
 * values — used only in edit mode (see CreateStockCountPage). */
export function countToFormValues(row, emptyItemRow) {
  return {
    countDate: formatPickerDate(new Date(row.countDate)),
    warehouse: row.warehouse || '',
    department: row.department || '',
    costCenter: row.costCenter || '',
    countReason: row.countReason || '',
    countRemarks: row.countRemarks || '',

    countType: toCountTypeValue(row.countType),
    countBy: toCountByValue(row.countBy),
    binRack: row.binRack || '',
    startCountTime: row.startCountTime || '',
    endCountTime: row.endCountTime || '',

    referenceNo: row.referenceNo || '',
    preparedBy: row.preparedBy || '',
    approvedBy: row.approvedBy || '',
    otherNotes: row.otherNotes || '',

    notes: row.notes || '',
    items: row.items?.length ? row.items.map(itemToFormRow) : [emptyItemRow()],
  };
}

/** Converts the form's string-based values into the JSON payload the
 * backend's createStockCountSchema/updateStockCountSchema expect — only
 * rows with a non-blank Item Code are sent, same "filled row" convention
 * Stock Wastage/Stock Return use. */
export function formValuesToPayload(values, { status, isBlankItemRow }) {
  const countDate = parsePickerDate(values.countDate);

  const items = values.items
    .filter((row) => !isBlankItemRow(row))
    .map((row) => ({
      itemCode: row.itemCode.trim(),
      itemName: row.itemName.trim(),
      hsnCode: row.hsnCode?.trim() || '',
      uom: row.uom?.trim() || '',
      systemQty: row.systemQty ? Number(row.systemQty) : 0,
      countedQty: row.countedQty ? Number(row.countedQty) : 0,
      unitCost: row.unitCost ? Number(row.unitCost) : 0,
      remarks: row.remarks?.trim() || '',
    }));

  return {
    countDate: countDate ? countDate.toISOString() : undefined,
    warehouse: values.warehouse,
    department: values.department?.trim() || '',
    costCenter: values.costCenter?.trim() || '',
    countReason: values.countReason,
    countRemarks: values.countRemarks?.trim() || '',

    countType: values.countType,
    countBy: values.countBy,
    binRack: values.binRack?.trim() || '',
    startCountTime: values.startCountTime?.trim() || '',
    endCountTime: values.endCountTime?.trim() || '',

    referenceNo: values.referenceNo?.trim() || '',
    preparedBy: values.preparedBy?.trim() || '',
    approvedBy: values.approvedBy?.trim() || '',
    otherNotes: values.otherNotes?.trim() || '',

    notes: values.notes?.trim() || '',
    status,
    items,
  };
}
