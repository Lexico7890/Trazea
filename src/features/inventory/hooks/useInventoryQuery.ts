import { useQuery } from '@tanstack/react-query';
import { getInventory } from '../services';
import type { InventoryParams } from '../types';

export function useInventoryQuery(params: InventoryParams) {
  return useQuery({
    queryKey: ['inventory', params],
    queryFn: () => getInventory(params),
    staleTime: 30000, // 30 seconds
    retry: 2,
  });
}
