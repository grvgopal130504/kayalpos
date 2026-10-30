import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper, Button, Skeleton, Alert,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';
import StatCard from '../../components/common/StatCard';
import DonutChart from '../../components/common/DonutChart';
import { DatePickerField, formatPickerDate, parsePickerDate } from '../../components/form/FormDatePicker';
import { formatCurrency } from '../../utils/format';
import { useExpenseReportQuery } from '../../api/expenseApi';

import ExpenseTransactionsTable from './components/ExpenseTransactionsTable';
import AddExpensePage from './AddExpensePage';

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
// param expects (see CashSalesPage.jsx's toDateKey for the same
// local-vs-UTC reasoning).
function toDateKey(pickerValue) {
  const date = parsePickerDate(pickerValue) || new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Expenses Book — the cashier's day-to-day expense log, reached from the
 * main sidebar's "Expense Book" item (not the Cashier Panel). Same overall
 * shape as the cashier-panel report pages (stat tiles + summary/breakdown
 * panels + transactions table), with two donuts side by side at the bottom
 * (Expenses by Category next to the transactions table's "View All", and
 * Expenses by Payment Mode beside it) and an "Add Expenses" button that
 * swaps in the create-expense form via local state.
 *
 * Every figure comes from GET /expenses/summary (see expense.service.js's
 * getExpenseReport) — real Expense rows, keyed off each row's own
 * (possibly backdated) expenseDate rather than when it was logged.
 */
export default function ExpensesBookPage() {
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState('list');
  const [page, setPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(() => formatPickerDate(new Date()));

  const dateKey = toDateKey(selectedDate);
  const {
    data: report, isLoading, isFetching, isError, refetch,
  } = useExpenseReportQuery({ date: dateKey, page, pageSize: PAGE_SIZE }, { skip: tab === 'create' });

  const handleViewAll = () => dispatch(showToast('Full expense list is coming soon', 'info'));
  const handleDateChange = (value) => {
    setSelectedDate(value || formatPickerDate(new Date()));
    setPage(1);
  };

  if (tab === 'create') {
    return <AddExpensePage onBack={() => setTab('list')} />;
  }

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
          Couldn&apos;t load the Expenses Book from the server. Check your connection and try reloading.
        </Alert>
      </Stack>
    );
  }

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
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon fontSize="small" />}
            onClick={() => setTab('create')}
          >
            Add Expenses
          </Button>
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
              icon={PointOfSaleOutlinedIcon}
              iconColor="success"
              iconShape="circle"
              label="Total Expenses"
              value={formatCurrency(report.stats.totalExpenses.value, { decimals: true })}
              caption={`Transactions : ${report.stats.totalExpenses.transactions}`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              icon={DescriptionOutlinedIcon}
              iconColor="#2563EB"
              iconShape="circle"
              label="Total Entries"
              value={String(report.stats.totalEntries.value)}
              caption="Total Quantity : -"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              icon={CurrencyRupeeOutlinedIcon}
              iconColor="warning"
              iconShape="circle"
              label="Average Expense"
              value={formatCurrency(report.stats.avgExpense.value, { decimals: true })}
              caption="Per Entry"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              icon={CalendarTodayOutlinedIcon}
              iconColor="#8B5CF6"
              iconShape="circle"
              label="Today's Expenses"
              value={formatCurrency(report.stats.todaysExpenses.value, { decimals: true })}
              caption={`${report.stats.todaysExpenses.transactions} Transactions`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              icon={CalendarTodayOutlinedIcon}
              iconColor="#0EA5A4"
              iconShape="circle"
              label="Selected Date Expenses"
              value={formatCurrency(report.stats.selectedDateExpenses.value, { decimals: true })}
              caption={report.stats.selectedDateExpenses.date}
            />
          </Grid>
        </Grid>
      )}

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Expense Summary</Typography>
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
                    <SummaryTile label="Total Expenses" value={formatCurrency(report.summary.totalExpenses, { decimals: true })} valueColor="#2563EB" />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <SummaryTile label="Total Transactions" value={String(report.summary.totalTransactions)} valueColor="#2563EB" />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <SummaryTile label="Total Payment Modes" value={String(report.summary.totalPaymentModes)} valueColor="#2563EB" />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <SummaryTile label="Total Categories" value={String(report.summary.totalCategories)} valueColor="#2563EB" />
                  </Grid>
                </Grid>

                <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <SummaryTile label="Cash Expenses" value={formatCurrency(report.summary.cashExpenses, { decimals: true })} valueColor="success.main" />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <SummaryTile label="Card Expenses" value={formatCurrency(report.summary.cardExpenses, { decimals: true })} valueColor="#2563EB" />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <SummaryTile label="UPI Expenses" value={formatCurrency(report.summary.upiExpenses, { decimals: true })} valueColor="#8B5CF6" />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <SummaryTile label="Other Expenses" value={formatCurrency(report.summary.otherExpenses, { decimals: true })} valueColor="#C1560A" />
                  </Grid>
                </Grid>
              </>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Expenses by Category</Typography>
            {!report ? (
              <Skeleton variant="rounded" height={220} />
            ) : report.summary.totalExpenses === 0 ? (
              <Alert severity="info">No expenses were logged on this date yet.</Alert>
            ) : (
              <DonutChart
                data={report.byCategory}
                centerValue={formatCurrency(report.summary.totalExpenses, { decimals: true })}
                centerLabel="Total Expenses"
                formatValue={(v) => formatCurrency(v, { decimals: true })}
              />
            )}
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
            {!report ? (
              <Skeleton variant="rounded" height={240} />
            ) : (
              <ExpenseTransactionsTable
                rows={report.transactions}
                totalPages={report.totalPages}
                page={report.page}
                onPageChange={setPage}
                loading={isFetching}
              />
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Expenses by Payment Mode</Typography>
            {!report ? (
              <Skeleton variant="rounded" height={220} />
            ) : report.summary.totalExpenses === 0 ? (
              <Alert severity="info">No expenses were logged on this date yet.</Alert>
            ) : (
              <DonutChart
                data={report.byPaymentMode}
                centerValue={formatCurrency(report.summary.totalExpenses, { decimals: true })}
                centerLabel="Total Expenses"
                formatValue={(v) => formatCurrency(v, { decimals: true })}
              />
            )}
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}
