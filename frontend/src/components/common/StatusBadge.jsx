import { Chip } from '@mui/material';

// Central status -> color mapping so every table/badge in the app agrees on
// what "Completed" / "Low Stock" / "Connected" etc. look like.
const STATUS_STYLES = {
  completed: { bgcolor: '#E6F7EF', color: '#1B8354' },
  connected: { bgcolor: '#E6F7EF', color: '#1B8354' },
  'in stock': { bgcolor: '#E6F7EF', color: '#1B8354' },
  success: { bgcolor: '#E6F7EF', color: '#1B8354' },
  active: { bgcolor: '#E6F7EF', color: '#1B8354' },
  paid: { bgcolor: '#E6F7EF', color: '#1B8354' },
  received: { bgcolor: '#E7EFFE', color: '#2563EB' },
  inactive: { bgcolor: '#FDEBEC', color: '#D5343B' },
  upcoming: { bgcolor: '#E7EFFE', color: '#2563EB' },
  pending: { bgcolor: '#FFF4E5', color: '#B5730A' },
  confirmed: { bgcolor: '#E7EFFE', color: '#2563EB' },
  delivered: { bgcolor: '#E6F7EF', color: '#1B8354' },
  draft: { bgcolor: '#F1F2F4', color: '#5B6472' },
  sent: { bgcolor: '#E7EFFE', color: '#2563EB' },
  overdue: { bgcolor: '#FDEBEC', color: '#D5343B' },
  printed: { bgcolor: '#E6F7EF', color: '#1B8354' },
  'pending-print': { bgcolor: '#FFF4E5', color: '#B5730A' },
  approved: { bgcolor: '#E6F7EF', color: '#1B8354' },
  'pending-approval': { bgcolor: '#E7EFFE', color: '#2563EB' },
  rejected: { bgcolor: '#FDEBEC', color: '#D5343B' },
  'in-transit': { bgcolor: '#FFF4E5', color: '#B5730A' },
  cancelled: { bgcolor: '#FDEBEC', color: '#D5343B' },
  'low stock': { bgcolor: '#FDEBEC', color: '#D5343B' },
  'out of stock': { bgcolor: '#FDEBEC', color: '#D5343B' },
  expired: { bgcolor: '#F1F2F4', color: '#5B6472' },
  blocked: { bgcolor: '#F1F2F4', color: '#5B6472' },
  failed: { bgcolor: '#FDEBEC', color: '#D5343B' },
  error: { bgcolor: '#FDEBEC', color: '#D5343B' },
};

export default function StatusBadge({ status, label }) {
  const key = String(status || '').toLowerCase();
  const style = STATUS_STYLES[key] || { bgcolor: '#F1F2F4', color: '#5B6472' };

  return (
    <Chip
      label={label || status}
      size="small"
      sx={{
        bgcolor: style.bgcolor,
        color: style.color,
        fontWeight: 700,
        fontSize: 12,
        height: 24,
      }}
    />
  );
}
