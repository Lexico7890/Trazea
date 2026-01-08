import type { InventoryParams } from "../model/types";

// Query keys for better cache management
export const inventoryKeys = {
    all: ['inventory'] as const,
    lists: () => [...inventoryKeys.all, 'list'] as const,
    list: (params: InventoryParams) => [...inventoryKeys.lists(), params] as const,
    details: () => [...inventoryKeys.all, 'detail'] as const,
    detail: (id: string) => [...inventoryKeys.details(), id] as const,
    allItems: () => [...inventoryKeys.all, 'allItems'] as const,
    search: (query: string) => [...inventoryKeys.all, 'search', query] as const,
    searchRepuestos: (query: string) => [...inventoryKeys.all, 'searchRepuestos', query] as const,
} as const;

