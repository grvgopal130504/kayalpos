import { useEffect, useState } from 'react';
import { Box, Stack, Typography, ButtonBase, TextField, InputAdornment, Paper } from '@mui/material';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CreditScoreOutlinedIcon from '@mui/icons-material/CreditScoreOutlined';
import InfoCard from '../../../components/common/InfoCard';
import { formatCurrency } from '../../../utils/format';

const METHOD_ICONS = {
  cash: PaymentsOutlinedIcon,
  upi: QrCode2OutlinedIcon,
  card: CreditCardOutlinedIcon,
  wallet: AccountBalanceWalletOutlinedIcon,
  credit: CreditScoreOutlinedIcon,
};

export default function PaymentMethodsCard({
  methods, selectedMethod, onSelectMethod,
  receivedAmount, onReceivedAmountChange, quickAmounts, changeAmount,
}) {
  // The field keeps its own text so typing behaves like a normal amount box:
  // empty when zero (no leading "0" in front of what you type), and "84."
  // survives mid-typing. The parent still receives a clean number, and the
  // text re-syncs whenever the amount changes from outside (quick-amount
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

  return (
    <InfoCard title="Payment Methods" dense sx={{ height: '100%' }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {methods.map((m) => {
            const Icon = METHOD_ICONS[m.key];
            const active = m.key === selectedMethod;
            return (
              <ButtonBase
                key={m.key}
                onClick={() => onSelectMethod(m.key)}
                sx={{
                  flex: '1 1 90px',
                  minWidth: 90,
                  py: 1,
                  px: 1,
                  borderRadius: 2,
                  border: '1.5px solid',
                  borderColor: active ? m.color : 'divider',
                  bgcolor: active ? `${m.color}14` : 'transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <Icon fontSize="small" sx={{ color: m.color }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: active ? m.color : 'text.primary' }}>
                  {m.label}
                </Typography>
              </ButtonBase>
            );
          })}
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <TextField
              label="Received Amount (₹)"
              size="small"
              fullWidth
              value={amountText}
              onChange={handleAmountChange}
              placeholder="0"
              slotProps={{
                input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> },
                htmlInput: { inputMode: 'decimal' },
              }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1, mb: 0.5 }}>
              Quick Amount
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {quickAmounts.map((amt) => {
                const active = Number(receivedAmount) === amt;
                return (
                  <ButtonBase
                    key={amt}
                    onClick={() => onReceivedAmountChange(amt)}
                    sx={{
                      px: 1.5, py: 0.5, borderRadius: 1.5,
                      border: '1px solid', borderColor: active ? 'success.main' : 'divider',
                      bgcolor: active ? 'rgba(34,160,107,0.1)' : 'transparent',
                      color: active ? 'success.main' : 'text.primary',
                      fontSize: 12.5, fontWeight: 700,
                    }}
                  >
                    {formatCurrency(amt)}
                  </ButtonBase>
                );
              })}
            </Stack>
          </Box>

          <Paper
            variant="outlined"
            sx={{
              flex: '0 0 auto', minWidth: { sm: 150 }, borderRadius: 2, p: 1.5,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              bgcolor: 'background.default',
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Change Amount</Typography>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, color: changeAmount < 0 ? 'error.main' : 'text.primary' }}
            >
              {formatCurrency(Math.abs(changeAmount), { decimals: true })}
            </Typography>
          </Paper>
        </Stack>
      </Stack>
    </InfoCard>
  );
}
