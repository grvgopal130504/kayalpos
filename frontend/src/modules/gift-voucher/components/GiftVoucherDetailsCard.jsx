import { Paper, Stack, Box, Typography, Button } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

import StatusBadge from '../../../components/common/StatusBadge';
import { formatCurrency, formatNumber } from '../../../utils/format';

function DetailField({ label, value, valueColor }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, color: valueColor || 'text.primary' }}>{value}</Typography>
    </Box>
  );
}

/**
 * Right-hand "Voucher Details" panel for whichever row is selected in
 * GiftVoucherTable — name/code/status header, then voucher info on the left
 * and validity/usage figures on the right.
 */
export default function GiftVoucherDetailsCard({ voucher, onEdit }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2.5, sm: 3 }, height: '100%' }}>
      <Stack spacing={2.5}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Voucher Details</Typography>
          <Button variant="outlined" color="inherit" size="small" startIcon={<EditOutlinedIcon fontSize="small" />} onClick={onEdit}>
            Edit Voucher
          </Button>
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: 'rgba(139,92,246,0.12)', color: '#8B5CF6', fontWeight: 700, fontSize: 16,
            }}
          >
            GV
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>{voucher.name}</Typography>
              <StatusBadge status={voucher.status} label={voucher.status === 'active' ? 'Active' : voucher.status === 'expired' ? 'Expired' : 'Inactive'} />
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{voucher.code}</Typography>
          </Box>
        </Stack>

        {voucher.description && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>{voucher.description}</Typography>
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <DetailField label="Voucher Type" value={voucher.type} />
            <DetailField label="Voucher Value" value={voucher.value} />
            <DetailField label="Applicable To" value={voucher.applicableTo} />
            <DetailField label="Maximum Usage" value={voucher.maximumUsage} />
          </Stack>
          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <DetailField label="Valid From" value={voucher.validFrom} />
            <DetailField label="Valid Till" value={voucher.validTill} />
            <DetailField label="Minimum Bill Amount" value={voucher.minimumBillAmount} />
            <DetailField label="Redemptions (Till Date)" value={formatNumber(voucher.redemptionsTillDate)} />
          </Stack>
        </Stack>

        <DetailField
          label="Value Redeemed"
          value={formatCurrency(voucher.valueRedeemed, { decimals: true })}
          valueColor="success.main"
        />
      </Stack>
    </Paper>
  );
}
