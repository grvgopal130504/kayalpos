import { Box, Chip, Tooltip } from '@mui/material';
import { keyframes } from '@emotion/react';

// Same flat-color language as StatusBadge (green/red/grey) so this tag
// reads as part of the same system rather than a one-off widget.
const STATUS_STYLES = {
  checking: { bgcolor: '#F1F2F4', color: '#5B6472', dot: '#9AA1AC', label: 'Checking' },
  healthy: { bgcolor: '#E6F7EF', color: '#1B8354', dot: '#1B8354', label: 'Healthy' },
  unhealthy: { bgcolor: '#FDEBEC', color: '#D5343B', dot: '#D5343B', label: 'Unhealthy' },
};

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
`;

function buildTooltip(status, services) {
  if (status === 'checking') return 'Checking connectivity…';
  if (status === 'healthy') return 'Frontend, backend and database are all reachable.';

  const down = [];
  if (!services?.backend) down.push('Backend API');
  if (!services?.database) down.push('Database');

  return down.length > 0
    ? `Unreachable: ${down.join(', ')}`
    : 'Unable to verify backend/database connectivity.';
}

/**
 * Small connectivity indicator for the topbar: a colored dot + label
 * reflecting the latest useHealthStatus() result, with a tooltip naming
 * which dependency (backend/database) is down when unhealthy.
 */
export default function HealthStatusTag({ status, services }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.checking;
  const tooltip = buildTooltip(status, services);

  return (
    <Tooltip title={tooltip} arrow>
      <Chip
        size="small"
        label={style.label}
        icon={(
          <Box
            component="span"
            sx={{
              width: 8,
              height: 8,
              ml: '10px',
              borderRadius: '50%',
              bgcolor: style.dot,
              flexShrink: 0,
              animation: status === 'checking' ? `${pulse} 1.2s ease-in-out infinite` : 'none',
            }}
          />
        )}
        sx={{
          bgcolor: style.bgcolor,
          color: style.color,
          fontWeight: 700,
          fontSize: 12,
          height: 28,
          '& .MuiChip-icon': { color: 'inherit' },
        }}
      />
    </Tooltip>
  );
}
