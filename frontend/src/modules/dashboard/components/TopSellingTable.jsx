import DataTable from '../../../components/common/DataTable';
import { formatCurrency, formatNumber } from '../../../utils/format';

export default function TopSellingTable({ items }) {
  const columns = [
    { key: 'rank', label: '#', render: (row, index) => index + 1 },
    { key: 'name', label: 'Item Name' },
    { key: 'qty', label: 'Quantity', align: 'right', render: (row) => `${formatNumber(row.qty)} ${row.unit}` },
    { key: 'salesAmount', label: 'Sales Amount', align: 'right', render: (row) => formatCurrency(row.salesAmount, { decimals: true }) },
  ];

  return <DataTable columns={columns} rows={items} getRowKey={(r) => r.id} dense />;
}
