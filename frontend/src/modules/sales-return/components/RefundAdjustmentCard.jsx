import { Paper, Stack, Typography, TextField, MenuItem, RadioGroup, FormControlLabel, Radio } from '@mui/material';

export default function RefundAdjustmentCard({
  refundMode, onRefundModeChange, refundTo, onRefundToChange, paymentMethods,
}) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: 2, height: '100%' }}>
      <Stack spacing={1.5}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Refund / Adjustment</Typography>

        <RadioGroup
          row
          value={refundMode}
          onChange={(e) => onRefundModeChange(e.target.value)}
        >
          <FormControlLabel value="refund" control={<Radio size="small" />} label={<Typography variant="body2">Refund</Typography>} />
          <FormControlLabel value="credit-note" control={<Radio size="small" />} label={<Typography variant="body2">Credit Note</Typography>} />
        </RadioGroup>

        <TextField
          select
          size="small"
          label="Refund To"
          value={refundTo}
          onChange={(e) => onRefundToChange(e.target.value)}
          fullWidth
          disabled={refundMode !== 'refund'}
          slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
        >
          <MenuItem value="">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Select Payment Method</Typography>
          </MenuItem>
          {paymentMethods.map((m) => (
            <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
          ))}
        </TextField>
      </Stack>
    </Paper>
  );
}
