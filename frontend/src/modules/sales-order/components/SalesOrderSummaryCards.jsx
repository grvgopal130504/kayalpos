import { Grid } from '@mui/material';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';

import StatCard from '../../../components/common/StatCard';
import { formatCurrency, formatNumber } from '../../../utils/format';

/**
 * 5-tile summary strip at the top of the Sales Order page — Total Orders,
 * Total Amount, Confirmed, Pending, Delivered — matching the Sales
 * Quotation module's summary strip pattern.
 */
export default function SalesOrderSummaryCards({ summary }) {
  const tiles = [
    {
      icon: ReceiptLongOutlinedIcon, iconColor: 'info', label: 'Total Orders',
      value: formatNumber(summary.totalOrders.value), caption: summary.totalOrders.caption,
    },
    {
      icon: CardGiftcardOutlinedIcon, iconColor: 'success', label: 'Total Amount',
      value: formatCurrency(summary.totalAmount.value, { decimals: true }), caption: summary.totalAmount.caption,
    },
    {
      icon: CheckCircleOutlinedIcon, iconColor: '#8B5CF6', label: 'Confirmed',
      value: formatNumber(summary.confirmed.value), caption: summary.confirmed.caption,
    },
    {
      icon: HourglassEmptyOutlinedIcon, iconColor: 'warning', label: 'Pending',
      value: formatNumber(summary.pending.value), caption: summary.pending.caption,
    },
    {
      icon: LocalShippingOutlinedIcon, iconColor: 'error', label: 'Delivered',
      value: formatNumber(summary.delivered.value), caption: summary.delivered.caption,
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
