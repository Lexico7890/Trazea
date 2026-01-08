import { useQuery } from '@tanstack/react-query';
import { getInventory, type InventoryParams } from '@/entities/inventario';

export function useInventoryQuery(params: InventoryParams) {
    return useQuery({
        queryKey: ['inventory', params],
        queryFn: () => getInventory(params),
        staleTime: 30000, // 30 seconds
        retry: 2,
    });
}