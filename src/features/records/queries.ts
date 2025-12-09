import { useQuery } from "@tanstack/react-query";
import { getListMovements, getTechniciansByLocation } from "./services";

// Hook to search inventory items (for autocomplete)
export function useSearchMovements() {
  return useQuery({
    queryKey: ["technical-movements"],
    queryFn: () => getListMovements(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    gcTime: 0,
  });
}

export function useTechnicians(locationId: string | undefined) {
    return useQuery({
        queryKey: ["technicians", locationId],
        queryFn: () => getTechniciansByLocation(locationId!),
        enabled: !!locationId,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
}
