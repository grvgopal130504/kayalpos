import { Box, Paper, Typography } from '@mui/material';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import KeyboardReturnOutlinedIcon from '@mui/icons-material/KeyboardReturnOutlined';
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';

// Every icon path below is one already used successfully elsewhere in this
// codebase (navConfig, HomePage, StatCard, etc.) — the reference design's
// exact icon per tile isn't always available in the installed
// @mui/icons-material version, so each tile uses the closest verified
// icon instead of risking an unresolvable import.
const ACTIONS = [
  { key: 'cashier-login', label: 'Cashier Login', icon: BadgeOutlinedIcon, color: '#1F2A3C', path: '/cashier-panel/login' },
  { key: 'shift-opening', label: 'Shift Opening', icon: LockOpenOutlinedIcon, color: '#2563EB', path: '/cashier-panel/shift-opening' },
  { key: 'cash-sales', label: 'Cash Sales', icon: CurrencyRupeeOutlinedIcon, color: '#22A06B', path: '/cashier-panel/cash-sales' },
  { key: 'card-sales', label: 'Card Sales', icon: ReceiptOutlinedIcon, color: '#2563EB', path: '/cashier-panel/card-sales' },
  { key: 'upi-sales', label: 'UPI Sales', icon: QrCode2OutlinedIcon, color: '#8B5CF6', path: '/cashier-panel/upi-sales' },
  { key: 'other-payments', label: 'Other Payments', icon: ReceiptLongOutlinedIcon, color: '#1F2A3C', path: '/cashier-panel/other-payments' },
  { key: 'cash-withdrawal', label: 'Cash Withdrawal', icon: ArrowDownwardIcon, color: '#F26B21', path: '/cashier-panel/cash-withdrawal' },
  { key: 'cash-deposit', label: 'Cash Deposit', icon: ArrowUpwardIcon, color: '#22A06B', path: '/cashier-panel/cash-deposit' },
  { key: 'cash-transfer', label: 'Cash Transfer', icon: KeyboardReturnOutlinedIcon, color: '#8B5CF6', path: '/cashier-panel/cash-transfer' },
  { key: 'cash-drawer-opening', label: 'Cash Drawer Opening', icon: PointOfSaleOutlinedIcon, color: '#2563EB', path: '/cashier-panel/cash-drawer-opening' },
  { key: 'shift-closing', label: 'Shift Closing', icon: LockOutlinedIcon, color: '#F26B21', path: '/cashier-panel/shift-closing' },
  { key: 'cash-reconciliation', label: 'Cash Reconciliation', icon: FactCheckOutlinedIcon, color: '#22A06B', path: '/cashier-panel/cash-reconciliation' },
  { key: 'shortage-excess', label: 'Shortage / Excess', icon: WarningAmberOutlinedIcon, color: '#E5484D', path: '/cashier-panel/shortage-excess' },
  { key: 'cashier-wise-sales', label: 'Cashier-wise Sales', icon: PeopleAltOutlinedIcon, color: '#0EA5A4', path: '/cashier-panel/cashier-wise-sales' },
];

/**
 * The Cashier Panel's "Quick Actions" grid — 14 shortcut tiles (shift +
 * payment-method sales + cash-drawer movements + reconciliation
 * reporting), matching the reference's two-row icon-over-label layout.
 * Expenses Book lives in the main sidebar instead of here.
 * Only Cashier Login and Shift Opening route anywhere (dedicated screens
 * exist for those); every other tile surfaces a "coming soon" toast via
 * `onAction`.
 */
export default function CashierQuickActions({ onAction }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',
          sm: 'repeat(3, 1fr)',
          md: 'repeat(4, 1fr)',
          lg: 'repeat(7, 1fr)',
        },
        gap: 1.5,
      }}
    >
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <Paper
            key={action.key}
            component="button"
            type="button"
            onClick={() => onAction(action.label, action.path)}
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              textDecoration: 'none',
              color: 'text.primary',
              cursor: 'pointer',
              font: 'inherit',
              width: '100%',
              transition: 'transform 0.15s, box-shadow 0.15s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 2, borderColor: action.color },
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: `${action.color}1A`,
                color: action.color,
              }}
            >
              <Icon fontSize="small" />
            </Box>
            <Typography variant="caption" align="center" sx={{ fontWeight: 700 }}>
              {action.label}
            </Typography>
          </Paper>
        );
      })}
    </Box>
  );
}
