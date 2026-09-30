import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper, Skeleton, Alert,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout, selectCurrentUser } from '../../features/auth/authSlice';
import { showToast } from '../../features/ui/uiSlice';
import StatCard from '../../components/common/StatCard';
import DonutChart from '../../components/common/DonutChart';
import { DatePickerField, formatPickerDate, parsePickerDate } from '../../components/form/FormDatePicker';
import { formatCurrency, formatNumber } from '../../utils/format';
import { useCashierWiseSalesReportQuery } from '../../api/cashierWiseSalesApi';

import CashierWiseSalesTable from './components/CashierWiseSalesTable';
import CashierSalesTrendChart from './components/CashierSalesTrendChart';
import TopPerformingCashiers from './components/TopPerformingCashiers';

const PAGE_SIZE = 10;

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

// yyyy-mm-dd in the *local* time zone (Date#toISOString is UTC, which can
// land on the wrong calendar day) — this is what the backend's `date`
// query param expects. Same helper as CashSalesPage.jsx's toDateKey.
function toDateKey(pickerValue) {
  const date = parsePickerDate(pickerValue) || new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Cashier Wise Sales — the store-wide, per-cashier sales report reached
 * from the Cashier Panel's "Cashier-wise Sales" quick action. Unlike the
 * other cashier-panel report pages, this one isn't scoped to the signed-in
 * cashier's own activity: it compares every cashier side by side via a
 * Sales Summary + Sales Contribution donut, a full per-cashier details
 * table, a multi-line Sales Trend chart, and a Top Performing Cashiers
 * ranked list — all built from real Sale/SaleLine/SalesReturn rows via
 * GET /cashier-wise-sales/summary (see cashierWiseSales.service.js's
 * getCashierWiseSalesReport).
 */
export default function CashierWiseSalesPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  const [page, setPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(() => formatPickerDate(new Date()));

  const dateKey = toDateKey(selectedDate);
  const {
    data: report, isLoading, isFetching, isError, refetch,
  } = useCashierWiseSalesReportQuery({ date: dateKey, page, pageSize: PAGE_SIZE });

  const cashierLabel = user ? `${user.name}${user.username ? ` (${user.username})` : ''}` : '—';

  const handleViewAll = () => dispatch(showToast('Full cashier wise sales list is coming soon', 'info'));
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };
  const handleDateChange = (value) => {
    setSelectedDate(value || formatPickerDate(new Date()));
    setPage(1);
  };

  if (isError) {
    return (
      <Stack spacing={2}>
        <Alert
          severity="error"
          action={(
            <MuiLink component="button" type="button" variant="body2" underline="hover" onClick={refetch}>
              Retry
            </MuiLink>
          )}
        >
          Couldn&apos;t load the Cashier Wise Sales report from the server. Check your connection and try reloading.
        </Alert>
      </Stack>
    );
  }

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
            Cashier : {cashierLabel}
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

      {isLoading || !report ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5].map((key) => (
            <Grid key={key} size={{ xs: 12, sm: 6, lg: 2.4 }}>
              <Skeleton variant="rounded" height={92} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              icon={PeopleAltOutlinedIcon}
              iconColor="success"
              iconShape="circle"
              label="Total Sales (All Cashiers)"
              value={formatCurrency(report.stats.totalSalesAllCashiers.value, { decimals: true })}
              caption={`Transactions : ${report.stats.totalSalesAllCashiers.transactions}`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              icon={DescriptionOutlinedIcon}
              iconColor="#2563EB"
              iconShape="circle"
              label="Total Invoices"
              value={String(report.stats.totalInvoices.value)}
              caption={`Total Quantity : ${formatNumber(report.stats.totalInvoices.quantity)}`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              icon={CurrencyRupeeOutlinedIcon}
              iconColor="warning"
              iconShape="circle"
              label="Average Invoice Value"
              value={formatCurrency(report.stats.avgInvoiceValue.value, { decimals: true })}
              caption="Per Invoice"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              icon={CalendarTodayOutlinedIcon}
              iconColor="#8B5CF6"
              iconShape="circle"
              label="Today's Sales"
              value={formatCurrency(report.stats.todaysSales.value, { decimals: true })}
              caption={`${report.stats.todaysSales.transactions} Transactions`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              icon={CalendarTodayOutlinedIcon}
              iconColor="#0EA5A4"
              iconShape="circle"
              label="Selected Date Sales"
              value={formatCurrency(report.stats.selectedDateSales.value, { decimals: true })}
              caption={report.stats.selectedDateSales.date}
            />
          </Grid>
        </Grid>
      )}

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Sales Summary</Typography>
              <DatePickerField
                value={selectedDate}
                onChange={handleDateChange}
                sx={{ width: { xs: '100%', sm: 200 } }}
              />
            </Stack>

            {!report ? (
              <Skeleton variant="rounded" height={160} />
            ) : (
              <>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <SummaryTile label="Total Sales" value={formatCurrency(report.summary.totalSales, { decimals: true })} valueColor="#2563EB" />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <SummaryTile label="Total Transactions" value={String(report.summary.totalTransactions)} valueColor="#2563EB" />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <SummaryTile label="Total Quantity" value={formatNumber(report.summary.totalQuantity)} valueColor="#2563EB" />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <SummaryTile label="Total Invoices" value={String(report.summary.totalInvoices)} valueColor="#2563EB" />
                  </Grid>
                </Grid>

                <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <SummaryTile label="Total Discounts" value={formatCurrency(report.summary.totalDiscounts, { decimals: true })} valueColor="error.main" />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <SummaryTile label="Total Returns" value={formatCurrency(report.summary.totalReturns, { decimals: true })} valueColor="error.main" />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <SummaryTile label="Net Sales" value={formatCurrency(report.summary.netSales, { decimals: true })} valueColor="success.main" />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <SummaryTile label="Tax Collected" value={formatCurrency(report.summary.taxCollected, { decimals: true })} valueColor="#2563EB" />
                  </Grid>
                </Grid>
              </>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Sales Contribution (By Cashier)</Typography>
            {!report ? (
              <Skeleton variant="rounded" height={220} />
            ) : report.byCashier.length === 0 ? (
              <Alert severity="info">No cashier sold anything on this date yet.</Alert>
            ) : (
              <DonutChart
                data={report.byCashier}
                centerValue={formatCurrency(report.summary.totalSales, { decimals: true })}
                centerLabel="Total Sales"
                formatValue={(v) => formatCurrency(v, { decimals: true })}
              />
            )}
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
        {!report ? (
          <Skeleton variant="rounded" height={240} />
        ) : (
          <CashierWiseSalesTable
            rows={report.cashiers}
            totalPages={report.totalPages}
            page={report.page}
            onPageChange={setPage}
            loading={isFetching}
          />
        )}
      </Paper>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Sales Trend (By Cashier)</Typography>
            {!report ? (
              <Skeleton variant="rounded" height={280} />
            ) : report.trend.series.length === 0 ? (
              <Alert severity="info">No cashier sold anything on this date yet.</Alert>
            ) : (
              <CashierSalesTrendChart categories={report.trend.categories} series={report.trend.series} />
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Top Performing Cashiers</Typography>
            {!report ? (
              <Skeleton variant="rounded" height={200} />
            ) : report.topPerformers.length === 0 ? (
              <Alert severity="info">No cashier sold anything on this date yet.</Alert>
            ) : (
              <TopPerformingCashiers rows={report.topPerformers} />
            )}
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}
