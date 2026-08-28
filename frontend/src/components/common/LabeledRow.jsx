import { Stack, Typography } from '@mui/material';

/**
 * "Label ......... value" row used inside summary panels (Expense
 * Summary, Profit Overview, Receivables & Payables, Inventory Summary).
 * Keeps every such panel's row spacing/typography consistent.
 */
export default function LabeledRow({ label, value, emphasize = false, valueColor }) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', py: 0.65 }}>
      <Typography variant="body2" sx={{ color: emphasize ? 'text.primary' : 'text.secondary', fontWeight: emphasize ? 700 : 400 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: emphasize ? 800 : 600, color: valueColor || 'text.primary' }}>
        {value}
      </Typography>
    </Stack>
  );
}
