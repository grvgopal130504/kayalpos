import { Grid } from '@mui/material';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import PauseCircleOutlinedIcon from '@mui/icons-material/PauseCircleOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import StarOutlinedIcon from '@mui/icons-material/StarOutlined';
import RedeemOutlinedIcon from '@mui/icons-material/RedeemOutlined';

import StatCard from '../../../components/common/StatCard';
import { formatNumber } from '../../../utils/format';

/**
 * Six KPI tiles at the top of the Loyalty list page: Total / Active /
 * Inactive programs, Members Enrolled, Points Issued (This Month) and
 * Points Redeemed (This Month).
 */
export default function LoyaltySummaryCards({ summary }) {
  const tiles = [
    {
      key: 'total', icon: FavoriteBorderOutlinedIcon, iconColor: '#8B5CF6', label: 'Total Programs',
      value: formatNumber(summary.totalPrograms.value), caption: summary.totalPrograms.caption,
    },
    {
      key: 'active', icon: PlayCircleOutlinedIcon, iconColor: 'success', label: 'Active Programs',
      value: formatNumber(summary.activePrograms.value), caption: summary.activePrograms.caption,
    },
    {
      key: 'inactive', icon: PauseCircleOutlinedIcon, iconColor: 'error', label: 'Inactive Programs',
      value: formatNumber(summary.inactivePrograms.value), caption: summary.inactivePrograms.caption,
    },
    {
      key: 'members', icon: PeopleAltOutlinedIcon, iconColor: '#2563EB', label: 'Members Enrolled',
      value: formatNumber(summary.membersEnrolled.value), caption: summary.membersEnrolled.caption,
    },
    {
      key: 'issued', icon: StarOutlinedIcon, iconColor: '#F5A623', label: 'Points Issued',
      value: formatNumber(summary.pointsIssued.value), caption: summary.pointsIssued.caption,
    },
    {
      key: 'redeemed', icon: RedeemOutlinedIcon, iconColor: 'info', label: 'Points Redeemed',
      value: formatNumber(summary.pointsRedeemed.value), caption: summary.pointsRedeemed.caption,
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
