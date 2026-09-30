/**
 * Shared mappers between the real Stock Wastage API shape (Decimal fields
 * serialized as strings, dates as ISO strings, `status` a plain stored
 * column — see backend/src/modules/stock-wastage) and the shapes
 * StockWastageTable / StockWastageDetailsCard / StockWastageSummaryCards
 * already expect. Every figure here comes straight from a real StockWastage
 * row — a tenant with no wastages yet honestly shows zeros/empty lists,
 * never a placeholder number.
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

const STATUS_LABEL = { draft: 'Draft', approved: 'Approved' };

export function statusLabel(status) {
  return STATUS_LABEL[status] || status;
}

/** Row shape for StockWastageTable. */
export function toWastageRow(row) {
  return {
    id: row.id,
    code: row.code,
    date: formatDate(row.wastageDate),
    outlet: row.outletName,
    wastageType: row.wastageType,
    items: row.totalItems,
    wastageValue: num(row.totalValue),
    status: row.status,
  };
}

/** Full detail shape for StockWastageDetailsCard / WastageViewPage. */
export function toWastageDetails(row) {
  return {
    id: row.id,
    code: row.code,
    date: formatDate(row.wastageDate),
    status: row.status,
    outletLocation: row.outletName,
    wastageType: row.wastageType,
    department: row.department || '-',
    costCenter: row.costCenter || '-',
    warehouse: row.warehouse || '-',
    binRack: row.binRack || '-',
    wastageReason: row.wastageReason || '',
    preparedBy: row.preparedBy || '-',
    approvedBy: row.approvedBy || '-',
    items: row.totalItems,
    wastageValue: num(row.totalValue),
    referenceNo: row.referenceNo || '-',
    notes: row.notes || '',
    lineItems: (row.items || []).map((item) => ({
      code: item.itemCode,
      name: item.itemName,
      hsn: item.hsnCode || '-',
      uom: item.uom || '-',
      batchNo: item.batchNo || '-',
      expiryDate: item.expiryDate ? formatDate(item.expiryDate) : '-',
      availableQty: num(item.availableQty),
      wastageQty: num(item.wastageQty),
      unitCost: num(item.unitCost),
      totalValue: num(item.totalValue),
    })),
  };
}

/** 5-tile "Stock Wastage" summary strip — "This Month" captions reflect the
 * real current-calendar-month window getStockWastageSummary() computes for
 * approvedThisMonth/valueWasted; the other three are honestly "All Time"
 * since they aggregate every wastage ever created. */
export function buildSummary(summary) {
  return {
    totalWastages: { value: summary?.totalWastages || 0, caption: 'All Time' },
    draftWastages: { value: summary?.draftWastages || 0, caption: 'Not Yet Approved' },
    approvedWastages: { value: summary?.approvedWastages || 0, caption: 'Completed' },
    approvedThisMonth: { value: summary?.approvedThisMonth || 0, caption: 'This Month' },
    valueWasted: { value: summary?.valueWasted || 0, caption: 'This Month' },
  };
}

function itemToFormRow(item) {
  return {
    itemCode: item.itemCode || '',
    itemName: item.itemName || '',
    hsnCode: item.hsnCode || '',
    uom: item.uom || '',
    batchNo: item.batchNo || '',
    expiryDate: item.expiryDate ? formatPickerDate(new Date(item.expiryDate)) : '',
    availableQty: item.availableQty !== null && item.availableQty !== undefined ? String(item.availableQty) : '0.00',
    wastageQty: item.wastageQty !== null && item.wastageQty !== undefined ? String(item.wastageQty) : '',
    unitCost: item.unitCost !== null && item.unitCost !== undefined ? String(item.unitCost) : '0.00',
    remarks: item.remarks || '',
  };
}

/** Converts a real API wastage row into the Create/Edit form's default
 * values — used only in edit mode (see CreateStockWastagePage). */
export function wastageToFormValues(row, emptyItemRow) {
  return {
    wastageDate: formatPickerDate(new Date(row.wastageDate)),
    wastageType: row.wastageType || '',
    department: row.department || '',
    costCenter: row.costCenter || '',
    wastageReason: row.wastageReason || '',
    wastageRemarks: row.wastageRemarks || '',

    outletLocation: row.outletId || '',
    warehouse: row.warehouse || '',
    binRack: row.binRack || '',

    referenceNo: row.referenceNo || '',
    preparedBy: row.preparedBy || '',
    approvedBy: row.approvedBy || '',

    notes: row.notes || '',
    items: row.items?.length ? row.items.map(itemToFormRow) : [emptyItemRow()],
  };
}

/** Converts the form's string-based values into the JSON payload the
 * backend's createStockWastageSchema/updateStockWastageSchema expect — only
 * rows with a non-blank Item Code are sent, same "filled row" convention
 * Stock Return/Stock Receipt use. */
export function formValuesToPayload(values, { status, isBlankItemRow }) {
  const wastageDate = parsePickerDate(values.wastageDate);

  const items = values.items
    .filter((row) => !isBlankItemRow(row))
    .map((row) => {
      const expiryDate = row.expiryDate ? parsePickerDate(row.expiryDate) : null;
      return {
        itemCode: row.itemCode.trim(),
        itemName: row.itemName.trim(),
        hsnCode: row.hsnCode?.trim() || '',
        uom: row.uom?.trim() || '',
        batchNo: row.batchNo?.trim() || '',
        expiryDate: expiryDate ? expiryDate.toISOString() : null,
        availableQty: row.availableQty ? Number(row.availableQty) : 0,
        wastageQty: Number(row.wastageQty),
        unitCost: row.unitCost ? Number(row.unitCost) : 0,
        remarks: row.remarks?.trim() || '',
      };
    });

  return {
    wastageDate: wastageDate ? wastageDate.toISOString() : undefined,
    wastageType: values.wastageType,
    department: values.department?.trim() || '',
    costCenter: values.costCenter?.trim() || '',
    wastageReason: values.wastageReason?.trim() || '',
    wastageRemarks: values.wastageRemarks?.trim() || '',

    outletId: values.outletLocation,
    warehouse: values.warehouse?.trim() || '',
    binRack: values.binRack?.trim() || '',

    referenceNo: values.referenceNo?.trim() || '',
    preparedBy: values.preparedBy?.trim() || '',
    approvedBy: values.approvedBy?.trim() || '',

    notes: values.notes?.trim() || '',
    status,
    items,
  };
}
