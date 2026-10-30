import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { FormProvider, useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper, Alert, Skeleton, Button,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';
import StatCard from '../../components/common/StatCard';
import DonutChart from '../../components/common/DonutChart';
import FormTextField from '../../components/form/FormTextField';
import { DatePickerField, formatPickerDate, parsePickerDate } from '../../components/form/FormDatePicker';
import { formatCurrency } from '../../utils/format';
import { useShiftSessionStatusQuery, useCloseShiftMutation } from '../../api/shiftSessionApi';
import { useShiftClosingReportQuery } from '../../api/shiftClosingApi';

import ShiftClosingTransactionsTable from './components/ShiftClosingTransactionsTable';
import ShiftClosingDenominationTable from './components/ShiftClosingDenominationTable';
import ShiftClosingSummary from './components/ShiftClosingSummary';
import {
  shiftClosingSchema, shiftClosingDefaultValues, shiftClosingFormValuesToPayload, computeTotalClosingCash,
} from './shiftClosingSchema';

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
 * Shift Closing — the cashier's shift-close screen reached from the
 * Cashier Panel's "Shift Closing" quick action. Two real, fully wired
 * pieces sit on this one page:
 *
 * - A "Close Shift" panel, shown only while a shift is OPEN for this
 *   outlet (GET /shift-sessions/status) — the mirror image of the Shift
 *   Opening form. The cashier counts the closing cash by denomination
 *   (same grid as opening), sees a live Expected Cash vs. counted Total
 *   Closing Cash preview (currentShiftExpectedCash from that same status
 *   call — computed exactly the way the server will on submit), and
 *   submits to POST /shift-sessions/close (see shiftSession.service.js's
 *   closeShift), which recomputes and stores the real variance.
 * - The Shift Closing report below it — stat tiles, Closing Summary /
 *   Closing Summary (By Shift), the by-shift donut, and paginated
 *   transactions — all real data from GET /shift-closings/summary (see
 *   shiftClosing.service.js's getShiftClosingReport), itemizing every
 *   shift this outlet has ever closed.
 *
 * With no shift currently open, the panel is replaced by an info banner —
 * there's nothing to close — and the report keeps working underneath it.
 */
export default function ShiftClosingPage() {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(() => formatPickerDate(new Date()));

  const {
    data: status, isLoading: isLoadingStatus, isError: isStatusError,
  } = useShiftSessionStatusQuery();
  const [closeShift, { isLoading: isClosing }] = useCloseShiftMutation();

  const dateKey = toDateKey(selectedDate);
  const {
    data: report, isLoading: isLoadingReport, isFetching: isFetchingReport, isError: isReportError, refetch: refetchReport,
  } = useShiftClosingReportQuery({ date: dateKey, page, pageSize: PAGE_SIZE });

  const currentShift = status?.currentShift ?? null;
  const isShiftOpen = Boolean(currentShift);
  const expectedCash = status?.currentShiftExpectedCash ?? 0;

  const methods = useForm({
    resolver: zodResolver(shiftClosingSchema),
    defaultValues: shiftClosingDefaultValues(),
    mode: 'onTouched',
  });
  const { handleSubmit, control, reset } = methods;
  const { fields } = useFieldArray({ control, name: 'denominations' });
  const denominations = methods.watch('denominations');
  const totalClosingCash = computeTotalClosingCash(denominations);


  const handleViewAll = () => dispatch(showToast('Full shift closing list is coming soon', 'info'));
  const handleDateChange = (value) => {
    setSelectedDate(value || formatPickerDate(new Date()));
    setPage(1);
  };

  const onCloseShift = handleSubmit(
    async (values) => {
      try {
        const payload = shiftClosingFormValuesToPayload(values);
        const closed = await closeShift(payload).unwrap();
        dispatch(showToast(
          `Shift ${closed.shiftNo} closed with ₹${Number(closed.closingCash).toFixed(2)} closing cash`,
          'success',
        ));
        reset(shiftClosingDefaultValues());
      } catch (err) {
        dispatch(showToast(err?.data?.message || 'Failed to close the shift', 'error'));
      }
    },
    (formErrors) => {
      dispatch(showToast(
        formErrors.denominations?.message || 'Please fix the highlighted fields before closing the shift',
        'error',
      ));
    },
  );

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Shift Closing</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/cashier-panel" underline="hover" color="text.secondary">Cashier Panel</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Shift Closing</Typography>
          </Breadcrumbs>
        </Box>
      </Stack>

      {isStatusError && (
        <Alert severity="error">Couldn&apos;t load shift status from the server. Check your connection and try reloading.</Alert>
      )}

      {isLoadingStatus ? (
        <Skeleton variant="rounded" height={120} />
      ) : isShiftOpen ? (
        <FormProvider {...methods}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Close Shift {currentShift.shiftNo}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Opened {new Date(currentShift.openedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} by {currentShift.cashierName}
                </Typography>
              </Box>
            </Stack>

            <Stack component="form" noValidate spacing={2}>
              <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
                <Grid size={{ xs: 12, md: 7 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Closing Cash Details</Typography>
                  <ShiftClosingDenominationTable control={control} fields={fields} />
                  {methods.formState.errors.denominations?.message && (
                    <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mt: 1 }}>
                      {methods.formState.errors.denominations.message}
                    </Typography>
                  )}
                </Grid>
                <Grid size={{ xs: 12, md: 5 }}>
                  <Stack spacing={2}>
                    <ShiftClosingSummary expectedCash={expectedCash} totalClosingCash={totalClosingCash} />
                    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Remarks</Typography>
                      <FormTextField name="remarks" placeholder="Enter remarks (optional)" multiline minRows={3} fullWidth />
                    </Paper>
                  </Stack>
                </Grid>
              </Grid>

              <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<LockOutlinedIcon fontSize="small" />}
                  onClick={onCloseShift}
                  disabled={isClosing}
                  sx={{ bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' } }}
                >
                  {isClosing ? 'Closing…' : 'Close Shift'}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </FormProvider>
      ) : (
        <Alert severity="info" variant="outlined">
          There is no open shift for this outlet right now — nothing to close. Open a shift from the Shift Opening screen to start one.
        </Alert>
      )}

      {isReportError ? (
        <Alert
          severity="error"
          action={(
            <MuiLink component="button" type="button" variant="body2" underline="hover" onClick={refetchReport}>
              Retry
            </MuiLink>
          )}
        >
          Couldn&apos;t load the Shift Closing report from the server. Check your connection and try reloading.
        </Alert>
      ) : (
        <>
          {isLoadingReport || !report ? (
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
                  icon={PointOfSaleOutlinedIcon}
                  iconColor="success"
                  iconShape="circle"
                  label="Total Shift Closings"
                  value={formatCurrency(report.stats.totalShiftClosings.value, { decimals: true })}
                  caption={`Transactions : ${report.stats.totalShiftClosings.transactions}`}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
                <StatCard
                  icon={DescriptionOutlinedIcon}
                  iconColor="#2563EB"
                  iconShape="circle"
                  label="Total Closings"
                  value={String(report.stats.totalClosings.value)}
                  caption="Total Quantity : -"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
                <StatCard
                  icon={CurrencyRupeeOutlinedIcon}
                  iconColor="warning"
                  iconShape="circle"
                  label="Average Closing Value"
                  value={formatCurrency(report.stats.avgClosingValue.value, { decimals: true })}
                  caption="Per Closing"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
                <StatCard
                  icon={CalendarTodayOutlinedIcon}
                  iconColor="#8B5CF6"
                  iconShape="circle"
                  label="Today's Shift Closing"
                  value={formatCurrency(report.stats.todaysShiftClosing.value, { decimals: true })}
                  caption={`${report.stats.todaysShiftClosing.transactions} Transactions`}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
                <StatCard
                  icon={CalendarTodayOutlinedIcon}
                  iconColor="#0EA5A4"
                  iconShape="circle"
                  label="Selected Date Closing"
                  value={formatCurrency(report.stats.selectedDateClosing.value, { decimals: true })}
                  caption={report.stats.selectedDateClosing.date}
                />
              </Grid>
            </Grid>
          )}

          <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
            <Grid size={{ xs: 12, lg: 7 }}>
              <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Closing Summary</Typography>
                  <DatePickerField
                    value={selectedDate}
                    onChange={handleDateChange}
                    sx={{ width: { xs: '100%', sm: 200 } }}
                  />
                </Stack>

                {!report ? (
                  <Skeleton variant="rounded" height={160} />
                ) : (
                  <>
                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <SummaryTile label="Total Shift Closing" value={formatCurrency(report.summary.totalShiftClosing, { decimals: true })} valueColor="#2563EB" />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <SummaryTile label="Total Transactions" value={String(report.summary.totalTransactions)} valueColor="#2563EB" />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <SummaryTile label="Total Closed By" value={report.summary.totalClosedBy} valueColor="#2563EB" />
                      </Grid>
                    </Grid>
                    <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <SummaryTile label="Total Sales (All Modes)" value={formatCurrency(report.summary.totalSalesAllModes, { decimals: true })} valueColor="#2563EB" />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <SummaryTile label="Cash In Drawer (Actual)" value={formatCurrency(report.summary.cashInDrawerActual, { decimals: true })} valueColor="#2563EB" />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <SummaryTile label="Expected Cash" value={formatCurrency(report.summary.expectedCash, { decimals: true })} valueColor="success.main" />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <SummaryTile label="Variance" value={formatCurrency(report.summary.variance, { decimals: true })} valueColor="text.primary" />
                      </Grid>
                    </Grid>
                  </>
                )}
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, lg: 5 }}>
              <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Closing Summary (By Shift)</Typography>
                {!report ? (
                  <Skeleton variant="rounded" height={220} />
                ) : report.byShift.length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>No shifts were closed on this date yet.</Typography>
                ) : (
                  (() => {
                    const totalByShift = report.byShift.reduce((sum, s) => sum + s.value, 0);
                    return (
                      <>
                        <Stack spacing={1.25} sx={{ mb: 2 }}>
                          {report.byShift.map((s) => (
                            <Stack key={s.id} direction="row" sx={{ justifyContent: 'space-between' }}>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>{s.label}</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {formatCurrency(s.value, { decimals: true })} ({totalByShift ? Math.round((s.value / totalByShift) * 100 * 100) / 100 : 0}%)
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>
                        <DonutChart
                          data={report.byShift}
                          centerValue={formatCurrency(totalByShift, { decimals: true })}
                          centerLabel="Total"
                          formatValue={(v) => formatCurrency(v, { decimals: true })}
                        />
                      </>
                    );
                  })()
                )}
              </Paper>
            </Grid>
          </Grid>

          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Recent Shift Closing Transactions</Typography>
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
              <ShiftClosingTransactionsTable
                rows={report.transactions}
                totalPages={report.totalPages}
                page={report.page}
                onPageChange={setPage}
                loading={isFetchingReport}
              />
            )}
          </Paper>
        </>
      )}
    </Stack>
  );
}
