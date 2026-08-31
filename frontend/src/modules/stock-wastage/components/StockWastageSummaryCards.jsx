import { Grid } from '@mui/material';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';

import StatCard from '../../../components/common/StatCard';
import { formatCurrency, formatNumber } from '../../../utils/format';

/**
 * Five KPI tiles at the top of the Stock Wastage list page: Total / Draft /
 * Approved wastages, Approved (This Month) and Value Wasted (This Month).
 */
export default function StockWastageSummaryCards({ summary }) {
  const tiles = [
    {
      key: 'total', icon: DeleteSweepOutlinedIcon, iconColor: '#8B5CF6', label: 'Total Wastages',
      value: formatNumber(summary.totalWastages.value), caption: summary.totalWastages.caption,
    },
    {
      key: 'draft', icon: DescriptionOutlinedIcon, iconColor: 'warning', label: 'Draft Wastages',
      value: formatNumber(summary.draftWastages.value), caption: summary.draftWastages.caption,
    },
    {
      key: 'approved', icon: CheckCircleOutlinedIcon, iconColor: 'success', label: 'Approved Wastages',
      value: formatNumber(summary.approvedWastages.value), caption: summary.approvedWastages.caption,
    },
    {
      key: 'thisMonth', icon: EventAvailableOutlinedIcon, iconColor: '#2563EB', label: 'Approved',
      value: formatNumber(summary.approvedThisMonth.value), caption: summary.approvedThisMonth.caption,
    },
    {
      key: 'value', icon: CurrencyRupeeOutlinedIcon, iconColor: '#E5484D', label: 'Value Wasted',
      value: formatCurrency(summary.valueWasted.value, { decimals: true }), caption: summary.valueWasted.caption,
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
