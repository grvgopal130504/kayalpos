import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, Chip, Stack, Typography, Pagination,
} from '@mui/material';

import { formatCurrency } from '../../../utils/format';

const COLUMNS = [
  { key: 'index', label: '#' },
  { key: 'dateTime', label: 'Date & Time' },
  { key: 'referenceNo', label: 'Reference No' },
  { key: 'openedBy', label: 'Opened By' },
  { key: 'openingType', label: 'Opening Type' },
  { key: 'amount', label: 'Opening Cash Given (₹)' },
  { key: 'remarks', label: 'Remarks / Details' },
  { key: 'status', label: 'Status' },
];

// One color per opening type, matching the by-time donut's palette so a
// row's chip and its slice in the summary stay visually linked. Real
// openingType values (see cashDrawerOpening.service.js's withOpeningType)
// are "Shift Start - Morning/Afternoon/Evening/Night" or
// "Additional Opening" — any value not listed falls back to the
// "Additional Opening" color rather than going unstyled.
const OPENING_TYPE_COLORS = {
  'Shift Start - Morning': { bg: 'rgba(34,160,107,0.12)', color: '#22A06B' },
  'Additional Opening': { bg: 'rgba(242,107,33,0.14)', color: '#C1560A' },
  'Shift Start - Afternoon': { bg: 'rgba(37,99,235,0.12)', color: '#2563EB' },
  'Shift Start - Evening': { bg: 'rgba(139,92,246,0.12)', color: '#8B5CF6' },
  'Shift Start - Night': { bg: 'rgba(14,165,164,0.14)', color: '#0EA5A4' },
};

// `dateTime` arrives as a raw ISO timestamp from the API
// (ShiftSession.openedAt, via cashDrawerOpening.service.js).
function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

/**
 * "Recent Cash Drawer Opening Transactions" table — same footer-Total-row
 * + page-number Pagination pattern as the other cash-movement tables
 * (Withdrawal/Deposit/Transfer), with an Opening Type chip (colored to
 * match the "Opening Summary (By Time)" donut) and a Status chip in
 * place of a Payment Mode column, since every row here is a completed
 * cash-in-drawer event rather than a payment. `rows` is one page of real
 * ShiftSession-derived rows from GET /cash-drawer-openings/summary;
 * pagination is server-side.
 */
export default function CashDrawerOpeningTransactionsTable({
  rows, totalPages, page, onPageChange, loading,
}) {
  const totalAmount = rows.reduce((sum, row) => sum + row.amount, 0);

  return (
    <Stack spacing={2} sx={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.15s ease' }}>
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 1050 }}>
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
                    No cash drawer openings on this date yet.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {rows.map((row, index) => {
              const typeChip = OPENING_TYPE_COLORS[row.openingType] || OPENING_TYPE_COLORS['Additional Opening'];
              return (
                <TableRow key={row.referenceNo} hover>
                  <TableCell sx={{ color: 'text.secondary' }}>{index + 1}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDateTime(row.dateTime)}</TableCell>
                  <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{row.referenceNo}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.openedBy}</TableCell>
                  <TableCell>
                    <Chip label={row.openingType} size="small" sx={{ bgcolor: typeChip.bg, color: typeChip.color, fontWeight: 700, height: 22 }} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{formatCurrency(row.amount, { decimals: true })}</TableCell>
                  <TableCell>{row.remarks || '—'}</TableCell>
                  <TableCell>
                    <Chip label={row.status} size="small" sx={{ bgcolor: 'rgba(34,160,107,0.12)', color: 'success.main', fontWeight: 700, height: 22 }} />
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length > 0 && (
              <TableRow sx={{ '& td': { borderBottom: 'none', fontWeight: 800 } }}>
                <TableCell colSpan={3} />
                <TableCell>{rows.length}</TableCell>
                <TableCell />
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
