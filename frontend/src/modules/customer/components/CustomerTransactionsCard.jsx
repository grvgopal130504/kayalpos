import { Paper, Stack, Box, Typography, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import DataTable from '../../../components/common/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import { formatCurrency } from '../../../utils/format';

const COLUMNS = [
  { key: 'date', label: 'Date' },
  { key: 'type', label: 'Type' },
  { key: 'invoiceNo', label: 'Invoice No.' },
  { key: 'amount', label: 'Amount (₹)', render: (row) => formatCurrency(row.amount, { decimals: true }) },
  { key: 'payment', label: 'Payment' },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} label={row.status === 'paid' ? 'Paid' : 'Received'} /> },
];

/**
 * "Recent Transactions" card on the Customer page — invoice/payment history
 * for the currently selected customer, with a "View All" link top-right.
 */
export default function CustomerTransactionsCard({ transactions }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 2.5, pt: 2.25, pb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Recent Transactions</Typography>
        <MuiLink component={RouterLink} to="/reports" variant="body2" sx={{ fontWeight: 700 }} underline="hover">
          View All
        </MuiLink>
      </Stack>
      <Box sx={{ px: 2.5, pb: 2 }}>
        <DataTable
          columns={COLUMNS}
          rows={transactions}
          getRowKey={(r) => r.invoiceNo}
          emptyMessage="No transactions found"
          dense
        />
      </Box>
    </Paper>
  );
}
