import { Paper, Stack, Box, Typography, IconButton, Grid } from '@mui/material';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import AddIcon from '@mui/icons-material/Add';

/**
 * Top info strip above the item/cart panels: current customer (with a
 * shortcut to add a new one) on the left, bill metadata (bill no / cashier /
 * date-time) on the right. Split into two Paper cards so it visually
 * matches the reference instead of one continuous bar.
 */
export default function BillSummaryRow({ customerName, billNo, cashierName, dateTime, onAddCustomer }) {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 5, md: 4 }}>
        <Paper variant="outlined" sx={{ borderRadius: 3, p: 2, height: '100%' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Customer</Typography>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mt: 0.5 }}>
            <Box
              sx={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: 'rgba(31,42,60,0.08)', color: 'text.secondary',
              }}
            >
              <PersonOutlineOutlinedIcon fontSize="small" />
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 700, flex: 1, minWidth: 0 }} noWrap>
              {customerName}
            </Typography>
            <IconButton
              size="small"
              onClick={onAddCustomer}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, sm: 7, md: 8 }}>
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
      </Grid>
    </Grid>
  );
}
