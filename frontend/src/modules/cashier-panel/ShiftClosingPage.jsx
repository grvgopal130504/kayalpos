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

import ShiftClosingTransactionsTable from './components/ShiftClosingTransactionsTable';
import { CASHIER, SHIFT_CLOSING } from './cashierPanelMockData';

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
 * Shift Closing — the cashier's shift-close report reached from the
 * Cashier Panel's "Shift Closing" quick action. Same overall shape as
 * the other cashier-panel report pages, but the breakdown here is
 * "Closing Summary (By Shift)" — how much closing cash came from each of
 * the day's shifts — and the Closing Summary panel tracks Total Sales
 * (All Modes) alongside Cash In Drawer (Actual) vs Expected Cash with a
 * Variance tile, mirroring the reference's shift-reconciliation framing.
 *
 * There's no sales-reporting backend wired to this screen yet, so every
 * figure comes from SHIFT_CLOSING mock data.
 */
export default function ShiftClosingPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { stats, summary, byShift, transactions, totalPages } = SHIFT_CLOSING;
  const [selectedDate, setSelectedDate] = useState(SHIFT_CLOSING.selectedDate);
  const totalByShift = byShift.reduce((sum, s) => sum + s.value, 0);

  const handleViewAll = () => dispatch(showToast('Full shift closing list is coming soon', 'info'));
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Shift Closing</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/cashier-panel" underline="hover" color="text.secondary">Cashier Panel</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Shift Closing</Typography>
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
            label="Total Shift Closings"
            value={formatCurrency(stats.totalShiftClosings.value, { decimals: true })}
            caption={`Transactions : ${stats.totalShiftClosings.transactions}`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            icon={DescriptionOutlinedIcon}
            iconColor="#2563EB"
            iconShape="circle"
            label="Total Closings"
            value={String(stats.totalClosings.value)}
            caption="Total Quantity : -"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            icon={CurrencyRupeeOutlinedIcon}
            iconColor="warning"
            iconShape="circle"
            label="Average Closing Value"
            value={formatCurrency(stats.avgClosingValue.value, { decimals: true })}
            caption="Per Closing"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            icon={CalendarTodayOutlinedIcon}
            iconColor="#8B5CF6"
            iconShape="circle"
            label="Today's Shift Closing"
            value={formatCurrency(stats.todaysShiftClosing.value, { decimals: true })}
            caption={`${stats.todaysShiftClosing.transactions} Transactions`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            icon={CalendarTodayOutlinedIcon}
            iconColor="#0EA5A4"
            iconShape="circle"
            label="Selected Date Closing"
            value={formatCurrency(stats.selectedDateClosing.value, { decimals: true })}
            caption={stats.selectedDateClosing.date}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Closing Summary</Typography>
              <DatePickerField
                value={selectedDate}
                onChange={setSelectedDate}
                sx={{ width: { xs: '100%', sm: 200 } }}
              />
            </Stack>

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <SummaryTile label="Total Shift Closing" value={formatCurrency(summary.totalShiftClosing, { decimals: true })} valueColor="#2563EB" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <SummaryTile label="Total Transactions" value={String(summary.totalTransactions)} valueColor="#2563EB" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <SummaryTile label="Total Closed By" value={summary.totalClosedBy} valueColor="#2563EB" />
              </Grid>
            </Grid>

            <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <SummaryTile label="Total Sales (All Modes)" value={formatCurrency(summary.totalSalesAllModes, { decimals: true })} valueColor="#2563EB" />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <SummaryTile label="Cash In Drawer (Actual)" value={formatCurrency(summary.cashInDrawerActual, { decimals: true })} valueColor="#2563EB" />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <SummaryTile label="Expected Cash" value={formatCurrency(summary.expectedCash, { decimals: true })} valueColor="success.main" />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <SummaryTile label="Variance" value={formatCurrency(summary.variance, { decimals: true })} valueColor="text.primary" />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Closing Summary (By Shift)</Typography>
            <Stack spacing={1.25} sx={{ mb: 2 }}>
              {byShift.map((s) => (
                <Stack key={s.id} direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>{s.label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {formatCurrency(s.value, { decimals: true })} ({totalByShift ? Math.round((s.value / totalByShift) * 100 * 100) / 100 : 0}%)
                  </Typography>
                </Stack>
              ))}
            </Stack>

            <DonutChart
              data={byShift}
              centerValue={formatCurrency(totalByShift, { decimals: true })}
              centerLabel="Total"
              formatValue={(v) => formatCurrency(v, { decimals: true })}
            />
          </Paper>
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Recent Shift Closing Transactions</Typography>
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
        <ShiftClosingTransactionsTable rows={transactions} totalPages={totalPages} page={page} onPageChange={setPage} />
      </Paper>
    </Stack>
  );
}
