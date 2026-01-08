import { useQuery } from "@tanstack/react-query";
import { getTechniciansByLocation } from "../api";

export function useTechnicians(locationId: string | undefined) {
    return useQuery({
        queryKey: ["technicians", locationId],
        queryFn: () => getTechniciansByLocation(locationId!),
        enabled: !!locationId,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
}