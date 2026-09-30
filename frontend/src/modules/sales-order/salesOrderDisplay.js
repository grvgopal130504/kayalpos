/**
 * Shared mappers between the real Sales Order API shape (Decimal fields
 * serialized as strings, dates as ISO strings, `status` a plain stored
 * column — see backend/src/modules/sales-order) and the shapes
 * SalesOrderTable / OrderDetailsCard / SalesOrderSummaryCards / the status
 * pages already expect. Every figure here comes straight from a real
 * SalesOrder row — a tenant with no orders yet honestly shows zeros/empty
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

const STATUS_LABEL = { pending: 'Pending', confirmed: 'Confirmed', delivered: 'Delivered' };

export function statusLabel(status) {
  return STATUS_LABEL[status] || status;
}

/** Row shape for SalesOrderTable. */
export function toOrderRow(row) {
  return {
    id: row.id,
    code: row.code,
    date: formatDate(row.orderDate),
    customer: row.customerName,
    amount: num(row.grandTotal),
    deliveryDate: formatDate(row.deliveryDate),
    status: row.status,
    createdBy: row.createdBy,
  };
}

/** Full detail shape for OrderDetailsCard / OrderViewPage. */
export function toOrderDetails(row) {
  const sgstRate = 2.5;
  const cgstRate = 2.5;
  return {
    id: row.id,
    code: row.code,
    date: formatDate(row.orderDate),
    ref: row.quotationRef || '-',
    status: row.status,
    totalAmount: num(row.grandTotal),
    customer: {
      name: row.customerName,
      mobile: row.mobile || '-',
      email: row.email || '-',
      address: row.address || '-',
    },
    deliveryDate: formatDate(row.deliveryDate),
    paymentTerms: row.paymentTerms || '-',
    salesPerson: row.salesPerson,
    createdBy: row.createdBy,
    deliveredOn: row.deliveredOn ? formatDate(row.deliveredOn) : '-',
    items: (row.items || []).map((item) => ({
      code: item.itemCode,
      name: item.itemName,
      hsn: item.hsnCode || '-',
      qty: num(item.qty),
      unitPrice: num(item.unitPrice),
      discount: num(item.discountAmount),
      amount: num(item.amount),
    })),
    totals: {
      subTotal: num(row.subTotal),
      discount: num(row.discountAmount),
      taxableAmount: num(row.taxableAmount),
      sgst: { rate: sgstRate, amount: num(row.sgstAmount) },
      cgst: { rate: cgstRate, amount: num(row.cgstAmount) },
      grandTotal: num(row.grandTotal),
    },
  };
}

/** 5-tile "Sales Order" summary strip — captions are honestly "All Time"
 * since getSalesOrderSummary() aggregates every order ever created, not a
 * monthly window. */
export function buildSummary(summary) {
  const caption = 'All Time';
  return {
    totalOrders: { value: summary?.totalOrders || 0, caption },
    totalAmount: { value: summary?.totalAmount || 0, caption },
    confirmed: { value: summary?.confirmed || 0, caption },
    pending: { value: summary?.pending || 0, caption },
    delivered: { value: summary?.delivered || 0, caption },
  };
}

const STATUS_EXTRA_LABELS = {
  pending: ['Total Pending Amount', 'Average Order Value', 'Total Line Items'],
  confirmed: ['Total Confirmed Amount', 'Average Order Value', 'Total Line Items'],
  delivered: ['Total Delivered Amount', 'Average Order Value', 'Total Line Items'],
};

/** 4-tile status-page strip (count + 3 real aggregates) for one status. */
export function buildStatusStats(status, statusSummary) {
  const labels = STATUS_EXTRA_LABELS[status] || STATUS_EXTRA_LABELS.pending;
  const caption = 'All Time';
  return {
    count: { value: statusSummary?.count || 0, caption },
    extra: [
      { label: labels[0], value: statusSummary?.totalAmount || 0, currency: true, caption },
      { label: labels[1], value: statusSummary?.averageAmount || 0, currency: true, caption },
      { label: labels[2], value: statusSummary?.totalItems || 0, currency: false, caption },
    ],
  };
}

function itemRowToFormRow(item) {
  return {
    itemCode: item.itemCode || '',
    itemName: item.itemName || '',
    hsnCode: item.hsnCode || '',
    qty: item.qty !== null && item.qty !== undefined ? String(item.qty) : '',
    unit: item.unit || '',
    unitPrice: item.unitPrice !== null && item.unitPrice !== undefined ? String(item.unitPrice) : '',
    discountPercent: item.discountPercent !== null && item.discountPercent !== undefined ? String(item.discountPercent) : '',
    taxCode: item.taxCode || '',
  };
}

/** Converts a real API order row into the Create/Edit form's default
 * values — used only in edit mode (see CreateSalesOrderPage). */
export function orderToFormValues(row, emptyItemRow) {
  return {
    customerId: row.customerId || '',
    contactPerson: row.contactPerson || '',
    mobile: row.mobile || '',
    email: row.email || '',
    address: row.address || '',
    orderDate: formatPickerDate(new Date(row.orderDate)),
    deliveryDate: formatPickerDate(new Date(row.deliveryDate)),
    paymentTerms: row.paymentTerms || '',
    salesPerson: row.salesPerson || '',
    currency: row.currency || 'INR',
    quotationRef: row.quotationRef || '',
    referenceDate: row.referenceDate ? formatPickerDate(new Date(row.referenceDate)) : '',
    priceList: row.priceList || '',
    remarks: row.remarks || '',
    notes: row.notes || '',
    extraDiscount: row.extraDiscount !== null && row.extraDiscount !== undefined ? String(row.extraDiscount) : '0',
    items: row.items?.length ? row.items.map(itemRowToFormRow) : [emptyItemRow()],
  };
}

/** Converts the form's string-based values into the JSON payload the
 * backend's createSalesOrderSchema/updateSalesOrderSchema expect — dates
 * parsed back to real Date objects, numbers coerced, and any still-blank
 * spare item rows dropped (see isBlankItemRow in createSalesOrderSchema.js)
 * so they never reach the "add at least one item" validation as empty
 * entries. */
export function formValuesToPayload(values, { status, isBlankItemRow }) {
  const orderDate = parsePickerDate(values.orderDate);
  const deliveryDate = parsePickerDate(values.deliveryDate);
  const referenceDate = values.referenceDate ? parsePickerDate(values.referenceDate) : null;

  const items = values.items
    .filter((row) => !isBlankItemRow(row))
    .map((row) => ({
      itemCode: row.itemCode.trim(),
      itemName: row.itemName.trim(),
      hsnCode: row.hsnCode?.trim() || '',
      qty: Number(row.qty),
      unit: row.unit?.trim() || '',
      unitPrice: Number(row.unitPrice),
      discountPercent: row.discountPercent ? Number(row.discountPercent) : 0,
      taxCode: row.taxCode?.trim() || '',
    }));

  return {
    customerId: values.customerId,
    contactPerson: values.contactPerson?.trim() || '',
    mobile: values.mobile?.trim() || '',
    email: values.email?.trim() || '',
    address: values.address?.trim() || '',
    orderDate: orderDate ? orderDate.toISOString() : undefined,
    deliveryDate: deliveryDate ? deliveryDate.toISOString() : undefined,
    paymentTerms: values.paymentTerms?.trim() || '',
    salesPerson: values.salesPerson,
    currency: values.currency || 'INR',
    quotationRef: values.quotationRef?.trim() || '',
    referenceDate: referenceDate ? referenceDate.toISOString() : null,
    priceList: values.priceList?.trim() || '',
    remarks: values.remarks?.trim() || '',
    notes: values.notes?.trim() || '',
    extraDiscount: values.extraDiscount ? Number(values.extraDiscount) : 0,
    status,
    items,
  };
}
