import { Paper, Box, Grid, Typography } from '@mui/material';

function LoyaltyTile({ value, label, color }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: 2.25, textAlign: 'center' }}>
      <Typography sx={{ fontWeight: 800, fontSize: '1.6rem', color }}>{value}</Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{label}</Typography>
    </Paper>
  );
}

/**
 * "Loyalty Summary" block on the Customer page — four plain stat tiles for
 * the currently selected customer's points balance/activity.
 */
export default function CustomerLoyaltySummary({ summary }) {
  const tiles = [
    { key: 'available', value: summary.availablePoints, label: 'Available Points', color: '#7C3AED' },
    { key: 'earned', value: summary.totalEarnedPoints, label: 'Total Earned Points', color: 'success.main' },
    { key: 'redeemed', value: summary.totalRedeemedPoints, label: 'Total Redeemed Points', color: '#B5730A' },
    { key: 'transactions', value: summary.transactions, label: 'Transactions', color: '#2563EB' },
  ];

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Loyalty Summary</Typography>
      <Grid container spacing={2}>
        {tiles.map((tile) => (
          <Grid key={tile.key} size={{ xs: 6, sm: 3 }}>
            <LoyaltyTile value={tile.value} label={tile.label} color={tile.color} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
