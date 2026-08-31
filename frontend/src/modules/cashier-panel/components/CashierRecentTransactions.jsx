import { Paper, Stack, Box, Typography, Link as MuiLink } from '@mui/material';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

import { formatCurrency } from '../../../utils/format';

const ICONS = {
  'Cash Sale': CurrencyRupeeOutlinedIcon,
  'Card Sale': ReceiptOutlinedIcon,
  'UPI Sale': QrCode2OutlinedIcon,
  'Cash Withdrawal': ArrowDownwardIcon,
  'Cash Deposit': ArrowUpwardIcon,
};

/**
 * "Recent Transactions" panel — each row pairs a colored type icon +
 * label + reference number on the left with time (above) and amount
 * (below) right-aligned, matching the reference's two-line layout. "View
 * All" in the header is a stub for now (no dedicated transactions list
 * screen yet).
 */
export default function CashierRecentTransactions({ transactions, onViewAll }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Recent Transactions</Typography>
        <MuiLink component="button" type="button" variant="body2" underline="hover" sx={{ fontWeight: 700 }} onClick={onViewAll}>
          View All
        </MuiLink>
      </Stack>
      <Stack spacing={1.5}>
        {transactions.map((txn) => {
          const Icon = ICONS[txn.type] || CurrencyRupeeOutlinedIcon;
          return (
            <Stack key={txn.id} direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', minWidth: 0 }}>
                <Box
                  sx={{
                    width: 30, height: 30, borderRadius: 1.5, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: `${txn.color}1A`, color: txn.color,
                  }}
                >
                  <Icon sx={{ fontSize: 16 }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>{txn.type}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{txn.ref}</Typography>
                </Box>
              </Stack>
              <Box sx={{ textAlign: 'right', flexShrink: 0, pl: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{txn.time}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCurrency(txn.amount, { decimals: true })}</Typography>
              </Box>
            </Stack>
          );
        })}
      </Stack>
    </Paper>
  );
}
