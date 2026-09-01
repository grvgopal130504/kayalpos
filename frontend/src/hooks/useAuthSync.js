import { useEffect } from 'react';
import { useAppDispatch, useAppSelector, } from "../app/hooks";
import { logout, selectIsAuthenticated } from '../features/auth/authSlice';

export function useAuthSync() {
    const dispatch = useAppDispatch();
    const IsAuthenticated = useAppSelector(selectIsAuthenticated);

    useEffect(()=> {
        const handleStorageChange = (event) =>{
            if(
                event.key === 'nexora_logout_signal' ||
                (event.key === 'nexora_auth' && !event.newValue)
            ) {
                if(IsAuthenticated) {
                    dispatch(logout());
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    },[dispatch, IsAuthenticated]);
}