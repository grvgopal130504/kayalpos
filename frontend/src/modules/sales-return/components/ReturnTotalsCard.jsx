import { Paper, Stack, Typography, Divider } from '@mui/material';
import { formatCurrency } from '../../../utils/format';

export default function ReturnTotalsCard({ totals }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: 2, height: '100%', bgcolor: 'background.default' }}>
      <Stack spacing={1} sx={{ height: '100%', justifyContent: 'center' }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Sub Total</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCurrency(totals.subTotal, { decimals: true })}</Typography>
        </Stack>
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Discount</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCurrency(totals.discountAmount, { decimals: true })}</Typography>
        </Stack>
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Tax</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCurrency(totals.tax, { decimals: true })}</Typography>
        </Stack>
        <Divider />
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Grand Total</Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
            {formatCurrency(totals.grandTotal, { decimals: true })}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
