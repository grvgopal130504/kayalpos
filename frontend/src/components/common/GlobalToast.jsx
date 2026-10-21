import { Snackbar, Alert } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { clearToast, selectToast } from '../../features/ui/uiSlice';

/**
 * Single app-wide snackbar/toast. Any component can trigger a message by
 * dispatching showToast('some message', 'success' | 'error' | 'info' | 'warning')
 * from features/ui/uiSlice — no page should render its own ad-hoc Snackbar.
 */
export default function GlobalToast() {
  const dispatch = useAppDispatch();
  const toast = useAppSelector(selectToast);

  return (
    <Snackbar
      open={Boolean(toast)}
      key={toast?.id}
      autoHideDuration={toast?.duration ?? 4000}
      onClose={() => dispatch(clearToast())}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      {toast ? (
        <Alert onClose={toast.closable === false ? undefined : () => dispatch(clearToast())} severity={toast.severity} variant="filled" sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      ) : undefined}
    </Snackbar>
  );
}
