import { Stack, Typography } from '@mui/material';

/**
 * "Label ......... value" row used inside summary panels (Expense
 * Summary, Profit Overview, Receivables & Payables, Inventory Summary).
 * Keeps every such panel's row spacing/typography consistent.
 */
export default function LabeledRow({ label, value, emphasize = false, valueColor }) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', py: 0.65, gap: 1, minHeight: '2.6em' }}>
      <Typography
        variant="body2"
        sx={{ color: emphasize ? 'text.primary' : 'text.secondary', fontWeight: emphasize ? 700 : 400 }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        noWrap
        sx={{ fontWeight: emphasize ? 800 : 600, color: valueColor || 'text.primary', flexShrink: 0, pt: '1px' }}
      >
        {value}
      </Typography>
    </Stack>
  );
}
