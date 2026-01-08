import { useQuery } from "@tanstack/react-query";
import { inventoryKeys } from "../constants";
import { getAllInventoryItems } from "../api";

// Hook to get all inventory items (for autocomplete/dropdowns)
export function useAllInventoryItems() {
    return useQuery({
        queryKey: inventoryKeys.allItems(),
        queryFn: getAllInventoryItems,
        staleTime: 1000 * 60 * 10, // 10 minutes - items don't change often
    });
}