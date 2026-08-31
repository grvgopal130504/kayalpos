import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, Chip, Stack, Pagination,
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
  { key: 'paymentMode', label: 'Payment Mode' },
  { key: 'reference', label: 'Reference / Details' },
  { key: 'cashier', label: 'Cashier' },
];

// One color per "other" payment mode so each row's chip stays instantly
// scannable, mirroring the reference's distinct chip colors.
const MODE_COLORS = {
  'Store Credit': { bg: 'rgba(219,39,119,0.12)', color: '#DB2777' },
  'Gift Card': { bg: 'rgba(245,166,35,0.15)', color: '#B5730A' },
  Wallet: { bg: 'rgba(37,99,235,0.12)', color: '#2563EB' },
  Cheque: { bg: 'rgba(34,160,107,0.12)', color: '#22A06B' },
  'Bank Transfer': { bg: 'rgba(139,92,246,0.12)', color: '#8B5CF6' },
};

/**
 * "Recent Other Payments Transactions" table — same footer-Total-row +
 * page-number Pagination pattern as the other tender tables, with
 * Payment Mode / Reference-Details columns for the miscellaneous tender
 * types (store credit, gift card, wallet, cheque, bank transfer) this
 * report covers. Note there's no Received (₹) column here — unlike cash/
 * card/UPI, several of these modes (loyalty redemption, gift card) don't
 * carry a separate "amount tendered vs due" figure, so Total Amount is
 * the only money column, matching the reference.
 */
export default function OtherPaymentsTransactionsTable({ rows, totalPages, page, onPageChange }) {
  const totals = rows.reduce(
    (acc, row) => ({
      items: acc.items + row.items,
      qty: acc.qty + row.qty,
      discount: acc.discount + row.discount,
      tax: acc.tax + row.tax,
      totalAmount: acc.totalAmount + row.totalAmount,
    }),
    { items: 0, qty: 0, discount: 0, tax: 0, totalAmount: 0 },
  );

  return (
    <Stack spacing={2}>
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 1000 }}>
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
            {rows.map((row, index) => {
              const chip = MODE_COLORS[row.paymentMode] || MODE_COLORS.Wallet;
              return (
                <TableRow key={row.invoiceNo} hover>
                  <TableCell sx={{ color: 'text.secondary' }}>{index + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{row.invoiceNo}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.dateTime}</TableCell>
                  <TableCell>{row.items}</TableCell>
                  <TableCell>{formatNumber(row.qty)}</TableCell>
                  <TableCell>{row.discount.toFixed(2)}</TableCell>
                  <TableCell>{row.tax.toFixed(2)}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(row.totalAmount, { decimals: true })}</TableCell>
                  <TableCell>
                    <Chip label={row.paymentMode} size="small" sx={{ bgcolor: chip.bg, color: chip.color, fontWeight: 700, height: 22 }} />
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.reference}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.cashier}</TableCell>
                </TableRow>
              );
            })}
            <TableRow sx={{ '& td': { borderBottom: 'none', fontWeight: 800 } }}>
              <TableCell colSpan={3} />
              <TableCell>{totals.items}</TableCell>
              <TableCell>{formatNumber(totals.qty)}</TableCell>
              <TableCell>{totals.discount.toFixed(2)}</TableCell>
              <TableCell>{totals.tax.toFixed(2)}</TableCell>
              <TableCell>{formatCurrency(totals.totalAmount, { decimals: true })}</TableCell>
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
