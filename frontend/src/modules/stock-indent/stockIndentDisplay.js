/**
 * Shared mappers between the real Stock Indent API shape (Decimal fields
 * serialized as strings, dates as ISO strings, `status` a plain stored
 * column — see backend/src/modules/stock-indent) and the shapes
 * StockIndentTable / IndentDetailsCard / StockIndentSummaryCards / the
 * status pages already expect. Every figure here comes straight from a real
 * StockIndent row — a tenant with no indents yet honestly shows zeros/empty
 * lists, never a placeholder number.
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
  draft: 'Draft', 'pending-approval': 'Pending Approval', approved: 'Approved', rejected: 'Rejected',
};

export function statusLabel(status) {
  return STATUS_LABEL[status] || status;
}

/** Row shape for StockIndentTable. */
export function toIndentRow(row) {
  return {
    id: row.id,
    code: row.code,
    date: formatDate(row.indentDate),
    department: row.department,
    fromOutlet: row.fromOutletName,
    estimatedValue: num(row.totalEstimatedValue),
    status: row.status,
    createdBy: row.createdBy,
  };
}

/** Full detail shape for IndentDetailsCard / IndentViewPage. */
export function toIndentDetails(row) {
  return {
    id: row.id,
    code: row.code,
    date: formatDate(row.indentDate),
    requiredDate: formatDate(row.requiredDate),
    status: row.status,
    department: row.department,
    purpose: row.purpose || '-',
    fromOutlet: row.fromOutletName,
    toOutlet: row.toOutletName,
    location: row.locationName || '-',
    requestor: row.requestor,
    priority: row.priority,
    designation: row.designation || '-',
    referenceNo: row.referenceNo || '-',
    costCenter: row.costCenter || '-',
    totalItems: row.totalItems,
    totalRequiredQty: num(row.totalRequiredQty),
    // IndentDetailsCard reads this as `estimatedValue` (matching
    // StockIndentTable's own row.estimatedValue field name) — kept the same
    // name across both shapes so the two components share one convention.
    estimatedValue: num(row.totalEstimatedValue),
    createdBy: row.createdBy,
    approvedBy: row.approvedBy || '-',
    approvedOn: row.approvedOn ? formatDate(row.approvedOn) : '-',
    remarks: row.remarks || '-',
    notes: row.notes || '',
    items: (row.items || []).map((item) => ({
      code: item.itemCode,
      name: item.itemName,
      hsn: item.hsnCode || '-',
      uom: item.uom || '-',
      requiredQty: num(item.requiredQty),
      availableQty: num(item.availableQty),
      issueWarehouse: item.issueWarehouse || '-',
    })),
  };
}

/** 5-tile "Stock Indent" summary strip — captions are honestly "All Time"
 * since getStockIndentSummary() aggregates every indent ever created, not a
 * monthly window. */
export function buildSummary(summary) {
  const caption = 'All Time';
  return {
    totalIndents: { value: summary?.totalIndents || 0, caption },
    totalEstimatedValue: { value: summary?.totalEstimatedValue || 0, caption },
    approved: { value: summary?.approved || 0, caption },
    pendingApproval: { value: summary?.pendingApproval || 0, caption },
    rejected: { value: summary?.rejected || 0, caption },
  };
}

const STATUS_EXTRA_LABELS = {
  draft: ['Total Estimated Value', 'Average Indent Value', 'Total Line Items'],
  'pending-approval': ['Total Estimated Value', 'Average Indent Value', 'Total Line Items'],
  approved: ['Total Estimated Value', 'Average Indent Value', 'Total Line Items'],
  rejected: ['Total Estimated Value', 'Average Indent Value', 'Total Line Items'],
};

/** 4-tile status-page strip (count + 3 real aggregates) for one status. */
export function buildStatusStats(status, statusSummary) {
  const labels = STATUS_EXTRA_LABELS[status] || STATUS_EXTRA_LABELS.draft;
  const caption = 'All Time';
  return {
    count: { value: statusSummary?.count || 0, caption },
    extra: [
      { label: labels[0], value: statusSummary?.totalEstimatedValue || 0, caption },
      { label: labels[1], value: statusSummary?.averageIndentValue || 0, caption },
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
    requiredQty: item.requiredQty !== null && item.requiredQty !== undefined ? String(item.requiredQty) : '',
    issueWarehouse: item.issueWarehouse || '',
    remarks: item.remarks || '',
  };
}

/** Converts a real API indent row into the Create/Edit form's default
 * values — used only in edit mode (see CreateStockIndentPage). */
export function indentToFormValues(row, emptyItemRow) {
  return {
    indentDate: formatPickerDate(new Date(row.indentDate)),
    requiredDate: formatPickerDate(new Date(row.requiredDate)),
    department: row.department || '',
    purposeRemarks: row.purpose || '',
    fromOutlet: row.fromOutletId || '',
    toOutlet: row.toOutletId || '',
    requestor: row.requestor || '',
    priority: row.priority || '',
    designation: row.designation || '',
    referenceNo: row.referenceNo || '',
    location: row.locationId || '',
    costCenter: row.costCenter || '',
    remarks: row.remarks || '',
    notes: row.notes || '',
    items: row.items?.length ? row.items.map(itemToFormRow) : [emptyItemRow()],
  };
}

/** Converts the form's string-based values into the JSON payload the
 * backend's createStockIndentSchema/updateStockIndentSchema expect — only
 * rows with a non-blank Item Code are sent, same "filled row" convention
 * Sales Quotation/Order/Invoice use. */
export function formValuesToPayload(values, { status, isBlankItemRow }) {
  const indentDate = parsePickerDate(values.indentDate);
  const requiredDate = parsePickerDate(values.requiredDate);

  const items = values.items
    .filter((row) => !isBlankItemRow(row))
    .map((row) => ({
      itemCode: row.itemCode.trim(),
      itemName: row.itemName.trim(),
      hsnCode: row.hsnCode?.trim() || '',
      uom: row.uom?.trim() || '',
      requiredQty: Number(row.requiredQty),
      issueWarehouse: row.issueWarehouse?.trim() || '',
      remarks: row.remarks?.trim() || '',
    }));

  return {
    indentDate: indentDate ? indentDate.toISOString() : undefined,
    requiredDate: requiredDate ? requiredDate.toISOString() : undefined,
    department: values.department,
    purpose: values.purposeRemarks?.trim() || '',
    fromOutletId: values.fromOutlet,
    toOutletId: values.toOutlet,
    requestor: values.requestor.trim(),
    priority: values.priority,
    designation: values.designation?.trim() || '',
    referenceNo: values.referenceNo?.trim() || '',
    locationId: values.location?.trim() || '',
    costCenter: values.costCenter?.trim() || '',
    remarks: values.remarks?.trim() || '',
    notes: values.notes?.trim() || '',
    status,
    items,
  };
}
