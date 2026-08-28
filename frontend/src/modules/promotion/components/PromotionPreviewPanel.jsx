import { useFormContext, useWatch } from 'react-hook-form';
import { Paper, Stack, Box, Typography, Chip, Button } from '@mui/material';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';

import { MAXIMUM_USAGE_OPTIONS } from '../createPromotionSchema';

const TERMS = [
  'Offer applicable on listed items only.',
  'Not valid with other promotions.',
  'Minimum bill amount and usage limit (if any) must be met.',
  'Offer valid only during the selected period.',
  'Management reserves the right to modify or cancel this promotion at any time.',
];

function SummaryField({ label, value }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>{value || '-'}</Typography>
    </Box>
  );
}

/**
 * Right-hand live preview for the Create Promotion form — Promotion
 * Summary, Items/Categories, Terms & Conditions, and an invoice-line
 * preview. Reads the form's current values via `useWatch` so it updates as
 * the person fills the form in, without the form itself needing to know
 * the preview exists.
 */
export default function PromotionPreviewPanel({ onSelectItems }) {
  const { control } = useFormContext();
  const values = useWatch({ control });

  const discountValueDisplay = values.discountValue
    ? (values.discountUnit === '₹' ? `₹${values.discountValue}` : `${values.discountValue}%`)
    : '-';
  const minBillDisplay = values.minimumBillAmount ? `₹${values.minimumBillAmount}` : '-';
  const maxUsageLabel = MAXIMUM_USAGE_OPTIONS.find((o) => o.value === values.maximumUsage)?.label;
  const endDateDisplay = values.noExpiry ? 'No Expiry' : (values.endDate || '-');

  const youSave = values.discountValue
    ? (values.discountUnit === '₹' ? `₹${Number(values.discountValue).toFixed(2)}` : `${values.discountValue}% off`)
    : '₹0.00';

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ borderRadius: 3, p: 2.5, bgcolor: 'rgba(242,107,33,0.04)' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Promotion Summary</Typography>

        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
            <Box
              sx={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: 'rgba(242,107,33,0.12)', color: 'primary.main',
              }}
            >
              <LocalOfferOutlinedIcon fontSize="small" />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>
                  {values.promotionName || 'Promotion Name'}
                </Typography>
                <Chip label="New" size="small" sx={{ bgcolor: 'rgba(242,107,33,0.12)', color: 'primary.main', fontWeight: 700, height: 22 }} />
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>PROMO-XXXX</Typography>
            </Box>
          </Stack>
          <Box sx={{ textAlign: 'right', flexShrink: 0, pl: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Status</Typography>
            <Chip label="Draft" size="small" sx={{ bgcolor: '#FFF4E5', color: '#B5730A', fontWeight: 700, height: 22, mt: 0.25 }} />
          </Box>
        </Stack>

        <Stack spacing={1.75}>
          <Stack direction="row" spacing={2}>
            <Box sx={{ flex: 1, minWidth: 0 }}><SummaryField label="Promotion Type" value={values.promotionType} /></Box>
            <Box sx={{ flex: 1, minWidth: 0 }}><SummaryField label="Discount Type" value={values.discountType} /></Box>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <SummaryField label="Applies To" value={values.appliesTo === 'all' ? 'All Items' : values.appliesTo === 'specific' ? 'Specific Items' : values.appliesTo === 'category' ? 'Category' : ''} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}><SummaryField label="Discount Value" value={discountValueDisplay} /></Box>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Box sx={{ flex: 1, minWidth: 0 }}><SummaryField label="Start Date" value={values.startDate} /></Box>
            <Box sx={{ flex: 1, minWidth: 0 }}><SummaryField label="Minimum Bill Amount" value={minBillDisplay} /></Box>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Box sx={{ flex: 1, minWidth: 0 }}><SummaryField label="End Date" value={endDateDisplay} /></Box>
            <Box sx={{ flex: 1, minWidth: 0 }}><SummaryField label="Maximum Usage" value={maxUsageLabel} /></Box>
          </Stack>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Items / Categories</Typography>
        <Box
          sx={{
            border: '1px dashed', borderColor: 'divider', borderRadius: 2, p: 3,
            textAlign: 'center', bgcolor: 'background.default',
          }}
        >
          <Inventory2OutlinedIcon sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
          {values.appliesTo === 'all' || !values.appliesTo ? (
            <>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>No items or categories selected</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                This promotion will be applied to all items.
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                No {values.appliesTo === 'category' ? 'category' : 'items'} selected yet
              </Typography>
              <Button variant="outlined" size="small" onClick={onSelectItems}>
                + Select {values.appliesTo === 'category' ? 'Category' : 'Items'}
              </Button>
            </>
          )}
        </Box>
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

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3, p: 2.5, borderStyle: 'dashed', borderColor: 'success.main',
          bgcolor: 'rgba(34,160,107,0.04)',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
          Preview (How it will appear in invoice)
        </Typography>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: 'rgba(34,160,107,0.12)', color: 'success.main',
            }}
          >
            <SellOutlinedIcon fontSize="small" />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'success.main' }}>
              {values.promotionName ? values.promotionName.toUpperCase() : 'PROMOTION'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              This promotion will be applied to the invoice
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>You Save</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'success.main' }}>{youSave}</Typography>
          </Box>
        </Stack>
      </Paper>
    </Stack>
  );
}
