import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, Chip, Stack, Typography, Pagination,
} from '@mui/material';

import { formatCurrency } from '../../../utils/format';

const COLUMNS = [
  { key: 'index', label: '#' },
  { key: 'dateTime', label: 'Date & Time' },
  { key: 'referenceNo', label: 'Reference No' },
  { key: 'from', label: 'From (Source)' },
  { key: 'to', label: 'To (Destination)' },
  { key: 'purpose', label: 'Purpose' },
  { key: 'amount', label: 'Amount (₹)' },
  { key: 'transferredBy', label: 'Transferred By' },
  { key: 'paymentMode', label: 'Payment Mode' },
  { key: 'remarks', label: 'Remarks / Details' },
];

// One color per transfer purpose, matching the by-purpose donut's
// palette so a row's chip and its slice in the summary stay visually
// linked.
const PURPOSE_COLORS = {
  'Bank Deposit': { bg: 'rgba(34,160,107,0.12)', color: '#22A06B' },
  'Petty Cash': { bg: 'rgba(245,166,35,0.15)', color: '#B5730A' },
  'Change Fund': { bg: 'rgba(37,99,235,0.12)', color: '#2563EB' },
  'Other Purpose': { bg: 'rgba(139,92,246,0.12)', color: '#8B5CF6' },
};

// A small colored initial badge stands in for each location's icon (the
// always-the-same source "Cash Counter" plus whichever destination the
// row names) — no external icon set for arbitrary account/box names, so
// this keeps every From/To cell visually anchored the way the
// reference's per-row icons do.
const LOCATION_COLORS = {
  'Cash Counter': '#1F2A3C',
  'Petty Cash Box': '#8B5CF6',
  'Change Fund Box': '#2563EB',
  'Office Cash': '#6B7280',
  'Staff Refreshment Fund': '#6B7280',
};

function LocationBadge({ label }) {
  const color = LOCATION_COLORS[label] || (label.toLowerCase().includes('bank') ? '#E5484D' : '#6B7280');
  return (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
      <Box
        sx={{
          width: 20, height: 20, borderRadius: 1, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: color, color: '#fff', fontSize: 10.5, fontWeight: 800,
        }}
      >
        {label[0]}
      </Box>
      <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>{label}</Typography>
    </Stack>
  );
}

/**
 * "Recent Cash Transfer Transactions" table — same footer-Total-row +
 * page-number Pagination pattern as CashWithdrawalTransactionsTable /
 * CashDepositTransactionsTable, with From (Source) / To (Destination)
 * columns in place of a single Withdrawn/Deposited By column, since a
 * transfer moves cash between two named places rather than just
 * recording who handled it (Transferred By still appears separately).
 */
export default function CashTransferTransactionsTable({ rows, totalPages, page, onPageChange }) {
  const totalAmount = rows.reduce((sum, row) => sum + row.amount, 0);

  return (
    <Stack spacing={2}>
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 1250 }}>
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
                  <TableCell><LocationBadge label={row.from} /></TableCell>
                  <TableCell><LocationBadge label={row.to} /></TableCell>
                  <TableCell>
                    <Chip label={row.purpose} size="small" sx={{ bgcolor: purposeChip.bg, color: purposeChip.color, fontWeight: 700, height: 22 }} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(row.amount, { decimals: true })}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.transferredBy}</TableCell>
                  <TableCell>
                    <Chip label={row.paymentMode} size="small" sx={{ bgcolor: 'rgba(34,160,107,0.12)', color: 'success.main', fontWeight: 700, height: 22 }} />
                  </TableCell>
                  <TableCell>{row.remarks}</TableCell>
                </TableRow>
              );
            })}
            <TableRow sx={{ '& td': { borderBottom: 'none', fontWeight: 800 } }}>
              <TableCell colSpan={5} />
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
