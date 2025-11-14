import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { DashboardOverviewResponse } from '@/types/api';

export function useDashboardOverview() {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: async () => {
      const response = await apiClient.get<DashboardOverviewResponse>(
        '/dashboard/overview'
      );
      return response.data;
    },
  });
}
