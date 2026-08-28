import { Paper, Stack, Box, Typography, Chip, Button, Grid, Avatar } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';

import StatusBadge from '../../../components/common/StatusBadge';
import { formatCurrency, formatNumber } from '../../../utils/format';

function Field({ label, value }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>{value}</Typography>
    </Box>
  );
}

const MAX_VISIBLE_ITEMS = 3;

/**
 * Right-hand detail panel for whichever promotion is selected in
 * PromotionTable. Fully data-driven — `promotion.fields` is a flat list of
 * {label, value} pairs rendered 2-up, since different promotion types
 * (Buy X Get Y vs Percentage Off vs Bundle Offer) surface different
 * relevant fields, and `promotion.usageSummary` is {title, rows} so the
 * box can be framed as "Usage Summary" (active/expired) or "Usage
 * Forecast" (upcoming) with different rows.
 */
export default function PromotionDetailsCard({ promotion, onEdit, editLabel = 'Edit', onViewAllItems }) {
  const visibleItems = promotion.items.slice(0, MAX_VISIBLE_ITEMS);
  const hiddenCount = promotion.items.length - visibleItems.length;

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, height: '100%', p: 2.5, overflow: 'auto' }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Promotion Details</Typography>
        <Button size="small" variant="outlined" startIcon={<EditOutlinedIcon fontSize="small" />} onClick={onEdit}>
          {editLabel}
        </Button>
      </Stack>

      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            width: 40, height: 40, borderRadius: 2, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: 'rgba(229,72,77,0.1)', color: 'error.main',
          }}
        >
          <LocalOfferOutlinedIcon fontSize="small" />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>{promotion.name}</Typography>
            <StatusBadge status={promotion.status} />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{promotion.code}</Typography>
        </Box>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {promotion.fields.map((field) => (
          <Grid key={field.label} size={6}>
            <Field label={field.label} value={field.value} />
          </Grid>
        ))}
      </Grid>

      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Applies To Items ({promotion.items.length})
        </Typography>
        {onViewAllItems && (
          <Button size="small" onClick={onViewAllItems} sx={{ fontWeight: 700, minWidth: 0 }}>
            View All Items
          </Button>
        )}
      </Stack>
      <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap', mb: 2.5, alignItems: 'center' }}>
        {visibleItems.map((item) => (
          <Chip
            key={item.code}
            avatar={<Avatar sx={{ bgcolor: item.color, fontWeight: 700 }}>{item.initial}</Avatar>}
            label={
              <Box sx={{ py: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>{item.name}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{item.code}</Typography>
              </Box>
            }
            variant="outlined"
            sx={{ height: 'auto', py: 0.5, '& .MuiChip-label': { px: 1 } }}
          />
        ))}
        {hiddenCount > 0 && (
          <Button
            variant="outlined"
            size="small"
            onClick={onViewAllItems}
            sx={{ fontWeight: 700, borderRadius: 2, flexShrink: 0 }}
          >
            +{hiddenCount} More
          </Button>
        )}
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 7 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Terms &amp; Conditions</Typography>
          <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2.5 }}>
            {promotion.terms.map((term) => (
              <Typography key={term} component="li" variant="body2" sx={{ color: 'text.secondary' }}>
                {term}
              </Typography>
            ))}
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, sm: 5 }}>
          <Paper variant="outlined" sx={{ borderRadius: 2, p: 1.75, bgcolor: 'background.default' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>{promotion.usageSummary.title}</Typography>
            <Stack spacing={0.75}>
              {promotion.usageSummary.rows.map((row) => (
                <Stack key={row.label} direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{row.label}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    {row.currency ? formatCurrency(row.value, { decimals: true }) : formatNumber(row.value)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
}
