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
 * Right-hand "Wastage Details" panel for whichever row is selected in
 * StockWastageTable — wastage no/date/status header, then location details
 * on the left and prepared/approved-by details on the right.
 */
export default function StockWastageDetailsCard({ wastage, onEdit }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2.5, sm: 3 }, height: '100%' }}>
      <Stack spacing={2.5}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Wastage Details</Typography>
          <Button variant="outlined" color="inherit" size="small" startIcon={<EditOutlinedIcon fontSize="small" />} onClick={onEdit}>
            Edit Wastage
          </Button>
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: 'rgba(213,52,59,0.12)', color: '#D5343B', fontWeight: 700, fontSize: 15,
            }}
          >
            WS
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>{wastage.code}</Typography>
              <StatusBadge status={wastage.status} label={wastage.status === 'draft' ? 'Draft' : 'Approved'} />
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{wastage.date}</Typography>
          </Box>
        </Stack>

        {wastage.wastageReason && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>{wastage.wastageReason}</Typography>
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <DetailField label="Outlet / Location" value={wastage.outletLocation} />
            <DetailField label="Wastage Type" value={wastage.wastageType} />
            <DetailField label="Department / Section" value={wastage.department} />
            <DetailField label="Cost Center" value={wastage.costCenter} />
          </Stack>
          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <DetailField label="Warehouse" value={wastage.warehouse} />
            <DetailField label="Bin / Rack" value={wastage.binRack} />
            <DetailField label="Prepared By" value={wastage.preparedBy} />
            <DetailField label="Approved By" value={wastage.approvedBy} />
          </Stack>
        </Stack>

        <Stack direction="row" spacing={3}>
          <DetailField label="Items" value={formatNumber(wastage.items)} />
          <DetailField label="Wastage Value" value={formatCurrency(wastage.wastageValue, { decimals: true })} valueColor="error.main" />
        </Stack>
      </Stack>
    </Paper>
  );
}
