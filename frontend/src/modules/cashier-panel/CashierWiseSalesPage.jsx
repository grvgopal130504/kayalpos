import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper, Pagination,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

import { useAppDispatch } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { showToast } from '../../features/ui/uiSlice';
import StatCard from '../../components/common/StatCard';
import DonutChart from '../../components/common/DonutChart';
import { DatePickerField } from '../../components/form/FormDatePicker';
import { formatCurrency, formatNumber } from '../../utils/format';

import CashierWiseSalesTable from './components/CashierWiseSalesTable';
import CashierSalesTrendChart from './components/CashierSalesTrendChart';
import TopPerformingCashiers from './components/TopPerformingCashiers';
import { CASHIER, CASHIER_WISE_SALES } from './cashierPanelMockData';

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
 * Cashier Wise Sales — the store-wide, per-cashier sales report reached
 * from the Cashier Panel's "Cashier-wise Sales" quick action. Unlike the
 * other cashier-panel report pages, this one isn't scoped to the signed-in
 * cashier's own activity: it compares every cashier side by side via a
 * Sales Summary + Sales Contribution donut, a full per-cashier details
 * table, a multi-line Sales Trend chart, and a Top Performing Cashiers
 * ranked list.
 *
 * There's no sales-reporting backend wired to this screen yet, so every
 * figure comes from CASHIER_WISE_SALES mock data.
 */
export default function CashierWiseSalesPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { stats, summary, byCashier, cashiers, trend, topPerformers, totalPages } = CASHIER_WISE_SALES;
  const [selectedDate, setSelectedDate] = useState(CASHIER_WISE_SALES.selectedDate);

  const handleViewAll = () => dispatch(showToast('Full cashier wise sales list is coming soon', 'info'));
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Cashier Wise Sales</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/cashier-panel" underline="hover" color="text.secondary">Cashier Panel</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Cashier Wise Sales</Typography>
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
            icon={PeopleAltOutlinedIcon}
            iconColor="success"
            iconShape="circle"
            label="Total Sales (All Cashiers)"
            value={formatCurrency(stats.totalSalesAllCashiers.value, { decimals: true })}
            caption={`Transactions : ${stats.totalSalesAllCashiers.transactions}`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            icon={DescriptionOutlinedIcon}
            iconColor="#2563EB"
            iconShape="circle"
            label="Total Invoices"
            value={String(stats.totalInvoices.value)}
            caption={`Total Quantity : ${formatNumber(stats.totalInvoices.quantity)}`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            icon={CurrencyRupeeOutlinedIcon}
            iconColor="warning"
            iconShape="circle"
            label="Average Invoice Value"
            value={formatCurrency(stats.avgInvoiceValue.value, { decimals: true })}
            caption="Per Invoice"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            icon={CalendarTodayOutlinedIcon}
            iconColor="#8B5CF6"
            iconShape="circle"
            label="Today's Sales"
            value={formatCurrency(stats.todaysSales.value, { decimals: true })}
            caption={`${stats.todaysSales.transactions} Transactions`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            icon={CalendarTodayOutlinedIcon}
            iconColor="#0EA5A4"
            iconShape="circle"
            label="Selected Date Sales"
            value={formatCurrency(stats.selectedDateSales.value, { decimals: true })}
            caption={stats.selectedDateSales.date}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Sales Summary</Typography>
              <DatePickerField
                value={selectedDate}
                onChange={setSelectedDate}
                sx={{ width: { xs: '100%', sm: 200 } }}
              />
            </Stack>

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <SummaryTile label="Total Sales" value={formatCurrency(summary.totalSales, { decimals: true })} valueColor="#2563EB" />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <SummaryTile label="Total Transactions" value={String(summary.totalTransactions)} valueColor="#2563EB" />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <SummaryTile label="Total Quantity" value={formatNumber(summary.totalQuantity)} valueColor="#2563EB" />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <SummaryTile label="Total Invoices" value={String(summary.totalInvoices)} valueColor="#2563EB" />
              </Grid>
            </Grid>

            <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <SummaryTile label="Total Discounts" value={formatCurrency(summary.totalDiscounts, { decimals: true })} valueColor="error.main" />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <SummaryTile label="Total Returns" value={formatCurrency(summary.totalReturns, { decimals: true })} valueColor="error.main" />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <SummaryTile label="Net Sales" value={formatCurrency(summary.netSales, { decimals: true })} valueColor="success.main" />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <SummaryTile label="Tax Collected" value={formatCurrency(summary.taxCollected, { decimals: true })} valueColor="#2563EB" />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Sales Contribution (By Cashier)</Typography>
            <DonutChart
              data={byCashier}
              centerValue={formatCurrency(summary.totalSales, { decimals: true })}
              centerLabel="Total Sales"
              formatValue={(v) => formatCurrency(v, { decimals: true })}
            />
          </Paper>
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Cashier Wise Sales Details</Typography>
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
        <CashierWiseSalesTable rows={cashiers} />
      </Paper>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Sales Trend (By Cashier)</Typography>
            <CashierSalesTrendChart categories={trend.categories} series={trend.series} />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Top Performing Cashiers</Typography>
            <TopPerformingCashiers rows={topPerformers} />
          </Paper>
        </Grid>
      </Grid>

      {totalPages > 1 && (
        <Stack direction="row" sx={{ justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_e, value) => setPage(value)}
            showFirstButton
            showLastButton
            color="primary"
            shape="rounded"
          />
        </Stack>
      )}
    </Stack>
  );
}
