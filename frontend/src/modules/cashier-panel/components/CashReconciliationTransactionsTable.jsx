import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, Chip, Stack, Typography, Pagination,
} from '@mui/material';

import { formatCurrency } from '../../../utils/format';

const COLUMNS = [
  { key: 'index', label: '#' },
  { key: 'dateTime', label: 'Date & Time' },
  { key: 'referenceNo', label: 'Reference No' },
  { key: 'reconciliationType', label: 'Reconciliation Type' },
  { key: 'reconciledBy', label: 'Reconciled By' },
  { key: 'systemCash', label: 'System Cash (₹)' },
  { key: 'countedCash', label: 'Counted Cash (₹)' },
  { key: 'variance', label: 'Variance (₹)' },
  { key: 'variancePercent', label: 'Variance (%)' },
  { key: 'status', label: 'Status' },
  { key: 'remarks', label: 'Remarks / Details' },
];

// One color per shift ordinal, matching the reconciliation-type dot
// prefix used throughout the cashier panel's shift-based reports. Real
// `reconciliationType` values (see cashReconciliation.service.js's
// withShiftLabel) are "Shift <n> - Morning/Afternoon/Evening/Night"; any
// value beyond the first four falls back to a neutral gray dot.
const TYPE_COLORS = {
  'Shift 1 - Morning': '#22A06B',
  'Shift 2 - Afternoon': '#C1560A',
  'Shift 3 - Evening': '#2563EB',
  'Shift 4 - Night': '#8B5CF6',
};

const STATUS_COLORS = {
  'Exact Match': { bg: 'rgba(34,160,107,0.12)', color: '#22A06B' },
  Short: { bg: 'rgba(229,72,77,0.12)', color: '#E5484D' },
  Over: { bg: 'rgba(242,107,33,0.14)', color: '#C1560A' },
};

function signedCurrency(value) {
  const formatted = formatCurrency(Math.abs(value), { decimals: true });
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}

function varianceColor(value) {
  if (value > 0) return '#22A06B';
  if (value < 0) return '#E5484D';
  return 'text.primary';
}

// `dateTime` arrives as a raw ISO timestamp from the API
// (ShiftSession.closedAt, via cashReconciliation.service.js).
function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

/**
 * "Recent Cash Reconciliation Transactions" table — same footer-Total-row
 * + page-number Pagination pattern as the other cashier-panel report
 * tables. Reconciliation Type carries a small colored dot (per shift,
 * matching the other shift-based reports) instead of a filled chip;
 * Variance and Variance (%) are signed and colored green/red/neutral, and
 * Status is a colored chip (Exact Match / Short / Over). `rows` is one
 * page of real CLOSED-ShiftSession-derived rows from GET
 * /cash-reconciliations/summary; pagination is server-side.
 */
export default function CashReconciliationTransactionsTable({
  rows, totalPages, page, onPageChange, loading,
}) {
  const totalSystemCash = rows.reduce((sum, row) => sum + row.systemCash, 0);
  const totalCountedCash = rows.reduce((sum, row) => sum + row.countedCash, 0);
  const totalVariance = rows.reduce((sum, row) => sum + row.variance, 0);
  const totalVariancePercent = totalSystemCash ? (totalVariance / totalSystemCash) * 100 : 0;

  return (
    <Stack spacing={2} sx={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.15s ease' }}>
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 1400 }}>
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
                    No shifts were reconciled on this date yet.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {rows.map((row, index) => {
              const statusChip = STATUS_COLORS[row.status] || STATUS_COLORS['Exact Match'];
              const dotColor = TYPE_COLORS[row.reconciliationType] || '#6B7280';
              return (
                <TableRow key={row.referenceNo} hover>
                  <TableCell sx={{ color: 'text.secondary' }}>{index + 1}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDateTime(row.dateTime)}</TableCell>
                  <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{row.referenceNo}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dotColor, flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>{row.reconciliationType}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.reconciledBy}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatCurrency(row.systemCash, { decimals: true })}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatCurrency(row.countedCash, { decimals: true })}</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', color: varianceColor(row.variance) }}>{signedCurrency(row.variance)}</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', color: varianceColor(row.variance) }}>{row.variancePercent.toFixed(2)}%</TableCell>
                  <TableCell>
                    <Chip label={row.status} size="small" sx={{ bgcolor: statusChip.bg, color: statusChip.color, fontWeight: 700, height: 22 }} />
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
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatCurrency(totalSystemCash, { decimals: true })}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatCurrency(totalCountedCash, { decimals: true })}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', color: varianceColor(totalVariance) }}>{signedCurrency(totalVariance)}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', color: varianceColor(totalVariance) }}>{totalVariancePercent.toFixed(2)}%</TableCell>
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
