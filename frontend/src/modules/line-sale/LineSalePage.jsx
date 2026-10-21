import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Stack, Box, Typography, Button, Menu, MenuItem, Grid, Breadcrumbs, Link as MuiLink, Paper, Divider, Tooltip, IconButton, Badge,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { showToast } from '../../features/ui/uiSlice';
import { formatCurrency } from '../../utils/format';
import AddCustomerDialog from '../../components/common/AddCustomerDialog';
import { useGetProductsQuery } from '../../api/productApi';
import { useNextBillNoQuery, useCreateSaleMutation } from '../../api/saleApi';
import {
  useHeldBillsQuery, useHoldBillMutation, useUpdateHeldBillMutation, useResumeHeldBillMutation, useDiscardHeldBillMutation,
} from '../../api/heldBillApi';

import ItemsPanel from './components/ItemsPanel';
import CartPanel from './components/CartPanel';
import BillSummaryRow, { WALK_IN_CUSTOMER } from './components/BillSummaryRow';
import CustomerDetailsCard from './components/CustomerDetailsCard';
import PaymentMethodsCard from './components/PaymentMethodsCard';
import PaymentActionsCard from './components/PaymentActionsCard';
import HeldBillsDialog from './components/HeldBillsDialog';
import { PAYMENT_METHODS, TAX_RATE } from './lineSaleMockData';

const QUICK_AMOUNTS = [3800, 4000, 4500, 5000];

/**
 * POS billing screen — scan/search items on the left, build the current
 * sale on the right, settle it at the bottom. Fully wired to the backend:
 * items come from the real Product master, the customer picker/creator hits
 * the real Customer table, the Bill No. field previews the next real
 * sequence number, and "Pay & Print" actually creates the Sale (+ its
 * SaleLine rows) and decrements stock server-side — see
 * backend/src/modules/sale for the transaction that makes this atomic.
 * Only local UI state (cart-in-progress, discount inputs, chosen payment
 * method) lives on the client until the moment of payment.
 */
export default function LineSalePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);

  const { data: products = [] } = useGetProductsQuery({ status: 'ACTIVE' });
  const { data: previewBillNo, isLoading: isLoadingBillNo, isError: billNoError } = useNextBillNoQuery();
  const [createSale, { isLoading: isPaying }] = useCreateSaleMutation();

  // Held ("parked") bills — saved carts, never sales (see modules/held-bill
  // on the backend). refetchOnMountOrArgChange re-reads the server list every
  // time this screen opens, so a refresh/restart/other till always shows the
  // truth rather than a stale cache.
  const {
    data: heldBills = [], isLoading: isLoadingHeld, isFetching: isFetchingHeld, isError: heldError, refetch: refetchHeld,
  } = useHeldBillsQuery(undefined, { refetchOnMountOrArgChange: true, pollingInterval: 30000, skipPollingIfUnfocused: true });
  const [holdBill, { isLoading: isHolding }] = useHoldBillMutation();
  const [updateHeldBill, { isLoading: isUpdatingHeld }] = useUpdateHeldBillMutation();
  const [resumeHeldBill, { isLoading: isResuming }] = useResumeHeldBillMutation();
  const [discardHeldBill] = useDiscardHeldBillMutation();

  // The real logged-in cashier's name (set at login — see LoginPage's
  // setCredentials(result, ...) call), never a hardcoded placeholder. If
  // this shows something unexpected, the session's auth state itself is the
  // thing to check, not this page.
  const cashierName = user?.name || 'Not logged in';

  // code -> live product, used to resolve price/stock/productId whenever an
  // item is added or its quantity changed, so the cart never drifts from
  // what the Product master actually has on hand.
  const productByCode = useMemo(
    () => Object.fromEntries(products.map((p) => [p.code, {
      id: p.id, code: p.code, name: p.name, uom: p.uom, price: Number(p.salePrice), stock: p.availableQty,
    }])),
    [products],
  );

  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('amount');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [printSettingsEnabled, setPrintSettingsEnabled] = useState(false);
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [customer, setCustomer] = useState(WALK_IN_CUSTOMER);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  // 'billing' = items + cart; 'payment' = customer details, payment methods,
  // Pay & Print. Both are views of this one page so the in-progress cart,
  // customer and discount carry over without being lifted into the store.
  const [step, setStep] = useState('billing');
  // The held bill whose contents are currently on screen (set by Resume,
  // cleared by Hold/Pay/Clear). While set, Hold updates that same bill
  // instead of creating a second one, and Pay closes it out atomically.
  const [activeHeldBill, setActiveHeldBill] = useState(null);
  const [heldDialogOpen, setHeldDialogOpen] = useState(false);
  // A held bill the cashier tapped Resume on while another unsaved bill is
  // still on screen — drives the "hold or clear it first" prompt.
  const [pendingResume, setPendingResume] = useState(null);
  const [busyHeldId, setBusyHeldId] = useState(null);
  // Idempotency token for one "hold new bill" attempt: reused if the request
  // is retried after a network failure so the server can't create two bills.
  const holdTokenRef = useRef(null);

  // Full-screen mode: the browser goes full screen (Fullscreen API) and this
  // page is lifted into a fixed overlay covering the viewport, so the app
  // shell (sidebar / top bar / tabs) is hidden. The overlay — rather than
  // fullscreening just this element — keeps MUI dialogs, menus and toasts
  // (rendered in portals on <body>) visible. Esc is handled by the browser
  // itself; we only listen for the change to show the notification.
  const [isFullScreen, setIsFullScreen] = useState(false);

  const enterFullScreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      dispatch(showToast('Full screen is not available in this browser', 'warning'));
    }
  }, [dispatch]);
  const exitFullScreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
  }, []);

  useEffect(() => {
    const onChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullScreen(active);
      // Short-lived and without a close button — it's just a confirmation.
      dispatch(showToast(
        active ? 'Full screen mode — press Esc to exit' : 'Exited full screen — back to normal view',
        'info',
        { duration: 1800, closable: false },
      ));
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    };
  }, [dispatch]);

  // Space enters full screen — but only when nothing is being typed into or
  // focused (inputs, buttons, links, dialogs), otherwise it would swallow
  // spaces in search/discount fields and double-fire buttons. Tab is left
  // alone on purpose: it's keyboard focus navigation. The header button
  // works in every situation.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code !== 'Space' || e.repeat || document.fullscreenElement || addCustomerOpen) return;
      const el = e.target;
      if (el instanceof HTMLElement && (el.isContentEditable
        || el.closest('input, textarea, select, button, a, [role="button"], [role="menuitem"], [role="dialog"]'))) return;
      e.preventDefault();
      enterFullScreen();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [addCustomerOpen, enterFullScreen]);

  // Auto-generated by the backend (see api/saleApi's NextBillNo query and
  // backend/src/modules/sale's nextBillNo) — never typed or edited here.
  // Distinguishes "still loading" from "the request failed" so a stuck
  // dash is actually diagnosable instead of looking like a static value.
  const billNo = isLoadingBillNo ? 'Generating…' : billNoError ? 'Unavailable' : (previewBillNo || '—');
  const dateTime = useMemo(
    () => new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date()),
    [],
  );

  const totals = useMemo(() => {
    const subTotal = cart.reduce((sum, line) => sum + line.qty * line.price, 0);
    const discountAmount = discountType === 'percent' ? (subTotal * discount) / 100 : Math.min(discount, subTotal);
    const taxable = Math.max(subTotal - discountAmount, 0);
    const tax = cart.reduce((sum, line) => {
      const lineTaxable = subTotal > 0 ? ((line.qty * line.price) / subTotal) * taxable : 0;
      return sum + lineTaxable * line.taxRate;
    }, 0);
    const grandTotal = taxable + tax;
    return { subTotal, discountAmount, tax, grandTotal };
  }, [cart, discount, discountType]);

  const changeAmount = receivedAmount - totals.grandTotal;

  const handleAddItem = (code) => {
    const item = productByCode[code];
    if (!item) return;

    setCart((prev) => {
      const existing = prev.find((line) => line.code === code);
      const nextQty = (existing?.qty || 0) + 1;
      if (nextQty > item.stock) {
        dispatch(showToast(`Only ${item.stock} ${item.uom} of ${item.name} available`, 'warning'));
        return prev;
      }
      if (existing) {
        return prev.map((line) => (line.code === code ? { ...line, qty: nextQty } : line));
      }
      return [...prev, {
        id: item.id, code, qty: 1, name: item.name, uom: item.uom, price: item.price, taxRate: TAX_RATE,
      }];
    });
  };

  const handleQtyChange = (code, qty) => {
    const item = productByCode[code];
    const clamped = item ? Math.min(Math.max(1, qty), Math.max(item.stock, 1)) : qty;
    if (item && qty > item.stock) {
      dispatch(showToast(`Only ${item.stock} ${item.uom} of ${item.name} available`, 'warning'));
    }
    setCart((prev) => prev.map((line) => (line.code === code ? { ...line, qty: clamped } : line)));
  };

  const handleRemove = (code) => {
    setCart((prev) => prev.filter((line) => line.code !== code));
  };

  const resetBill = () => {
    setCart([]);
    setDiscount(0);
    setDiscountType('amount');
    setReceivedAmount(0);
    setCustomer(WALK_IN_CUSTOMER);
    setActiveHeldBill(null);
    holdTokenRef.current = null;
  };
  const handleClear = () => {
    const parked = activeHeldBill;
    resetBill();
    setStep('billing');
    dispatch(showToast(
      parked ? `Cart cleared — ${parked.reference} is still saved under Held Bills` : 'Cart cleared',
      'info',
    ));
  };

  // ---- Hold / Resume ------------------------------------------------------
  const newHoldToken = () => (globalThis.crypto?.randomUUID?.()
    ?? `hb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);
  const errorMessage = (err, fallback) => (err?.status === 'FETCH_ERROR'
    ? 'Couldn\u2019t reach the server \u2014 nothing was changed. Check the connection and try again.'
    : (err?.data?.message || fallback));

  // Saves the current cart as a held bill: a new one, or — when this cart
  // was resumed from one — an in-place update of that same bill. Returns the
  // saved bill, or null on any failure (the cart is left untouched so the
  // cashier loses nothing).
  const holdCurrentBill = async () => {
    if (cart.length === 0) {
      dispatch(showToast('Add at least one item before holding the bill', 'warning'));
      return null;
    }
    if (discountType === 'percent' && discount > 100) {
      dispatch(showToast('Percentage discount cannot exceed 100', 'warning'));
      return null;
    }
    const payload = {
      customerId: customer.id && customer.id !== WALK_IN_CUSTOMER.id ? customer.id : undefined,
      customerName: customer.name,
      lines: cart.map((line) => ({ productId: line.id, qty: line.qty })),
      discountType,
      discountValue: discount,
    };
    try {
      if (activeHeldBill) return await updateHeldBill({ id: activeHeldBill.id, ...payload }).unwrap();
      if (!holdTokenRef.current) holdTokenRef.current = newHoldToken();
      return await holdBill({ ...payload, clientToken: holdTokenRef.current }).unwrap();
    } catch (err) {
      dispatch(showToast(errorMessage(err, 'Failed to hold the bill \u2014 your bill is still on screen'), 'error'));
      return null;
    }
  };

  const handleHoldBill = async () => {
    const saved = await holdCurrentBill();
    if (!saved) return;
    resetBill();
    setStep('billing');
    dispatch(showToast(`Bill held as ${saved.reference}. Resume it from Held Bills.`, 'success'));
  };

  // Puts a resumed bill's saved lines, UOMs, prices, discount, tax basis and
  // customer back on the billing screen.
  const loadHeldBill = (bill) => {
    setCart(bill.lines.map((line) => ({
      id: line.productId, code: line.code, qty: line.qty, name: line.name, uom: line.uom, price: line.price, taxRate: line.taxRate,
    })));
    setDiscountType(bill.discountType);
    setDiscount(bill.discountValue);
    setReceivedAmount(0);
    setCustomer(bill.customer || { ...WALK_IN_CUSTOMER, name: bill.customerName || WALK_IN_CUSTOMER.name });
    setActiveHeldBill({ id: bill.id, reference: bill.reference });
    holdTokenRef.current = null;
    setStep('billing');

    const changed = bill.lines.filter((l) => l.live && (!l.live.active || l.live.price !== l.price || l.live.availableQty < l.qty));
    if (changed.length > 0) {
      dispatch(showToast(
        `${changed.length} item${changed.length === 1 ? '' : 's'} changed since this bill was held (price or stock): ${changed.map((l) => l.name).slice(0, 3).join(', ')}${changed.length > 3 ? '\u2026' : ''}. Prices and stock are re-checked when you pay.`,
        'warning',
      ));
    }
  };

  const doResume = async (summary) => {
    setBusyHeldId(summary.id);
    try {
      const bill = await resumeHeldBill(summary.id).unwrap();
      loadHeldBill(bill);
      setHeldDialogOpen(false);
      dispatch(showToast(`Resumed ${bill.reference}`, 'success'));
      return true;
    } catch (err) {
      dispatch(showToast(errorMessage(err, 'Failed to resume the held bill'), 'error'));
      refetchHeld();
      return false;
    } finally {
      setBusyHeldId(null);
    }
  };

  // Never overwrites an unsaved cart silently: if items are on screen the
  // cashier must hold or clear them first.
  const handleResumeRequest = (summary) => {
    if (summary.id === activeHeldBill?.id) {
      setHeldDialogOpen(false);
      return;
    }
    if (cart.length > 0) {
      setPendingResume(summary);
      return;
    }
    doResume(summary);
  };
  const handleHoldThenResume = async () => {
    const target = pendingResume;
    const saved = await holdCurrentBill();
    if (!saved) return; // error toast already shown; keep the prompt and the cart
    resetBill();
    setPendingResume(null);
    dispatch(showToast(`Current bill held as ${saved.reference}`, 'success'));
    await doResume(target);
  };
  const handleClearThenResume = async () => {
    const target = pendingResume;
    resetBill();
    setPendingResume(null);
    await doResume(target);
  };
  const handleDiscardHeld = async (summary) => {
    setBusyHeldId(summary.id);
    try {
      await discardHeldBill(summary.id).unwrap();
      dispatch(showToast(`${summary.reference} discarded`, 'info'));
    } catch (err) {
      dispatch(showToast(errorMessage(err, 'Failed to discard the held bill'), 'error'));
      refetchHeld();
    } finally {
      setBusyHeldId(null);
    }
  };

  // Browsers' own "leave site?" prompt (not alert/confirm) so a refresh or
  // tab close doesn't silently throw away an unsaved cart. Held bills that
  // were already saved are unaffected — they live on the server.
  useEffect(() => {
    if (cart.length === 0) return undefined;
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [cart.length]);
  const handleMoreAction = (label) => {
    setMoreActionsAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };
  const handleAddCustomer = () => setAddCustomerOpen(true);
  const handleSelectCustomer = (selected) => {
    setCustomer(selected);
    if (selected.name !== WALK_IN_CUSTOMER.name) {
      dispatch(showToast(`${selected.name} selected`, 'info'));
    }
  };
  const handleCustomerCreated = (newCustomer) => {
    setCustomer(newCustomer);
    setAddCustomerOpen(false);
    dispatch(showToast('Customer saved successfully', 'success'));
  };

  const handlePayAndPrint = async () => {
    if (cart.length === 0) {
      dispatch(showToast('Add at least one item before taking payment', 'warning'));
      return;
    }

    try {
      const sale = await createSale({
        customerId: customer.id && customer.id !== WALK_IN_CUSTOMER.id ? customer.id : undefined,
        customerName: customer.name,
        cashierName,
        lines: cart.map((line) => ({ productId: line.id, qty: line.qty })),
        discountType,
        discountValue: discount,
        paymentMethod,
        receivedAmount,
        // Present only for a resumed bill: closes the held bill out in the
        // same server transaction as the sale (so it can't be paid twice).
        heldBillId: activeHeldBill?.id,
      }).unwrap();

      dispatch(showToast(`Payment captured — Bill ${sale.billNo} saved`, 'success'));
      resetBill();
      setStep('billing');
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to save the sale', 'error'));
    }
  };
  const handleProceed = () => {
    if (cart.length === 0) {
      dispatch(showToast('Add at least one item before proceeding', 'warning'));
      return;
    }
    setStep('payment');
  };
  const handleBackToBilling = () => setStep('billing');
  const handlePrintInvoice = () => dispatch(showToast('Print Invoice is coming soon', 'info'));

  return (
    <Stack
      spacing={2}
      sx={isFullScreen ? {
        position: 'fixed', inset: 0, zIndex: (t) => t.zIndex.modal - 1,
        bgcolor: 'background.default', overflow: 'auto', p: { xs: 1.5, md: 2.5 },
      } : undefined}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{step === 'payment' ? 'Line Sale — Payment' : 'Line Sale'}</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            {step === 'payment' ? (
              <MuiLink component="button" type="button" underline="hover" color="text.secondary" onClick={handleBackToBilling}>Line Sale</MuiLink>
            ) : (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Line Sale</Typography>
            )}
            {step === 'payment' && <Typography variant="caption" sx={{ color: 'text.secondary' }}>Payment</Typography>}
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Tooltip title={isFullScreen ? 'Exit full screen (Esc)' : 'Full screen (Space)'}>
            <IconButton onClick={isFullScreen ? exitFullScreen : enterFullScreen} aria-label={isFullScreen ? 'Exit full screen' : 'Enter full screen'}>
              {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>
          {step === 'billing' && (
            <>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<PauseCircleOutlineIcon />}
            onClick={handleHoldBill}
            disabled={isHolding || isUpdatingHeld || isResuming}
            sx={{ minHeight: 44 }}
          >
            {isHolding || isUpdatingHeld ? 'Holding\u2026' : 'Hold Bill'}
          </Button>
          <Badge badgeContent={heldBills.length} color="warning" max={99}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<FolderOpenOutlinedIcon />}
              onClick={() => setHeldDialogOpen(true)}
              sx={{ minHeight: 44 }}
            >
              Held Bills
            </Button>
          </Badge>
          <Button variant="outlined" color="error" onClick={handleClear}>Clear</Button>
          <Button
            variant="outlined"
            color="inherit"
            endIcon={<ExpandMoreIcon />}
            onClick={(e) => setMoreActionsAnchor(e.currentTarget)}
          >
            More Actions
          </Button>
          <Menu anchorEl={moreActionsAnchor} open={Boolean(moreActionsAnchor)} onClose={() => setMoreActionsAnchor(null)}>
            <MenuItem onClick={() => handleMoreAction('Apply Promotion')}>Apply Promotion</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Redeem Voucher')}>Redeem Voucher</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Void Sale')}>Void Sale</MenuItem>
          </Menu>
            </>
          )}
        </Stack>
      </Stack>


      {step === 'billing' ? (
        <>
      <BillSummaryRow
        customer={customer}
        billNo={activeHeldBill ? `${billNo} \u00b7 ${activeHeldBill.reference}` : billNo}
        cashierName={cashierName}
        dateTime={dateTime}
        onAddCustomer={handleAddCustomer}
        onSelectCustomer={handleSelectCustomer}
      />

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Box sx={{ height: { lg: 560 } }}>
            <ItemsPanel onAddItem={handleAddItem} />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Box sx={{ height: { lg: 560 } }}>
            <CartPanel
              lines={cart}
              onQtyChange={handleQtyChange}
              onRemove={handleRemove}
              discount={discount}
              discountType={discountType}
              onDiscountChange={setDiscount}
              onDiscountTypeChange={setDiscountType}
              totals={totals}
            />
          </Box>
        </Grid>
      </Grid>


      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowForwardIcon />}
          onClick={handleProceed}
          disabled={cart.length === 0}
          sx={{ px: 4 }}
        >
          Proceed
        </Button>
      </Box>
        </>
      ) : (
        <>
      <Paper variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} divider={<Divider orientation="vertical" flexItem />} sx={{ justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Bill No.</Typography>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>{billNo}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Items</Typography>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>{cart.length} ({cart.reduce((n, l) => n + l.qty, 0)} qty)</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Discount</Typography>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>{formatCurrency(totals.discountAmount, { decimals: true })}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Tax</Typography>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>{formatCurrency(totals.tax, { decimals: true })}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Grand Total</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>{formatCurrency(totals.grandTotal, { decimals: true })}</Typography>
          </Box>
        </Stack>
      </Paper>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <CustomerDetailsCard customer={customer} onAddCustomer={handleAddCustomer} />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <PaymentMethodsCard
            methods={PAYMENT_METHODS}
            selectedMethod={paymentMethod}
            onSelectMethod={setPaymentMethod}
            receivedAmount={receivedAmount}
            onReceivedAmountChange={setReceivedAmount}
            quickAmounts={QUICK_AMOUNTS}
            changeAmount={changeAmount}
          />
        </Grid>
      </Grid>

      <Stack direction={{ xs: 'column-reverse', md: 'row' }} spacing={2} sx={{ alignItems: { xs: 'stretch', md: 'flex-start' }, justifyContent: 'space-between' }}>
        <Box>
          <Button variant="outlined" color="inherit" startIcon={<ArrowBackIcon />} onClick={handleBackToBilling}>
            Back to Items
          </Button>
        </Box>
        <Box sx={{ width: { xs: '100%', md: 380 } }}>
          <PaymentActionsCard
            onPayAndPrint={handlePayAndPrint}
            onPrintInvoice={handlePrintInvoice}
            printSettingsEnabled={printSettingsEnabled}
            onTogglePrintSettings={setPrintSettingsEnabled}
            disabled={cart.length === 0 || isPaying}
          />
        </Box>
      </Stack>
        </>
      )}

      <HeldBillsDialog
        open={heldDialogOpen}
        onClose={() => setHeldDialogOpen(false)}
        bills={heldBills}
        isLoading={isLoadingHeld}
        isFetching={isFetchingHeld}
        isError={heldError}
        onRefresh={refetchHeld}
        activeBillId={activeHeldBill?.id}
        busyBillId={busyHeldId}
        onResume={handleResumeRequest}
        onDiscard={handleDiscardHeld}
      />

      <Dialog open={Boolean(pendingResume)} onClose={() => setPendingResume(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Current bill has items</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The screen has an unsaved bill ({cart.length} item{cart.length === 1 ? '' : 's'},
            {' '}{formatCurrency(totals.grandTotal, { decimals: true })}). Hold it, or clear it, before
            resuming {pendingResume?.reference}.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Button color="inherit" onClick={() => setPendingResume(null)} sx={{ minHeight: 44 }}>Cancel</Button>
          <Button color="error" variant="outlined" onClick={handleClearThenResume} disabled={isHolding || isUpdatingHeld} sx={{ minHeight: 44 }}>
            Clear &amp; Resume
          </Button>
          <Button variant="contained" onClick={handleHoldThenResume} disabled={isHolding || isUpdatingHeld} sx={{ minHeight: 44 }}>
            {isHolding || isUpdatingHeld ? 'Holding\u2026' : 'Hold Current & Resume'}
          </Button>
        </DialogActions>
      </Dialog>

      <AddCustomerDialog
        open={addCustomerOpen}
        onClose={() => setAddCustomerOpen(false)}
        onCustomerCreated={handleCustomerCreated}
      />
    </Stack>
  );
}
