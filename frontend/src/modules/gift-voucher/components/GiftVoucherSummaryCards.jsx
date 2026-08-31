import { Grid } from '@mui/material';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import PauseCircleOutlinedIcon from '@mui/icons-material/PauseCircleOutlined';
import RedeemOutlinedIcon from '@mui/icons-material/RedeemOutlined';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';

import StatCard from '../../../components/common/StatCard';
import { formatCurrency, formatNumber } from '../../../utils/format';

/**
 * Six KPI tiles at the top of the Gift Voucher list page: Total / Active /
 * Expired vouchers, Redeemed (This Month), Value Issued (This Month) and
 * Outstanding (unredeemed) Value.
 */
export default function GiftVoucherSummaryCards({ summary }) {
  const tiles = [
    {
      key: 'total', icon: CardGiftcardOutlinedIcon, iconColor: '#8B5CF6', label: 'Total Vouchers',
      value: formatNumber(summary.totalVouchers.value), caption: summary.totalVouchers.caption,
    },
    {
      key: 'active', icon: PlayCircleOutlinedIcon, iconColor: 'success', label: 'Active Vouchers',
      value: formatNumber(summary.activeVouchers.value), caption: summary.activeVouchers.caption,
    },
    {
      key: 'expired', icon: PauseCircleOutlinedIcon, iconColor: 'error', label: 'Expired Vouchers',
      value: formatNumber(summary.expiredVouchers.value), caption: summary.expiredVouchers.caption,
    },
    {
      key: 'redeemed', icon: RedeemOutlinedIcon, iconColor: 'info', label: 'Redeemed',
      value: formatNumber(summary.redeemedThisMonth.value), caption: summary.redeemedThisMonth.caption,
    },
    {
      key: 'issued', icon: CurrencyRupeeOutlinedIcon, iconColor: '#F5A623', label: 'Value Issued',
      value: formatCurrency(summary.valueIssued.value, { decimals: true }), caption: summary.valueIssued.caption,
    },
    {
      key: 'outstanding', icon: AccountBalanceWalletOutlinedIcon, iconColor: '#E5484D', label: 'Outstanding Value',
      value: formatCurrency(summary.outstandingValue.value, { decimals: true }), caption: summary.outstandingValue.caption,
    },
  ];

  return (
    <Grid container spacing={2}>
      {tiles.map((tile) => (
        <Grid key={tile.key} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
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
