import { Paper, Stack, Typography } from '@mui/material';

/**
 * Plain label/value/caption tile used across the Cashier Panel's top
 * strip (Current Shift, Current Cash in Hand, Today's Sales, Today's
 * Receipt) — unlike the dashboard's StatCard, these carry no icon, just a
 * small caption label, a large colored value, and a secondary caption
 * line underneath (or two stacked caption lines for Current Shift's
 * time/date).
 */
export default function CashierStatCard({ label, value, valueColor = 'text.primary', caption, captionLines }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 3, height: '100%' }}>
      <Stack spacing={0.5}>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography sx={{ fontWeight: 800, color: valueColor, fontSize: 'clamp(1.1rem, 1.8vw, 1.4rem)', lineHeight: 1.2 }}>
          {value}
        </Typography>
        {captionLines ? (
          <Stack spacing={0.1}>
            {captionLines.map((line) => (
              <Typography key={line} variant="caption" sx={{ color: 'text.secondary' }}>
                {line}
              </Typography>
            ))}
          </Stack>
        ) : caption ? (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {caption}
          </Typography>
        ) : null}
      </Stack>
    </Paper>
  );
}
