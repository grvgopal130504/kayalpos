import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Stack,
  Box,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  Grid,
  Paper,
  Button,
  Chip,
  Divider,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";

import { useTranslation } from "react-i18next";
import { useAppDispatch } from "../../app/hooks";
import { showToast } from "../../features/ui/uiSlice";
import { formatCurrency } from "../../utils/format";
import {
  SHIFT_INFO,
  OVERVIEW,
  SALES_SUMMARY,
  NET_SALES_TOTAL,
  PAYMENT_SUMMARY,
  REFUND_SUMMARY,
  CASH_CALC,
  DENOMINATIONS,
} from "./dayCloseMockData";

const money = (value) => formatCurrency(value, { decimals: true });
const toNumber = (value) => {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
};
const NOTES_MAX = 500;

/** Titled card used for every panel on the screen. */
function Panel({ icon: Icon, title, action, children, sx }) {
  return (
    <Paper
      variant="outlined"
      sx={{ borderRadius: 3, p: 2, height: "100%", ...sx }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between", mb: 1.5 }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          {Icon && <Icon sx={{ fontSize: 20, color: "primary.main" }} />}
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            {title}
          </Typography>
        </Stack>
        {action}
      </Stack>
      {children}
    </Paper>
  );
}

/** Label on the left, amount on the right. `strong` renders a highlighted total row. */
function AmountRow({ label, value, strong, color }) {
  return (
    <Stack
      direction="row"
      sx={(theme) => ({
        justifyContent: "space-between",
        alignItems: "center",
        py: 0.9,
        px: strong ? 1.25 : 0,
        mx: strong ? -1.25 : 0,
        borderRadius: strong ? 1.5 : 0,
        bgcolor: strong
          ? alpha(theme.palette.primary.main, 0.08)
          : "transparent",
        borderBottom: strong ? "none" : `1px solid ${theme.palette.divider}`,
        "&:last-of-type": { borderBottom: "none" },
      })}
    >
      <Typography
        variant="body2"
        sx={{
          fontWeight: strong ? 800 : 500,
          color: strong ? "text.primary" : "text.secondary",
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ fontWeight: strong ? 800 : 700, color: color || "text.primary" }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

/** One of the four tinted headline tiles under Shift Information. */
function OverviewTile({ icon: Icon, color, label, value, caption }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        p: 2,
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: 1.75,
        bgcolor: alpha(color, 0.08),
        borderColor: alpha(color, 0.3),
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2.5,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: color,
          color: "#fff",
        }}
      >
        <Icon fontSize="small" />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: "text.secondary" }}
        >
          {label}
        </Typography>
        <Typography
          variant="h6"
          sx={{ fontWeight: 800, color, lineHeight: 1.25 }}
        >
          {value}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {caption}
        </Typography>
      </Box>
    </Paper>
  );
}

function InfoField({ label, value, sub }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="caption"
        sx={{ color: "text.secondary", display: "block" }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 800 }}>
        {value}
      </Typography>
      {sub && (
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {sub}
        </Typography>
      )}
    </Box>
  );
}

const rightAlignedInput = {
  htmlInput: { style: { textAlign: "right", fontWeight: 600 } },
};

/** One row of the Cash Closing Calculator: a label and a right-aligned amount box. */
function CalcRow({ label, value, onChange, readOnly = true }) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{ alignItems: "center", justifyContent: "space-between", py: 0.6 }}
    >
      <Typography variant="body2" sx={{ color: "text.secondary", flex: 1 }}>
        {label}
      </Typography>
      <TextField
        size="small"
        value={value}
        onChange={onChange}
        disabled={readOnly}
        inputMode="decimal"
        sx={{ width: 120 }}
        slotProps={rightAlignedInput}
      />
    </Stack>
  );
}

export default function DayClosePage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [pieces, setPieces] = useState(() =>
    Object.fromEntries(
      DENOMINATIONS.map((d) => [d.key, d.notes != null ? String(d.notes) : ""]),
    ),
  );
  const [coinsAmount, setCoinsAmount] = useState(() =>
    String(DENOMINATIONS.find((d) => d.unitValue == null)?.amount ?? 0),
  );
  const [paidOut, setPaidOut] = useState(String(CASH_CALC.paidOut));
  const [remarks, setRemarks] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dayClosed, setDayClosed] = useState(false);

  const denominationRows = useMemo(
    () =>
      DENOMINATIONS.map((d) => ({
        ...d,
        pieces: d.unitValue != null ? toNumber(pieces[d.key]) : null,
        total:
          d.unitValue != null
            ? d.unitValue * toNumber(pieces[d.key])
            : toNumber(coinsAmount),
      })),
    [pieces, coinsAmount],
  );

  const actualCash = denominationRows.reduce((sum, row) => sum + row.total, 0);
  const expectedClosingCash =
    CASH_CALC.openingCash +
    CASH_CALC.cashSales -
    CASH_CALC.cashRefunds -
    CASH_CALC.cashExpenses -
    toNumber(paidOut);
  // Round to paise so floating point noise never shows a phantom ₹0.00 difference.
  const difference = Math.round((actualCash - expectedClosingCash) * 100) / 100;
  const isBalanced = difference === 0;
  const differenceTone = isBalanced
    ? "success"
    : difference < 0
      ? "error"
      : "warning";
  const differenceLabel = isBalanced
    ? "Balanced"
    : difference < 0
      ? "Short"
      : "Excess";

  const totalRefunds = REFUND_SUMMARY.reduce((sum, r) => sum + r.value, 0);
  const totalCollections = PAYMENT_SUMMARY.reduce((sum, p) => sum + p.value, 0);

  const handleCloseDay = () => {
    if (dayClosed) return;
    if (!isBalanced && !remarks.trim()) {
      dispatch(
        showToast(
          "Cash does not match — add a shift note explaining the difference before closing the day",
          "error",
        ),
      );
      return;
    }
    setConfirmOpen(true);
  };
  const handleConfirmClose = () => {
    setConfirmOpen(false);
    setDayClosed(true);
    dispatch(showToast(`Day closed for ${SHIFT_INFO.businessDate}`, "success"));
  };
  const handleSaveDraft = () =>
    dispatch(showToast("Day close draft saved", "success"));
  const handlePreview = () =>
    dispatch(showToast("Report preview is coming soon", "info"));
  const handlePrint = () => window.print();

  const closeDayButton = (size) => (
    <Button
      variant="contained"
      size={size}
      startIcon={
        dayClosed ? (
          <CheckCircleOutlineIcon fontSize="small" />
        ) : (
          <LockOutlinedIcon fontSize="small" />
        )
      }
      onClick={handleCloseDay}
      disabled={dayClosed}
      sx={{ whiteSpace: "nowrap" }}
    >
      {dayClosed ? "Day Closed" : "Close Day"}
    </Button>
  );

  return (
    <Stack spacing={2}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Box
            sx={(theme) => ({
              width: 48,
              height: 48,
              borderRadius: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: "primary.main",
            })}
          >
            <EventAvailableOutlinedIcon />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {t("nav.dayClose")}
            </Typography>
            <Breadcrumbs
              separator={<NavigateNextIcon sx={{ fontSize: 14 }} />}
              sx={{
                "& .MuiTypography-root, & .MuiLink-root": { fontSize: 12.5 },
              }}
            >
              <MuiLink
                component={RouterLink}
                to="/home"
                underline="hover"
                color="text.secondary"
              >
                {t("common.home")}
              </MuiLink>
              <MuiLink
                component={RouterLink}
                to="/sales"
                underline="hover"
                color="text.secondary"
              >
                {t("nav.sales")}
              </MuiLink>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {t("nav.dayClose")}
              </Typography>
            </Breadcrumbs>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Chip
            size="small"
            variant="outlined"
            color={dayClosed ? "default" : "success"}
            icon={dayClosed ? <LockOutlinedIcon /> : <StorefrontOutlinedIcon />}
            label={dayClosed ? "Day Closed" : "Shift Open"}
            sx={{ fontWeight: 700 }}
          />
          {closeDayButton("medium")}
        </Stack>
      </Stack>

      {/* Shift information */}
      <Paper variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", mb: 1.5 }}
        >
          <StorefrontOutlinedIcon
            sx={{ fontSize: 20, color: "primary.main" }}
          />
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            Shift Information
          </Typography>
        </Stack>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
            <InfoField
              label="Business Date"
              value={SHIFT_INFO.businessDate}
              sub={`(${SHIFT_INFO.businessDay})`}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
            <InfoField
              label="Store / Branch"
              value={SHIFT_INFO.store}
              sub={SHIFT_INFO.branch}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
            <InfoField
              label="POS Terminal"
              value={SHIFT_INFO.posTerminal}
              sub={SHIFT_INFO.terminalLocation}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
            <InfoField
              label="Cashier"
              value={SHIFT_INFO.cashier}
              sub={SHIFT_INFO.cashierRole}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
            <InfoField
              label="Shift Opened At"
              value={SHIFT_INFO.shiftOpenedAt}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
            <InfoField
              label="Opening Cash"
              value={money(SHIFT_INFO.openingCash)}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Headline tiles */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <OverviewTile
            icon={ShoppingCartOutlinedIcon}
            color="#2563EB"
            label="Net Sales"
            value={money(OVERVIEW.netSales)}
            caption="After discounts and returns"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <OverviewTile
            icon={PaymentsOutlinedIcon}
            color="#22A06B"
            label="Expected Cash"
            value={money(expectedClosingCash)}
            caption="Calculated by the system"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <OverviewTile
            icon={CreditCardOutlinedIcon}
            color="#8B5CF6"
            label="Digital Payments"
            value={money(OVERVIEW.digitalPayments)}
            caption="UPI, Card, Wallet etc."
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <OverviewTile
            icon={ReceiptLongOutlinedIcon}
            color="#F26B21"
            label="Transactions"
            value={String(OVERVIEW.transactions)}
            caption="Total bills (excl. cancelled)"
          />
        </Grid>
      </Grid>

      {/* Detail panels */}
      <Grid container spacing={2} sx={{ alignItems: "stretch" }}>
        {/* Sales summary + shift notes */}
        <Grid size={{ xs: 12, md: 6, xl: 3 }}>
          <Stack spacing={2} sx={{ height: "100%" }}>
            <Panel icon={ReceiptLongOutlinedIcon} title="Sales Summary">
              {SALES_SUMMARY.map((row) => (
                <AmountRow
                  key={row.key}
                  label={row.label}
                  value={
                    row.kind === "count" ? String(row.value) : money(row.value)
                  }
                />
              ))}
              <Divider sx={{ my: 0.5 }} />
              <AmountRow
                strong
                label="Net Sales"
                value={money(NET_SALES_TOTAL)}
                color="primary.main"
              />
            </Panel>
            <Panel
              icon={EditNoteOutlinedIcon}
              title="Shift Notes / Remarks"
              sx={{ flex: 1 }}
            >
              <TextField
                fullWidth
                multiline
                minRows={3}
                placeholder="Add any notes for this shift..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value.slice(0, NOTES_MAX))}
                disabled={dayClosed}
              />
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  display: "block",
                  textAlign: "right",
                  mt: 0.5,
                }}
              >
                {remarks.length}/{NOTES_MAX}
              </Typography>
            </Panel>
          </Stack>
        </Grid>

        {/* Payment + refunds */}
        <Grid size={{ xs: 12, md: 6, xl: 3 }}>
          <Panel
            icon={AccountBalanceWalletOutlinedIcon}
            title="Payment Summary"
          >
            {PAYMENT_SUMMARY.map((row) => (
              <AmountRow
                key={row.key}
                label={row.label}
                value={money(row.value)}
              />
            ))}
            <Divider sx={{ my: 0.5 }} />
            <AmountRow
              strong
              label="Total Collections"
              value={money(totalCollections)}
              color="primary.main"
            />

            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", mt: 2.5, mb: 1 }}
            >
              <UndoOutlinedIcon sx={{ fontSize: 20, color: "primary.main" }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                Refunds
              </Typography>
            </Stack>
            {REFUND_SUMMARY.map((row) => (
              <AmountRow
                key={row.key}
                label={row.label}
                value={money(row.value)}
              />
            ))}
            <Divider sx={{ my: 0.5 }} />
            <AmountRow
              strong
              label="Total Refunds"
              value={money(totalRefunds)}
              color="error.main"
            />
          </Panel>
        </Grid>

        {/* Cash closing calculator */}
        <Grid size={{ xs: 12, md: 6, xl: 3 }}>
          <Panel icon={CalculateOutlinedIcon} title="Cash Closing Calculator">
            <CalcRow
              label="Opening cash (₹)"
              value={CASH_CALC.openingCash.toLocaleString("en-IN")}
            />
            <CalcRow
              label="Cash sales (₹)"
              value={CASH_CALC.cashSales.toLocaleString("en-IN")}
            />
            <CalcRow
              label="Cash refunds (₹)"
              value={CASH_CALC.cashRefunds.toLocaleString("en-IN")}
            />
            <CalcRow
              label="Cash expenses (₹)"
              value={CASH_CALC.cashExpenses.toLocaleString("en-IN")}
            />
            <CalcRow
              label="Cash paid out / withdrawals (₹)"
              value={paidOut}
              readOnly={dayClosed}
              onChange={(e) =>
                setPaidOut(e.target.value.replace(/[^\d.]/g, ""))
              }
            />

            <Stack
              direction="row"
              sx={(theme) => ({
                justifyContent: "space-between",
                alignItems: "center",
                mt: 1.5,
                p: 1.25,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
              })}
            >
              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                Expected closing cash
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                {money(expectedClosingCash)}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                alignItems: "center",
                justifyContent: "space-between",
                mt: 1.5,
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", flex: 1 }}
              >
                Actual cash counted (₹)
              </Typography>
              <TextField
                size="small"
                value={actualCash.toLocaleString("en-IN")}
                disabled
                sx={{ width: 120 }}
                slotProps={rightAlignedInput}
              />
            </Stack>

            <Stack
              direction="row"
              sx={(theme) => ({
                justifyContent: "space-between",
                alignItems: "center",
                mt: 1.5,
                p: 1.5,
                borderRadius: 2,
                bgcolor: alpha(theme.palette[differenceTone].main, 0.1),
                border: `1px solid ${alpha(theme.palette[differenceTone].main, 0.3)}`,
              })}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Cash difference
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, color: `${differenceTone}.main` }}
                >
                  {money(difference)}
                </Typography>
              </Box>
              <Chip
                size="small"
                color={differenceTone}
                variant="outlined"
                icon={isBalanced ? <CheckCircleOutlineIcon /> : undefined}
                label={differenceLabel}
                sx={{ fontWeight: 700 }}
              />
            </Stack>
          </Panel>
        </Grid>

        {/* Denomination count */}
        <Grid size={{ xs: 12, md: 6, xl: 3 }}>
          <Panel icon={AppsOutlinedIcon} title="Denomination Count">
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow
                    sx={{
                      "& th": {
                        fontWeight: 700,
                        fontSize: 12.5,
                        color: "text.secondary",
                        whiteSpace: "nowrap",
                      },
                    }}
                  >
                    <TableCell>Denomination</TableCell>
                    <TableCell align="center" sx={{ width: 80 }}>
                      Notes
                    </TableCell>
                    <TableCell align="right">Total (₹)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {denominationRows.map((row) => (
                    <TableRow key={row.key} sx={{ "& td": { py: 0.5 } }}>
                      <TableCell sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                        {row.label}
                      </TableCell>
                      <TableCell align="center">
                        {row.unitValue != null ? (
                          <TextField
                            size="small"
                            value={pieces[row.key]}
                            disabled={dayClosed}
                            inputMode="numeric"
                            onChange={(e) =>
                              setPieces((prev) => ({
                                ...prev,
                                [row.key]: e.target.value.replace(/\D/g, ""),
                              }))
                            }
                            slotProps={{
                              htmlInput: {
                                style: {
                                  textAlign: "center",
                                  padding: "4px 6px",
                                },
                              },
                            }}
                            sx={{ width: 64 }}
                          />
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {row.unitValue != null ? (
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {row.total.toLocaleString("en-IN")}
                          </Typography>
                        ) : (
                          <TextField
                            size="small"
                            value={coinsAmount}
                            disabled={dayClosed}
                            inputMode="decimal"
                            onChange={(e) =>
                              setCoinsAmount(
                                e.target.value.replace(/[^\d.]/g, ""),
                              )
                            }
                            slotProps={{
                              htmlInput: {
                                style: {
                                  textAlign: "right",
                                  padding: "4px 8px",
                                },
                              },
                            }}
                            sx={{ width: 84 }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            <Stack
              direction="row"
              sx={(theme) => ({
                justifyContent: "space-between",
                alignItems: "center",
                mt: 1.5,
                p: 1.25,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
              })}
            >
              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                Total Counted
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                {money(actualCash)}
              </Typography>
            </Stack>
          </Panel>
        </Grid>
      </Grid>

      {/* Footer action bar */}
      <Paper variant="outlined" sx={{ borderRadius: 3, p: 1.5 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          sx={{
            alignItems: { xs: "stretch", md: "center" },
            justifyContent: "space-between",
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={(theme) => ({
              alignItems: "center",
              flex: 1,
              px: 1.5,
              py: 1,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.06),
              color: "text.secondary",
            })}
          >
            <InfoOutlinedIcon sx={{ fontSize: 18, color: "primary.main" }} />
            <Typography variant="body2">
              Make sure the actual cash matches the expected amount before
              closing the day.
            </Typography>
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              flexWrap: "wrap",
              justifyContent: { xs: "flex-start", md: "flex-end" },
              rowGap: 1,
            }}
          >
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<SaveOutlinedIcon fontSize="small" />}
              onClick={handleSaveDraft}
              disabled={dayClosed}
            >
              Save Draft
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<VisibilityOutlinedIcon fontSize="small" />}
              onClick={handlePreview}
            >
              Preview Report
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<PrintOutlinedIcon fontSize="small" />}
              onClick={handlePrint}
            >
              Print
            </Button>
            {closeDayButton("medium")}
          </Stack>
        </Stack>
      </Paper>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Close the day?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This closes the shift for {SHIFT_INFO.businessDate} with{" "}
            {money(actualCash)} counted in the drawer
            {isBalanced
              ? " (balanced)."
              : ` (${differenceLabel.toLowerCase()} by ${money(Math.abs(difference))}).`}{" "}
            You won&apos;t be able to edit the counts afterwards.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<LockOutlinedIcon fontSize="small" />}
            onClick={handleConfirmClose}
          >
            Close Day
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
