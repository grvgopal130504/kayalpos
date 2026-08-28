import { useFormContext, useWatch } from 'react-hook-form';
import { Paper, Stack, Box, Typography, Chip, Divider } from '@mui/material';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';

import { formatCurrency } from '../../../utils/format';
import { MAXIMUM_USAGE_OPTIONS, YES_NO_OPTIONS } from '../createGiftVoucherSchema';

const TERMS = [
  'This gift voucher is non-refundable and cannot be exchanged for cash.',
  'Voucher can only be used during the validity period.',
  'Minimum bill amount must be met for redemption.',
  'This voucher is applicable only on selected items/categories.',
  'Management reserves the right to modify or cancel this voucher at any time.',
];

function SummaryField({ label, value }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>{value || '-'}</Typography>
    </Box>
  );
}

const APPLICABLE_TO_LABELS = { all: 'All Items', specific: 'Specific Items', category: 'Category' };

/**
 * Right-hand live preview for the Create Gift Voucher form — Voucher
 * Summary, Terms & Conditions, and an invoice-style preview card. Reads
 * the form's current values via `useWatch`, mirroring
 * PromotionPreviewPanel's pattern.
 */
export default function VoucherPreviewPanel() {
  const { control } = useFormContext();
  const values = useWatch({ control });

  const validTillDisplay = values.noExpiry ? 'No Expiry' : (values.validTill || '-');
  const maxUsageLabel = MAXIMUM_USAGE_OPTIONS.find((o) => o.value === values.maximumUsage)?.label;
  const oneTimeLabel = YES_NO_OPTIONS.find((o) => o.value === values.oneTimePerCustomer)?.label;
  const partialLabel = YES_NO_OPTIONS.find((o) => o.value === values.partialRedemptionAllowed)?.label;
  const applicableToLabel = APPLICABLE_TO_LABELS[values.applicableTo];

  const valueDisplay = values.voucherValue
    ? (values.voucherType === 'Percentage Discount' ? `${values.voucherValue}%` : `₹${values.voucherValue}`)
    : '-';
  const minBillDisplay = values.minimumBillAmount ? `₹${values.minimumBillAmount}` : '₹0.00';
  const invoiceValue = values.voucherValue
    ? (values.voucherType === 'Percentage Discount' ? `${values.voucherValue}%` : formatCurrency(Number(values.voucherValue), { decimals: true }))
    : '₹500.00';

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ borderRadius: 3, p: 2.5, bgcolor: 'rgba(242,107,33,0.04)' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Voucher Summary</Typography>

        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
            <Box
              sx={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: 'rgba(37,99,235,0.12)', color: '#2563EB',
              }}
            >
              <CardGiftcardOutlinedIcon fontSize="small" />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>
                  {values.voucherName || 'New Voucher'}
                </Typography>
                <Chip label="New" size="small" sx={{ bgcolor: 'rgba(242,107,33,0.12)', color: 'primary.main', fontWeight: 700, height: 22 }} />
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>VCHR-XXXX</Typography>
            </Box>
          </Stack>
          <Box sx={{ textAlign: 'right', flexShrink: 0, pl: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Status</Typography>
            <Chip label="Draft" size="small" sx={{ bgcolor: '#FFF4E5', color: '#B5730A', fontWeight: 700, height: 22, mt: 0.25 }} />
          </Box>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Stack spacing={1.75} sx={{ flex: 1, minWidth: 0 }}>
            <SummaryField label="Voucher Type" value={values.voucherType} />
            <SummaryField label="Voucher Value" value={valueDisplay} />
            <SummaryField label="Valid From" value={values.validFrom} />
            <SummaryField label="Valid Till" value={validTillDisplay} />
            <SummaryField label="Minimum Bill Amount" value={minBillDisplay} />
          </Stack>
          <Stack spacing={1.75} sx={{ flex: 1, minWidth: 0 }}>
            <SummaryField label="Maximum Usage" value={maxUsageLabel} />
            <SummaryField label="One Time Per Customer" value={oneTimeLabel} />
            <SummaryField label="Partial Redemption" value={partialLabel} />
            <SummaryField label="Applicable To" value={applicableToLabel} />
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
            borderRadius: 3, p: 2.5, borderStyle: 'dashed', borderColor: 'success.main',
            bgcolor: 'rgba(34,160,107,0.04)',
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
                bgcolor: 'rgba(34,160,107,0.12)', color: 'success.main',
              }}
            >
              <CardGiftcardOutlinedIcon fontSize="medium" />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'success.main' }}>
                GIFT VOUCHER
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Use this voucher and save more on your shopping!
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'success.main', lineHeight: 1.1 }}>
                {invoiceValue}
              </Typography>
              <Chip label="VALUE" size="small" sx={{ bgcolor: 'success.main', color: '#fff', fontWeight: 700, height: 20, mt: 0.5 }} />
            </Box>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Stack spacing={1.25} sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Voucher Code</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>VCHR-XXXX</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Valid Till</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>{validTillDisplay}</Typography>
              </Stack>
            </Stack>
            <Stack spacing={1.25} sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Minimum Bill Amount</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>{minBillDisplay}</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Terms</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>* T&amp;C Apply</Typography>
              </Stack>
            </Stack>
          </Stack>

          <Divider sx={{ borderColor: 'rgba(34,160,107,0.25)', mb: 1.5 }} />
          <Typography variant="body2" align="center" sx={{ color: 'success.main', fontStyle: 'italic', fontWeight: 600 }}>
            Thank you for shopping with us!
          </Typography>
        </Paper>

        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
          Note: This is only a preview. Actual appearance may vary in invoice print.
        </Typography>
      </Box>
    </Stack>
  );
}
