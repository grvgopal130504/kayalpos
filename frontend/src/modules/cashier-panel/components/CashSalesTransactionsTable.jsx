import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, Chip, Pagination, Stack, Typography,
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
  { key: 'paymentMode', label: 'Payment Mode' },
  { key: 'cashier', label: 'Cashier' },
];

// `dateTime` arrives as a raw ISO timestamp from the API (Sale.createdAt) —
// formatted here, once, rather than baked into the row shape the backend
// returns.
function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

/**
 * "Recent Cash Sales Transactions" table — a plain data grid (not the
 * shared DataTable, since this one needs a footer Total row DataTable
 * doesn't support) plus a page-number Pagination control below, matching
 * the reference. `rows` is one page of real Sale rows from
 * GET /sales/cash-summary; pagination is server-side (`page`/`totalPages`
 * come straight from that response).
 */
export default function CashSalesTransactionsTable({
  rows, totalPages, page, onPageChange, loading,
}) {
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
    <Stack spacing={2} sx={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.15s ease' }}>
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 900 }}>
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
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={COLUMNS.length} sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    No cash sales on this date yet.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {rows.map((row, index) => (
              <TableRow key={row.invoiceNo} hover>
                <TableCell sx={{ color: 'text.secondary' }}>{index + 1}</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{row.invoiceNo}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDateTime(row.dateTime)}</TableCell>
                <TableCell>{row.items}</TableCell>
                <TableCell>{formatNumber(row.qty)}</TableCell>
                <TableCell>{row.discount.toFixed(2)}</TableCell>
                <TableCell>{row.tax.toFixed(2)}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(row.totalAmount, { decimals: true })}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(row.received, { decimals: true })}</TableCell>
                <TableCell>
                  <Chip
                    label={row.paymentMode}
                    size="small"
                    sx={{ bgcolor: 'rgba(34,160,107,0.12)', color: 'success.main', fontWeight: 700, height: 22 }}
                  />
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.cashier}</TableCell>
              </TableRow>
            ))}
            {rows.length > 0 && (
              <TableRow sx={{ '& td': { borderBottom: 'none', fontWeight: 800 } }}>
                <TableCell colSpan={3} />
                <TableCell>{totals.items}</TableCell>
                <TableCell>{formatNumber(totals.qty)}</TableCell>
                <TableCell>{totals.discount.toFixed(2)}</TableCell>
                <TableCell>{totals.tax.toFixed(2)}</TableCell>
                <TableCell>{formatCurrency(totals.totalAmount, { decimals: true })}</TableCell>
                <TableCell>{formatCurrency(totals.received, { decimals: true })}</TableCell>
                <TableCell colSpan={2} />
              </TableRow>
            )}
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
