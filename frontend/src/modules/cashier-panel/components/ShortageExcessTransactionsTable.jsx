import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, Chip, Stack, Typography, Pagination,
} from '@mui/material';

import { formatCurrency } from '../../../utils/format';

const COLUMNS = [
  { key: 'index', label: '#' },
  { key: 'dateTime', label: 'Date & Time' },
  { key: 'referenceNo', label: 'Reference No' },
  { key: 'type', label: 'Type' },
  { key: 'recordedBy', label: 'Recorded By' },
  { key: 'reason', label: 'Reason / Description' },
  { key: 'amount', label: 'Amount (₹)' },
  { key: 'shift', label: 'Shift' },
  { key: 'remarks', label: 'Remarks / Details' },
];

const TYPE_COLORS = {
  Shortage: { bg: 'rgba(229,72,77,0.12)', color: '#E5484D' },
  Excess: { bg: 'rgba(34,160,107,0.12)', color: '#22A06B' },
};

// Real `shift` values (see shortageExcess.service.js's withShiftLabel)
// are "Shift <n> - Morning/Afternoon/Evening/Night"; any value beyond the
// first four falls back to the "Shift 1" color rather than going
// unstyled.
const SHIFT_COLORS = {
  'Shift 1 - Morning': { bg: 'rgba(34,160,107,0.12)', color: '#22A06B' },
  'Shift 2 - Afternoon': { bg: 'rgba(242,107,33,0.14)', color: '#C1560A' },
  'Shift 3 - Evening': { bg: 'rgba(37,99,235,0.12)', color: '#2563EB' },
  'Shift 4 - Night': { bg: 'rgba(139,92,246,0.12)', color: '#8B5CF6' },
};

// `dateTime` arrives as a raw ISO timestamp from the API
// (ShiftSession.closedAt, via shortageExcess.service.js).
function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

/**
 * "Recent Shortage / Excess Transactions" table — same footer-Total-row
 * + page-number Pagination pattern as the other cashier-panel report
 * tables, with a Type chip (Shortage red / Excess green, matching the
 * by-type donut) and a Shift chip (colored to match the other
 * shift-based reports) in place of a payment-mode column. `rows` is one
 * page of real CLOSED-ShiftSession-derived rows (variance != 0 only)
 * from GET /shortage-excess/summary; pagination is server-side.
 */
export default function ShortageExcessTransactionsTable({
  rows, totalPages, page, onPageChange, loading,
}) {
  const totalAmount = rows.reduce((sum, row) => sum + row.amount, 0);

  return (
    <Stack spacing={2} sx={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.15s ease' }}>
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 1200 }}>
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
                    No shortages or excesses were recorded on this date — every closed shift balanced exactly.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {rows.map((row, index) => {
              const typeChip = TYPE_COLORS[row.type] || TYPE_COLORS.Shortage;
              const shiftChip = SHIFT_COLORS[row.shift] || SHIFT_COLORS['Shift 1 - Morning'];
              return (
                <TableRow key={row.referenceNo} hover>
                  <TableCell sx={{ color: 'text.secondary' }}>{index + 1}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDateTime(row.dateTime)}</TableCell>
                  <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{row.referenceNo}</TableCell>
                  <TableCell>
                    <Chip label={row.type} size="small" sx={{ bgcolor: typeChip.bg, color: typeChip.color, fontWeight: 700, height: 22 }} />
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.recordedBy}</TableCell>
                  <TableCell>{row.reason}</TableCell>
                  <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{formatCurrency(row.amount, { decimals: true })}</TableCell>
                  <TableCell>
                    <Chip label={row.shift} size="small" sx={{ bgcolor: shiftChip.bg, color: shiftChip.color, fontWeight: 700, height: 22 }} />
                  </TableCell>
                  <TableCell>{row.remarks || '—'}</TableCell>
                </TableRow>
              );
            })}
            {rows.length > 0 && (
              <TableRow sx={{ '& td': { borderBottom: 'none', fontWeight: 800 } }}>
                <TableCell colSpan={3} />
                <TableCell>{rows.length}</TableCell>
                <TableCell />
                <TableCell />
                <TableCell sx={{ whiteSpace: 'nowrap', color: 'error.main' }}>{formatCurrency(totalAmount, { decimals: true })}</TableCell>
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
