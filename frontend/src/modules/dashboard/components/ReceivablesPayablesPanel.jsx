import { Grid, Stack, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LabeledRow from '../../../components/common/LabeledRow';
import { formatCurrency, formatNumber } from '../../../utils/format';

export default function ReceivablesPayablesPanel({ data }) {
  return (
    <Grid container spacing={2}>
      <Grid size={6}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
            Receivables
          </Typography>
          <LabeledRow label="Total Receivables" value={formatCurrency(data.receivables.total, { decimals: true })} />
          <LabeledRow label="Overdue Amount" value={formatCurrency(data.receivables.overdue, { decimals: true })} valueColor="error.main" />
          <LabeledRow label="Customers Due" value={formatNumber(data.receivables.customersDue)} />
          <Button component={RouterLink} to="/customer" variant="outlined" size="small" fullWidth sx={{ mt: 1 }}>
            View Receivables
          </Button>
        </Stack>
      </Grid>
      <Grid size={6}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'warning.dark' }}>
            Payables
          </Typography>
          <LabeledRow label="Total Payables" value={formatCurrency(data.payables.total, { decimals: true })} />
          <LabeledRow label="Overdue Amount" value={formatCurrency(data.payables.overdue, { decimals: true })} valueColor="error.main" />
          <LabeledRow label="Suppliers Due" value={formatNumber(data.payables.suppliersDue)} />
          <Button component={RouterLink} to="/expenses-book" variant="outlined" color="warning" size="small" fullWidth sx={{ mt: 1 }}>
            View Payables
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
}
