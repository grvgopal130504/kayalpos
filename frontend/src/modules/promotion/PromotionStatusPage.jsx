import { useState } from 'react';
import {
  Stack, Box, Typography, Button, Menu, MenuItem, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import PauseCircleOutlinedIcon from '@mui/icons-material/PauseCircleOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import PieChartOutlineOutlinedIcon from '@mui/icons-material/PieChartOutlineOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';
import StatCard from '../../components/common/StatCard';
import { formatCurrency, formatNumber } from '../../utils/format';

import PromotionTable from './components/PromotionTable';
import PromotionDetailsCard from './components/PromotionDetailsCard';
import PromotionActivityCard from './components/PromotionHistoryCard';
import {
  PROMOTIONS, STATUS_DETAILS, STATUS_STATS, PROMOTION_HISTORY, EXPIRED_PROMOTION_HISTORY, UPCOMING_SCHEDULE,
} from './promotionMockData';

const PROMOTION_BY_CODE = Object.fromEntries(PROMOTIONS.map((p) => [p.code, p]));

const STATUS_META = {
  active: {
    label: 'Active Promotions', tab: 'active', icon: PlayCircleOutlinedIcon, iconColor: 'success',
  },
  upcoming: {
    label: 'Upcoming Promotions', tab: 'upcoming', icon: AccessTimeOutlinedIcon, iconColor: 'success',
  },
  expired: {
    label: 'Expired Promotions', tab: 'expired', icon: PauseCircleOutlinedIcon, iconColor: 'error',
  },
};

const EXTRA_TILE_ICONS = [CardGiftcardOutlinedIcon, CurrencyRupeeOutlinedIcon, ShoppingCartOutlinedIcon, PieChartOutlineOutlinedIcon];
const EXTRA_TILE_COLORS = ['info', '#E5484D', '#F5A623', '#8B5CF6'];

/**
 * Shared page for the Active / Upcoming / Expired Promotions cards on the
 * Promotion landing grid — same list+details layout, scoped by `status`.
 * Stat tiles, the selected-promotion detail panel, and the bottom activity
 * card are all pulled from promotionMockData's per-status records
 * (STATUS_STATS / STATUS_DETAILS) so each status can use its own framing —
 * e.g. Upcoming talks about "Scheduled/Potential/Expected" figures and a
 * forward-looking schedule table, where Active/Expired talk about actual
 * usage and a Promotion History audit trail.
 */
export default function PromotionStatusPage({ status, embedded = false }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const meta = STATUS_META[status];
  const stats = STATUS_STATS[status];
  const detailsTemplate = STATUS_DETAILS[status];
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);

  const firstOfStatus = PROMOTIONS.find((p) => p.status === status) || PROMOTIONS[0];
  const [selectedCode, setSelectedCode] = useState(firstOfStatus.code);
  const selectedRow = PROMOTION_BY_CODE[selectedCode] || firstOfStatus;
  const promotionDetails = selectedCode === detailsTemplate.code
    ? detailsTemplate
    : { ...detailsTemplate, code: selectedRow.code, name: selectedRow.name, status: selectedRow.status };

  const handleSelectPromotion = (row) => setSelectedCode(row.code);
  const handleRowAction = (label, row) => {
    if (label === 'View') return navigate(`/promotion/view/${row.code}`);
    if (label === 'Edit') return navigate(`/promotion/edit/${row.code}`);
    return dispatch(showToast(`${label} "${row.name}" is coming soon`, 'info'));
  };
  const handleImport = () => dispatch(showToast('Import Promotion is coming soon', 'info'));
  const handleCreate = () => navigate('/promotion/create');
  const handleFilters = () => dispatch(showToast('Filters are coming soon', 'info'));
  const handleEdit = () => dispatch(showToast('Edit Promotion is coming soon', 'info'));
  const handleMoreAction = (label) => {
    setMoreActionsAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };

  const tiles = [
    { icon: meta.icon, iconColor: meta.iconColor, label: meta.label, value: formatNumber(stats.count.value), caption: stats.count.caption },
    ...stats.extra.map((tile, i) => ({
      icon: EXTRA_TILE_ICONS[i],
      iconColor: EXTRA_TILE_COLORS[i],
      label: tile.label,
      value: tile.currency ? formatCurrency(tile.value, { decimals: true }) : formatNumber(tile.value),
      caption: tile.caption,
    })),
  ];

  return (
    <Stack spacing={2}>
      {!embedded && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Promotion</Typography>
            <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
              <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
              <MuiLink component={RouterLink} to="/promotion" underline="hover" color="text.secondary">Promotion</MuiLink>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{meta.label}</Typography>
            </Breadcrumbs>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" color="inherit" startIcon={<FileUploadOutlinedIcon fontSize="small" />} onClick={handleImport}>
              Import Promotion
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
              Create Promotion
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              endIcon={<ExpandMoreIcon />}
              onClick={(e) => setMoreActionsAnchor(e.currentTarget)}
            >
              More Actions
            </Button>
            <Menu anchorEl={moreActionsAnchor} open={Boolean(moreActionsAnchor)} onClose={() => setMoreActionsAnchor(null)}>
              <MenuItem onClick={() => handleMoreAction('Export Promotions')}>Export Promotions</MenuItem>
              <MenuItem onClick={() => handleMoreAction('Bulk Deactivate')}>Bulk Deactivate</MenuItem>
              <MenuItem onClick={() => handleMoreAction('Promotion Settings')}>Promotion Settings</MenuItem>
            </Menu>
          </Stack>
        </Stack>
      )}

      <Grid container spacing={2}>
        {tiles.map((tile) => (
          <Grid key={tile.label} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
            <StatCard icon={tile.icon} iconColor={tile.iconColor} iconShape="circle" label={tile.label} value={tile.value} caption={tile.caption} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{ height: { lg: 460 } }}>
            <PromotionTable
              promotions={PROMOTIONS}
              selectedCode={selectedCode}
              onSelectPromotion={handleSelectPromotion}
              onRowAction={handleRowAction}
              onFilters={handleFilters}
              defaultTab={meta.tab}
              showUsageColumn
              showPageSizeSelector
              nameColumnLabel="Promotion Name (Code)"
              usageColumnLabel={detailsTemplate.usageColumnLabel}
              searchPlaceholder={`Search ${meta.label.toLowerCase()} by name or code…`}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ height: { lg: 460 } }}>
            <PromotionDetailsCard
              promotion={promotionDetails}
              onEdit={handleEdit}
              editLabel="Edit Promotion"
              onViewAllItems={() => dispatch(showToast('View All Items is coming soon', 'info'))}
            />
          </Box>
        </Grid>
      </Grid>

      {status === 'upcoming' ? (
        <PromotionActivityCard
          title="Upcoming Promotion Schedule"
          linkLabel="View Full Schedule"
          columns={[
            { key: 'date', label: 'Date' },
            { key: 'name', label: 'Promotion' },
            { key: 'type', label: 'Type' },
            { key: 'discount', label: 'Discount' },
          ]}
          rows={UPCOMING_SCHEDULE}
        />
      ) : (
        <PromotionActivityCard
          title="Promotion History"
          linkLabel="View Full History"
          columns={[
            { key: 'date', label: 'Date' },
            { key: 'action', label: 'Action', sticky: false },
            { key: 'user', label: 'User' },
          ]}
          rows={status === 'expired' ? EXPIRED_PROMOTION_HISTORY : PROMOTION_HISTORY}
        />
      )}
    </Stack>
  );
}
