import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';

export interface UserStats {
  xpLevel: number;
  stardustPoints: number;
  rank: string;
  ticketsResolved: number;
}

export function useUserStats(userId?: string) {
  const [data, setData] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Replace with real API endpoint
        // const response = await apiRequest(`/api/v2/user-stats?userId=${userId}`);
        // setData(response.data);
        // Mocked data for now
        setData({
          xpLevel: 12,
          stardustPoints: 2450,
          rank: 'Specialist',
          ticketsResolved: 156,
        });
      } catch (err: any) {
        setError(err.message || 'Failed to fetch user stats');
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, [userId]);

  return { data, isLoading, error };
}
