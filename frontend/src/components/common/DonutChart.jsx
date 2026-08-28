import { Box, Stack, Typography } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';

/**
 * Donut chart with a centered total and a right-hand legend listing each
 * slice's label, formatted value, and share of the total — matches the
 * "Payment Summary" / "Sales by Outlet" / "Inventory Summary" style donuts
 * used on both dashboards. One component so those panels only supply data.
 *
 * `data`: [{ id, label, value, color }]
 * `centerLabel` / `centerValue`: text shown in the donut's empty middle.
 */
export default function DonutChart({ data, centerLabel, centerValue, formatValue = (v) => v, size = 160 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'center' }}>
      <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <PieChart
          series={[
            {
              data,
              innerRadius: size * 0.32,
              outerRadius: size * 0.5,
              paddingAngle: 1,
              cornerRadius: 1,
            },
          ]}
          width={size}
          height={size}
          hideLegend
          margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
          slotProps={{ tooltip: { trigger: 'item' } }}
          sx={{ '& .MuiPieArc-root': { stroke: 'none' } }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            textAlign: 'center',
            px: 2,
          }}
        >
          {centerValue && (
            <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>
              {centerValue}
            </Typography>
          )}
          {centerLabel && (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10.5 }}>
              {centerLabel}
            </Typography>
          )}
        </Box>
      </Box>

      <Stack spacing={0.75} sx={{ width: '100%', minWidth: 0 }}>
        {data.map((slice) => (
          <Stack key={slice.id} direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', minWidth: 0 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: slice.color, flexShrink: 0 }} />
              <Typography variant="caption" noWrap title={slice.label} sx={{ color: 'text.secondary' }}>
                {slice.label}
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ fontWeight: 700, flexShrink: 0 }}>
              {formatValue(slice.value)} ({total ? Math.round((slice.value / total) * 100) : 0}%)
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
