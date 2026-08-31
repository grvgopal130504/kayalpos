import { Grid } from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';

import StatCard from '../../../components/common/StatCard';
import { formatCurrency, formatNumber } from '../../../utils/format';

/**
 * Five KPI tiles at the top of the Stock Receipt list page: Total / Draft /
 * Received receipts, Received (This Month) and Value Received (This Month).
 */
export default function StockReceiptSummaryCards({ summary }) {
  const tiles = [
    {
      key: 'total', icon: Inventory2OutlinedIcon, iconColor: '#8B5CF6', label: 'Total Receipts',
      value: formatNumber(summary.totalReceipts.value), caption: summary.totalReceipts.caption,
    },
    {
      key: 'draft', icon: DescriptionOutlinedIcon, iconColor: 'warning', label: 'Draft Receipts',
      value: formatNumber(summary.draftReceipts.value), caption: summary.draftReceipts.caption,
    },
    {
      key: 'received', icon: CheckCircleOutlinedIcon, iconColor: 'success', label: 'Received Receipts',
      value: formatNumber(summary.receivedReceipts.value), caption: summary.receivedReceipts.caption,
    },
    {
      key: 'thisMonth', icon: EventAvailableOutlinedIcon, iconColor: '#2563EB', label: 'Received',
      value: formatNumber(summary.receivedThisMonth.value), caption: summary.receivedThisMonth.caption,
    },
    {
      key: 'value', icon: CurrencyRupeeOutlinedIcon, iconColor: '#E5484D', label: 'Value Received',
      value: formatCurrency(summary.valueReceived.value, { decimals: true }), caption: summary.valueReceived.caption,
    },
  ];

  return (
    <Grid container spacing={2}>
      {tiles.map((tile) => (
        <Grid key={tile.key} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard
            icon={tile.icon}
            iconColor={tile.iconColor}
            iconShape="circle"
            label={tile.label}
            value={tile.value}
            caption={tile.caption}
          />
        </Grid>
      ))}
    </Grid>
  );
}
