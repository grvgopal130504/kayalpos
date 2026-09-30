import { useMemo, useState } from 'react';
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
import { formatCurrency, formatNumber } from '../../utils/format';

import PromotionTable from './components/PromotionTable';
import PromotionDetailsCard from './components/PromotionDetailsCard';
import PromotionActivityCard from './components/PromotionHistoryCard';
import CreatePromotionPage from './CreatePromotionPage';
import PromotionViewPage from './PromotionViewPage';
import { useGetPromotionsQuery, useDeletePromotionMutation } from '../../api/promotionApi';
import { useGetProductsQuery } from '../../api/productApi';
import { useDiscountSummaryQuery } from '../../api/saleApi';
import {
  toPromotionRow, toPromotionDetails, buildPerformanceByType, buildTopPromotions,
  buildUpcomingSchedule, buildPromotionHistory,
} from './promotionDisplay';

const STATUS_META = {
  active: { label: 'Active Promotions', icon: PlayCircleOutlinedIcon, iconColor: 'success' },
  upcoming: { label: 'Upcoming Promotions', icon: AccessTimeOutlinedIcon, iconColor: 'success' },
  expired: { label: 'Expired Promotions', icon: PauseCircleOutlinedIcon, iconColor: 'error' },
};

const EXTRA_TILE_ICONS = [CardGiftcardOutlinedIcon, CurrencyRupeeOutlinedIcon, ShoppingCartOutlinedIcon, PieChartOutlineOutlinedIcon];
const EXTRA_TILE_COLORS = ['info', '#E5484D', '#F5A623', '#8B5CF6'];
const PERFORMANCE_COLORS = ['#22A06B', '#2563EB', '#F5A623', '#8B5CF6', '#E5484D'];

/**
 * Landing page for the sidebar's Promotion item. Fully wired to the
 * backend — the list, the selected-row detail panel, Create/Edit/View, and
 * every card on this page (including the bottom analytics section) are all
 * derived from the real Promotion table (see backend/src/modules/promotion)
 * — nothing here is mock data, so an empty table correctly shows empty
 * charts and "no data yet" states instead of pretend numbers.
 *
 * Per-promotion "Discount Given"/usage figures are honestly zero: nothing
 * in the app applies a *promotion's* discount to an actual Sale yet (Line
 * Sale has no "apply promotion" step), so there's no real redemption data
 * to report there.
 *
 * "Discount Trend" and "Discount by Outlet" (the last two analytics cards)
 * are real, but deliberately report something different and more honest:
 * the bill-level discount a cashier actually applied at checkout (Sale's
 * own `discountAmount`, from Line Sale's discount fields), summed by day /
 * by outlet — see backend/src/modules/sale's getDiscountSummary(). That
 * data exists today; promotion-specific redemption data doesn't, so this
 * page never pretends otherwise.
 */
export default function PromotionPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');
  const [mode, setMode] = useState('list');
  const [activeId, setActiveId] = useState(null);
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [deletePromotion] = useDeletePromotionMutation();

  const { data: promotions = [], isLoading, isError } = useGetPromotionsQuery({});
  const { data: products = [] } = useGetProductsQuery({});
  const { data: discountSummary } = useDiscountSummaryQuery(undefined, { skip: tab !== 'all' });
  const productNameByCode = useMemo(() => Object.fromEntries(products.map((p) => [p.code, p.name])), [products]);

  const promotionById = useMemo(() => Object.fromEntries(promotions.map((p) => [p.id, p])), [promotions]);
  const rows = useMemo(() => promotions.map(toPromotionRow), [promotions]);

  const filteredForTab = useMemo(
    () => (tab === 'all' ? promotions : promotions.filter((p) => p.status === tab)),
    [promotions, tab],
  );

  const performanceData = useMemo(() => buildPerformanceByType(promotions), [promotions]);
  const topPromotions = useMemo(() => buildTopPromotions(promotions), [promotions]);
  const upcomingSchedule = useMemo(() => buildUpcomingSchedule(promotions), [promotions]);

  const goToList = () => { setActiveId(null); setMode('list'); };
  const openEdit = (id) => { setActiveId(id); setMode('edit'); };
  const openView = (id) => { setActiveId(id); setMode('view'); };

  if (mode === 'create' || mode === 'edit') {
    return (
      <CreatePromotionPage
        id={mode === 'edit' ? activeId : undefined}
        onBack={(savedId) => {
          if (savedId) setSelectedId(savedId);
          if (mode === 'edit') return openView(savedId || activeId);
          return goToList();
        }}
      />
    );
  }

  if (mode === 'view') {
    return <PromotionViewPage id={activeId} onBack={goToList} onEdit={() => openEdit(activeId)} />;
  }

  const selectedPromotion = (selectedId && promotionById[selectedId]) || filteredForTab[0] || promotions[0];
  const promotionDetails = selectedPromotion ? toPromotionDetails(selectedPromotion, productNameByCode) : null;

  const handleTabChange = (nextTab) => {
    setTab(nextTab);
    const first = nextTab === 'all' ? promotions[0] : promotions.find((p) => p.status === nextTab);
    setSelectedId(first?.id || null);
  };
  const handleSelectPromotion = (row) => setSelectedId(row.id);
  const handleRowAction = async (label, row) => {
    if (label === 'View') return openView(row.id);
    if (label === 'Edit') return openEdit(row.id);
    if (label === 'Delete') {
      try {
        await deletePromotion(row.id).unwrap();
        dispatch(showToast(`Promotion "${row.name}" deleted`, 'success'));
        if (selectedId === row.id) setSelectedId(null);
      } catch (err) {
        dispatch(showToast(err?.data?.message || 'Failed to delete the promotion', 'error'));
      }
      return undefined;
    }
    return dispatch(showToast(`${label} "${row.name}" is coming soon`, 'info'));
  };
  const handleImport = () => dispatch(showToast('Import Promotion is coming soon', 'info'));
  const handleCreate = () => setMode('create');
  const handleFilters = () => dispatch(showToast('Filters are coming soon', 'info'));
  const handleEdit = () => selectedPromotion && openEdit(selectedPromotion.id);
  const handleViewAllItems = () => selectedPromotion && openView(selectedPromotion.id);
  const handleMoreAction = (label) => {
    setMoreActionsAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };

  const total = promotions.length;
  const activeCount = promotions.filter((p) => p.status === 'active').length;
  const upcomingCount = promotions.filter((p) => p.status === 'upcoming').length;
  const expiredCount = promotions.filter((p) => p.status === 'expired').length;
  // Honestly zero rather than a fabricated number — see the module doc
  // comment above on why redemption stats aren't computed yet.
  const couponsUsed = promotions.reduce((sum, p) => sum + (p.usageCount || 0), 0);

  const meta = STATUS_META[tab];
  const tiles = tab === 'all'
    ? [
      { icon: LocalOfferOutlinedIcon, iconColor: '#8B5CF6', label: 'Total Promotions', value: formatNumber(total), caption: 'All Time' },
      { icon: PlayCircleOutlinedIcon, iconColor: 'success', label: 'Active Promotions', value: formatNumber(activeCount), caption: 'Currently Running' },
      { icon: AccessTimeOutlinedIcon, iconColor: 'warning', label: 'Upcoming Promotions', value: formatNumber(upcomingCount), caption: 'Starts in Future' },
      { icon: PauseCircleOutlinedIcon, iconColor: 'error', label: 'Expired Promotions', value: formatNumber(expiredCount), caption: 'Already Ended' },
      { icon: CardGiftcardOutlinedIcon, iconColor: 'info', label: 'Coupon/Offers Used', value: formatNumber(couponsUsed), caption: 'All Time' },
      { icon: CurrencyRupeeOutlinedIcon, iconColor: '#E5484D', label: 'Discount Given', value: formatCurrency(0, { decimals: true }), caption: 'Not yet tracked' },
    ]
    : [
      { icon: meta.icon, iconColor: meta.iconColor, label: meta.label, value: formatNumber(filteredForTab.length), caption: tab === 'active' ? 'Currently Running' : tab === 'upcoming' ? 'Starts in Future' : 'Already Ended' },
      { icon: EXTRA_TILE_ICONS[0], iconColor: EXTRA_TILE_COLORS[0], label: 'Coupon/Offers Used', value: formatNumber(filteredForTab.reduce((s, p) => s + (p.usageCount || 0), 0)), caption: 'All Time' },
      { icon: EXTRA_TILE_ICONS[1], iconColor: EXTRA_TILE_COLORS[1], label: 'Discount Given', value: formatCurrency(0, { decimals: true }), caption: 'Not yet tracked' },
      { icon: EXTRA_TILE_ICONS[2], iconColor: EXTRA_TILE_COLORS[2], label: 'Transactions', value: formatNumber(0), caption: 'Not yet tracked' },
      { icon: EXTRA_TILE_ICONS[3], iconColor: EXTRA_TILE_COLORS[3], label: 'Average Discount / Bill', value: formatCurrency(0, { decimals: true }), caption: 'Not yet tracked' },
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
              promotions={rows}
              selectedCode={promotionDetails?.code}
              onSelectPromotion={handleSelectPromotion}
              onRowAction={handleRowAction}
              onFilters={handleFilters}
              tab={tab}
              onTabChange={handleTabChange}
              showUsageColumn={tab !== 'all'}
              showPageSizeSelector={tab !== 'all'}
              nameColumnLabel={tab === 'all' ? 'Promotion Name' : 'Promotion Name (Code)'}
              usageColumnLabel={tab === 'all' ? undefined : promotionDetails?.usageColumnLabel}
              searchPlaceholder={tab === 'all' ? 'Search promotion by name or code…' : `Search ${meta.label.toLowerCase()} by name or code…`}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ height: { lg: tab === 'all' ? 560 : 460 } }}>
            {promotionDetails ? (
              <PromotionDetailsCard
                promotion={promotionDetails}
                onEdit={handleEdit}
                editLabel={tab === 'all' ? undefined : 'Edit Promotion'}
                onViewAllItems={tab === 'all' ? undefined : handleViewAllItems}
              />
            ) : (
              <Stack sx={{ height: '100%', alignItems: 'center', justifyContent: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 3 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {isLoading ? 'Loading promotions…' : isError ? 'Failed to load promotions' : 'No promotions yet — create one to get started'}
                </Typography>
              </Stack>
            )}
          </Box>
        </Grid>
      </Grid>

      {tab === 'all' && (
        <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <InfoCard title="Promotion Performance" subtitle="By promotion type">
              {performanceData.length > 0 ? (
                <DonutChart
                  data={performanceData}
                  centerValue={formatNumber(promotions.length)}
                  centerLabel="Total Promotions"
                  formatValue={(v) => formatNumber(v)}
                  size={140}
                />
              ) : (
                <EmptyChartState message="No promotions yet — create one to see a breakdown by type." />
              )}
            </InfoCard>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <InfoCard title="Top Promotions" subtitle="By usage" dense>
              {topPromotions.length > 0 ? (
                <DataTable columns={topPromotionColumns} rows={topPromotions} getRowKey={(r) => r.name} dense />
              ) : (
                <EmptyChartState message="No promotions yet." />
              )}
            </InfoCard>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <InfoCard title="Discount Trend" subtitle="Last 7 days, from billed sales">
              {discountSummary?.trend?.values?.some((v) => v > 0) ? (
                <TrendChart
                  categories={discountSummary.trend.categories}
                  values={discountSummary.trend.values}
                  height={160}
                  valueFormatter={(v) => formatCurrency(v)}
                />
              ) : (
                <EmptyChartState message="No discounts billed in the last 7 days." />
              )}
            </InfoCard>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <InfoCard title="Discount by Outlet" subtitle="Last 7 days, from billed sales">
              {discountSummary?.byOutlet?.length > 0 ? (
                <DonutChart
                  data={discountSummary.byOutlet.map((row, i) => ({
                    id: row.outletId, label: row.name, value: row.total,
                    color: PERFORMANCE_COLORS[i % PERFORMANCE_COLORS.length],
                  }))}
                  centerValue={formatCurrency(discountSummary.byOutlet.reduce((s, r) => s + r.total, 0), { decimals: true })}
                  centerLabel="Total Discount"
                  formatValue={(v) => formatCurrency(v, { decimals: true })}
                  size={140}
                />
              ) : (
                <EmptyChartState message="No discounts billed in the last 7 days." />
              )}
            </InfoCard>
          </Grid>
        </Grid>
      )}

      {tab === 'upcoming' && (
        upcomingSchedule.length > 0 ? (
          <PromotionActivityCard
            title="Upcoming Promotion Schedule"
            columns={[
              { key: 'date', label: 'Date' },
              { key: 'name', label: 'Promotion' },
              { key: 'type', label: 'Type' },
              { key: 'discount', label: 'Discount' },
            ]}
            rows={upcomingSchedule}
          />
        ) : null
      )}

      {(tab === 'active' || tab === 'expired') && selectedPromotion && (
        <PromotionActivityCard
          title="Promotion History"
          columns={[
            { key: 'date', label: 'Date' },
            { key: 'action', label: 'Action' },
            { key: 'user', label: 'User' },
          ]}
          rows={buildPromotionHistory(selectedPromotion)}
        />
      )}
    </Stack>
  );
}

function EmptyChartState({ message }) {
  return (
    <Stack sx={{ height: 160, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{message}</Typography>
    </Stack>
  );
}

