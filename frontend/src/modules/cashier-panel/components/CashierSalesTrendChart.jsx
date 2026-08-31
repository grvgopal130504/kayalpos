import { LineChart } from '@mui/x-charts/LineChart';
import { Stack, Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { formatCurrency } from '../../../utils/format';

/**
 * "Sales Trend (By Cashier)" multi-line chart — one line per cashier, each
 * colored to match that cashier's donut slice / table row. Built directly
 * on @mui/x-charts LineChart (the shared TrendChart wrapper only supports
 * a single series) with a custom legend row above the chart, matching the
 * reference's inline swatch-and-name legend.
 */
export default function CashierSalesTrendChart({ categories, series, height = 280 }) {
  const theme = useTheme();
  const valueFormatter = (v) => formatCurrency(v, { decimals: false });

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={2.5} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
        {series.map((s) => (
          <Stack key={s.code} direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <Box sx={{ width: 20, height: 3, borderRadius: 1, bgcolor: s.color, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>{s.name}</Typography>
          </Stack>
        ))}
      </Stack>

      <Box sx={{ overflowX: 'auto' }}>
        <Box sx={{ minWidth: 560 }}>
          <LineChart
            height={height}
            series={series.map((s) => ({
              id: s.code,
              data: s.data,
              area: false,
              showMark: true,
              curve: 'monotone',
              color: s.color,
              valueFormatter,
              label: s.name,
            }))}
            xAxis={[{ data: categories, scaleType: 'point', tickLabelStyle: { fontSize: 11 } }]}
            yAxis={[{ label: 'Sales (₹)', tickLabelStyle: { fontSize: 11 }, labelStyle: { fontSize: 11 } }]}
            grid={{ horizontal: true }}
            hideLegend
            margin={{ left: 64, right: 16, top: 16, bottom: 28 }}
            sx={{
              '& .MuiLineElement-root': { strokeWidth: 2.25 },
              '& .MuiMarkElement-root': { strokeWidth: 2 },
              '& .MuiChartsAxis-line, & .MuiChartsAxis-tick': { stroke: theme.palette.divider },
            }}
          />
        </Box>
      </Box>
    </Stack>
  );
}
