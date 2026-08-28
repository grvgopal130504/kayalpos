import { Stack, Divider } from '@mui/material';
import LabeledRow from '../../../components/common/LabeledRow';
import { formatCurrency } from '../../../utils/format';

export default function ExpenseSummaryPanel({ summary }) {
  return (
    <Stack>
      {summary.breakdown.map((row) => (
        <LabeledRow key={row.category} label={row.category} value={formatCurrency(row.amount)} />
      ))}
      <Divider sx={{ my: 1 }} />
      <LabeledRow label="Total Expenses" value={formatCurrency(summary.total, { decimals: true })} emphasize valueColor="error.main" />
    </Stack>
  );
}
