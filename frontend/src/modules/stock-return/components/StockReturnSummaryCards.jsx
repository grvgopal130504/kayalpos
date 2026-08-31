import { Grid } from '@mui/material';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';

import StatCard from '../../../components/common/StatCard';
import { formatCurrency, formatNumber } from '../../../utils/format';

/**
 * Five KPI tiles at the top of the Stock Return list page: Total / Draft /
 * Accepted returns, Accepted (This Month) and Value Returned (This Month).
 */
export default function StockReturnSummaryCards({ summary }) {
  const tiles = [
    {
      key: 'total', icon: AssignmentReturnOutlinedIcon, iconColor: '#8B5CF6', label: 'Total Returns',
      value: formatNumber(summary.totalReturns.value), caption: summary.totalReturns.caption,
    },
    {
      key: 'draft', icon: DescriptionOutlinedIcon, iconColor: 'warning', label: 'Draft Returns',
      value: formatNumber(summary.draftReturns.value), caption: summary.draftReturns.caption,
    },
    {
      key: 'accepted', icon: CheckCircleOutlinedIcon, iconColor: 'success', label: 'Accepted Returns',
      value: formatNumber(summary.acceptedReturns.value), caption: summary.acceptedReturns.caption,
    },
    {
      key: 'thisMonth', icon: EventAvailableOutlinedIcon, iconColor: '#2563EB', label: 'Accepted',
      value: formatNumber(summary.acceptedThisMonth.value), caption: summary.acceptedThisMonth.caption,
    },
    {
      key: 'value', icon: CurrencyRupeeOutlinedIcon, iconColor: '#E5484D', label: 'Value Returned',
      value: formatCurrency(summary.valueReturned.value, { decimals: true }), caption: summary.valueReturned.caption,
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
