import { Grid } from '@mui/material';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import PauseCircleOutlinedIcon from '@mui/icons-material/PauseCircleOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';

import StatCard from '../../../components/common/StatCard';
import { formatCurrency, formatNumber } from '../../../utils/format';

export default function PromotionSummaryCards({ summary }) {
  const tiles = [
    {
      icon: LocalOfferOutlinedIcon, iconColor: '#8B5CF6', label: 'Total Promotions',
      value: formatNumber(summary.totalPromotions.value), caption: summary.totalPromotions.caption,
    },
    {
      icon: PlayCircleOutlinedIcon, iconColor: 'success', label: 'Active Promotions',
      value: formatNumber(summary.activePromotions.value), caption: summary.activePromotions.caption,
    },
    {
      icon: AccessTimeOutlinedIcon, iconColor: 'warning', label: 'Upcoming Promotions',
      value: formatNumber(summary.upcomingPromotions.value), caption: summary.upcomingPromotions.caption,
    },
    {
      icon: PauseCircleOutlinedIcon, iconColor: 'error', label: 'Expired Promotions',
      value: formatNumber(summary.expiredPromotions.value), caption: summary.expiredPromotions.caption,
    },
    {
      icon: CardGiftcardOutlinedIcon, iconColor: 'info', label: 'Coupon/Offers Used',
      value: formatNumber(summary.couponsUsed.value), caption: summary.couponsUsed.caption,
    },
    {
      icon: CurrencyRupeeOutlinedIcon, iconColor: '#E5484D', label: 'Discount Given',
      value: formatCurrency(summary.discountGiven.value, { decimals: true }), caption: summary.discountGiven.caption,
    },
  ];

  return (
    <Grid container spacing={2}>
      {tiles.map((tile) => (
        <Grid key={tile.label} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
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
