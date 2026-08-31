import { Stack, Box, Typography, Paper } from '@mui/material';

import { formatCurrency } from '../../../utils/format';

// Rank badges rendered as plain colored circles (gold/silver/bronze) with
// the rank number rather than a medal/trophy icon glyph, since no such
// icon is confirmed to exist in this app's installed icon set.
const RANK_COLORS = {
  1: { bg: '#F5C542', fg: '#7A5B00' },
  2: { bg: '#C7CCD6', fg: '#3F4652' },
  3: { bg: '#E3A05C', fg: '#6B3A0A' },
};

/**
 * "Top Performing Cashiers" ranked list for the Cashier Wise Sales page —
 * the top 3 cashiers by total sales, each with a colored rank badge.
 */
export default function TopPerformingCashiers({ rows }) {
  return (
    <Stack spacing={1.25}>
      {rows.map((row) => {
        const rankColor = RANK_COLORS[row.rank] || { bg: '#E5E7EB', fg: '#4B5563' };
        return (
          <Paper key={row.code} variant="outlined" sx={{ borderRadius: 2.5, p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', minWidth: 0 }}>
              <Box
                sx={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: rankColor.bg, color: rankColor.fg, fontSize: 13, fontWeight: 800,
                }}
              >
                {row.rank}
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{row.label}</Typography>
            </Stack>
            <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main', flexShrink: 0 }}>
              {formatCurrency(row.value, { decimals: true })}
            </Typography>
          </Paper>
        );
      })}
    </Stack>
  );
}
