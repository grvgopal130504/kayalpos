import { Paper, Stack, Box, Typography, IconButton, Grid } from '@mui/material';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';

function Field({ label, children }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{label}</Typography>
      <Box sx={{ mt: 0.25 }}>{children}</Box>
    </Box>
  );
}

/**
 * Top strip above the item/cart panels: current customer on the left, and
 * the return + original-invoice metadata (return no/date, original invoice
 * no/date, cashier) on the right — mirrors Line Sale's BillSummaryRow but
 * with the extra original-invoice columns a return needs.
 */
export default function ReturnInfoRow({
  customerName, returnNo, returnDate, originalInvoiceNo, invoiceDate, cashierName,
  onAddCustomer, onFindOriginalInvoice,
}) {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 3 }}>
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

      <Grid size={{ xs: 12, md: 9 }}>
        <Paper variant="outlined" sx={{ borderRadius: 3, p: 2, height: '100%' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
              <Field label="Return No.">
                <Typography variant="body1" sx={{ fontWeight: 700 }} noWrap>{returnNo}</Typography>
              </Field>
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
              <Field label="Return Date">
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <CalendarTodayOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                  <Typography variant="body1" sx={{ fontWeight: 700 }} noWrap>{returnDate}</Typography>
                </Stack>
              </Field>
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
              <Field label="Original Invoice">
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ fontWeight: 700 }} noWrap>{originalInvoiceNo}</Typography>
                  <IconButton size="small" onClick={onFindOriginalInvoice}>
                    <SearchOutlinedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Stack>
              </Field>
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
              <Field label="Invoice Date">
                <Typography variant="body1" sx={{ fontWeight: 700 }} noWrap>{invoiceDate}</Typography>
              </Field>
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
              <Field label="Cashier">
                <Typography variant="body1" sx={{ fontWeight: 700 }} noWrap>{cashierName}</Typography>
              </Field>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
}
