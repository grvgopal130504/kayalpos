import { Grid } from '@mui/material';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import LocalPrintshopOutlinedIcon from '@mui/icons-material/LocalPrintshopOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';

import StatCard from '../../../components/common/StatCard';
import { formatNumber } from '../../../utils/format';

/**
 * 5-tile summary strip at the top of the Barcode & Label page — Total
 * Batches, Total Labels Printed, Printed, Draft, Pending Print — matching
 * the other modules' summary strip pattern. No currency figures here since
 * a label batch isn't a priced document.
 */
export default function BarcodeLabelSummaryCards({ summary }) {
  const tiles = [
    {
      icon: QrCode2OutlinedIcon, iconColor: 'info', label: 'Total Batches',
      value: formatNumber(summary.totalBatches.value), caption: summary.totalBatches.caption,
    },
    {
      icon: LocalPrintshopOutlinedIcon, iconColor: 'success', label: 'Total Labels Printed',
      value: formatNumber(summary.totalLabelsPrinted.value), caption: summary.totalLabelsPrinted.caption,
    },
    {
      icon: CheckCircleOutlinedIcon, iconColor: '#8B5CF6', label: 'Printed',
      value: formatNumber(summary.printed.value), caption: summary.printed.caption,
    },
    {
      icon: EditNoteOutlinedIcon, iconColor: 'warning', label: 'Draft',
      value: formatNumber(summary.draft.value), caption: summary.draft.caption,
    },
    {
      icon: HourglassEmptyOutlinedIcon, iconColor: 'error', label: 'Pending Print',
      value: formatNumber(summary.pendingPrint.value), caption: summary.pendingPrint.caption,
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
