import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Popper, Paper, ClickAwayListener, MenuList, MenuItem, ListItemIcon, ListItemText, Typography, Box,
} from '@mui/material';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import SearchBar from '../common/SearchBar';
import { ALL_NAV_ITEMS } from './navConfig';

const MAX_RESULTS = 8;

/**
 * Wires the (previously purely decorative) topbar SearchBar up to real
 * behavior: typing live-filters the app's page list (navConfig's
 * ALL_NAV_ITEMS — every sidebar/Quick Access destination) into a dropdown,
 * and Enter or clicking a result navigates there. There's no backend search
 * endpoint yet (items/invoices/customers aren't indexed anywhere), so this
 * covers page/module navigation — the one thing a client-side search can
 * actually do today — rather than silently doing nothing like before.
 */
export default function GlobalSearch({ placeholder }) {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return ALL_NAV_ITEMS.filter((item) => item.label.toLowerCase().includes(q)).slice(0, MAX_RESULTS);
  }, [query]);

  const goTo = (path) => {
    setQuery('');
    setOpen(false);
    navigate(path);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      goTo(results[0].path);
    }
    if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <Box ref={containerRef} sx={{ position: 'relative', width: '100%' }}>
      <SearchBar
        placeholder={placeholder}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => query.trim() && setOpen(true)}
        onKeyDown={handleKeyDown}
      />
      <Popper
        open={open && query.trim().length > 0}
        anchorEl={containerRef.current}
        placement="bottom-start"
        style={{ width: containerRef.current?.offsetWidth, zIndex: 1300 }}
      >
        <ClickAwayListener onClickAway={() => setOpen(false)}>
          <Paper variant="outlined" sx={{ mt: 0.5, borderRadius: 2, maxHeight: 360, overflow: 'auto' }}>
            {results.length > 0 ? (
              <MenuList dense>
                {results.map((item) => {
                  const Icon = item.icon;
                  return (
                    <MenuItem key={item.key} onClick={() => goTo(item.path)}>
                      <ListItemIcon>
                        <Icon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>{item.label}</ListItemText>
                    </MenuItem>
                  );
                })}
              </MenuList>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 2 }}>
                <SearchOffOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No pages match &ldquo;{query}&rdquo;
                </Typography>
              </Box>
            )}
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Box>
  );
}
