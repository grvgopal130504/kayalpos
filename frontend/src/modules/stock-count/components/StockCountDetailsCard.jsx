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
 * Right-hand "Count Details" panel for whichever row is selected in
 * StockCountTable — count no/date/status header, then location & method
 * details on the left and timing/sign-off details on the right.
 */
export default function StockCountDetailsCard({ count, onEdit }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2.5, sm: 3 }, height: '100%' }}>
      <Stack spacing={2.5}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Count Details</Typography>
          <Button variant="outlined" color="inherit" size="small" startIcon={<EditOutlinedIcon fontSize="small" />} onClick={onEdit}>
            Edit Count
          </Button>
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: 'rgba(37,99,235,0.12)', color: '#2563EB', fontWeight: 700, fontSize: 15,
            }}
          >
            CT
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>{count.code}</Typography>
              <StatusBadge status={count.status} label={count.status === 'draft' ? 'Draft' : 'Completed'} />
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{count.date}</Typography>
          </Box>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <DetailField label="Warehouse" value={count.warehouse} />
            <DetailField label="Count Type" value={count.countType} />
            <DetailField label="Count By" value={count.countBy} />
            <DetailField label="Department / Section" value={count.department} />
            <DetailField label="Cost Center" value={count.costCenter} />
          </Stack>
          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <DetailField label="Count Reason" value={count.countReason} />
            <DetailField label="Start Count Time" value={count.startCountTime} />
            <DetailField label="End Count Time" value={count.endCountTime} />
            <DetailField label="Prepared By" value={count.preparedBy} />
            <DetailField label="Approved By" value={count.approvedBy} />
          </Stack>
        </Stack>

        <Stack direction="row" spacing={3}>
          <DetailField label="Items" value={formatNumber(count.items)} />
          <DetailField
            label="Variance Value"
            value={formatCurrency(count.varianceValue, { decimals: true })}
            valueColor={count.varianceValue < 0 ? 'error.main' : 'success.main'}
          />
        </Stack>
      </Stack>
    </Paper>
  );
}
