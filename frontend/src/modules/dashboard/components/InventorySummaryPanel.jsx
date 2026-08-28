import { Stack, Divider } from '@mui/material';
import LabeledRow from '../../../components/common/LabeledRow';
import DonutChart from '../../../components/common/DonutChart';
import { formatCurrency, formatNumber } from '../../../utils/format';

const STATUS_COLORS = { 'In Stock': '#22A06B', 'Low Stock': '#F5A623', 'Out of Stock': '#E5484D', Blocked: '#9CA3AF' };

export default function InventorySummaryPanel({ summary }) {
  return (
    <Stack spacing={1.5}>
      <LabeledRow label="Total Items" value={formatNumber(summary.totalItems)} />
      <LabeledRow label="Active Items" value={formatNumber(summary.activeItems)} />
      <LabeledRow label="Stock in Hand" value={formatCurrency(summary.stockInHand)} />
      <LabeledRow label="Stock Movement (Today)" value={formatCurrency(summary.stockMovementToday)} />
      <Divider />
      <DonutChart
        data={summary.breakdown.map((b) => ({ id: b.status, label: b.status, value: b.count, color: STATUS_COLORS[b.status] }))}
        centerValue={formatNumber(summary.totalItems)}
        centerLabel="Total Items"
        formatValue={(v) => formatNumber(v)}
        size={130}
      />
    </Stack>
  );
}
