import { Stack, Divider } from '@mui/material';
import LabeledRow from '../../../components/common/LabeledRow';
import { formatCurrency } from '../../../utils/format';

export default function ProfitOverviewPanel({ data }) {
  return (
    <Stack>
      <LabeledRow label="Total Sales" value={formatCurrency(data.totalSales, { decimals: true })} />
      <LabeledRow label="Total Purchase" value={formatCurrency(data.totalPurchase, { decimals: true })} />
      <LabeledRow label="Gross Profit" value={formatCurrency(data.grossProfit, { decimals: true })} valueColor="success.main" />
      <LabeledRow label="Total Expenses" value={formatCurrency(data.totalExpenses, { decimals: true })} valueColor="error.main" />
      <Divider sx={{ my: 1 }} />
      <LabeledRow label="Net Profit" value={formatCurrency(data.netProfit, { decimals: true })} emphasize valueColor="success.main" />
    </Stack>
  );
}
