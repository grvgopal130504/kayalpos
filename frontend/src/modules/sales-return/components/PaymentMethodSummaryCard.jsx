import InfoCard from '../../../components/common/InfoCard';
import DonutChart from '../../../components/common/DonutChart';
import { formatCurrency } from '../../../utils/format';

const METHOD_COLORS = { Cash: '#22A06B', UPI: '#2563EB', Card: '#8B5CF6', Wallet: '#F5A623', Credit: '#E5484D' };

export default function PaymentMethodSummaryCard({ method, amount }) {
  return (
    <InfoCard title="Payment Method (Original Invoice)" dense sx={{ height: '100%' }}>
      <DonutChart
        data={[{ id: method, label: method, value: amount, color: METHOD_COLORS[method] || '#22A06B' }]}
        centerValue={formatCurrency(amount, { decimals: true })}
        centerLabel="Total Paid"
        formatValue={(v) => formatCurrency(v, { decimals: true })}
        size={140}
      />
    </InfoCard>
  );
}
