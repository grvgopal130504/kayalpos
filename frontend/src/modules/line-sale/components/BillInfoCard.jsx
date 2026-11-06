import { Paper, Grid, Typography } from '@mui/material';

/**
 * Bill No. / Cashier / Date & Time strip — the right-hand card of
 * BillSummaryRow on the billing step, and reused as its own standalone row
 * on the payment step (LineSalePage) so the same bill metadata stays
 * visible after "Proceed to Payment".
 */
export default function BillInfoCard({ billNo, cashierName, dateTime }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: 2, height: '100%' }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 4 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Bill No.</Typography>
          <Typography variant="body1" sx={{ fontWeight: 700 }} noWrap>{billNo}</Typography>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Cashier</Typography>
          <Typography variant="body1" sx={{ fontWeight: 700 }} noWrap>{cashierName}</Typography>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Date &amp; Time</Typography>
          <Typography variant="body1" sx={{ fontWeight: 700 }} noWrap>{dateTime}</Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}
