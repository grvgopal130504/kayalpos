import { Grid } from '@mui/material';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';

import StatCard from '../../../components/common/StatCard';
import { formatCurrency, formatNumber } from '../../../utils/format';

/**
 * 5-tile summary strip at the top of the Sales Invoice page — Total
 * Invoices, Total Amount, Paid, Draft, Overdue — matching the Sales
 * Quotation/Sales Order modules' summary strip pattern.
 */
export default function SalesInvoiceSummaryCards({ summary }) {
  const tiles = [
    {
      icon: ReceiptOutlinedIcon, iconColor: 'info', label: 'Total Invoices',
      value: formatNumber(summary.totalInvoices.value), caption: summary.totalInvoices.caption,
    },
    {
      icon: CardGiftcardOutlinedIcon, iconColor: 'success', label: 'Total Amount',
      value: formatCurrency(summary.totalAmount.value, { decimals: true }), caption: summary.totalAmount.caption,
    },
    {
      icon: CheckCircleOutlinedIcon, iconColor: '#8B5CF6', label: 'Paid',
      value: formatNumber(summary.paid.value), caption: summary.paid.caption,
    },
    {
      icon: EditNoteOutlinedIcon, iconColor: 'warning', label: 'Draft',
      value: formatNumber(summary.draft.value), caption: summary.draft.caption,
    },
    {
      icon: ErrorOutlineOutlinedIcon, iconColor: 'error', label: 'Overdue',
      value: formatNumber(summary.overdue.value), caption: summary.overdue.caption,
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
