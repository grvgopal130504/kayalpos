import { useState } from 'react';
import {
  Stack, Box, Typography, Button, Menu, MenuItem, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';
import InfoCard from '../../components/common/InfoCard';
import DataTable from '../../components/common/DataTable';
import DonutChart from '../../components/common/DonutChart';
import TrendChart from '../../components/common/TrendChart';
import PeriodSelect from '../../components/common/PeriodSelect';
import { formatCurrency, formatNumber } from '../../utils/format';

import PromotionSummaryCards from './components/PromotionSummaryCards';
import PromotionTable from './components/PromotionTable';
import PromotionDetailsCard from './components/PromotionDetailsCard';
import {
  SUMMARY, PROMOTIONS, PROMOTION_DETAILS, PROMOTION_PERFORMANCE,
  TOP_PROMOTIONS, DISCOUNT_TREND, OUTLET_USAGE,
} from './promotionMockData';

const PROMOTION_BY_CODE = Object.fromEntries(PROMOTIONS.map((p) => [p.code, p]));

/**
 * "Promotion" card from the landing grid — the full module overview:
 * summary tiles, the promotion list + a detail panel for whichever row is
 * selected, and performance/usage reporting below. The Promotion backend
 * module doesn't exist yet, so everything is driven by promotionMockData.js
 * — selecting a row from PROMOTIONS other than PROMO-0001 falls back to
 * reusing PROMOTION_DETAILS' shape (only the name/code/status differ) since
 * we don't have full mock detail records for all 28 rows.
 */
export default function PromotionOverviewPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [trendPeriod, setTrendPeriod] = useState('month');
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [selectedCode, setSelectedCode] = useState(PROMOTION_DETAILS.code);

  const selectedRow = PROMOTION_BY_CODE[selectedCode];
  const promotionDetails = selectedCode === PROMOTION_DETAILS.code
    ? PROMOTION_DETAILS
    : { ...PROMOTION_DETAILS, code: selectedRow.code, name: selectedRow.name, status: selectedRow.status };

  const handleSelectPromotion = (row) => setSelectedCode(row.code);
  const handleRowAction = (label, row) => dispatch(showToast(`${label} "${row.name}" is coming soon`, 'info'));
  const handleImport = () => dispatch(showToast('Import Promotion is coming soon', 'info'));
  const handleCreate = () => navigate('/promotion/create');
  const handleFilters = () => dispatch(showToast('Filters are coming soon', 'info'));
  const handleEdit = () => dispatch(showToast('Edit Promotion is coming soon', 'info'));
  const handleMoreAction = (label) => {
    setMoreActionsAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };

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
            <MuiLink component={RouterLink} to="/promotion" underline="hover" color="text.secondary">Promotion</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>All Promotions</Typography>
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

      <PromotionSummaryCards summary={SUMMARY} />

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{ height: { lg: 560 } }}>
            <PromotionTable
              promotions={PROMOTIONS}
              selectedCode={selectedCode}
              onSelectPromotion={handleSelectPromotion}
              onRowAction={handleRowAction}
              onFilters={handleFilters}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ height: { lg: 560 } }}>
            <PromotionDetailsCard promotion={promotionDetails} onEdit={handleEdit} />
          </Box>
        </Grid>
      </Grid>

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
          <InfoCard title="Top Promotions" subtitle="By Usage" link={{ label: 'View All Promotions', to: '/promotion/overview' }} dense>
            <DataTable columns={topPromotionColumns} rows={TOP_PROMOTIONS} getRowKey={(r) => r.name} dense />
          </InfoCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <InfoCard
            title="Discount Trend"
            action={<PeriodSelect value={trendPeriod} onChange={setTrendPeriod} options={[{ value: 'month', label: 'This Month' }, { value: 'week', label: 'This Week' }]} />}
          >
            <TrendChart categories={DISCOUNT_TREND.categories} values={DISCOUNT_TREND.values} height={200} valueFormatter={(v) => formatCurrency(v)} />
          </InfoCard>
        </Grid>

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
    </Stack>
  );
}
