import { Box, Stack, Typography, Divider } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { formatCurrency } from '../../../utils/format';

const money = (v) => formatCurrency(v, { decimals: true });

/**
 * Dark summary card at the top of the right column on the payment step:
 * the amount payable, the bill's line items and the sub / discount / tax
 * breakdown. Long carts show the first few lines and "+ N more".
 */
export default function AmountPayableCard({ billNo, lines, totals }) {
  const MAX_LINES = 3;
  const shown = lines.slice(0, MAX_LINES);
  const hidden = lines.length - shown.length;
  const rates = [...new Set(lines.map((l) => l.taxRate))];
  const gstLabel = rates.length === 1 ? `GST ${Number((rates[0] * 100).toFixed(2))}%` : 'GST';

  return (
    <Box
      sx={{
        position: 'relative', overflow: 'hidden', borderRadius: 4, p: 3, color: '#fff',
        background: (t) => `radial-gradient(circle at 100% 0%, ${alpha(t.palette.primary.main, 0.45)} 0%, transparent 45%), linear-gradient(135deg, #1B2437 0%, #1F2A3C 60%, #2A3750 100%)`,
      }}
    >
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
        <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'rgba(255,255,255,0.65)' }}>AMOUNT PAYABLE</Typography>
        <Typography noWrap sx={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>{billNo}</Typography>
      </Stack>

      <Typography sx={{ fontSize: 46, fontWeight: 800, lineHeight: 1.15, my: 1.25, letterSpacing: -0.5 }}>{money(totals.grandTotal)}</Typography>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.14)', my: 1.5 }} />

      <Stack spacing={0.5}>
        {shown.map((l) => (
          <Stack key={l.code} direction="row" sx={{ justifyContent: 'space-between', gap: 2, fontSize: 12.5 }}>
            <Typography noWrap sx={{ fontSize: 12.5, color: 'rgba(255,255,255,0.85)' }}>{l.name} × {l.qty}</Typography>
            <Typography sx={{ fontSize: 12.5, fontWeight: 600, flexShrink: 0 }}>{money(l.qty * l.price)}</Typography>
          </Stack>
        ))}
        {hidden > 0 && (
          <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>+ {hidden} more item{hidden === 1 ? '' : 's'}</Typography>
        )}
      </Stack>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.14)', my: 1.5 }} />

      <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {[['Sub total', totals.subTotal], ['Discount', totals.discountAmount], [gstLabel, totals.tax]].map(([label, value]) => (
          <Box key={label} sx={{ px: 1.25, py: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.08)', minWidth: 0 }}>
            <Typography noWrap sx={{ fontSize: 10.5, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>{label}</Typography>
            <Typography noWrap sx={{ fontSize: 13, fontWeight: 800 }}>{money(value)}</Typography>
          </Box>
        ))}
      </Box>
      <Typography sx={{ mt: 1.25, fontSize: 11.5, color: 'rgba(255,255,255,0.55)' }}>{lines.length} item{lines.length === 1 ? '' : 's'} in this bill</Typography>
    </Box>
  );
}
