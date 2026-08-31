import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper,
} from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

import { useAppDispatch } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { showToast } from '../../features/ui/uiSlice';
import StatCard from '../../components/common/StatCard';
import { DatePickerField } from '../../components/form/FormDatePicker';
import { formatCurrency } from '../../utils/format';

import CashReconciliationTransactionsTable from './components/CashReconciliationTransactionsTable';
import { CASHIER, CASH_RECONCILIATION } from './cashierPanelMockData';

function SummaryTile({ label, value, valueColor }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2.5, p: 1.75, height: '100%' }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{label}</Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: valueColor || 'text.primary', mt: 0.25 }}>
        {value}
      </Typography>
    </Paper>
  );
}

function signedCurrency(value) {
  const formatted = formatCurrency(Math.abs(value), { decimals: true });
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}

function varianceColor(value) {
  if (value > 0) return 'success.main';
  if (value < 0) return 'error.main';
  return 'text.primary';
}

/**
 * Variance-by-type donut for the reconciliation summary — built directly
 * on PieChart (rather than the shared DonutChart) because each legend
 * row here needs its own two-line "count Reconciliations (pct%)" / signed
 * value layout, which the shared component's single-line legend doesn't
 * support. The pie itself uses each type's reconciliation count (always
 * positive) so an "Exact Match" slice with ₹0 variance still renders.
 */
function VarianceDonut({ data, centerLabel, centerValue, size = 160 }) {
  const totalCount = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'center' }}>
      <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <PieChart
          series={[
            {
              data: data.map((d) => ({ id: d.id, label: d.label, value: d.count, color: d.color })),
              innerRadius: size * 0.32,
              outerRadius: size * 0.5,
              paddingAngle: 1,
              cornerRadius: 1,
            },
          ]}
          width={size}
          height={size}
          hideLegend
          margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
          slotProps={{ tooltip: { trigger: 'item' } }}
          sx={{ '& .MuiPieArc-root': { stroke: 'none' } }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            textAlign: 'center',
            px: 2,
          }}
        >
          {centerValue && (
            <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: 14, lineHeight: 1.2, color: varianceColor(centerValue.raw) }}>
              {centerValue.text}
            </Typography>
          )}
          {centerLabel && (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10.5 }}>
              {centerLabel}
            </Typography>
          )}
        </Box>
      </Box>

      <Stack spacing={1.25} sx={{ width: '100%', minWidth: 0 }}>
        {data.map((slice) => (
          <Stack key={slice.id} direction="row" spacing={1} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Stack spacing={0.1} sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: slice.color, flexShrink: 0 }} />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{slice.label}</Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary', pl: 2 }}>
                {slice.count} Reconciliation{slice.count === 1 ? '' : 's'} ({totalCount ? Math.round((slice.count / totalCount) * 100 * 100) / 100 : 0}%)
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ fontWeight: 700, flexShrink: 0, color: varianceColor(slice.value) }}>
              {signedCurrency(slice.value)}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}

/**
 * Cash Reconciliation — the cashier's system-vs-counted cash report
 * reached from the Cashier Panel's "Cash Reconciliation" quick action.
 * Same overall shape as the other cashier-panel report pages, but the
 * Reconciliation Summary panel tracks System Cash vs Counted Cash with
 * signed Variance / Variance (%) tiles plus a Cash Short/Over and
 * Balanced-status readout, and the breakdown is "Variance Summary (By
 * Type)" (Cash Short / Cash Over / Exact Match).
 *
 * There's no sales-reporting backend wired to this screen yet, so every
 * figure comes from CASH_RECONCILIATION mock data.
 */
export default function CashReconciliationPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { stats, summary, byType, transactions, totalPages } = CASH_RECONCILIATION;
  const [selectedDate, setSelectedDate] = useState(CASH_RECONCILIATION.selectedDate);

  const handleViewAll = () => dispatch(showToast('Full cash reconciliation list is coming soon', 'info'));
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Cash Reconciliation</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/cashier-panel" underline="hover" color="text.secondary">Cashier Panel</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Cash Reconciliation</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#2563EB' }}>
            Cashier : {CASHIER.name} ({CASHIER.code})
          </Typography>
          <MuiLink
            component="button"
            type="button"
            variant="body2"
            underline="hover"
            onClick={handleLogout}
            sx={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 0.5, color: '#2563EB' }}
          >
            <LogoutOutlinedIcon fontSize="inherit" /> Logout
          </MuiLink>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            icon={PointOfSaleOutlinedIcon}
            iconColor="success"
            iconShape="circle"
            label="Total Reconciliations"
            value={formatCurrency(stats.totalReconciliations.value, { decimals: true })}
            caption={`Transactions : ${stats.totalReconciliations.transactions}`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            icon={DescriptionOutlinedIcon}
            iconColor="#2563EB"
            iconShape="circle"
            label="Total Reconciled"
            value={String(stats.totalReconciled.value)}
            caption="Total Quantity : -"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            icon={CurrencyRupeeOutlinedIcon}
            iconColor="warning"
            iconShape="circle"
            label="Average Variance"
            value={formatCurrency(stats.avgVariance.value, { decimals: true })}
            caption="Per Reconciliation"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            icon={CalendarTodayOutlinedIcon}
            iconColor="#8B5CF6"
            iconShape="circle"
            label="Today's Reconciliation"
            value={formatCurrency(stats.todaysReconciliation.value, { decimals: true })}
            caption={`${stats.todaysReconciliation.transactions} Transaction${stats.todaysReconciliation.transactions === 1 ? '' : 's'}`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            icon={CalendarTodayOutlinedIcon}
            iconColor="#0EA5A4"
            iconShape="circle"
            label="Selected Date Reconciliation"
            value={formatCurrency(stats.selectedDateReconciliation.value, { decimals: true })}
            caption={stats.selectedDateReconciliation.date}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Reconciliation Summary</Typography>
              <DatePickerField
                value={selectedDate}
                onChange={setSelectedDate}
                sx={{ width: { xs: '100%', sm: 200 } }}
              />
            </Stack>

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <SummaryTile label="Total Reconciliation" value={formatCurrency(summary.totalReconciliation, { decimals: true })} valueColor="#2563EB" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <SummaryTile label="Total Transactions" value={String(summary.totalTransactions)} valueColor="#2563EB" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <SummaryTile label="Reconciled By" value={summary.reconciledBy} valueColor="#2563EB" />
              </Grid>
            </Grid>

            <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <SummaryTile label="Total System Cash" value={formatCurrency(summary.totalSystemCash, { decimals: true })} valueColor="#2563EB" />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <SummaryTile label="Total Counted Cash" value={formatCurrency(summary.totalCountedCash, { decimals: true })} valueColor="success.main" />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <SummaryTile label="Total Variance" value={signedCurrency(summary.totalVariance)} valueColor={varianceColor(summary.totalVariance)} />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <SummaryTile label="Variance ( % )" value={`${summary.variancePercent > 0 ? '+' : ''}${summary.variancePercent.toFixed(2)}%`} valueColor={varianceColor(summary.variancePercent)} />
              </Grid>
            </Grid>

            <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 6 }}>
                <SummaryTile label="Cash Short / Over" value={summary.cashShortOver} valueColor="error.main" />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <SummaryTile label="Status" value={summary.status} valueColor="success.main" />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Variance Summary (By Type)</Typography>
            <VarianceDonut
              data={byType}
              centerValue={{ text: signedCurrency(summary.totalVariance), raw: summary.totalVariance }}
              centerLabel="Total Variance"
            />
          </Paper>
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Recent Cash Reconciliation Transactions</Typography>
          <MuiLink
            component="button"
            type="button"
            variant="body2"
            underline="hover"
            onClick={handleViewAll}
            sx={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center' }}
          >
            View All <NavigateNextIcon fontSize="small" />
          </MuiLink>
        </Stack>
        <CashReconciliationTransactionsTable rows={transactions} totalPages={totalPages} page={page} onPageChange={setPage} />
      </Paper>
    </Stack>
  );
}
