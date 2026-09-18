import { useState } from 'react';
import {
  Stack, Box, Typography, Button, Menu, MenuItem, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
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
import InfoCard from '../../components/common/InfoCard';
import DataTable from '../../components/common/DataTable';
import DonutChart from '../../components/common/DonutChart';
import TrendChart from '../../components/common/TrendChart';
import PeriodSelect from '../../components/common/PeriodSelect';
import { formatCurrency, formatNumber } from '../../utils/format';

import PromotionTable from './components/PromotionTable';
import PromotionDetailsCard from './components/PromotionDetailsCard';
import PromotionActivityCard from './components/PromotionHistoryCard';
import CreatePromotionPage from './CreatePromotionPage';
import PromotionViewPage from './PromotionViewPage';
import {
  SUMMARY, PROMOTIONS, PROMOTION_DETAILS, STATUS_DETAILS, STATUS_STATS,
  PROMOTION_HISTORY, EXPIRED_PROMOTION_HISTORY, UPCOMING_SCHEDULE,
  PROMOTION_PERFORMANCE, TOP_PROMOTIONS, DISCOUNT_TREND, OUTLET_USAGE,
} from './promotionMockData';

const STATUS_META = {
  active: { label: 'Active Promotions', icon: PlayCircleOutlinedIcon, iconColor: 'success' },
  upcoming: { label: 'Upcoming Promotions', icon: AccessTimeOutlinedIcon, iconColor: 'success' },
  expired: { label: 'Expired Promotions', icon: PauseCircleOutlinedIcon, iconColor: 'error' },
};

const EXTRA_TILE_ICONS = [CardGiftcardOutlinedIcon, CurrencyRupeeOutlinedIcon, ShoppingCartOutlinedIcon, PieChartOutlineOutlinedIcon];
const EXTRA_TILE_COLORS = ['info', '#E5484D', '#F5A623', '#8B5CF6'];

// Reads live counts from the current PROMOTIONS array (so a promotion
// created/edited this session is reflected immediately) while leaving the
// couponsUsed/discountGiven figures as static mock summary values, since
// nothing in the app tracks real redemptions yet.
function buildAllTiles() {
  const total = PROMOTIONS.length;
  const active = PROMOTIONS.filter((p) => p.status === 'active').length;
  const upcoming = PROMOTIONS.filter((p) => p.status === 'upcoming').length;
  const expired = PROMOTIONS.filter((p) => p.status === 'expired').length;
  return [
    { icon: LocalOfferOutlinedIcon, iconColor: '#8B5CF6', label: 'Total Promotions', value: formatNumber(total), caption: SUMMARY.totalPromotions.caption },
    { icon: PlayCircleOutlinedIcon, iconColor: 'success', label: 'Active Promotions', value: formatNumber(active), caption: SUMMARY.activePromotions.caption },
    { icon: AccessTimeOutlinedIcon, iconColor: 'warning', label: 'Upcoming Promotions', value: formatNumber(upcoming), caption: SUMMARY.upcomingPromotions.caption },
    { icon: PauseCircleOutlinedIcon, iconColor: 'error', label: 'Expired Promotions', value: formatNumber(expired), caption: SUMMARY.expiredPromotions.caption },
    { icon: CardGiftcardOutlinedIcon, iconColor: 'info', label: 'Coupon/Offers Used', value: formatNumber(SUMMARY.couponsUsed.value), caption: SUMMARY.couponsUsed.caption },
    { icon: CurrencyRupeeOutlinedIcon, iconColor: '#E5484D', label: 'Discount Given', value: formatCurrency(SUMMARY.discountGiven.value, { decimals: true }), caption: SUMMARY.discountGiven.caption },
  ];
}

function firstPromotionFor(tab) {
  if (tab === 'all') return PROMOTION_DETAILS;
  return PROMOTIONS.find((p) => p.status === tab) || PROMOTIONS[0];
}

/**
 * Landing page for the sidebar's Promotion item. A single tab filter drives
 * everything on the page — stat tiles, the promotion list + selected-row
 * detail panel, and the bottom section — so switching between
 * All/Active/Upcoming/Expired (via the tab strip built into the promotion
 * list) updates the whole page instead of only filtering the table rows.
 * Create/Edit/View swap in via local state instead of separate
 * /create, /edit/:code, /view/:code routes. The Promotion backend module
 * doesn't exist yet, so everything is driven by promotionMockData.js.
 */
export default function PromotionPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');
  const [mode, setMode] = useState('list');
  const [activeCode, setActiveCode] = useState(null);
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [selectedCode, setSelectedCode] = useState(PROMOTION_DETAILS.code);

  // Recomputed on every render (rather than module scope) so a promotion
  // created or edited this session — which mutates PROMOTIONS in place —
  // is picked up immediately instead of only on a full page reload.
  const promotionByCode = Object.fromEntries(PROMOTIONS.map((p) => [p.code, p]));

  const goToList = () => { setActiveCode(null); setMode('list'); };
  const openEdit = (code) => { setActiveCode(code); setMode('edit'); };
  const openView = (code) => { setActiveCode(code); setMode('view'); };

  if (mode === 'create' || mode === 'edit') {
    return (
      <CreatePromotionPage
        code={mode === 'edit' ? activeCode : undefined}
        onBack={(savedCode) => {
          if (savedCode) setSelectedCode(savedCode);
          if (mode === 'edit') return openView(savedCode || activeCode);
          return goToList();
        }}
      />
    );
  }

  if (mode === 'view') {
    return <PromotionViewPage code={activeCode} onBack={goToList} onEdit={() => openEdit(activeCode)} />;
  }

  const detailsTemplate = tab === 'all' ? PROMOTION_DETAILS : STATUS_DETAILS[tab];
  const selectedRow = promotionByCode[selectedCode] || firstPromotionFor(tab);
  const promotionDetails = selectedCode === detailsTemplate.code
    ? detailsTemplate
    : { ...detailsTemplate, code: selectedRow.code, name: selectedRow.name, status: selectedRow.status };

  const handleTabChange = (nextTab) => {
    setTab(nextTab);
    setSelectedCode(nextTab === 'all' ? PROMOTION_DETAILS.code : STATUS_DETAILS[nextTab].code);
  };
  const handleSelectPromotion = (row) => setSelectedCode(row.code);
  const handleRowAction = (label, row) => {
    if (label === 'View') return openView(row.code);
    if (label === 'Edit') return openEdit(row.code);
    return dispatch(showToast(`${label} "${row.name}" is coming soon`, 'info'));
  };
  const handleImport = () => dispatch(showToast('Import Promotion is coming soon', 'info'));
  const handleCreate = () => setMode('create');
  const handleFilters = () => dispatch(showToast('Filters are coming soon', 'info'));
  const handleEdit = () => dispatch(showToast('Edit Promotion is coming soon', 'info'));
  const handleViewAllItems = () => dispatch(showToast('View All Items is coming soon', 'info'));
  const handleMoreAction = (label) => {
    setMoreActionsAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };

  const meta = STATUS_META[tab];
  const stats = STATUS_STATS[tab];
  const tiles = tab === 'all'
    ? buildAllTiles()
    : [
      { icon: meta.icon, iconColor: meta.iconColor, label: meta.label, value: formatNumber(stats.count.value), caption: stats.count.caption },
      ...stats.extra.map((tile, i) => ({
        icon: EXTRA_TILE_ICONS[i],
        iconColor: EXTRA_TILE_COLORS[i],
        label: tile.label,
        value: tile.currency ? formatCurrency(tile.value, { decimals: true }) : formatNumber(tile.value),
        caption: tile.caption,
      })),
    ];

  const topPromotionColumns = [
    { key: 'name', label: 'Promotion Name' },
    { key: 'usage', label: 'Usage (Times)', render: (row) => formatNumber(row.usage) },
    { key: 'discountGiven', label: 'Discount Given', align: 'right', render: (row) => formatCurrency(row.discountGiven, { decimals: true }) },
  ];

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Promotion</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            {tab === 'all' ? (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Promotion</Typography>
            ) : (
              <>
                <MuiLink component={RouterLink} to="/promotion" underline="hover" color="text.secondary">Promotion</MuiLink>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{meta.label}</Typography>
              </>
            )}
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
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

      <Grid container spacing={2}>
        {tiles.map((tile) => (
          <Grid key={tile.label} size={{ xs: 12, sm: 6, md: 4, lg: tab === 'all' ? 2 : 2.4 }}>
            <StatCard icon={tile.icon} iconColor={tile.iconColor} iconShape="circle" label={tile.label} value={tile.value} caption={tile.caption} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{ height: { lg: tab === 'all' ? 560 : 460 } }}>
            <PromotionTable
              key={tab}
              promotions={PROMOTIONS}
              selectedCode={selectedCode}
              onSelectPromotion={handleSelectPromotion}
              onRowAction={handleRowAction}
              onFilters={handleFilters}
              tab={tab}
              onTabChange={handleTabChange}
              showUsageColumn={tab !== 'all'}
              showPageSizeSelector={tab !== 'all'}
              nameColumnLabel={tab === 'all' ? 'Promotion Name' : 'Promotion Name (Code)'}
              usageColumnLabel={tab === 'all' ? undefined : detailsTemplate.usageColumnLabel}
              searchPlaceholder={tab === 'all' ? 'Search promotion by name or code…' : `Search ${meta.label.toLowerCase()} by name or code…`}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ height: { lg: tab === 'all' ? 560 : 460 } }}>
            <PromotionDetailsCard
              promotion={promotionDetails}
              onEdit={handleEdit}
              editLabel={tab === 'all' ? undefined : 'Edit Promotion'}
              onViewAllItems={tab === 'all' ? undefined : handleViewAllItems}
            />
          </Box>
        </Grid>
      </Grid>

      {tab === 'all' && (
        <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <InfoCard
              title="Promotion Performance"
              subtitle="This Month"
              link={{ label: 'View Report', to: '/reports' }}
            >
              <DonutChart
                data={PROMOTION_PERFORMANCE}
                centerValue={formatCurrency(PROMOTION_PERFORMANCE.reduce((s, d) => s + d.value, 0), { decimals: true })}
                centerLabel="Total Discount"
                formatValue={(v) => formatCurrency(v, { decimals: true })}
                size={140}
              />
            </InfoCard>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <InfoCard title="Top Promotions" subtitle="By Usage" link={{ label: 'View All Promotions', to: '/promotion' }} dense>
              <DataTable columns={topPromotionColumns} rows={TOP_PROMOTIONS} getRowKey={(r) => r.name} dense />
            </InfoCard>
          </Grid>

          <PromotionDiscountTrendCard />

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <InfoCard title="Promotion Usage by Outlet" link={{ label: 'View Detailed Report', to: '/reports' }}>
              <DonutChart
                data={OUTLET_USAGE}
                centerValue={formatNumber(OUTLET_USAGE.reduce((s, d) => s + d.value, 0))}
                centerLabel="Total Usage"
                formatValue={(v) => formatNumber(v)}
                size={140}
              />
            </InfoCard>
          </Grid>
        </Grid>
      )}

      {tab === 'upcoming' && (
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
      )}

      {(tab === 'active' || tab === 'expired') && (
        <PromotionActivityCard
          title="Promotion History"
          linkLabel="View Full History"
          columns={[
            { key: 'date', label: 'Date' },
            { key: 'action', label: 'Action' },
            { key: 'user', label: 'User' },
          ]}
          rows={tab === 'expired' ? EXPIRED_PROMOTION_HISTORY : PROMOTION_HISTORY}
        />
      )}
    </Stack>
  );
}

// Discount Trend card needs its own local state (selected period), pulled
// out so the surrounding grid stays readable.
function PromotionDiscountTrendCard() {
  const [trendPeriod, setTrendPeriod] = useState('month');
  return (
    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
      <InfoCard
        title="Discount Trend"
        action={<PeriodSelect value={trendPeriod} onChange={setTrendPeriod} options={[{ value: 'month', label: 'This Month' }, { value: 'week', label: 'This Week' }]} />}
      >
        <TrendChart categories={DISCOUNT_TREND.categories} values={DISCOUNT_TREND.values} height={200} valueFormatter={(v) => formatCurrency(v)} />
      </InfoCard>
    </Grid>
  );
}
