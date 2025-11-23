import { useQuery } from "@tanstack/react-query";
import { getListMovements } from "./services";

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