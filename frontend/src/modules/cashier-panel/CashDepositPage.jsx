import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

import { useAppDispatch } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { showToast } from '../../features/ui/uiSlice';
import StatCard from '../../components/common/StatCard';
import DonutChart from '../../components/common/DonutChart';
import { DatePickerField } from '../../components/form/FormDatePicker';
import { formatCurrency } from '../../utils/format';

import CashDepositTransactionsTable from './components/CashDepositTransactionsTable';
import { CASHIER, CASH_DEPOSIT } from './cashierPanelMockData';

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
 * Cash Deposit — the cashier's cash-in report reached from the Cashier
 * Panel's "Cash Deposit" quick action. Mirrors CashWithdrawalPage's
 * shape exactly (same cash-position summary tiles, same list+donut
 * by-purpose breakdown), since a deposit is the same kind of drawer
 * movement as a withdrawal just in the opposite direction — only the
 * purpose categories (Bank Deposit / Owner Deposit / Float Adjustment /
 * Other Purpose) and the transactions table's Deposited By / Bank-Account
 * columns differ.
 *
 * There's no sales-reporting backend wired to this screen yet, so every
 * figure comes from CASH_DEPOSIT mock data.
 */
export default function CashDepositPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { stats, summary, byPurpose, transactions, totalPages } = CASH_DEPOSIT;
  const [selectedDate, setSelectedDate] = useState(CASH_DEPOSIT.selectedDate);
  const totalByPurpose = byPurpose.reduce((sum, p) => sum + p.value, 0);

  const handleViewAll = () => dispatch(showToast('Full cash deposit list is coming soon', 'info'));
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Cash Deposit</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/cashier-panel" underline="hover" color="text.secondary">Cashier Panel</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Cash Deposit</Typography>
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
            label="Total Cash Deposit"
            value={formatCurrency(stats.totalCashDeposit.value, { decimals: true })}
            caption={`Transactions : ${stats.totalCashDeposit.transactions}`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            icon={DescriptionOutlinedIcon}
            iconColor="#2563EB"
            iconShape="circle"
            label="Total Deposits"
            value={String(stats.totalDeposits.value)}
            caption="Total Quantity : -"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            icon={ReceiptLongOutlinedIcon}
            iconColor="warning"
            iconShape="circle"
            label="Average Deposit Value"
            value={formatCurrency(stats.avgDepositValue.value, { decimals: true })}
            caption="Per Transaction"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            icon={CalendarTodayOutlinedIcon}
            iconColor="#8B5CF6"
            iconShape="circle"
            label="Today's Cash Deposit"
            value={formatCurrency(stats.todaysCashDeposit.value, { decimals: true })}
            caption={`${stats.todaysCashDeposit.transactions} Transactions`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            icon={CalendarTodayOutlinedIcon}
            iconColor="#0EA5A4"
            iconShape="circle"
            label="Selected Date Deposit"
            value={formatCurrency(stats.selectedDateDeposit.value, { decimals: true })}
            caption={stats.selectedDateDeposit.date}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Deposit Summary</Typography>
              <DatePickerField
                value={selectedDate}
                onChange={setSelectedDate}
                sx={{ width: { xs: '100%', sm: 200 } }}
              />
            </Stack>

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <SummaryTile label="Total Cash Deposit" value={formatCurrency(summary.totalCashDeposit, { decimals: true })} valueColor="#2563EB" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <SummaryTile label="Total Transactions" value={String(summary.totalTransactions)} valueColor="#2563EB" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <SummaryTile label="Total Deposited By" value={summary.totalDepositedBy} valueColor="#2563EB" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <SummaryTile label="Opening Cash" value={formatCurrency(summary.openingCash, { decimals: true })} valueColor="#2563EB" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <SummaryTile label="Total Sales (All Modes)" value={formatCurrency(summary.totalSalesAllModes, { decimals: true })} valueColor="#2563EB" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <SummaryTile label="Closing Cash (Actual)" value={formatCurrency(summary.closingCashActual, { decimals: true })} valueColor="success.main" />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Deposit Summary (By Purpose)</Typography>
            <Stack spacing={1.25} sx={{ mb: 2 }}>
              {byPurpose.map((p) => (
                <Stack key={p.id} direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>{p.label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {formatCurrency(p.value, { decimals: true })} ({totalByPurpose ? Math.round((p.value / totalByPurpose) * 100 * 100) / 100 : 0}%)
                  </Typography>
                </Stack>
              ))}
            </Stack>

            <DonutChart
              data={byPurpose}
              centerValue={formatCurrency(totalByPurpose, { decimals: true })}
              centerLabel="Total"
              formatValue={(v) => formatCurrency(v, { decimals: true })}
            />
          </Paper>
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Recent Cash Deposit Transactions</Typography>
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
        <CashDepositTransactionsTable rows={transactions} totalPages={totalPages} page={page} onPageChange={setPage} />
      </Paper>
    </Stack>
  );
}
