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
  { key: 'cardType', label: 'Card Type' },
  { key: 'cardLast4', label: 'Card No (Last 4)' },
  { key: 'bank', label: 'Bank / Provider' },
  { key: 'cashier', label: 'Cashier' },
];

/**
 * Small text badge standing in for each card network's logo (VISA,
 * Mastercard, RuPay) — no external logo assets, just brand-ish
 * colored/styled text so the column stays instantly scannable like the
 * reference's real logos.
 */
function CardBrandBadge({ type }) {
  if (type === 'Mastercard') {
    return (
      <Stack direction="row" spacing={0} sx={{ alignItems: 'center', width: 34 }}>
        <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: '#EB001B', opacity: 0.85 }} />
        <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: '#F79E1B', opacity: 0.85, ml: '-8px' }} />
      </Stack>
    );
  }
  if (type === 'RuPay') {
    return (
      <Typography sx={{ fontWeight: 800, fontStyle: 'italic', fontSize: 14, whiteSpace: 'nowrap' }}>
        <Box component="span" sx={{ color: '#0B3D91' }}>Ru</Box>
        <Box component="span" sx={{ color: '#F26B21' }}>Pay</Box>
      </Typography>
    );
  }
  return (
    <Typography sx={{ fontWeight: 800, fontStyle: 'italic', color: '#1A1F71', fontSize: 14, whiteSpace: 'nowrap' }}>
      VISA
    </Typography>
  );
}

/**
 * "Recent Card Sales Transactions" table — same footer-Total-row +
 * page-number Pagination pattern as CashSalesTransactionsTable, with
 * Payment Mode swapped for Card Type / Card No (Last 4) / Bank-Provider
 * columns since a card sale's identifying details differ from a cash
 * sale's.
 */
export default function CardSalesTransactionsTable({ rows, totalPages, page, onPageChange }) {
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
        <Table size="small" sx={{ minWidth: 1100 }}>
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
                <TableCell><CardBrandBadge type={row.cardType} /></TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>**** {row.cardLast4}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.bank}</TableCell>
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
              <TableCell colSpan={4} />
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
