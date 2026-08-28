import { LineChart } from '@mui/x-charts/LineChart';
import { useTheme } from '@mui/material/styles';

/**
 * Orange line trend chart (Sales Overview / Sales Trend on both
 * dashboards). One wrapper so every trend chart in the app shares the same
 * styling instead of hand-configuring @mui/x-charts per page.
 */
export default function TrendChart({ categories, values, height = 260, valueFormatter }) {
  const theme = useTheme();

  return (
    <LineChart
      height={height}
      series={[
        {
          data: values,
          area: false,
          showMark: true,
          curve: 'monotone',
          color: theme.palette.primary.main,
          valueFormatter,
        },
      ]}
      xAxis={[{ data: categories, scaleType: 'point', tickLabelStyle: { fontSize: 11 } }]}
      yAxis={[{ tickLabelStyle: { fontSize: 11 }, valueFormatter }]}
      grid={{ horizontal: true }}
      hideLegend
      margin={{ left: 56, right: 16, top: 16, bottom: 28 }}
      sx={{
        '& .MuiLineElement-root': { strokeWidth: 2.5 },
        '& .MuiMarkElement-root': { fill: theme.palette.primary.main, stroke: theme.palette.background.paper, strokeWidth: 2 },
        '& .MuiChartsAxis-line, & .MuiChartsAxis-tick': { stroke: theme.palette.divider },
      }}
    />
  );
}
