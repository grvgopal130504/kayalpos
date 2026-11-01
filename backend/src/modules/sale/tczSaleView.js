// Readers (cashier panel, dashboard, shift/cash modules ...) were written against
// the old Sale row. Linesales is the only sales store now; this renames a Linesales
// row's fields to the names those readers use, so their report maths is unchanged:
//   DocEntry->id, DocNum->billNo, CreatedBy->cashierName, CreateDate->createdAt,
//   PayMode->paymentMethod, Received->receivedAmount, DocStatus->status, PayRef->paymentReference
// Fields that already share a name (grandTotal, subTotal, taxAmount, discountAmount,
// changeAmount, outletId, customerId, customerName, cardType ...) pass through.
// Fields not present on the row are simply not added.
const RENAME = {
  docEntry: 'id', docNum: 'billNo', createdBy: 'cashierName', createDate: 'createdAt',
  payMode: 'paymentMethod', received: 'receivedAmount', docStatus: 'status', payRef: 'paymentReference',
};

export function asSale(row) {
  if (!row) return row;
  const out = {};
  Object.keys(row).forEach((key) => {
    const to = RENAME[key] || key;
    out[to] = key === 'docEntry' ? String(row[key]) : row[key];
  });
  return out;
}

/** groupBy rows: rename the grouped key and the summed fields back. */
export function asSaleGroup(row) {
  const out = { ...row };
  if ('payMode' in row) { out.paymentMethod = row.payMode; delete out.payMode; }
  if (row._sum) {
    out._sum = { ...row._sum };
    if ('received' in row._sum) { out._sum.receivedAmount = row._sum.received; delete out._sum.received; }
  }
  return out;
}
