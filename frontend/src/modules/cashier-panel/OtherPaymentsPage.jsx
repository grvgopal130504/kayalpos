import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper, Divider,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

import { useAppDispatch } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { showToast } from '../../features/ui/uiSlice';
import StatCard from '../../components/common/StatCard';
import DonutChart from '../../components/common/DonutChart';
import { DatePickerField } from '../../components/form/FormDatePicker';
import { formatCurrency, formatNumber } from '../../utils/format';

import OtherPaymentsTransactionsTable from './components/OtherPaymentsTransactionsTable';
import { CASHIER, OTHER_PAYMENTS } from './cashierPanelMockData';

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
 * Other Payments — the cashier's miscellaneous-tender sales report
 * (store credit, gift card, wallet, cheque, bank transfer) reached from
 * the Cashier Panel's "Other Payments" quick action. Same layout as
 * CashSalesPage/CardSalesPage/UpiSalesPage, with the Payment Summary
 * panel breaking out Cash/Card/UPI as separate 0.00 lines (since this
 * report is specifically the *other* bucket relative to those three) and
 * the transactions table swapping tender-specific columns for a colored
 * Payment Mode chip + free-text Reference/Details.
 *
 * There's no sales-reporting backend wired to this screen yet, so every
 * figure comes from OTHER_PAYMENTS mock data.
 */
export default function OtherPaymentsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { stats, summary, payment, donut, transactions, totalPages } = OTHER_PAYMENTS;
  const [selectedDate, setSelectedDate] = useState(OTHER_PAYMENTS.selectedDate);

  const handleBack = () => navigate('/cashier-panel');
  const handleViewAll = () => dispatch(showToast('Full other payments list is coming soon', 'info'));
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Other Payments</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/cashier-panel" underline="hover" color="text.secondary">Cashier Panel</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Other Payments</Typography>
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
            icon={ReceiptLongOutlinedIcon}
            iconColor="success"
            iconShape="circle"
            label="Total Other Payments"
            value={formatCurrency(stats.totalOtherPayments.value, { decimals: true })}
            caption={`Transactions : ${stats.totalOtherPayments.transactions}`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            icon={ShoppingCartOutlinedIcon}
            iconColor="#2563EB"
            iconShape="circle"
            label="Total Items Sold"
            value={formatNumber(stats.totalItemsSold.value)}
            caption={`Total Quantity : ${stats.totalItemsSold.totalQty.toFixed(3)}`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            icon={ReceiptLongOutlinedIcon}
            iconColor="warning"
            iconShape="circle"
            label="Average Invoice Value"
            value={formatCurrency(stats.avgInvoiceValue.value, { decimals: true })}
            caption="Per Transaction"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            icon={CalendarTodayOutlinedIcon}
            iconColor="#8B5CF6"
            iconShape="circle"
            label="Today's Other Payments"
            value={formatCurrency(stats.todaysOtherPayments.value, { decimals: true })}
            caption={`${stats.todaysOtherPayments.transactions} Transactions`}
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
              <Grid size={{ xs: 12, sm: 4 }}>
                <SummaryTile label="Gross Sales" value={formatCurrency(summary.grossSales, { decimals: true })} valueColor="#2563EB" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <SummaryTile label="Discount" value={formatCurrency(summary.discount, { decimals: true })} valueColor="error.main" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <SummaryTile label="Taxable Amount" value={formatCurrency(summary.taxableAmount, { decimals: true })} valueColor="#2563EB" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <SummaryTile label={`CGST (${summary.cgstRate}%)`} value={formatCurrency(summary.cgstAmount, { decimals: true })} valueColor="#2563EB" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <SummaryTile label={`SGST (${summary.sgstRate}%)`} value={formatCurrency(summary.sgstAmount, { decimals: true })} valueColor="#2563EB" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <SummaryTile label="Grand Total" value={formatCurrency(summary.grandTotal, { decimals: true })} valueColor="success.main" />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Payment Summary</Typography>
            <Stack spacing={1.25} sx={{ mb: 2 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Other Payments Received</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCurrency(payment.otherPaymentsReceived, { decimals: true })}</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Cash</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCurrency(payment.cash, { decimals: true })}</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Card</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCurrency(payment.card, { decimals: true })}</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>UPI</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCurrency(payment.upi, { decimals: true })}</Typography>
              </Stack>
              <Divider sx={{ my: 0.5 }} />
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>Total Received</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>{formatCurrency(payment.totalReceived, { decimals: true })}</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Refunds</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main' }}>{formatCurrency(payment.refunds, { decimals: true })}</Typography>
              </Stack>
            </Stack>

            <DonutChart
              data={donut}
              centerValue={`${donut[0].value ? Math.round((donut[0].value / donut.reduce((s, d) => s + d.value, 0)) * 100) : 0}%`}
              formatValue={(v) => formatCurrency(v, { decimals: true })}
            />
          </Paper>
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Recent Other Payments Transactions</Typography>
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
        <OtherPaymentsTransactionsTable rows={transactions} totalPages={totalPages} page={page} onPageChange={setPage} />
      </Paper>
    </Stack>
  );
}
