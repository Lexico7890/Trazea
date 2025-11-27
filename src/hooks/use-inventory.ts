import { useQuery } from '@tanstack/react-query';
import {
  getInventory,
  getAllInventoryItems,
  searchInventoryItems,
} from '../features/inventory/services';
import type { InventoryParams } from '../features/inventory/types';

// Query keys for better cache management
export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (params: InventoryParams) => [...inventoryKeys.lists(), params] as const,
  details: () => [...inventoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...inventoryKeys.details(), id] as const,
  allItems: () => [...inventoryKeys.all, 'allItems'] as const,
  search: (query: string) => [...inventoryKeys.all, 'search', query] as const,
};

// Hook to get paginated inventory with sorting
export function useInventory(params: InventoryParams = {}) {
  return useQuery({
    queryKey: inventoryKeys.list(params),
    queryFn: () => getInventory(params),
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  });
}

// Hook to get all inventory items (for autocomplete/dropdowns)
export function useAllInventoryItems() {
  return useQuery({
    queryKey: inventoryKeys.allItems(),
    queryFn: getAllInventoryItems,
    staleTime: 1000 * 60 * 10, // 10 minutes - items don't change often
  });
}

// Hook to search inventory items (for autocomplete)
export function useSearchInventory(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: inventoryKeys.search(query),
    queryFn: () => searchInventoryItems(query),
    enabled: enabled && query.trim().length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}