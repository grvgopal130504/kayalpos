import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { selectIsAuthenticated } from '../features/auth/authSlice';

// Guards routes that should only be reachable while logged OUT (currently
// just /login). If someone is already authenticated and navigates to
// /login directly — typing the URL, hitting back, an old bookmark — they
// are bounced to /home instead of seeing the login form again. Only after
// logout() clears the token does /login render normally.
export default function GuestRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  return isAuthenticated ? <Navigate to="/home" replace /> : <Outlet />;
}
