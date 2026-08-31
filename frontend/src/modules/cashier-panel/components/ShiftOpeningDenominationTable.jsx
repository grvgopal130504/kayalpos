import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, TextField, Stack, Typography, Divider,
} from '@mui/material';

import { formatCurrency } from '../../../utils/format';

function toNumber(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * "Opening Cash Details" denomination-count table on the Shift Opening
 * form — a fixed row per note denomination (Pieces is the only editable
 * cell; Amount = Pieces × the note's face value, computed) plus a
 * "Coins" row that bundles several small coin denominations and so has
 * no single face value — both Pieces and Amount are editable there.
 * `rows`/`onRowChange` are lifted to the parent so the page-level Opening
 * Summary panel can total the same figures.
 */
export default function ShiftOpeningDenominationTable({ rows, onRowChange }) {
  const total = rows.reduce((sum, row) => sum + (row.unitValue != null ? row.unitValue * toNumber(row.pieces) : toNumber(row.amount)), 0);

  return (
    <Stack spacing={1.5}>
      <Box sx={{ overflowX: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table size="small" sx={{ minWidth: 420 }}>
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 700, fontSize: 12.5, whiteSpace: 'nowrap', bgcolor: 'rgba(0,0,0,0.02)' } }}>
              <TableCell sx={{ width: 40 }}>#</TableCell>
              <TableCell>Denomination</TableCell>
              <TableCell sx={{ width: 110 }}>Pieces</TableCell>
              <TableCell sx={{ width: 130 }} align="right">Amount (₹)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => {
              const amount = row.unitValue != null ? row.unitValue * toNumber(row.pieces) : toNumber(row.amount);
              return (
                <TableRow key={row.key} sx={{ '& td': { py: 0.75 } }}>
                  <TableCell sx={{ color: 'text.secondary' }}>{index + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{row.label}</TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      fullWidth
                      value={row.pieces}
                      inputMode="numeric"
                      onChange={(e) => onRowChange(row.key, { pieces: e.target.value.replace(/\D/g, '') })}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {row.unitValue != null ? (
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{amount.toFixed(2)}</Typography>
                    ) : (
                      <TextField
                        size="small"
                        fullWidth
                        value={row.amount}
                        inputMode="decimal"
                        onChange={(e) => onRowChange(row.key, { amount: e.target.value })}
                        slotProps={{ htmlInput: { style: { textAlign: 'right' } } }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>

      <Divider />

      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Total Opening Cash (₹)</Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'success.main' }}>
          {formatCurrency(total, { decimals: true })}
        </Typography>
      </Stack>
    </Stack>
  );
}
