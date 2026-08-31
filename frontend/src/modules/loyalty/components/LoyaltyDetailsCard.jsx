import { Paper, Stack, Box, Typography, Button } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

import StatusBadge from '../../../components/common/StatusBadge';
import { formatNumber } from '../../../utils/format';

function DetailField({ label, value, valueColor }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, color: valueColor || 'text.primary' }}>{value}</Typography>
    </Box>
  );
}

/**
 * Right-hand "Program Details" panel for whichever row is selected in
 * LoyaltyTable — name/code/status header, then earning/redemption rules on
 * the left and validity/points figures on the right.
 */
export default function LoyaltyDetailsCard({ program, onEdit }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2.5, sm: 3 }, height: '100%' }}>
      <Stack spacing={2.5}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Program Details</Typography>
          <Button variant="outlined" color="inherit" size="small" startIcon={<EditOutlinedIcon fontSize="small" />} onClick={onEdit}>
            Edit Program
          </Button>
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: 'rgba(37,99,235,0.12)', color: '#2563EB', fontWeight: 700, fontSize: 16,
            }}
          >
            LP
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>{program.name}</Typography>
              <StatusBadge status={program.status} label={program.status} />
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{program.code}</Typography>
          </Box>
        </Stack>

        {program.description && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>{program.description}</Typography>
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <DetailField label="Earn Points On" value={program.earnPointsOn} />
            <DetailField label="Points Type" value={program.pointsType} />
            <DetailField label="Points Value" value={program.pointsValue} />
            <DetailField label="Redemption Type" value={program.redemptionType} />
            <DetailField label="Redemption Value" value={program.redemptionValue} />
          </Stack>
          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <DetailField label="Minimum Points Required" value={formatNumber(program.minimumPointsRequired)} />
            <DetailField label="Membership Validity" value={program.membershipValidity} />
            <DetailField label="Points Expiry" value={program.pointsExpiry} />
            <DetailField label="Members Enrolled" value={formatNumber(program.members)} />
            <DetailField label="Points Issued (Till Date)" value={formatNumber(program.pointsIssuedTillDate)} />
          </Stack>
        </Stack>

        <DetailField
          label="Points Redeemed (Till Date)"
          value={formatNumber(program.pointsRedeemedTillDate)}
          valueColor="success.main"
        />
      </Stack>
    </Paper>
  );
}
