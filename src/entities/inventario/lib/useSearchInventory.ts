import { useQuery } from "@tanstack/react-query";
import { inventoryKeys } from "../constants";
import { searchInventoryItems } from "../api";

// Hook to search inventory items (for autocomplete)
export function useSearchInventory(query: string, enabled: boolean = true) {
    return useQuery({
        queryKey: inventoryKeys.search(query),
        queryFn: () => searchInventoryItems(query),
        enabled: enabled && query.trim().length > 0,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}