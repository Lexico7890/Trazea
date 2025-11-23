import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getInventory,
  getAllInventoryItems,
  getInventoryItem,
  updateInventoryItem,
  createInventoryItem,
  searchInventoryItems,
  type InventoryParams,
} from '../lib/api';
import { toast } from 'sonner';
import type { InventoryItem } from '@/types/common-types';

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

// Hook to get a single inventory item
export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: inventoryKeys.detail(id),
    queryFn: () => getInventoryItem(id),
    enabled: !!id, // Only run if id exists
  });
}

// Hook to create an inventory item
export function useCreateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInventoryItem,
    onSuccess: () => {
      // Invalidate and refetch inventory queries
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.allItems() });
      toast.success('Item created successfully');
    },
  });
}

// Hook to update an inventory item
export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InventoryItem> }) =>
      updateInventoryItem(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: inventoryKeys.detail(id) });

      // Snapshot previous value
      const previousItem = queryClient.getQueryData(inventoryKeys.detail(id));

      // Optimistically update the cache
      queryClient.setQueryData(inventoryKeys.detail(id), (old: InventoryItem) => ({
        ...old,
        ...data,
      }));

      return { previousItem };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousItem) {
        queryClient.setQueryData(inventoryKeys.detail(id), context.previousItem);
      }
    },
    onSuccess: (data, { id }) => {
      // Update the specific item in cache
      queryClient.setQueryData(inventoryKeys.detail(id), data);
      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.allItems() });
      toast.success('Item updated successfully');
    },
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