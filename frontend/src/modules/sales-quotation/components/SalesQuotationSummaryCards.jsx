import { Grid } from '@mui/material';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import RedeemOutlinedIcon from '@mui/icons-material/RedeemOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';

import StatCard from '../../../components/common/StatCard';
import { formatCurrency, formatNumber } from '../../../utils/format';

/**
 * 5-tile summary strip at the top of the Sales Quotation page — Total
 * Quotations, Total Amount, Converted, Pending, Expired — matching the
 * reference screenshot's circular pastel icon tiles.
 */
export default function SalesQuotationSummaryCards({ summary }) {
  const tiles = [
    {
      icon: PeopleAltOutlinedIcon, iconColor: 'info', label: 'Total Quotations',
      value: formatNumber(summary.totalQuotations.value), caption: summary.totalQuotations.caption,
    },
    {
      icon: CardGiftcardOutlinedIcon, iconColor: 'success', label: 'Total Amount',
      value: formatCurrency(summary.totalAmount.value, { decimals: true }), caption: summary.totalAmount.caption,
    },
    {
      icon: AssignmentTurnedInOutlinedIcon, iconColor: '#8B5CF6', label: 'Converted',
      value: formatNumber(summary.converted.value), caption: summary.converted.caption,
    },
    {
      icon: RedeemOutlinedIcon, iconColor: 'warning', label: 'Pending',
      value: formatNumber(summary.pending.value), caption: summary.pending.caption,
    },
    {
      icon: EventBusyOutlinedIcon, iconColor: 'error', label: 'Expired',
      value: formatNumber(summary.expired.value), caption: summary.expired.caption,
    },
  ];

  return (
    <Grid container spacing={2}>
      {tiles.map((tile) => (
        <Grid key={tile.label} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
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
