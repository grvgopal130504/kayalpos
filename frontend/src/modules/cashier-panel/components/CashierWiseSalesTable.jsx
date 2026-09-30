import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, Stack, Typography, Pagination,
} from '@mui/material';

import { formatCurrency, formatNumber } from '../../../utils/format';

const COLUMNS = [
  { key: 'index', label: '#' },
  { key: 'code', label: 'Cashier Code' },
  { key: 'name', label: 'Cashier Name' },
  { key: 'totalSales', label: 'Total Sales (₹)' },
  { key: 'transactions', label: 'Transactions' },
  { key: 'invoices', label: 'Invoices' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'avgInvoiceValue', label: 'Average Invoice Value (₹)' },
  { key: 'discount', label: 'Discount (₹)' },
  { key: 'returns', label: 'Returns (₹)' },
  { key: 'netSales', label: 'Net Sales (₹)' },
  { key: 'contribution', label: '% Contribution' },
];

/**
 * "Cashier Wise Sales Details" table — a per-cashier breakdown rather than
 * a per-transaction log like the other cashier-panel report tables, so it
 * skips the row-chip conventions and just renders each cashier's totals
 * plain, with a footer Total row summing every numeric column. `rows` is
 * one page of real per-cashier totals from GET /cashier-wise-sales/
 * summary (see cashierWiseSales.service.js's getCashierWiseSalesReport);
 * pagination is server-side (`page`/`totalPages` come straight from that
 * response), same convention as every other cashier-panel report table.
 */
export default function CashierWiseSalesTable({
  rows, totalPages, page, onPageChange, loading,
}) {
  const totals = rows.reduce(
    (acc, row) => ({
      totalSales: acc.totalSales + row.totalSales,
      transactions: acc.transactions + row.transactions,
      invoices: acc.invoices + row.invoices,
      quantity: acc.quantity + row.quantity,
      discount: acc.discount + row.discount,
      returns: acc.returns + row.returns,
      netSales: acc.netSales + row.netSales,
      contributionPercent: acc.contributionPercent + row.contributionPercent,
    }),
    { totalSales: 0, transactions: 0, invoices: 0, quantity: 0, discount: 0, returns: 0, netSales: 0, contributionPercent: 0 },
  );
  const avgInvoiceValue = totals.invoices ? totals.totalSales / totals.invoices : 0;

  return (
    <Stack spacing={2} sx={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.15s ease' }}>
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 1350 }}>
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
                    No cashier sold anything on this date yet.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {rows.map((row, index) => (
              <TableRow key={row.code} hover>
                <TableCell sx={{ color: 'text.secondary' }}>{index + 1}</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{row.code}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.name}</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{formatCurrency(row.totalSales, { decimals: true })}</TableCell>
                <TableCell>{formatNumber(row.transactions)}</TableCell>
                <TableCell>{formatNumber(row.invoices)}</TableCell>
                <TableCell>{formatNumber(row.quantity)}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatCurrency(row.avgInvoiceValue, { decimals: true })}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', color: 'error.main' }}>{formatCurrency(row.discount, { decimals: true })}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', color: 'error.main' }}>{formatCurrency(row.returns, { decimals: true })}</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{formatCurrency(row.netSales, { decimals: true })}</TableCell>
                <TableCell>{row.contributionPercent.toFixed(2)}%</TableCell>
              </TableRow>
            ))}
            {rows.length > 0 && (
              <TableRow sx={{ '& td': { borderBottom: 'none', fontWeight: 800 } }}>
                <TableCell colSpan={3}>Total</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatCurrency(totals.totalSales, { decimals: true })}</TableCell>
                <TableCell>{formatNumber(totals.transactions)}</TableCell>
                <TableCell>{formatNumber(totals.invoices)}</TableCell>
                <TableCell>{formatNumber(totals.quantity)}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatCurrency(avgInvoiceValue, { decimals: true })}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatCurrency(totals.discount, { decimals: true })}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatCurrency(totals.returns, { decimals: true })}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatCurrency(totals.netSales, { decimals: true })}</TableCell>
                <TableCell>{totals.contributionPercent.toFixed(2)}%</TableCell>
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
