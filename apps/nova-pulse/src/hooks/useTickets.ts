import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/api';

export function useTickets(params: any = {}) {
  return useQuery({
    queryKey: ['tickets', params],
    queryFn: async () => {
      return apiRequest('/api/v2/tickets', { params });
    },
  });
}
