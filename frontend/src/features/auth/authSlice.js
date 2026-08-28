import { createSlice } from '@reduxjs/toolkit';
import { loadPersistedAuth, persistAuth, clearPersistedAuth } from './authStorage';

const persisted = loadPersistedAuth();

const initialState = {
  user: persisted?.user ?? null, // user.outletId carries the outlet selected at login
  token: persisted?.token ?? null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: {
      reducer(state, action) {
        const { user, token } = action.payload;
        state.user = user;
        state.token = token;
      },
      prepare(payload, rememberMe) {
        persistAuth({ user: payload.user, token: payload.token }, rememberMe);
        return { payload };
      },
    },
    logout(state) {
      state.user = null;
      state.token = null;
      clearPersistedAuth();
    },
    setActiveOutlet(state, action) {
      if (state.user) {
        state.user.outletId = action.payload;
        persistAuth({ user: state.user, token: state.token }, true);
      }
    },
  },
});

export const { setCredentials, logout, setActiveOutlet } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => Boolean(state.auth.token);
export const selectActiveOutletId = (state) => state.auth.user?.outletId;
