import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper, TextField, InputAdornment, Button,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import AddIcon from '@mui/icons-material/Add';
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

import { useAppDispatch } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { showToast } from '../../features/ui/uiSlice';
import StatCard from '../../components/common/StatCard';
import DonutChart from '../../components/common/DonutChart';
import { formatCurrency } from '../../utils/format';

import ExpenseTransactionsTable from './components/ExpenseTransactionsTable';
import { CASHIER, EXPENSES_BOOK } from './expensesBookMockData';

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
 * Expenses Book — the cashier's day-to-day expense log, reached from the
 * main sidebar's "Expense Book" item (not the Cashier Panel). Same overall
 * shape as the cashier-panel report pages (stat tiles + summary/breakdown
 * panels + transactions table), with two donuts side by side at the bottom
 * (Expenses by Category next to the transactions table's "View All", and
 * Expenses by Payment Mode beside it) and an "Add Expenses" button that
 * routes to the create-expense form.
 *
 * There's no expenses backend module yet, so every figure comes from
 * EXPENSES_BOOK mock data.
 */
export default function ExpensesBookPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { stats, summary, byCategory, byPaymentMode, transactions, totalPages, selectedDate } = EXPENSES_BOOK;

  const handleDatePick = () => dispatch(showToast('Date picker is coming soon', 'info'));
  const handleViewAll = () => dispatch(showToast('Full expense list is coming soon', 'info'));
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Expenses Book</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Expense Book</Typography>
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
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon fontSize="small" />}
            onClick={() => navigate('/expenses-book/add')}
          >
            Add Expenses
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            icon={PointOfSaleOutlinedIcon}
            iconColor="success"
            iconShape="circle"
            label="Total Expenses"
            value={formatCurrency(stats.totalExpenses.value, { decimals: true })}
            caption={`Transactions : ${stats.totalExpenses.transactions}`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            icon={DescriptionOutlinedIcon}
            iconColor="#2563EB"
            iconShape="circle"
            label="Total Entries"
            value={String(stats.totalEntries.value)}
            caption="Total Quantity : -"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            icon={CurrencyRupeeOutlinedIcon}
            iconColor="warning"
            iconShape="circle"
            label="Average Expense"
            value={formatCurrency(stats.avgExpense.value, { decimals: true })}
            caption="Per Entry"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            icon={CalendarTodayOutlinedIcon}
            iconColor="#8B5CF6"
            iconShape="circle"
            label="Today's Expenses"
            value={formatCurrency(stats.todaysExpenses.value, { decimals: true })}
            caption={`${stats.todaysExpenses.transactions} Transactions`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            icon={CalendarTodayOutlinedIcon}
            iconColor="#0EA5A4"
            iconShape="circle"
            label="Selected Date Expenses"
            value={formatCurrency(stats.selectedDateExpenses.value, { decimals: true })}
            caption={stats.selectedDateExpenses.date}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Expense Summary</Typography>
              <TextField
                size="small"
                value={selectedDate}
                onClick={handleDatePick}
                slotProps={{
                  input: {
                    readOnly: true,
                    startAdornment: <InputAdornment position="start"><CalendarTodayOutlinedIcon fontSize="small" /></InputAdornment>,
                    endAdornment: <InputAdornment position="end"><CalendarTodayOutlinedIcon fontSize="small" /></InputAdornment>,
                  },
                }}
                sx={{ cursor: 'pointer', width: { xs: '100%', sm: 200 } }}
              />
            </Stack>

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <SummaryTile label="Total Expenses" value={formatCurrency(summary.totalExpenses, { decimals: true })} valueColor="#2563EB" />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <SummaryTile label="Total Transactions" value={String(summary.totalTransactions)} valueColor="#2563EB" />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <SummaryTile label="Total Payment Modes" value={String(summary.totalPaymentModes)} valueColor="#2563EB" />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <SummaryTile label="Total Categories" value={String(summary.totalCategories)} valueColor="#2563EB" />
              </Grid>
            </Grid>

            <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <SummaryTile label="Cash Expenses" value={formatCurrency(summary.cashExpenses, { decimals: true })} valueColor="success.main" />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <SummaryTile label="Card Expenses" value={formatCurrency(summary.cardExpenses, { decimals: true })} valueColor="#2563EB" />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <SummaryTile label="UPI Expenses" value={formatCurrency(summary.upiExpenses, { decimals: true })} valueColor="#8B5CF6" />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <SummaryTile label="Other Expenses" value={formatCurrency(summary.otherExpenses, { decimals: true })} valueColor="#C1560A" />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Expenses by Category</Typography>
            <DonutChart
              data={byCategory}
              centerValue={formatCurrency(summary.totalExpenses, { decimals: true })}
              centerLabel="Total Expenses"
              formatValue={(v) => formatCurrency(v, { decimals: true })}
            />
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Recent Expense Transactions</Typography>
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
            <ExpenseTransactionsTable rows={transactions} totalPages={totalPages} page={page} onPageChange={setPage} />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Expenses by Payment Mode</Typography>
            <DonutChart
              data={byPaymentMode}
              centerValue={formatCurrency(summary.totalExpenses, { decimals: true })}
              centerLabel="Total Expenses"
              formatValue={(v) => formatCurrency(v, { decimals: true })}
            />
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}
