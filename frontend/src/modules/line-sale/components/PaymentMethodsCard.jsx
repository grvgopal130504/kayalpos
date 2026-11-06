import { useEffect, useState } from 'react';
import { Box, Stack, Typography, ButtonBase, InputBase, Paper } from '@mui/material';
import { alpha } from '@mui/material/styles';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CreditScoreOutlinedIcon from '@mui/icons-material/CreditScoreOutlined';
import CheckIcon from '@mui/icons-material/Check';
import { formatCurrency } from '../../../utils/format';

const METHOD_ICONS = {
  cash: PaymentsOutlinedIcon,
  upi: QrCode2OutlinedIcon,
  card: CreditCardOutlinedIcon,
  wallet: AccountBalanceWalletOutlinedIcon,
  credit: CreditScoreOutlinedIcon,
};

/**
 * Step 2 "Payment Method" card: method tiles, the received amount with the
 * change to return, and one-tap "quick cash" chips. `exactAmount` is the
 * amount payable, so "Exact" fills the received amount with the bill total.
 */
export default function PaymentMethodsCard({
  methods, selectedMethod, onSelectMethod,
  receivedAmount, onReceivedAmountChange, quickAmounts, exactAmount, changeAmount,
}) {
  // The field keeps its own text so typing behaves like a normal amount box:
  // empty when zero (no leading "0" in front of what you type), and "84."
  // survives mid-typing. The parent still receives a clean number, and the
  // text re-syncs whenever the amount changes from outside (quick-cash
  // chips, clearing the bill).
  const [amountText, setAmountText] = useState(receivedAmount ? String(receivedAmount) : '');
  useEffect(() => {
    setAmountText((current) => (Number(current) === Number(receivedAmount)
      ? current
      : (receivedAmount ? String(receivedAmount) : '')));
  }, [receivedAmount]);

  const handleAmountChange = (e) => {
    // digits and at most one decimal point, max 2 decimal places
    let text = e.target.value.replace(/[^\d.]/g, '');
    const firstDot = text.indexOf('.');
    if (firstDot !== -1) text = text.slice(0, firstDot + 1) + text.slice(firstDot + 1).replace(/\./g, '').slice(0, 2);
    text = text.replace(/^0+(?=\d)/, ''); // "084" -> "84"
    setAmountText(text);
    onReceivedAmountChange(Number(text) || 0);
  };

  const selected = methods.find((m) => m.key === selectedMethod);
  const short = changeAmount < 0;
  const exact = Number(exactAmount.toFixed(2));
  const chips = [{ label: 'Exact', value: exact }, ...quickAmounts.map((a) => ({ label: formatCurrency(a), value: a }))];

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: 2.5 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Payment Method</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Paying by <b style={{ fontWeight: 800 }}>{selected?.label}</b>
        </Typography>
      </Stack>

      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' } }}>
        {methods.map((m) => {
          const Icon = METHOD_ICONS[m.key];
          const active = m.key === selectedMethod;
          return (
            <ButtonBase
              key={m.key}
              onClick={() => onSelectMethod(m.key)}
              aria-pressed={active}
              sx={{
                position: 'relative', py: 2, px: 1, borderRadius: 3, gap: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                border: '2px solid', borderColor: active ? 'primary.main' : 'divider',
                bgcolor: active ? (t) => alpha(t.palette.primary.main, 0.08) : 'background.paper',
                transition: 'border-color .15s, background-color .15s, box-shadow .15s',
                boxShadow: active ? (t) => `0 6px 16px ${alpha(t.palette.primary.main, 0.18)}` : 'none',
                '&:hover': { borderColor: active ? 'primary.main' : 'text.disabled' },
              }}
            >
              {active && (
                <Box sx={{
                  position: 'absolute', top: -8, right: -8, width: 22, height: 22, borderRadius: '50%',
                  bgcolor: 'primary.main', color: 'primary.contrastText', display: 'grid', placeItems: 'center',
                }}
                >
                  <CheckIcon sx={{ fontSize: 14 }} />
                </Box>
              )}
              <Box sx={{ width: 44, height: 44, borderRadius: 2.5, display: 'grid', placeItems: 'center', bgcolor: `${m.color}1F` }}>
                <Icon sx={{ color: m.color, fontSize: 22 }} />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{m.label}</Typography>
            </ButtonBase>
          );
        })}
      </Box>

      <Box sx={{ mt: 2.5, p: 2, borderRadius: 3, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Received Amount (₹)</Typography>
            <Stack
              direction="row"
              sx={{
                mt: 0.5, px: 1.5, height: 56, alignItems: 'center', gap: 1, borderRadius: 2,
                // Sky Mist fill — matches the search field / table header
                // treatment used on the billing step for this theme.
                bgcolor: '#F3F8FF', border: '1px solid', borderColor: '#CFE4FF',
                '&:focus-within': { borderColor: 'primary.main', boxShadow: (t) => `0 0 0 3px ${alpha(t.palette.primary.main, 0.15)}` },
              }}
            >
              <Typography sx={{ color: 'text.secondary', fontSize: 20, fontWeight: 700 }}>₹</Typography>
              <InputBase
                fullWidth
                value={amountText}
                onChange={handleAmountChange}
                placeholder="0"
                inputProps={{ inputMode: 'decimal', 'aria-label': 'Received amount' }}
                sx={{ fontSize: 24, fontWeight: 800 }}
              />
            </Stack>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" sx={{ color: short ? 'error.main' : 'success.main', fontWeight: 600 }}>
              {short ? 'Amount short' : 'Change to return'}
            </Typography>
            <Stack
              direction="row"
              sx={{
                mt: 0.5, px: 1.5, height: 56, alignItems: 'center', borderRadius: 2,
                border: '1px solid',
                borderColor: (t) => alpha(short ? t.palette.error.main : t.palette.success.main, 0.35),
                bgcolor: (t) => alpha(short ? t.palette.error.main : t.palette.success.main, 0.1),
              }}
            >
              <Typography sx={{ fontSize: 24, fontWeight: 800, color: short ? 'error.main' : 'success.main' }}>
                {formatCurrency(Math.abs(changeAmount), { decimals: true })}
              </Typography>
            </Stack>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mr: 0.5 }}>Quick cash</Typography>
          {chips.map((chip) => {
            const active = Number(receivedAmount) === chip.value && chip.value > 0;
            return (
              <ButtonBase
                key={chip.label}
                onClick={() => onReceivedAmountChange(chip.value)}
                sx={{
                  px: 1.75, py: 0.5, borderRadius: 5, fontSize: 12.5, fontWeight: 700,
                  border: '1px solid', borderColor: active ? 'primary.main' : 'divider',
                  bgcolor: active ? (t) => alpha(t.palette.primary.main, 0.1) : 'background.paper',
                  color: active ? 'primary.main' : 'text.primary',
                }}
              >
                {chip.label}
              </ButtonBase>
            );
          })}
        </Stack>
      </Box>
    </Paper>
  );
}
