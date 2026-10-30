import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper, TextField, Skeleton, Alert,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';
import { useCashierPanelSummaryQuery } from '../../api/cashierPanelApi';

import CashierStatCard from './components/CashierStatCard';
import CashierQuickActions from './components/CashierQuickActions';
import CashierShiftDetails from './components/CashierShiftDetails';
import CashierPaymentSummary from './components/CashierPaymentSummary';
import CashierCashSummary from './components/CashierCashSummary';
import CashierRecentTransactions from './components/CashierRecentTransactions';
import CashierQuickInfo from './components/CashierQuickInfo';
import CashierAlerts from './components/CashierAlerts';
import { formatCurrency, formatNumber } from '../../utils/format';

// Static operating reminders — plain UI copy, not data, so there's nothing
// to fetch here (unlike Alerts, which is real, derived state — see
// cashierPanel.service.js's getCashierPanelSummary).
const QUICK_INFO = [
  'Use PIN login for secure operations.',
  'Please perform Shift Closing & Reconciliation at the end of the day.',
  'Ensure cash in hand matches with expected amount.',
];

/**
 * Cashier Panel — the front-of-house cash register operator screen:
 * shift/cash-in-hand/sales/receipt stat strip, a Quick Actions grid for
 * every shift & cash-drawer action, then Current Shift Details / Payment
 * Summary / Cash Summary / Recent Transactions side by side, and a
 * closing Quick Info / Notes / Alerts row. Every figure comes from
 * GET /cashier-panel/summary (see cashierPanel.service.js's
 * getCashierPanelSummary) — real ShiftSession/Sale/SalesReturn/
 * CashWithdrawal/CashDeposit/CashTransfer rows, reshaped for this
 * dashboard, never a table of its own. Every Quick Action tile already
 * routes to a real, fully-wired cashier-panel screen.
 */
export default function CashierPanelPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');

  const {
    data: summary, isLoading, isError, refetch,
  } = useCashierPanelSummaryQuery();


  const handleAction = (label, path) => {
    if (path) {
      navigate(path);
      return;
    }
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };
  const handleViewAllTransactions = () => dispatch(showToast('Full transaction list is coming soon', 'info'));

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
          Couldn&apos;t load the Cashier Panel from the server. Check your connection and try reloading.
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Cashier Panel</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Cashier Panel</Typography>
          </Breadcrumbs>
        </Box>
      </Stack>

      {isLoading || !summary ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((key) => (
            <Grid key={key} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Skeleton variant="rounded" height={92} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <CashierStatCard
              label="Current Shift"
              value={summary.shift ? summary.shift.status : 'No Shift Open'}
              valueColor={summary.shift ? 'success.main' : 'error.main'}
              captionLines={summary.shift ? [summary.shift.openedOn] : ['Open a shift to begin']}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <CashierStatCard
              label="Current Cash in Hand (₹)"
              value={formatCurrency(summary.stats.cashInHand.value, { decimals: true })}
              valueColor="#2563EB"
              caption={`Expected : ${formatCurrency(summary.stats.cashInHand.expected, { decimals: true })}`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <CashierStatCard
              label="Today's Sales (₹)"
              value={formatCurrency(summary.stats.todaysSales.value, { decimals: true })}
              valueColor="#2563EB"
              caption={`Transactions : ${formatNumber(summary.stats.todaysSales.transactions)}`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <CashierStatCard
              label="Today's Receipt (₹)"
              value={formatCurrency(summary.stats.todaysReceipt.value, { decimals: true })}
              valueColor="#2563EB"
              caption={`Refunds : ${formatCurrency(summary.stats.todaysReceipt.refunds, { decimals: true })}`}
            />
          </Grid>
        </Grid>
      )}

      <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Quick Actions</Typography>
        <CashierQuickActions onAction={handleAction} />
      </Paper>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {!summary ? (
            <Skeleton variant="rounded" height={220} />
          ) : summary.shift ? (
            <CashierShiftDetails shift={summary.shift} />
          ) : (
            <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Current Shift Details</Typography>
              <Alert severity="info">No shift is currently open for this outlet.</Alert>
            </Paper>
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {!summary ? <Skeleton variant="rounded" height={220} /> : <CashierPaymentSummary summary={summary.paymentSummary} />}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {!summary ? (
            <Skeleton variant="rounded" height={220} />
          ) : summary.cashSummary ? (
            <CashierCashSummary summary={summary.cashSummary} />
          ) : (
            <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Cash Summary (Today)</Typography>
              <Alert severity="info">Open a shift to start tracking today&apos;s cash summary.</Alert>
            </Paper>
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {!summary ? (
            <Skeleton variant="rounded" height={220} />
          ) : (
            <CashierRecentTransactions transactions={summary.recentTransactions} onViewAll={handleViewAllTransactions} />
          )}
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <CashierQuickInfo items={QUICK_INFO} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Notes</Typography>
            <TextField
              // Standalone field (no surrounding form on this page), so it's
              // plain value/onChange rather than the react-hook-form-backed
              // FormTextField used on the create-form pages. Scratch-pad
              // only — nothing here is persisted server-side, so it clears
              // on refresh; there's no "cashier notes" table in the schema
              // to save it to.
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes (optional)"
              multiline
              minRows={4}
              fullWidth
            />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          {!summary ? <Skeleton variant="rounded" height={140} /> : <CashierAlerts alerts={summary.alerts} />}
        </Grid>
      </Grid>
    </Stack>
  );
}
