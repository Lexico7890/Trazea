import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { MovementFilters } from "../model/types";
import { getListMovements } from "../api";

// Hook to search inventory items (for autocomplete)
export function useSearchMovements(filters: MovementFilters) {
    return useQuery({
        queryKey: ["technical-movements", filters],
        queryFn: () => getListMovements(filters),
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        gcTime: 0,
    });
}