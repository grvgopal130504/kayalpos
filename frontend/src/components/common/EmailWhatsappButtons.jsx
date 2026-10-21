import { Button } from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  showToast, selectEmailButtonEnabled, selectWhatsappButtonEnabled,
} from '../../features/ui/uiSlice';

/**
 * The one shared Email / WhatsApp button pair used by every page that offers
 * them (Line Sale, Sales Return, ...). Each button renders only when it has
 * been enabled on the Settings page (Email & WhatsApp card) — both are
 * hidden by default — so pages never decide this on their own; they just drop
 * this component in. Pass `onEmail` / `onWhatsapp` to override the default
 * "coming soon" handlers once real sending exists.
 */
export default function EmailWhatsappButtons({ onEmail, onWhatsapp }) {
  const dispatch = useAppDispatch();
  const emailEnabled = useAppSelector(selectEmailButtonEnabled);
  const whatsappEnabled = useAppSelector(selectWhatsappButtonEnabled);

  const handleEmail = onEmail || (() => dispatch(showToast('Email is coming soon', 'info')));
  const handleWhatsapp = onWhatsapp || (() => dispatch(showToast('WhatsApp is coming soon', 'info')));

  return (
    <>
      {emailEnabled && (
        <Button variant="outlined" size="large" fullWidth startIcon={<EmailOutlinedIcon />} onClick={handleEmail}>
          Email
        </Button>
      )}
      {whatsappEnabled && (
        <Button variant="outlined" size="large" fullWidth color="success" startIcon={<WhatsAppIcon />} onClick={handleWhatsapp}>
          WhatsApp
        </Button>
      )}
    </>
  );
}
