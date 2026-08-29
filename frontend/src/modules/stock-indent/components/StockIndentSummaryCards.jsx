import { Grid } from '@mui/material';
import PlaylistAddCheckOutlinedIcon from '@mui/icons-material/PlaylistAddCheckOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

import StatCard from '../../../components/common/StatCard';
import { formatCurrency, formatNumber } from '../../../utils/format';

/**
 * 5-tile summary strip at the top of the Stock Indent page — Total
 * Indents, Total Estimated Value, Approved, Pending Approval, Rejected —
 * matching the other modules' summary strip pattern.
 */
export default function StockIndentSummaryCards({ summary }) {
  const tiles = [
    {
      icon: PlaylistAddCheckOutlinedIcon, iconColor: 'info', label: 'Total Indents',
      value: formatNumber(summary.totalIndents.value), caption: summary.totalIndents.caption,
    },
    {
      icon: CardGiftcardOutlinedIcon, iconColor: 'success', label: 'Total Estimated Value',
      value: formatCurrency(summary.totalEstimatedValue.value, { decimals: true }), caption: summary.totalEstimatedValue.caption,
    },
    {
      icon: CheckCircleOutlinedIcon, iconColor: '#8B5CF6', label: 'Approved',
      value: formatNumber(summary.approved.value), caption: summary.approved.caption,
    },
    {
      icon: HourglassEmptyOutlinedIcon, iconColor: 'warning', label: 'Pending Approval',
      value: formatNumber(summary.pendingApproval.value), caption: summary.pendingApproval.caption,
    },
    {
      icon: CancelOutlinedIcon, iconColor: 'error', label: 'Rejected',
      value: formatNumber(summary.rejected.value), caption: summary.rejected.caption,
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
