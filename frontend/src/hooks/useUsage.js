import { useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useUsage = () => {
  // Always return unlimited usage
  return useMemo(() => ({
    currentUsage: 0,
    maxUsage: Infinity,
    isPro: true, // Treat all users as pro
    usagePercentage: 0,
    remaining: Infinity,
    usageLevel: 'normal',
    usageBarClass: '',
  }), []);
};
