import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { apiService, handleApiError } from '../src/services/apiService';
import { LeaderboardUser } from '../src/types';

interface UseLeaderboardReturn {
  leaderboardData: {
    leaderboard: LeaderboardUser[];
    user: LeaderboardUser;
  } | null;
  loading: boolean;
  error: string | null;
  refreshLeaderboard: () => Promise<void>;
}

export const useLeaderboard = (): UseLeaderboardReturn => {
  const [leaderboardData, setLeaderboardData] = useState<{
    leaderboard: LeaderboardUser[];
    user: LeaderboardUser;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const loadLeaderboard = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🏆 Loading leaderboard...');
      const data = await apiService.getLeaderboard();
      console.log('✅ Leaderboard loaded:', data);
      setLeaderboardData(data);
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      console.error('❌ Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  const refreshLeaderboard = useCallback(async () => {
    await loadLeaderboard();
  }, [loadLeaderboard]);

  return {
    leaderboardData,
    loading,
    error,
    refreshLeaderboard,
  };
};