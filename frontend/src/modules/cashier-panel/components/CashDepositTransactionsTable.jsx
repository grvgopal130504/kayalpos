import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, Chip, Stack, Pagination,
} from '@mui/material';

import { formatCurrency } from '../../../utils/format';

const COLUMNS = [
  { key: 'index', label: '#' },
  { key: 'dateTime', label: 'Date & Time' },
  { key: 'referenceNo', label: 'Reference No' },
  { key: 'purpose', label: 'Purpose' },
  { key: 'depositedBy', label: 'Deposited By' },
  { key: 'amount', label: 'Amount (₹)' },
  { key: 'paymentMode', label: 'Payment Mode' },
  { key: 'bankAccount', label: 'Bank / Account' },
  { key: 'remarks', label: 'Remarks / Details' },
];

// One color per deposit purpose, matching the by-purpose donut's palette
// so a row's chip and its slice in the summary stay visually linked.
const PURPOSE_COLORS = {
  'Bank Deposit': { bg: 'rgba(34,160,107,0.12)', color: '#22A06B' },
  'Owner Deposit': { bg: 'rgba(245,166,35,0.15)', color: '#B5730A' },
  'Float Adjustment': { bg: 'rgba(37,99,235,0.12)', color: '#2563EB' },
  'Other Purpose': { bg: 'rgba(139,92,246,0.12)', color: '#8B5CF6' },
};

/**
 * "Recent Cash Deposit Transactions" table — same footer-Total-row +
 * page-number Pagination pattern as CashWithdrawalTransactionsTable,
 * with Deposited By / Bank-Account columns in place of Withdrawn By,
 * since a deposit's identifying detail is which account it landed in.
 */
export default function CashDepositTransactionsTable({ rows, totalPages, page, onPageChange }) {
  const totalAmount = rows.reduce((sum, row) => sum + row.amount, 0);

  return (
    <Stack spacing={2}>
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 1150 }}>
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
              const purposeChip = PURPOSE_COLORS[row.purpose] || PURPOSE_COLORS['Other Purpose'];
              return (
                <TableRow key={row.referenceNo} hover>
                  <TableCell sx={{ color: 'text.secondary' }}>{index + 1}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.dateTime}</TableCell>
                  <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{row.referenceNo}</TableCell>
                  <TableCell>
                    <Chip label={row.purpose} size="small" sx={{ bgcolor: purposeChip.bg, color: purposeChip.color, fontWeight: 700, height: 22 }} />
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.depositedBy}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(row.amount, { decimals: true })}</TableCell>
                  <TableCell>
                    <Chip label={row.paymentMode} size="small" sx={{ bgcolor: 'rgba(34,160,107,0.12)', color: 'success.main', fontWeight: 700, height: 22 }} />
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.bankAccount}</TableCell>
                  <TableCell>{row.remarks}</TableCell>
                </TableRow>
              );
            })}
            <TableRow sx={{ '& td': { borderBottom: 'none', fontWeight: 800 } }}>
              <TableCell colSpan={4} />
              <TableCell>{rows.length}</TableCell>
              <TableCell>{formatCurrency(totalAmount, { decimals: true })}</TableCell>
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
