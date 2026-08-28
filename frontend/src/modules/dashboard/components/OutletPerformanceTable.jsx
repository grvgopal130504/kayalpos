import { Box } from '@mui/material';
import DataTable from '../../../components/common/DataTable';
import ProgressBar from '../../../components/common/ProgressBar';
import { formatCurrency, formatNumber } from '../../../utils/format';

export default function OutletPerformanceTable({ rows }) {
  const columns = [
    { key: 'outlet', label: 'Outlet' },
    { key: 'sales', label: 'Sales', align: 'right', render: (r) => formatCurrency(r.sales) },
    { key: 'transactions', label: 'Transactions', align: 'right', render: (r) => formatNumber(r.transactions) },
    { key: 'avgBillValue', label: 'Avg Bill Value', align: 'right', render: (r) => formatCurrency(r.avgBillValue, { decimals: true }) },
    {
      key: 'achievementPct',
      label: 'Target vs Achievement',
      render: (r) => (
        <Box sx={{ minWidth: 120 }}>
          <ProgressBar value={r.achievementPct} />
        </Box>
      ),
    },
  ];

  return <DataTable columns={columns} rows={rows} getRowKey={(r) => r.id} dense />;
}
