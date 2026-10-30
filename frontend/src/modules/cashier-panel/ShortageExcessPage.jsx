import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper, Alert, Skeleton,
} from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';
import StatCard from '../../components/common/StatCard';
import { DatePickerField, formatPickerDate, parsePickerDate } from '../../components/form/FormDatePicker';
import { formatCurrency } from '../../utils/format';
import { useShortageExcessReportQuery } from '../../api/shortageExcessApi';

import ShortageExcessTransactionsTable from './components/ShortageExcessTransactionsTable';

const PAGE_SIZE = 10;

function SummaryTile({ label, value, valueColor }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2.5, p: 1.75, height: '100%' }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{label}</Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: valueColor || 'text.primary', mt: 0.25 }}>
        {value}
      </Typography>
    </Paper>
  );
}

function toDateKey(pickerValue) {
  const date = parsePickerDate(pickerValue) || new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Shortage/Excess-by-type donut for the summary panel — built directly on
 * PieChart (rather than the shared DonutChart) so a third, non-slice
 * legend row ("Net Amount", equal to Shortage − Excess) can sit below the
 * two real Shortage/Excess arcs without double-counting the total.
 */
function ByTypeDonut({ data, netAmountLegend, centerLabel, centerValue, size = 160 }) {
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

      <Stack spacing={1.25} sx={{ width: '100%', minWidth: 0 }}>
        {data.map((slice) => (
          <Stack key={slice.id} direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', minWidth: 0 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: slice.color, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{slice.label}</Typography>
            </Stack>
            <Typography variant="body2" sx={{ fontWeight: 700, flexShrink: 0 }}>
              {formatCurrency(slice.value, { decimals: true })} ({total ? Math.round((slice.value / total) * 100 * 100) / 100 : 0}%)
            </Typography>
          </Stack>
        ))}
        {netAmountLegend && (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', minWidth: 0 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: netAmountLegend.color, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{netAmountLegend.label}</Typography>
            </Stack>
            <Typography variant="body2" sx={{ fontWeight: 700, flexShrink: 0 }}>
              {formatCurrency(netAmountLegend.value, { decimals: true })}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}

/**
 * Shortage / Excess — the cashier's cash-variance report reached from the
 * Cashier Panel's "Shortage / Excess" quick action. There is no separate
 * create-flow or table behind this page at all: a "shortage / excess"
 * entry is simply the non-zero-variance subset of a CLOSED ShiftSession
 * row's real reconciliation — closingVariance < 0 is a Shortage, > 0 is
 * an Excess, both computed once and stored by closeShift() (see backend/
 * src/modules/shift-session/shiftSession.service.js) — this page only
 * reads and reshapes that same real data via GET /shortage-excess/summary
 * (see shortageExcess.service.js's getShortageExcessReport), the same
 * read-only relationship Cash Reconciliation has with those rows (minus
 * the exact matches, which never appear here).
 */
export default function ShortageExcessPage() {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(() => formatPickerDate(new Date()));

  const dateKey = toDateKey(selectedDate);
  const {
    data: report, isLoading, isFetching, isError, refetch,
  } = useShortageExcessReportQuery({ date: dateKey, page, pageSize: PAGE_SIZE });


  const handleViewAll = () => dispatch(showToast('Full shortage / excess list is coming soon', 'info'));
  const handleDateChange = (value) => {
    setSelectedDate(value || formatPickerDate(new Date()));
    setPage(1);
  };

  if (isError) {
    return (
      <Stack spacing={2}>
        <Alert
          severity="error"
          action={(
            <MuiLink component="button" type="button" variant="body2" underline="hover" onClick={refetch}>
              Retry
            </MuiLink>
          )}
        >
          Couldn&apos;t load the Shortage / Excess report from the server. Check your connection and try reloading.
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Shortage / Excess</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/cashier-panel" underline="hover" color="text.secondary">Cashier Panel</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Shortage / Excess</Typography>
          </Breadcrumbs>
        </Box>
      </Stack>

      <Alert severity="info" variant="outlined">
        This is a report of shortages and excesses found while reconciling closed shifts. To close a shift and record its
        cash count, use the Shift Closing screen.
      </Alert>

      {isLoading || !report ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5].map((key) => (
            <Grid key={key} size={{ xs: 12, sm: 6, lg: 2.4 }}>
              <Skeleton variant="rounded" height={92} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              icon={WarningAmberOutlinedIcon}
              iconColor="success"
              iconShape="circle"
              label="Total Shortage / Excess"
              value={formatCurrency(report.stats.totalShortageExcess.value, { decimals: true })}
              caption={`Transactions : ${report.stats.totalShortageExcess.transactions}`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              icon={DescriptionOutlinedIcon}
              iconColor="#2563EB"
              iconShape="circle"
              label="Total Entries"
              value={String(report.stats.totalEntries.value)}
              caption="Total Quantity : -"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              icon={CurrencyRupeeOutlinedIcon}
              iconColor="warning"
              iconShape="circle"
              label="Average Amount"
              value={formatCurrency(report.stats.avgAmount.value, { decimals: true })}
              caption="Per Entry"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              icon={CalendarTodayOutlinedIcon}
              iconColor="#8B5CF6"
              iconShape="circle"
              label="Today's Shortage / Excess"
              value={formatCurrency(report.stats.todaysShortageExcess.value, { decimals: true })}
              caption={`${report.stats.todaysShortageExcess.transactions} Transactions`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              icon={CalendarTodayOutlinedIcon}
              iconColor="#0EA5A4"
              iconShape="circle"
              label="Selected Date"
              value={formatCurrency(report.stats.selectedDateShortageExcess.value, { decimals: true })}
              caption={report.stats.selectedDateShortageExcess.date}
            />
          </Grid>
        </Grid>
      )}

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Shortage / Excess Summary</Typography>
              <DatePickerField
                value={selectedDate}
                onChange={handleDateChange}
                sx={{ width: { xs: '100%', sm: 200 } }}
              />
            </Stack>

            {!report ? (
              <Skeleton variant="rounded" height={220} />
            ) : (
              <>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <SummaryTile label="Total Shortage / Excess" value={formatCurrency(report.summary.totalShortageExcess, { decimals: true })} valueColor="#2563EB" />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <SummaryTile label="Total Transactions" value={String(report.summary.totalTransactions)} valueColor="#2563EB" />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <SummaryTile label="Recorded By" value={report.summary.recordedBy} valueColor="#2563EB" />
                  </Grid>
                </Grid>

                <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <SummaryTile label="Total Shortage" value={formatCurrency(report.summary.totalShortage, { decimals: true })} valueColor="error.main" />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <SummaryTile label="Total Excess" value={formatCurrency(report.summary.totalExcess, { decimals: true })} valueColor="success.main" />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <SummaryTile label="Net Amount" value={formatCurrency(report.summary.netAmount, { decimals: true })} valueColor="error.main" />
                  </Grid>
                </Grid>

                <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <SummaryTile label="Shortage (Count)" value={String(report.summary.shortageCount)} valueColor="error.main" />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <SummaryTile label="Excess (Count)" value={String(report.summary.excessCount)} valueColor="success.main" />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <SummaryTile label="Status" value={report.summary.status} valueColor={report.summary.status === 'All Balanced' ? 'success.main' : 'error.main'} />
                  </Grid>
                </Grid>
              </>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Shortage / Excess Summary (By Type)</Typography>
            {!report ? (
              <Skeleton variant="rounded" height={220} />
            ) : (
              <ByTypeDonut
                data={report.byType}
                netAmountLegend={report.netAmountLegend}
                centerValue={formatCurrency(report.summary.totalShortageExcess, { decimals: true })}
                centerLabel="Total"
              />
            )}
          </Paper>
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Recent Shortage / Excess Transactions</Typography>
          <MuiLink
            component="button"
            type="button"
            variant="body2"
            underline="hover"
            onClick={handleViewAll}
            sx={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center' }}
          >
            View All <NavigateNextIcon fontSize="small" />
          </MuiLink>
        </Stack>
        {!report ? (
          <Skeleton variant="rounded" height={240} />
        ) : (
          <ShortageExcessTransactionsTable
            rows={report.transactions}
            totalPages={report.totalPages}
            page={report.page}
            onPageChange={setPage}
            loading={isFetching}
          />
        )}
      </Paper>
    </Stack>
  );
}
