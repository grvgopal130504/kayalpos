import { Paper, Stack, Box, Typography, Divider } from '@mui/material';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

import { formatCurrency } from '../../../utils/format';

const ICONS = {
  cash: CurrencyRupeeOutlinedIcon,
  card: ReceiptOutlinedIcon,
  upi: QrCode2OutlinedIcon,
  other: DescriptionOutlinedIcon,
};

/**
 * "Payment Summary (Today)" panel — a small colored icon per payment
 * method, its label, and its amount right-aligned, with Total Sales
 * called out in bold blue at the bottom (a plain emphasized row, not the
 * boxed highlight used on the stock create-forms' totals — matching the
 * reference here).
 */
export default function CashierPaymentSummary({ summary }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Payment Summary (Today)</Typography>
      <Stack spacing={1.25}>
        {summary.breakdown.map((row) => {
          const Icon = ICONS[row.key];
          return (
            <Stack key={row.key} direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', minWidth: 0 }}>
                <Box
                  sx={{
                    width: 30, height: 30, borderRadius: 1.5, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: `${row.color}1A`, color: row.color,
                  }}
                >
                  <Icon sx={{ fontSize: 16 }} />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{row.label}</Typography>
              </Stack>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCurrency(row.value, { decimals: true })}</Typography>
            </Stack>
          );
        })}
      </Stack>
      <Divider sx={{ my: 1.5 }} />
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Typography variant="body2" sx={{ fontWeight: 800, color: '#2563EB' }}>Total Sales (₹)</Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#2563EB' }}>
          {formatCurrency(summary.totalSales, { decimals: true })}
        </Typography>
      </Stack>
    </Paper>
  );
}
