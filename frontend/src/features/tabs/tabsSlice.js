import { createSlice } from '@reduxjs/toolkit';
import { HOME_TAB_PATH } from '../../components/layout/pageMeta';

// Open-tab strip (see TabBar.jsx) — tracks which page routes are "open" for
// the session, browser-tab style. Only the pathname is kept here (not
// label/icon, which aren't serializable-friendly and are cheap to
// re-derive via getPageMeta at render time). Intentionally not persisted:
// tabs are a per-session working set, reset on reload like a fresh browser
// window — Home is always open and can't be closed.
const initialState = {
  openPaths: [HOME_TAB_PATH],
};

const FALLBACK_MAX_OPEN_TABS = 10;

const tabsSlice = createSlice({
  name: 'tabs',
  initialState,
  reducers: {
    // Tabs never auto-close: once at the cap, a new tab is simply refused
    // (see AppShell.jsx, which checks this same limit before dispatching
    // and shows the "Tab limit reached" warning instead) — the user has to
    // close one manually. `maxOpenTabs` is passed in from the caller (ui
    // slice's Settings > Tabs slider) since slices can't read each other's
    // state directly; guarded against a bad/missing value the same way a
    // caller-refused open would be, so a malformed limit can never let the
    // strip grow unbounded.
    openTab: {
      reducer(state, action) {
        const { path, maxOpenTabs } = action.payload;
        if (state.openPaths.includes(path)) return;
        const safeMax = Number.isFinite(maxOpenTabs) && maxOpenTabs >= 1 ? maxOpenTabs : FALLBACK_MAX_OPEN_TABS;
        if (state.openPaths.length >= safeMax) return;
        state.openPaths.push(path);
      },
      prepare(path, maxOpenTabs) {
        return { payload: { path, maxOpenTabs } };
      },
    },
    closeTab(state, action) {
      if (action.payload === HOME_TAB_PATH) return;
      state.openPaths = state.openPaths.filter((p) => p !== action.payload);
    },
    closeAllTabs(state) {
      state.openPaths = [HOME_TAB_PATH];
    },
  },
});

export const { openTab, closeTab, closeAllTabs } = tabsSlice.actions;
export default tabsSlice.reducer;

export const selectOpenTabPaths = (state) => state.tabs.openPaths;
