import { useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useUsage = () => {
  const { user } = useContext(AuthContext);

  return useMemo(() => {
    const currentUsage = user?.dailyUsageCount || 0;
    const maxUsage = 5; // Could be fetched from API or config
    const isPro = user?.isPro || false;
    const usagePercentage = Math.min(100, (currentUsage / maxUsage) * 100);
    const remaining = Math.max(0, maxUsage - currentUsage);
    
    // Determine usage level for visual feedback
    let usageLevel = 'normal';
    let usageBarClass = '';
    
    if (remaining <= 1) {
      usageLevel = 'critical';
      usageBarClass = 'critical-usage';
    } else if (remaining <= 2) {
      usageLevel = 'low';
      usageBarClass = 'low-usage';
    }

    return {
      currentUsage,
      maxUsage,
      isPro,
      usagePercentage,
      remaining,
      usageLevel,
      usageBarClass,
    };
  }, [user]);
};
