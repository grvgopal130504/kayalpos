import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, Chip, Stack, Pagination, Typography,
} from '@mui/material';

import { formatCurrency } from '../../../utils/format';

const COLUMNS = [
  { key: 'index', label: '#' },
  { key: 'dateTime', label: 'Date & Time' },
  { key: 'referenceNo', label: 'Reference No' },
  { key: 'category', label: 'Category' },
  { key: 'description', label: 'Description' },
  { key: 'paymentMode', label: 'Payment Mode' },
  { key: 'amount', label: 'Amount (₹)' },
  { key: 'paidTo', label: 'Paid To / Vendor' },
  { key: 'addedBy', label: 'Added By' },
  { key: 'remarks', label: 'Remarks' },
];

// One color per category, matching the "Expenses by Category" donut's
// palette so a row's chip and its slice in the summary stay visually
// linked.
const CATEGORY_COLORS = {
  'Purchase / Stock': { bg: 'rgba(37,99,235,0.12)', color: '#2563EB' },
  Rent: { bg: 'rgba(34,160,107,0.12)', color: '#22A06B' },
  Utilities: { bg: 'rgba(242,107,33,0.14)', color: '#C1560A' },
  Salaries: { bg: 'rgba(139,92,246,0.12)', color: '#8B5CF6' },
  Transport: { bg: 'rgba(14,165,164,0.14)', color: '#0EA5A4' },
  'Repair & Maintenance': { bg: 'rgba(236,72,153,0.12)', color: '#DB2777' },
  'Office Expenses': { bg: 'rgba(245,166,35,0.18)', color: '#B5730A' },
};

// Small colored square with a payment-mode initial, standing in for a
// per-mode icon (no confirmed icon per mode in this app's icon set), used
// alongside a plain chip label matching the reference's icon+chip look.
const PAYMENT_MODE_COLORS = {
  Cash: { bg: 'rgba(34,160,107,0.12)', color: '#22A06B' },
  'Bank Transfer': { bg: 'rgba(37,99,235,0.12)', color: '#2563EB' },
  UPI: { bg: 'rgba(139,92,246,0.12)', color: '#8B5CF6' },
  Card: { bg: 'rgba(242,107,33,0.14)', color: '#C1560A' },
};

// `dateTime` arrives as a raw ISO timestamp from the API (Expense.
// expenseDate) — formatted here, once, same convention as every other
// cashier-panel transactions table.
function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

/**
 * "Recent Expense Transactions" table — same footer-Total-row + optional
 * page-number Pagination pattern as the other cashier-panel report
 * tables, with a Category chip (colored to match the by-category donut)
 * and a Payment Mode chip in place of the single payment-mode column used
 * elsewhere. `rows` is one page of real Expense rows from GET /expenses/
 * summary (see expense.service.js's getExpenseReport); pagination is
 * server-side (`page`/`totalPages` come straight from that response).
 */
export default function ExpenseTransactionsTable({
  rows, totalPages, page, onPageChange, loading,
}) {
  const totalAmount = rows.reduce((sum, row) => sum + row.amount, 0);

  return (
    <Stack spacing={2} sx={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.15s ease' }}>
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 1300 }}>
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
                    No expenses were logged on this date yet.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {rows.map((row, index) => {
              const categoryChip = CATEGORY_COLORS[row.category] || CATEGORY_COLORS['Office Expenses'];
              const modeChip = PAYMENT_MODE_COLORS[row.paymentMode] || PAYMENT_MODE_COLORS.Cash;
              return (
                <TableRow key={row.referenceNo} hover>
                  <TableCell sx={{ color: 'text.secondary' }}>{index + 1}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDateTime(row.dateTime)}</TableCell>
                  <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{row.referenceNo}</TableCell>
                  <TableCell>
                    <Chip label={row.category} size="small" sx={{ bgcolor: categoryChip.bg, color: categoryChip.color, fontWeight: 700, height: 22 }} />
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.description}</TableCell>
                  <TableCell>
                    <Chip label={row.paymentMode} size="small" sx={{ bgcolor: modeChip.bg, color: modeChip.color, fontWeight: 700, height: 22 }} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{formatCurrency(row.amount, { decimals: true })}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.paidTo}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.addedBy}</TableCell>
                  <TableCell>{row.remarks || '—'}</TableCell>
                </TableRow>
              );
            })}
            {rows.length > 0 && (
              <TableRow sx={{ '& td': { borderBottom: 'none', fontWeight: 800 } }}>
                <TableCell colSpan={3} />
                <TableCell>{rows.length}</TableCell>
                <TableCell colSpan={2} />
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatCurrency(totalAmount, { decimals: true })}</TableCell>
                <TableCell colSpan={3} />
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
