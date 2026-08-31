import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, Radio, Typography, Stack,
} from '@mui/material';

import { formatCurrency } from '../../../../utils/format';

const COLUMNS = ['', 'MRP (₹)', 'Margin %', 'Margin Amount (₹)', 'Selling Price (Excl. Tax)', 'Selling Price (Incl. Tax)'];

/**
 * "Margin From MRP Quick Calculator" — a preset table of common margin
 * percentages against the current MRP, each row showing the resulting
 * margin amount and selling price (excl./incl. tax). Clicking any row
 * applies that margin percentage to the main calculator (switching the
 * pricing method to "Margin % From MRP" if it wasn't already selected),
 * matching the reference's "*Click on any row to apply the margin." note.
 */
export default function MarginQuickCalculatorTable({ mrp, taxRate, steps, selectedMargin, onApplyMargin }) {
  return (
    <Stack spacing={1}>
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 560 }}>
          <TableHead>
            <TableRow>
              {COLUMNS.map((label, idx) => (
                <TableCell key={label || `col-${idx}`} sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 12.5, whiteSpace: 'nowrap' }}>
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {steps.map((marginPercent) => {
              const marginAmount = (mrp * marginPercent) / 100;
              const sellingExclTax = mrp - marginAmount;
              const sellingInclTax = sellingExclTax * (1 + taxRate / 100);
              const isSelected = selectedMargin === marginPercent;
              return (
                <TableRow
                  key={marginPercent}
                  hover
                  selected={isSelected}
                  onClick={() => onApplyMargin(marginPercent)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell sx={{ py: 0.5 }}>
                    <Radio size="small" checked={isSelected} onChange={() => onApplyMargin(marginPercent)} />
                  </TableCell>
                  <TableCell>{formatCurrency(mrp, { decimals: true })}</TableCell>
                  <TableCell>{marginPercent}%</TableCell>
                  <TableCell>{formatCurrency(marginAmount, { decimals: true })}</TableCell>
                  <TableCell>{formatCurrency(sellingExclTax, { decimals: true })}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {formatCurrency(sellingInclTax, { decimals: true })} ({taxRate}% Tax)
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <Typography variant="caption" sx={{ color: 'primary.main' }}>
        * Click on any row to apply the margin.
      </Typography>
    </Stack>
  );
}
