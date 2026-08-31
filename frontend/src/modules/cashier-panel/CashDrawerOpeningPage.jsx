import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper,
} from '@mui/material';
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
import DonutChart from '../../components/common/DonutChart';
import { DatePickerField } from '../../components/form/FormDatePicker';
import { formatCurrency } from '../../utils/format';

import CashDrawerOpeningTransactionsTable from './components/CashDrawerOpeningTransactionsTable';
import { CASHIER, CASH_DRAWER_OPENING } from './cashierPanelMockData';

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

/**
 * Cash Drawer Opening — the cashier's drawer-opening report reached from
 * the Cashier Panel's "Cash Drawer Opening" quick action. Same overall
 * shape as the other cash-movement report pages (stat tiles + summary /
 * by-breakdown panels + transactions table), but the breakdown here is
 * "Opening Summary (By Time)" — when during the day cash was added to
 * the drawer — rather than a by-purpose split, and the Opening Summary
 * panel tracks Cash Given vs Closing Cash (Actual) with a Variance tile
 * instead of Total Sales.
 *
 * There's no sales-reporting backend wired to this screen yet, so every
 * figure comes from CASH_DRAWER_OPENING mock data.
 */
export default function CashDrawerOpeningPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { stats, summary, byTime, transactions, totalPages } = CASH_DRAWER_OPENING;
  const [selectedDate, setSelectedDate] = useState(CASH_DRAWER_OPENING.selectedDate);
  const totalByTime = byTime.reduce((sum, t) => sum + t.value, 0);

  const handleViewAll = () => dispatch(showToast('Full cash drawer opening list is coming soon', 'info'));
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Cash Drawer Opening</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/cashier-panel" underline="hover" color="text.secondary">Cashier Panel</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Cash Drawer Opening</Typography>
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
            label="Total Drawer Openings"
            value={formatCurrency(stats.totalDrawerOpenings.value, { decimals: true })}
            caption={`Transactions : ${stats.totalDrawerOpenings.transactions}`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            icon={DescriptionOutlinedIcon}
            iconColor="#2563EB"
            iconShape="circle"
            label="Total Openings"
            value={String(stats.totalOpenings.value)}
            caption="Total Quantity : -"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            icon={CurrencyRupeeOutlinedIcon}
            iconColor="warning"
            iconShape="circle"
            label="Average Opening Value"
            value={formatCurrency(stats.avgOpeningValue.value, { decimals: true })}
            caption="Per Transaction"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            icon={CalendarTodayOutlinedIcon}
            iconColor="#8B5CF6"
            iconShape="circle"
            label="Today's Drawer Opening"
            value={formatCurrency(stats.todaysDrawerOpening.value, { decimals: true })}
            caption={`${stats.todaysDrawerOpening.transactions} Transactions`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            icon={CalendarTodayOutlinedIcon}
            iconColor="#0EA5A4"
            iconShape="circle"
            label="Selected Date Opening"
            value={formatCurrency(stats.selectedDateOpening.value, { decimals: true })}
            caption={stats.selectedDateOpening.date}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Opening Summary</Typography>
              <DatePickerField
                value={selectedDate}
                onChange={setSelectedDate}
                sx={{ width: { xs: '100%', sm: 200 } }}
              />
            </Stack>

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <SummaryTile label="Total Drawer Opening" value={formatCurrency(summary.totalDrawerOpening, { decimals: true })} valueColor="#2563EB" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <SummaryTile label="Total Transactions" value={String(summary.totalTransactions)} valueColor="#2563EB" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <SummaryTile label="Total Opened By" value={summary.totalOpenedBy} valueColor="#2563EB" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <SummaryTile label="Cash Given" value={formatCurrency(summary.cashGiven, { decimals: true })} valueColor="#2563EB" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <SummaryTile label="Closing Cash (Actual)" value={formatCurrency(summary.closingCashActual, { decimals: true })} valueColor="success.main" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <SummaryTile label="Variance" value={formatCurrency(summary.variance, { decimals: true })} valueColor="text.primary" />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Opening Summary (By Time)</Typography>
            <Stack spacing={1.25} sx={{ mb: 2 }}>
              {byTime.map((t) => (
                <Stack key={t.id} direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>{t.label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {formatCurrency(t.value, { decimals: true })} ({totalByTime ? Math.round((t.value / totalByTime) * 100 * 100) / 100 : 0}%)
                  </Typography>
                </Stack>
              ))}
            </Stack>

            <DonutChart
              data={byTime}
              centerValue={formatCurrency(totalByTime, { decimals: true })}
              centerLabel="Total"
              formatValue={(v) => formatCurrency(v, { decimals: true })}
            />
          </Paper>
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Recent Cash Drawer Opening Transactions</Typography>
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
        <CashDrawerOpeningTransactionsTable rows={transactions} totalPages={totalPages} page={page} onPageChange={setPage} />
      </Paper>
    </Stack>
  );
}
