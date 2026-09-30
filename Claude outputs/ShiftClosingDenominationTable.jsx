import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, TextField, Stack, Typography, Divider,
} from '@mui/material';
import { Controller, useWatch } from 'react-hook-form';

import { formatCurrency } from '../../../utils/format';
import { computeTotalClosingCash } from '../shiftClosingSchema';

function toNumber(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * "Closing Cash Details" denomination-count table on the Shift Closing
 * form — same shape as ShiftOpeningDenominationTable (a fixed row per note
 * denomination with only Pieces editable, plus a "Coins" row with both
 * Pieces and Amount editable), kept as its own component only so the total
 * row reads "Total Closing Cash" rather than "Total Opening Cash". The
 * live total feeds the Close Shift Summary panel and is only ever a
 * preview — the real closingCash is always recomputed server-side from
 * these same rows on submit (see the backend's shiftSession.service.js's
 * closeShift).
 */
export default function ShiftClosingDenominationTable({ control, fields }) {
  const denominations = useWatch({ control, name: 'denominations' });
  const total = computeTotalClosingCash(denominations || fields);

  return (
    <Stack spacing={1.5}>
      <Box sx={{ overflowX: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table size="small" sx={{ minWidth: 420 }}>
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 700, fontSize: 12.5, whiteSpace: 'nowrap', bgcolor: 'rgba(0,0,0,0.02)' } }}>
              <TableCell sx={{ width: 40 }}>#</TableCell>
              <TableCell>Denomination</TableCell>
              <TableCell sx={{ width: 130 }}>Pieces</TableCell>
              <TableCell sx={{ width: 150 }} align="right">Amount (₹)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((field, index) => (
              <DenominationRow key={field.id} control={control} index={index} field={field} />
            ))}
          </TableBody>
        </Table>
      </Box>

      <Divider />

      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Total Closing Cash (₹)</Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'success.main' }}>
          {formatCurrency(total, { decimals: true })}
        </Typography>
      </Stack>
    </Stack>
  );
}

function DenominationRow({ control, index, field }) {
  const row = useWatch({ control, name: `denominations.${index}` }) || field;
  const amount = row.unitValue != null ? row.unitValue * toNumber(row.pieces) : toNumber(row.amount);

  return (
    <TableRow sx={{ '& td': { py: 0.75 } }}>
      <TableCell sx={{ color: 'text.secondary' }}>{index + 1}</TableCell>
      <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{field.label}</TableCell>
      <TableCell>
        <Controller
          name={`denominations.${index}.pieces`}
          control={control}
          render={({ field: pieceField, fieldState: { error } }) => (
            <TextField
              {...pieceField}
              size="small"
              fullWidth
              inputMode="numeric"
              error={Boolean(error)}
              helperText={error?.message}
              onChange={(e) => pieceField.onChange(e.target.value.replace(/\D/g, ''))}
            />
          )}
        />
      </TableCell>
      <TableCell align="right">
        {field.unitValue != null ? (
          <Typography variant="body2" sx={{ fontWeight: 600, pt: 1 }}>{amount.toFixed(2)}</Typography>
        ) : (
          <Controller
            name={`denominations.${index}.amount`}
            control={control}
            render={({ field: amountField, fieldState: { error } }) => (
              <TextField
                {...amountField}
                size="small"
                fullWidth
                inputMode="decimal"
                error={Boolean(error)}
                helperText={error?.message}
                slotProps={{ htmlInput: { style: { textAlign: 'right' } } }}
              />
            )}
          />
        )}
      </TableCell>
    </TableRow>
  );
}
