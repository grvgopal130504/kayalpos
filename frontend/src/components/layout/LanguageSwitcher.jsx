import { useState } from 'react';
import { IconButton, Tooltip, Menu, MenuItem, ListItemText } from '@mui/material';
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setLanguage, selectLanguage, LANGUAGE_OPTIONS } from '../../features/ui/uiSlice';

/**
 * Topbar language switcher — a single icon button (next to the light/dark
 * and accent-color toggles) that opens a menu of the app's supported
 * languages (English, Tamil, Hindi — LANGUAGE_OPTIONS in uiSlice.js).
 * Selecting one dispatches `setLanguage`, which persists it to localStorage
 * and — via `useSyncLanguage` mounted near the app root — flips i18next's
 * active language, re-rendering every `useTranslation()` consumer (sidebar
 * menu, submenus, topbar, etc.) immediately.
 */
export default function LanguageSwitcher() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentLanguage = useAppSelector(selectLanguage);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleSelect = (value) => {
    setAnchorEl(null);
    dispatch(setLanguage(value));
  };

  return (
    <>
      <Tooltip title={t('common.language')}>
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} aria-label={t('common.language')}>
          <TranslateOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {LANGUAGE_OPTIONS.map((option) => (
          <MenuItem key={option.value} selected={currentLanguage === option.value} onClick={() => handleSelect(option.value)}>
            <ListItemText>{option.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
