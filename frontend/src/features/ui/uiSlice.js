import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  toast: null, // { id, message, severity }
  sidebarOpen: true, // desktop: expanded vs icon rail. mobile: drawer open/closed.
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showToast: {
      reducer(state, action) {
        state.toast = action.payload;
      },
      prepare(message, severity = 'info') {
        return { payload: { id: nanoid(), message, severity } };
      },
    },
    clearToast(state) {
      state.toast = null;
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action) {
      state.sidebarOpen = action.payload;
    },
  },
});

export const { showToast, clearToast, toggleSidebar, setSidebarOpen } = uiSlice.actions;
export default uiSlice.reducer;

export const selectToast = (state) => state.ui.toast;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
