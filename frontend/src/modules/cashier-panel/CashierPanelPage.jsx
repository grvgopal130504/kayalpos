import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper, TextField,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

import { useAppDispatch } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { showToast } from '../../features/ui/uiSlice';

import CashierStatCard from './components/CashierStatCard';
import CashierQuickActions from './components/CashierQuickActions';
import CashierShiftDetails from './components/CashierShiftDetails';
import CashierPaymentSummary from './components/CashierPaymentSummary';
import CashierCashSummary from './components/CashierCashSummary';
import CashierRecentTransactions from './components/CashierRecentTransactions';
import CashierQuickInfo from './components/CashierQuickInfo';
import CashierAlerts from './components/CashierAlerts';
import { CASHIER, SHIFT, STATS, PAYMENT_SUMMARY, CASH_SUMMARY, RECENT_TRANSACTIONS, QUICK_INFO, ALERTS } from './cashierPanelMockData';
import { formatCurrency, formatNumber } from '../../utils/format';

/**
 * Cashier Panel — the front-of-house cash register operator screen:
 * shift/cash-in-hand/sales/receipt stat strip, a Quick Actions grid for
 * every shift & cash-drawer action, then Current Shift Details / Payment
 * Summary / Cash Summary / Recent Transactions side by side, and a
 * closing Quick Info / Notes / Alerts row — matching the reference
 * layout exactly.
 *
 * There's no Cashier Panel backend module yet (shift/cash-drawer tracking
 * isn't modeled in the API), so every figure here comes from
 * cashierPanelMockData and every Quick Action tile just surfaces a
 * "coming soon" toast. Logout reuses the real auth flow (same as
 * UserMenu) since that part of the reference — the "Cashier : Name (Code)
 * / Logout" strip — maps onto a real, already-wired action.
 */
export default function CashierPanelPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');

  const handleAction = (label, path) => {
    if (path) {
      navigate(path);
      return;
    }
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };
  const handleViewAllTransactions = () => dispatch(showToast('Full transaction list is coming soon', 'info'));
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

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
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <CashierStatCard
            label="Current Shift"
            value={SHIFT.status}
            valueColor="success.main"
            captionLines={[SHIFT.openedAt, SHIFT.openedDate]}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <CashierStatCard
            label="Current Cash in Hand (₹)"
            value={formatCurrency(STATS.cashInHand.value, { decimals: true })}
            valueColor="#2563EB"
            caption={`Expected : ${formatCurrency(STATS.cashInHand.expected, { decimals: true })}`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <CashierStatCard
            label="Today's Sales (₹)"
            value={formatCurrency(STATS.todaysSales.value, { decimals: true })}
            valueColor="#2563EB"
            caption={`Transactions : ${formatNumber(STATS.todaysSales.transactions)}`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <CashierStatCard
            label="Today's Receipt (₹)"
            value={formatCurrency(STATS.todaysReceipt.value, { decimals: true })}
            valueColor="#2563EB"
            caption={`Refunds : ${formatCurrency(STATS.todaysReceipt.refunds, { decimals: true })}`}
          />
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Quick Actions</Typography>
        <CashierQuickActions onAction={handleAction} />
      </Paper>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <CashierShiftDetails shift={SHIFT} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <CashierPaymentSummary summary={PAYMENT_SUMMARY} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <CashierCashSummary summary={CASH_SUMMARY} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <CashierRecentTransactions transactions={RECENT_TRANSACTIONS} onViewAll={handleViewAllTransactions} />
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
              // FormTextField used on the create-form pages.
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
          <CashierAlerts alerts={ALERTS} />
        </Grid>
      </Grid>
    </Stack>
  );
}
