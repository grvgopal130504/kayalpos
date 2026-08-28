import { useFormContext, useWatch } from 'react-hook-form';
import { Paper, Stack, Box, Typography, Chip, Divider } from '@mui/material';
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';

import {
  EARN_POINTS_ON_OPTIONS, POINTS_TYPE_OPTIONS, REDEMPTION_TYPE_OPTIONS,
  MEMBERSHIP_VALIDITY_OPTIONS, POINTS_EXPIRY_OPTIONS,
} from '../createLoyaltyProgramSchema';

const PURPLE = '#7C3AED';

const TERMS = [
  'Points are earned based on the rules defined in this program.',
  'Points cannot be transferred or exchanged for cash.',
  'Management reserves the right to modify or cancel the program at any time.',
  'Points are valid as per the points expiry rule defined.',
  'Other terms and conditions may apply.',
];

function labelFor(options, value) {
  return options.find((o) => o.value === value)?.label;
}

function SummaryField({ label, value }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>{value || '-'}</Typography>
    </Box>
  );
}

/**
 * Right-hand live preview for the Create Loyalty Program form — Program
 * Summary, Terms & Conditions, and an invoice-style preview card. Reads
 * the form's current values via `useWatch`, mirroring
 * PromotionPreviewPanel / VoucherPreviewPanel's pattern.
 */
export default function LoyaltyPreviewPanel() {
  const { control } = useFormContext();
  const values = useWatch({ control });

  const earnPointsOnLabel = labelFor(EARN_POINTS_ON_OPTIONS, values.earnPointsOn);
  const pointsTypeLabel = labelFor(POINTS_TYPE_OPTIONS, values.pointsType);
  const pointsValueDisplay = values.pointsValue
    ? (values.pointsType === 'percentage' ? `${values.pointsValue}%` : values.pointsValue)
    : '-';
  const redemptionTypeLabel = labelFor(REDEMPTION_TYPE_OPTIONS, values.redemptionType);
  const redemptionValueDisplay = values.redemptionValue ? `₹${values.redemptionValue}` : '-';
  const maxDiscountDisplay = values.maximumDiscountPerTransaction ? `₹${values.maximumDiscountPerTransaction}` : '-';
  const membershipValidityLabel = labelFor(MEMBERSHIP_VALIDITY_OPTIONS, values.membershipValidity);
  const pointsExpiryLabel = labelFor(POINTS_EXPIRY_OPTIONS, values.pointsExpiry);
  const welcomePointsDisplay = values.welcomePointsEnabled ? `${values.welcomePointsValue || 0} Points` : 'Disabled';

  const earnRuleText = values.pointsValue
    ? (values.pointsType === 'percentage'
      ? `Earn ${values.pointsValue}% of bill as points`
      : `1 Point for every ₹100 spent`)
    : '1 Point for every ₹100 spent';
  const redeemRuleText = values.minimumPointsRequired && values.redemptionValue
    ? `${values.minimumPointsRequired} Points = ₹${values.redemptionValue}`
    : '100 Points = ₹10.00';
  const minPointsText = values.minimumPointsRequired ? `${values.minimumPointsRequired} Points` : '100 Points';
  const pointsValidityText = values.pointsExpiry ? (pointsExpiryLabel || '12 Months') : '12 Months';
  const availablePointsValue = values.minimumPointsRequired || '250';
  const availablePointsWorth = values.redemptionValue ? Number(values.redemptionValue).toFixed(2) : '25.00';

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ borderRadius: 3, p: 2.5, bgcolor: 'rgba(242,107,33,0.04)' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Program Summary</Typography>

        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
            <Box
              sx={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: 'rgba(124,58,237,0.12)', color: PURPLE,
              }}
            >
              <FavoriteOutlinedIcon fontSize="small" />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>
                  {values.programName || 'New Loyalty Program'}
                </Typography>
                <Chip label="New" size="small" sx={{ bgcolor: 'rgba(242,107,33,0.12)', color: 'primary.main', fontWeight: 700, height: 22 }} />
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>LOYALTY-XXXX</Typography>
            </Box>
          </Stack>
          <Box sx={{ textAlign: 'right', flexShrink: 0, pl: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Status</Typography>
            <Chip
              label={values.status || 'Active'}
              size="small"
              sx={{
                bgcolor: values.status === 'Inactive' ? '#FDECEC' : '#E8F7EF',
                color: values.status === 'Inactive' ? 'error.main' : 'success.main',
                fontWeight: 700, height: 22, mt: 0.25,
              }}
            />
          </Box>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Stack spacing={1.75} sx={{ flex: 1, minWidth: 0 }}>
            <SummaryField label="Earn Points On" value={earnPointsOnLabel} />
            <SummaryField label="Points Type" value={pointsTypeLabel} />
            <SummaryField label="Points Value" value={pointsValueDisplay} />
            <SummaryField label="Redemption Type" value={redemptionTypeLabel} />
            <SummaryField label="Redemption Value" value={redemptionValueDisplay} />
            <SummaryField label="Minimum Points Required" value={values.minimumPointsRequired} />
          </Stack>
          <Stack spacing={1.75} sx={{ flex: 1, minWidth: 0 }}>
            <SummaryField label="Maximum Discount (Per Transaction)" value={maxDiscountDisplay} />
            <SummaryField label="Membership Validity" value={membershipValidityLabel} />
            <SummaryField label="Points Expiry" value={pointsExpiryLabel} />
            <SummaryField label="Welcome Points" value={welcomePointsDisplay} />
            <SummaryField label="Program Status" value={values.status} />
          </Stack>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Terms &amp; Conditions</Typography>
        <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2.5 }}>
          {TERMS.map((term) => (
            <Typography key={term} component="li" variant="body2" sx={{ color: 'text.secondary' }}>
              {term}
            </Typography>
          ))}
        </Stack>
      </Paper>

      <Box>
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 3, p: 2.5, borderStyle: 'dashed', borderColor: PURPLE,
            bgcolor: 'rgba(124,58,237,0.04)',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Preview (How it will appear in invoice)
          </Typography>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', mb: 2.5 }}>
            <Box
              sx={{
                width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: 'rgba(124,58,237,0.12)', color: PURPLE,
              }}
            >
              <EmojiEventsOutlinedIcon fontSize="medium" />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: PURPLE }}>
                LOYALTY REWARDS
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Earn points on your purchases and redeem exciting rewards!
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
              <Typography variant="caption" sx={{ color: PURPLE, fontWeight: 600, display: 'block' }}>
                Available Points
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: PURPLE, lineHeight: 1.1 }}>
                {availablePointsValue} PTS
              </Typography>
              <Chip label={`₹ ${availablePointsWorth} VALUE`} size="small" sx={{ bgcolor: PURPLE, color: '#fff', fontWeight: 700, height: 20, mt: 0.5 }} />
            </Box>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap', rowGap: 2 }}>
            <Box sx={{ flex: '1 1 45%', minWidth: 120 }}>
              <Typography variant="caption" sx={{ color: PURPLE, fontWeight: 600, display: 'block' }}>Earn</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{earnRuleText}</Typography>
            </Box>
            <Box sx={{ flex: '1 1 45%', minWidth: 120 }}>
              <Typography variant="caption" sx={{ color: PURPLE, fontWeight: 600, display: 'block' }}>Redeem</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{redeemRuleText}</Typography>
            </Box>
            <Box sx={{ flex: '1 1 45%', minWidth: 120 }}>
              <Typography variant="caption" sx={{ color: PURPLE, fontWeight: 600, display: 'block' }}>Min. Points Required</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{minPointsText}</Typography>
            </Box>
            <Box sx={{ flex: '1 1 45%', minWidth: 120 }}>
              <Typography variant="caption" sx={{ color: PURPLE, fontWeight: 600, display: 'block' }}>Points Validity</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{pointsValidityText}</Typography>
            </Box>
          </Stack>

          <Divider sx={{ borderColor: 'rgba(124,58,237,0.25)', mb: 1.5 }} />
          <Typography variant="body2" align="center" sx={{ color: PURPLE, fontStyle: 'italic', fontWeight: 600 }}>
            Thank you for being a valued member!
          </Typography>
        </Paper>

        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
          Note: This is only a preview. Actual appearance may vary in invoice print.
        </Typography>
      </Box>
    </Stack>
  );
}
