import InfoCard from '../../../components/common/InfoCard';
import DataTable from '../../../components/common/DataTable';

/**
 * Bottom activity card on a status page — "Promotion History" (Date/
 * Action/User) for Active/Expired, or "Upcoming Promotion Schedule"
 * (Date/Promotion/Type/Discount) for Upcoming. Columns/title/rows/link are
 * all passed in so this one component covers both variants.
 */
export default function PromotionActivityCard({ title, columns, rows, linkLabel }) {
  const fullColumns = [{ key: 'index', label: '#', render: (_row, i) => i + 1 }, ...columns];

  return (
    <InfoCard title={title} link={linkLabel ? { label: linkLabel, to: '/promotion' } : undefined}>
      <DataTable columns={fullColumns} rows={rows} getRowKey={(r) => `${r.date}-${r.action || r.name}`} />
    </InfoCard>
  );
}
