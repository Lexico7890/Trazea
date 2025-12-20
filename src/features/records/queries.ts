import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { getListMovements, getTechniciansByLocation, markMovementAsDownloaded, getGarantiasDashboard, createWarranty } from "./services";

interface MovementFilters {
    page: number;
    pageSize: number;
    technicianId?: string;
    startDate?: string;
    endDate?: string;
    orderNumber?: string;
    concept?: string;
    downloaded?: string;
}

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

export function useTechnicians(locationId: string | undefined) {
    return useQuery({
        queryKey: ["technicians", locationId],
        queryFn: () => getTechniciansByLocation(locationId!),
        enabled: !!locationId,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
}

export function useMarkMovementAsDownloaded() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => markMovementAsDownloaded(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["technical-movements"] });
        },
    });
}

export function useGarantiasDashboard() {
    return useQuery({
        queryKey: ["garantias-dashboard"],
        queryFn: () => getGarantiasDashboard(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useCreateWarranty() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (warrantyData: any) => createWarranty(warrantyData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["garantias-dashboard"] });
        },
    });
}
