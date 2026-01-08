import { useQuery } from "@tanstack/react-query";
import type { InventoryParams } from "../model/types";
import { inventoryKeys } from "../constants";
import { getInventory } from "../api";

// Hook to get paginated inventory with sorting
export function useInventory(params: InventoryParams = {}) {
    return useQuery({
        queryKey: inventoryKeys.list(params),
        queryFn: () => getInventory(params),
        placeholderData: (previousData) => previousData, // Keep previous data while loading
    });
}