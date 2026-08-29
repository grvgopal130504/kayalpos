import { Grid } from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

import StatCard from '../../../components/common/StatCard';
import { formatCurrency, formatNumber } from '../../../utils/format';

/**
 * 5-tile summary strip at the top of the Stock Transfer page — Total
 * Transfers, Total Estimated Value, Received, In Transit, Cancelled —
 * matching the other modules' summary strip pattern.
 */
export default function StockTransferSummaryCards({ summary }) {
  const tiles = [
    {
      icon: LocalShippingOutlinedIcon, iconColor: 'info', label: 'Total Transfers',
      value: formatNumber(summary.totalTransfers.value), caption: summary.totalTransfers.caption,
    },
    {
      icon: CardGiftcardOutlinedIcon, iconColor: 'success', label: 'Total Estimated Value',
      value: formatCurrency(summary.totalEstimatedValue.value, { decimals: true }), caption: summary.totalEstimatedValue.caption,
    },
    {
      icon: CheckCircleOutlinedIcon, iconColor: '#8B5CF6', label: 'Received',
      value: formatNumber(summary.received.value), caption: summary.received.caption,
    },
    {
      icon: MoveToInboxOutlinedIcon, iconColor: 'warning', label: 'In Transit',
      value: formatNumber(summary.inTransit.value), caption: summary.inTransit.caption,
    },
    {
      icon: CancelOutlinedIcon, iconColor: 'error', label: 'Cancelled',
      value: formatNumber(summary.cancelled.value), caption: summary.cancelled.caption,
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
