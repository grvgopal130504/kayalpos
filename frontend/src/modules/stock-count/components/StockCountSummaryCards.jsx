import { Grid } from '@mui/material';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';

import StatCard from '../../../components/common/StatCard';
import { formatCurrency, formatNumber } from '../../../utils/format';

/**
 * Five KPI tiles at the top of the Stock Count list page: Total / Draft /
 * Completed counts, Completed (This Month) and Variance Value (This Month).
 */
export default function StockCountSummaryCards({ summary }) {
  const tiles = [
    {
      key: 'total', icon: FactCheckOutlinedIcon, iconColor: '#8B5CF6', label: 'Total Counts',
      value: formatNumber(summary.totalCounts.value), caption: summary.totalCounts.caption,
    },
    {
      key: 'draft', icon: DescriptionOutlinedIcon, iconColor: 'warning', label: 'Draft Counts',
      value: formatNumber(summary.draftCounts.value), caption: summary.draftCounts.caption,
    },
    {
      key: 'completed', icon: CheckCircleOutlinedIcon, iconColor: 'success', label: 'Completed Counts',
      value: formatNumber(summary.completedCounts.value), caption: summary.completedCounts.caption,
    },
    {
      key: 'thisMonth', icon: EventAvailableOutlinedIcon, iconColor: '#2563EB', label: 'Completed',
      value: formatNumber(summary.completedThisMonth.value), caption: summary.completedThisMonth.caption,
    },
    {
      key: 'variance', icon: CurrencyRupeeOutlinedIcon, iconColor: '#E5484D', label: 'Variance Value',
      value: formatCurrency(summary.varianceValue.value, { decimals: true }), caption: summary.varianceValue.caption,
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
