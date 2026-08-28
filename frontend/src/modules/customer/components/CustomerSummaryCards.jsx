import { Grid } from '@mui/material';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import StarOutlinedIcon from '@mui/icons-material/StarOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';

import StatCard from '../../../components/common/StatCard';
import { formatCurrency, formatNumber } from '../../../utils/format';

/**
 * Five KPI tiles at the top of the Customer page: Total / Active / Loyal
 * customers, Total Sales (This Month) and Outstanding Amount.
 */
export default function CustomerSummaryCards({ summary }) {
  const tiles = [
    {
      key: 'total',
      icon: PeopleAltOutlinedIcon,
      iconColor: 'success',
      label: 'Total Customers',
      value: formatNumber(summary.totalCustomers),
      caption: 'All Time',
    },
    {
      key: 'active',
      icon: PersonOutlinedIcon,
      iconColor: '#2563EB',
      label: 'Active Customers',
      value: formatNumber(summary.activeCustomers),
      caption: 'This Month',
    },
    {
      key: 'loyal',
      icon: StarOutlinedIcon,
      iconColor: '#F5A623',
      label: 'Loyal Customers',
      value: formatNumber(summary.loyalCustomers),
      caption: 'This Month',
    },
    {
      key: 'sales',
      icon: ShoppingCartOutlinedIcon,
      iconColor: '#7C3AED',
      label: 'Total Sales (This Month)',
      value: formatCurrency(summary.totalSalesThisMonth, { decimals: true }),
    },
    {
      key: 'outstanding',
      icon: AccountBalanceWalletOutlinedIcon,
      iconColor: 'error',
      label: 'Outstanding Amount',
      value: formatCurrency(summary.outstandingAmount, { decimals: true }),
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
