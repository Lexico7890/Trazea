import { useQuery } from "@tanstack/react-query";
import { inventoryKeys } from "../constants";
import { searchRepuestos } from "../api";

// Hook to search repuestos items (for autocomplete)
export function useSearchSpares(query: string, enabled: boolean = true, id_localizacion: string) {
    return useQuery({
        queryKey: inventoryKeys.searchRepuestos(query),
        queryFn: () => searchRepuestos(query, id_localizacion),
        enabled: enabled && query.trim().length > 0,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}