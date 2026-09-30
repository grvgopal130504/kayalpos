import { useMemo, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper, Divider, Alert, Skeleton,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout, selectCurrentUser } from '../../features/auth/authSlice';
import { showToast } from '../../features/ui/uiSlice';
import StatCard from '../../components/common/StatCard';
import DonutChart from '../../components/common/DonutChart';
import { DatePickerField, formatPickerDate, parsePickerDate } from '../../components/form/FormDatePicker';
import { formatCurrency, formatNumber } from '../../utils/format';
import { useUpiSalesReportQuery } from '../../api/saleApi';

import UpiSalesTransactionsTable from './components/UpiSalesTransactionsTable';

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

// yyyy-mm-dd in the *local* time zone — what the backend's `date` query
// param expects. `pickerValue` is DatePickerField's own "DD Mon YYYY"
// string; falls back to today when it can't be parsed.
function toDateKey(pickerValue) {
  const date = parsePickerDate(pickerValue) || new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * UPI Sales — the cashier's UPI-tender sales report reached from the
 * Cashier Panel's "UPI Sales" quick action. Every figure comes from real
 * Sale/SalesReturn rows via GET /sales/upi-summary (see sale.service.js's
 * getUpiSalesReport): the stat tiles, Sales Summary/Payment Summary cards,
 * the payment-mix donut, and the paginated Recent UPI Sales Transactions
 * table are all backed by the signed-in cashier's own outlet, scoped to the
 * selected date where the reference UI's date picker implies that.
 *
 * The transactions table's UPI App/UPI Transaction ID columns show "—" for
 * any sale made before the Line Sale checkout screen captures that detail —
 * createSale accepts it as optional today, but nothing sends it yet, so
 * it's honestly blank rather than guessed.
 */
export default function UpiSalesPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  const [page, setPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(() => formatPickerDate(new Date()));

  const dateKey = toDateKey(selectedDate);
  const {
    data: report, isLoading, isFetching, isError, refetch,
  } = useUpiSalesReportQuery({ date: dateKey, page, pageSize: PAGE_SIZE });

  const cashierLabel = user ? `${user.name}${user.username ? ` (${user.username})` : ''}` : '—';

  const handleViewAll = () => dispatch(showToast('Full UPI sales list is coming soon', 'info'));
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };
  const handleDateChange = (value) => {
    setSelectedDate(value || formatPickerDate(new Date()));
    setPage(1);
  };

  const donutTotal = useMemo(
    () => (report ? report.donut.reduce((sum, slice) => sum + slice.value, 0) : 0),
    [report],
  );
  const donutCenterPct = report && donutTotal > 0 ? Math.round((report.donut[0].value / donutTotal) * 100) : 0;

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
          Couldn&apos;t load the UPI Sales report from the server. Check your connection and try reloading.
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>UPI Sales</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/cashier-panel" underline="hover" color="text.secondary">Cashier Panel</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>UPI Sales</Typography>
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
              icon={QrCode2OutlinedIcon}
              iconColor="success"
              iconShape="circle"
              label="Total UPI Sales"
              value={formatCurrency(report.stats.totalUpiSales.value, { decimals: true })}
              caption={`Transactions : ${report.stats.totalUpiSales.transactions}`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              icon={ShoppingCartOutlinedIcon}
              iconColor="#2563EB"
              iconShape="circle"
              label="Total Items Sold"
              value={formatNumber(report.stats.totalItemsSold.value)}
              caption={`Total Quantity : ${report.stats.totalItemsSold.totalQty.toFixed(3)}`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              icon={ReceiptLongOutlinedIcon}
              iconColor="warning"
              iconShape="circle"
              label="Average Invoice Value"
              value={formatCurrency(report.stats.avgInvoiceValue.value, { decimals: true })}
              caption="Per Transaction"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              icon={CalendarTodayOutlinedIcon}
              iconColor="#8B5CF6"
              iconShape="circle"
              label="Today's UPI Sales"
              value={formatCurrency(report.stats.todaysUpiSales.value, { decimals: true })}
              caption={`${report.stats.todaysUpiSales.transactions} Transactions`}
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
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <SummaryTile label="Gross Sales" value={formatCurrency(report.summary.grossSales, { decimals: true })} valueColor="#2563EB" />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <SummaryTile label="Discount" value={formatCurrency(report.summary.discount, { decimals: true })} valueColor="error.main" />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <SummaryTile label="Taxable Amount" value={formatCurrency(report.summary.taxableAmount, { decimals: true })} valueColor="#2563EB" />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <SummaryTile label={`CGST (${report.summary.cgstRate}%)`} value={formatCurrency(report.summary.cgstAmount, { decimals: true })} valueColor="#2563EB" />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <SummaryTile label={`SGST (${report.summary.sgstRate}%)`} value={formatCurrency(report.summary.sgstAmount, { decimals: true })} valueColor="#2563EB" />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <SummaryTile label="Grand Total" value={formatCurrency(report.summary.grandTotal, { decimals: true })} valueColor="success.main" />
                </Grid>
              </Grid>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Payment Summary</Typography>
            {!report ? (
              <Skeleton variant="rounded" height={220} />
            ) : (
              <>
                <Stack spacing={1.25} sx={{ mb: 2 }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>UPI Received</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCurrency(report.payment.upiReceived, { decimals: true })}</Typography>
                  </Stack>
                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Change Returned</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCurrency(report.payment.changeReturned, { decimals: true })}</Typography>
                  </Stack>
                  <Divider sx={{ my: 0.5 }} />
                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>Total Received</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{formatCurrency(report.payment.totalReceived, { decimals: true })}</Typography>
                  </Stack>
                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Refunds</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main' }}>{formatCurrency(report.payment.refunds, { decimals: true })}</Typography>
                  </Stack>
                </Stack>

                <DonutChart
                  data={report.donut}
                  centerValue={`${donutCenterPct}%`}
                  formatValue={(v) => formatCurrency(v, { decimals: true })}
                />
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Recent UPI Sales Transactions</Typography>
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
          <UpiSalesTransactionsTable
            rows={report.transactions}
            totalPages={report.totalPages}
            page={report.page}
            onPageChange={setPage}
            loading={isFetching}
          />
        )}
      </Paper>
    </Stack>
  );
}
