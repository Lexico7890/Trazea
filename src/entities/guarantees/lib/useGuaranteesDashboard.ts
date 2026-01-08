import { useQuery } from "@tanstack/react-query";
import { getGarantiasDashboard } from "../api";

export function useGarantiasDashboard() {
    return useQuery({
        queryKey: ["garantias-dashboard"],
        queryFn: () => getGarantiasDashboard(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}