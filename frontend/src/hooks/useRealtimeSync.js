// frontend/src/hooks/useRealtimeSync.js
import { useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const SYNC_INTERVAL = 300000; // 5 minutes

export const useRealtimeSync = () => {
  const { isAuthenticated, refreshUser } = useContext(AuthContext);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Initial sync
    refreshUser();

    // Set up interval for periodic sync
    const intervalId = setInterval(() => {
      refreshUser();
    }, SYNC_INTERVAL);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [isAuthenticated, refreshUser]);
};