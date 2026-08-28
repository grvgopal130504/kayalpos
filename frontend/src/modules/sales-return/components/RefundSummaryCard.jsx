import { Stack, Typography } from '@mui/material';
import InfoCard from '../../../components/common/InfoCard';
import { formatCurrency } from '../../../utils/format';

/**
 * `totalReturnAmount` is this return's grand total. `alreadyRefunded` would
 * come from prior returns against the same invoice (none yet, since the
 * Sales Return backend doesn't exist — always 0 for now).
 */
export default function RefundSummaryCard({ totalReturnAmount, alreadyRefunded, invoicePaidAmount }) {
  const refundableAmount = Math.max(invoicePaidAmount - alreadyRefunded, 0);
  const remainingRefundable = Math.max(refundableAmount - totalReturnAmount, 0);

  const rows = [
    { label: 'Total Return Amount', value: totalReturnAmount },
    { label: 'Already Refunded', value: alreadyRefunded },
    { label: 'Refundable Amount', value: refundableAmount, color: 'success.main' },
    { label: 'This Return', value: totalReturnAmount, color: 'error.main' },
    { label: 'Remaining Refundable', value: remainingRefundable },
  ];

  return (
    <InfoCard title="Refund Summary" dense sx={{ height: '100%' }}>
      <Stack spacing={1.25}>
        {rows.map((row) => (
          <Stack key={row.label} direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ color: row.color ? row.color : 'text.secondary' }}>{row.label}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: row.color }}>
              {formatCurrency(row.value, { decimals: true })}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </InfoCard>
  );
}
