/**
 * Shared mappers between the real Stock Return API shape (Decimal fields
 * serialized as strings, dates as ISO strings, `status` a plain stored
 * column — see backend/src/modules/stock-return) and the shapes
 * StockReturnTable / StockReturnDetailsCard / StockReturnSummaryCards
 * already expect. Every figure here comes straight from a real StockReturn
 * row — a tenant with no returns yet honestly shows zeros/empty lists,
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

const STATUS_LABEL = { draft: 'Draft', accepted: 'Accepted' };

export function statusLabel(status) {
  return STATUS_LABEL[status] || status;
}

/** Row shape for StockReturnTable. */
export function toReturnRow(row) {
  return {
    id: row.id,
    code: row.code,
    date: formatDate(row.returnDate),
    supplier: row.supplierName,
    returnType: row.returnType,
    referenceNo: row.referenceNo || '-',
    items: row.totalItems,
    totalValue: num(row.totalValue),
    status: row.status,
  };
}

/** Full detail shape for StockReturnDetailsCard / ReturnViewPage. */
export function toReturnDetails(row) {
  return {
    id: row.id,
    code: row.code,
    date: formatDate(row.returnDate),
    status: row.status,
    supplier: row.supplierName,
    returnType: row.returnType,
    fromOutlet: row.fromOutletName,
    contactPerson: row.contactPerson || '-',
    mobileNo: row.mobileNo || '-',
    referenceType: row.referenceType,
    referenceNo: row.referenceNo || '-',
    referenceDate: row.referenceDate ? formatDate(row.referenceDate) : '-',
    grnDcNo: row.grnDcNo || '-',
    vehicleNo: row.vehicleNo || '-',
    transporter: row.transporter || '-',
    costCenter: row.costCenter || '-',
    returnReason: row.returnReason || '',
    items: row.totalItems,
    totalValue: num(row.totalValue),
    createdBy: row.createdBy,
    acceptedBy: row.acceptedBy || '-',
    acceptedOn: row.acceptedOn ? formatDate(row.acceptedOn) : '-',
    remarks: row.returnRemarks || row.otherRemarks || '-',
    notes: row.notes || '',
    lineItems: (row.items || []).map((item) => ({
      code: item.itemCode,
      name: item.itemName,
      hsn: item.hsnCode || '-',
      uom: item.uom || '-',
      returnedQty: num(item.returnedQty),
      unitCost: num(item.unitCost),
      discount: num(item.discount),
      tax: num(item.tax),
      totalCost: num(item.totalCost),
    })),
  };
}

/** 5-tile "Stock Return" summary strip — "This Month" captions reflect the
 * real current-calendar-month window getStockReturnSummary() computes for
 * acceptedThisMonth/valueReturned; the other three are honestly "All Time"
 * since they aggregate every return ever created. */
export function buildSummary(summary) {
  return {
    totalReturns: { value: summary?.totalReturns || 0, caption: 'All Time' },
    draftReturns: { value: summary?.draftReturns || 0, caption: 'Not Yet Sent' },
    acceptedReturns: { value: summary?.acceptedReturns || 0, caption: 'Completed' },
    acceptedThisMonth: { value: summary?.acceptedThisMonth || 0, caption: 'This Month' },
    valueReturned: { value: summary?.valueReturned || 0, caption: 'This Month' },
  };
}

function itemToFormRow(item) {
  return {
    itemCode: item.itemCode || '',
    itemName: item.itemName || '',
    hsnCode: item.hsnCode || '',
    uom: item.uom || '',
    returnedQty: item.returnedQty !== null && item.returnedQty !== undefined ? String(item.returnedQty) : '',
    unitCost: item.unitCost !== null && item.unitCost !== undefined ? String(item.unitCost) : '0.00',
    discount: item.discount !== null && item.discount !== undefined ? String(item.discount) : '0.00',
    tax: item.tax !== null && item.tax !== undefined ? String(item.tax) : '0.00',
    warehouse: item.warehouse || '',
    batchNo: item.batchNo || '',
    expiryDate: item.expiryDate ? formatPickerDate(new Date(item.expiryDate)) : '',
    remarks: item.remarks || '',
  };
}

/** Converts a real API return row into the Create/Edit form's default
 * values — used only in edit mode (see CreateStockReturnPage). */
export function returnToFormValues(row, emptyItemRow) {
  return {
    returnDate: formatPickerDate(new Date(row.returnDate)),
    returnType: row.returnType || '',
    referenceType: row.referenceType || '',
    referenceNo: row.referenceNo || '',
    referenceDate: row.referenceDate ? formatPickerDate(new Date(row.referenceDate)) : '',
    returnReason: row.returnReason || '',
    returnRemarks: row.returnRemarks || '',

    supplier: row.supplierId || '',
    fromOutlet: row.fromOutletId || '',
    costCenter: row.costCenter || '',
    contactPerson: row.contactPerson || '',
    mobileNo: row.mobileNo || '',

    grnDcNo: row.grnDcNo || '',
    grnDcDate: row.grnDcDate ? formatPickerDate(new Date(row.grnDcDate)) : '',
    vehicleNo: row.vehicleNo || '',
    transporter: row.transporter || '',
    otherRemarks: row.otherRemarks || '',

    notes: row.notes || '',
    items: row.items?.length ? row.items.map(itemToFormRow) : [emptyItemRow()],
  };
}

/** Converts the form's string-based values into the JSON payload the
 * backend's createStockReturnSchema/updateStockReturnSchema expect — only
 * rows with a non-blank Item Code are sent, same "filled row" convention
 * Stock Receipt/Stock Indent/Stock Transfer use. */
export function formValuesToPayload(values, { status, isBlankItemRow }) {
  const returnDate = parsePickerDate(values.returnDate);
  const referenceDate = values.referenceDate ? parsePickerDate(values.referenceDate) : null;
  const grnDcDate = values.grnDcDate ? parsePickerDate(values.grnDcDate) : null;

  const items = values.items
    .filter((row) => !isBlankItemRow(row))
    .map((row) => {
      const expiryDate = row.expiryDate ? parsePickerDate(row.expiryDate) : null;
      return {
        itemCode: row.itemCode.trim(),
        itemName: row.itemName.trim(),
        hsnCode: row.hsnCode?.trim() || '',
        uom: row.uom?.trim() || '',
        returnedQty: Number(row.returnedQty),
        unitCost: row.unitCost ? Number(row.unitCost) : 0,
        discount: row.discount ? Number(row.discount) : 0,
        tax: row.tax ? Number(row.tax) : 0,
        warehouse: row.warehouse?.trim() || '',
        batchNo: row.batchNo?.trim() || '',
        expiryDate: expiryDate ? expiryDate.toISOString() : null,
        remarks: row.remarks?.trim() || '',
      };
    });

  return {
    returnDate: returnDate ? returnDate.toISOString() : undefined,
    returnType: values.returnType,
    referenceType: values.referenceType,
    referenceNo: values.referenceNo?.trim() || '',
    referenceDate: referenceDate ? referenceDate.toISOString() : null,
    returnReason: values.returnReason?.trim() || '',
    returnRemarks: values.returnRemarks?.trim() || '',

    supplierId: values.supplier,
    fromOutletId: values.fromOutlet,
    costCenter: values.costCenter?.trim() || '',
    contactPerson: values.contactPerson?.trim() || '',
    mobileNo: values.mobileNo?.trim() || '',

    grnDcNo: values.grnDcNo?.trim() || '',
    grnDcDate: grnDcDate ? grnDcDate.toISOString() : null,
    vehicleNo: values.vehicleNo?.trim() || '',
    transporter: values.transporter?.trim() || '',
    otherRemarks: values.otherRemarks?.trim() || '',

    notes: values.notes?.trim() || '',
    status,
    items,
  };
}
