import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, Typography, Stack, Pagination,
} from '@mui/material';

import { formatCurrency, formatNumber } from '../../../utils/format';

const COLUMNS = [
  { key: 'index', label: '#' },
  { key: 'invoiceNo', label: 'Invoice No' },
  { key: 'dateTime', label: 'Date & Time' },
  { key: 'items', label: 'Items' },
  { key: 'qty', label: 'Qty' },
  { key: 'discount', label: 'Discount (₹)' },
  { key: 'tax', label: 'Tax (₹)' },
  { key: 'totalAmount', label: 'Total Amount (₹)' },
  { key: 'received', label: 'Received (₹)' },
  { key: 'upiApp', label: 'UPI App' },
  { key: 'upiTxnId', label: 'UPI Transaction ID' },
  { key: 'cashier', label: 'Cashier' },
];

const UPI_APPS = {
  PhonePe: { color: '#5F259F' },
  GPay: { color: '#4285F4' },
  Paytm: { color: '#00BAF2' },
  BHIM: { color: '#0B3D91' },
};

/**
 * Small text-in-a-circle badge standing in for each UPI app's logo
 * (PhonePe, GPay, Paytm, BHIM) — no external logo assets, just a
 * brand-colored initial badge plus the app name, matching the reference's
 * scannable per-row app identity.
 */
function UpiAppBadge({ app }) {
  const { color } = UPI_APPS[app] || UPI_APPS.PhonePe;
  return (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
      <Box
        sx={{
          width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: color, color: '#fff', fontSize: 11, fontWeight: 800,
        }}
      >
        {app[0]}
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{app}</Typography>
    </Stack>
  );
}

/**
 * "Recent UPI Sales Transactions" table — same footer-Total-row +
 * page-number Pagination pattern as CashSalesTransactionsTable /
 * CardSalesTransactionsTable, with UPI App / UPI Transaction ID columns
 * in place of Payment Mode / Card details.
 */
export default function UpiSalesTransactionsTable({ rows, totalPages, page, onPageChange }) {
  const totals = rows.reduce(
    (acc, row) => ({
      items: acc.items + row.items,
      qty: acc.qty + row.qty,
      discount: acc.discount + row.discount,
      tax: acc.tax + row.tax,
      totalAmount: acc.totalAmount + row.totalAmount,
      received: acc.received + row.received,
    }),
    { items: 0, qty: 0, discount: 0, tax: 0, totalAmount: 0, received: 0 },
  );

  return (
    <Stack spacing={2}>
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 1050 }}>
          <TableHead>
            <TableRow>
              {COLUMNS.map((col) => (
                <TableCell key={col.key} sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 12.5, whiteSpace: 'nowrap' }}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.invoiceNo} hover>
                <TableCell sx={{ color: 'text.secondary' }}>{index + 1}</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{row.invoiceNo}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.dateTime}</TableCell>
                <TableCell>{row.items}</TableCell>
                <TableCell>{formatNumber(row.qty)}</TableCell>
                <TableCell>{row.discount.toFixed(2)}</TableCell>
                <TableCell>{row.tax.toFixed(2)}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(row.totalAmount, { decimals: true })}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(row.received, { decimals: true })}</TableCell>
                <TableCell><UpiAppBadge app={row.upiApp} /></TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: 12.5 }}>{row.upiTxnId}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.cashier}</TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ '& td': { borderBottom: 'none', fontWeight: 800 } }}>
              <TableCell colSpan={3} />
              <TableCell>{totals.items}</TableCell>
              <TableCell>{formatNumber(totals.qty)}</TableCell>
              <TableCell>{totals.discount.toFixed(2)}</TableCell>
              <TableCell>{totals.tax.toFixed(2)}</TableCell>
              <TableCell>{formatCurrency(totals.totalAmount, { decimals: true })}</TableCell>
              <TableCell>{formatCurrency(totals.received, { decimals: true })}</TableCell>
              <TableCell colSpan={3} />
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      {totalPages > 1 && (
        <Stack direction="row" sx={{ justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_e, value) => onPageChange(value)}
            showFirstButton
            showLastButton
            color="primary"
            shape="rounded"
          />
        </Stack>
      )}
    </Stack>
  );
}
