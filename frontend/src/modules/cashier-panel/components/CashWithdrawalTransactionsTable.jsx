import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, Chip, Typography, Stack, Pagination,
} from '@mui/material';

import { formatCurrency } from '../../../utils/format';

const COLUMNS = [
  { key: 'index', label: '#' },
  { key: 'dateTime', label: 'Date & Time' },
  { key: 'referenceNo', label: 'Reference No' },
  { key: 'purpose', label: 'Purpose' },
  { key: 'withdrawnBy', label: 'Withdrawn By' },
  { key: 'amount', label: 'Amount (₹)' },
  { key: 'paymentMode', label: 'Payment Mode' },
  { key: 'remarks', label: 'Remarks / Details' },
];

// One color per withdrawal purpose, matching the by-purpose donut's
// palette (see cashWithdrawal.service.js's PURPOSE_DEFS) so a row's chip
// and its slice in the summary stay visually linked.
const PURPOSE_COLORS = {
  'Bank Deposit': { bg: 'rgba(34,160,107,0.12)', color: '#22A06B' },
  'Owner Withdrawal': { bg: 'rgba(245,166,35,0.15)', color: '#B5730A' },
  'Petty Cash': { bg: 'rgba(37,99,235,0.12)', color: '#2563EB' },
  'Other Purpose': { bg: 'rgba(139,92,246,0.12)', color: '#8B5CF6' },
};

// `dateTime` arrives as a raw ISO timestamp from the API
// (CashWithdrawal.createdAt).
function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

/**
 * "Recent Cash Withdrawal Transactions" table — same footer-Total-row +
 * page-number Pagination pattern as the sales-report tables, with
 * Purpose (colored chip) and Withdrawn By / Payment Mode / Remarks columns
 * in place of the item/qty/tax breakdown a sale has (a withdrawal isn't a
 * priced sale line, so there's nothing to break out there). `rows` is one
 * page of real CashWithdrawal rows from GET /cash-withdrawals/summary;
 * pagination is server-side.
 */
export default function CashWithdrawalTransactionsTable({
  rows, totalPages, page, onPageChange, loading,
}) {
  const totalAmount = rows.reduce((sum, row) => sum + row.amount, 0);

  return (
    <Stack spacing={2} sx={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.15s ease' }}>
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 950 }}>
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
                    No cash withdrawals on this date yet.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {rows.map((row, index) => {
              const purposeChip = PURPOSE_COLORS[row.purpose] || PURPOSE_COLORS['Other Purpose'];
              return (
                <TableRow key={row.referenceNo} hover>
                  <TableCell sx={{ color: 'text.secondary' }}>{index + 1}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDateTime(row.dateTime)}</TableCell>
                  <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{row.referenceNo}</TableCell>
                  <TableCell>
                    <Chip label={row.purpose} size="small" sx={{ bgcolor: purposeChip.bg, color: purposeChip.color, fontWeight: 700, height: 22 }} />
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.withdrawnBy}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(row.amount, { decimals: true })}</TableCell>
                  <TableCell>
                    <Chip label={row.paymentMode} size="small" sx={{ bgcolor: 'rgba(34,160,107,0.12)', color: 'success.main', fontWeight: 700, height: 22 }} />
                  </TableCell>
                  <TableCell>{row.remarks || '—'}</TableCell>
                </TableRow>
              );
            })}
            {rows.length > 0 && (
              <TableRow sx={{ '& td': { borderBottom: 'none', fontWeight: 800 } }}>
                <TableCell colSpan={4} />
                <TableCell>{rows.length}</TableCell>
                <TableCell>{formatCurrency(totalAmount, { decimals: true })}</TableCell>
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
