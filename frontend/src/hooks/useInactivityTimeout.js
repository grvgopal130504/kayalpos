import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout, selectIsAuthenticated } from '../features/auth/authSlice';
import { showToast } from '../features/ui/uiSlice';

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const ACTIVITY_STORAGE_KEY = 'nexora_last_activity';
const THROTTLE_MS = 3000; // Throttle storage writes to once every 3s
const CHECK_INTERVAL_MS = 15000; // Check inactivity every 15s

export function useInactivityTimeout() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const lastRecordedRef = useRef(Date.now());

  const handleLogout = useCallback(() => {
    localStorage.removeItem(ACTIVITY_STORAGE_KEY);
    dispatch(logout());
    dispatch(
      showToast('You have been logged out due to 30 minutes of inactivity.', 'warning')
    );
  }, [dispatch]);

  const updateActivity = useCallback(() => {
    const now = Date.now();
    // Throttle writes to avoid overhead on frequent events like mousemove
    if (now - lastRecordedRef.current > THROTTLE_MS) {
      lastRecordedRef.current = now;
      try {
        localStorage.setItem(ACTIVITY_STORAGE_KEY, now.toString());
      } catch {
        // Handle storage errors silently
      }
    }
  }, []);

  const checkInactivity = useCallback(() => {
    if (!isAuthenticated) return;

    const storedLastActivity = Number(localStorage.getItem(ACTIVITY_STORAGE_KEY));
    const lastActive = storedLastActivity || lastRecordedRef.current;
    const now = Date.now();

    if (now - lastActive >= INACTIVITY_TIMEOUT_MS) {
      handleLogout();
    }
  }, [isAuthenticated, handleLogout]);

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.removeItem(ACTIVITY_STORAGE_KEY);
      return;
    }

    // Initialize last activity timestamp on login / mount
    const now = Date.now();
    lastRecordedRef.current = now;
    localStorage.setItem(ACTIVITY_STORAGE_KEY, now.toString());

    // User activity events to monitor
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click',
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    // Periodic check interval
    const intervalId = setInterval(checkInactivity, CHECK_INTERVAL_MS);

    // Immediate check when tab becomes visible or gains focus (e.g. computer woke up)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkInactivity();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', checkInactivity);

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });
      clearInterval(intervalId);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', checkInactivity);
    };
  }, [isAuthenticated, updateActivity, checkInactivity]);
}