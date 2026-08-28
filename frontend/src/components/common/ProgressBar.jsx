import { Box, LinearProgress, Typography, Stack } from '@mui/material';

/**
 * Labeled progress bar (e.g. "Target vs Achievement"). `value` is 0-100.
 */
export default function ProgressBar({ value, label, color = 'primary' }) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
        {label && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {label}
          </Typography>
        )}
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          {clamped}%
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={clamped}
        color={color}
        sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover' }}
      />
    </Box>
  );
}
