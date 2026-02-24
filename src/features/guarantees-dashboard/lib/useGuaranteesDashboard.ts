import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGarantiasDashboard, updateGuaranteeStatus } from "@/entities/guarantees/api";

export function useGarantiasDashboard() {
    return useQuery({
        queryKey: ["garantias-dashboard"],
        queryFn: () => getGarantiasDashboard(),
        staleTime: 1000 * 60 * 5,
    });
}

export function useUpdateGuaranteeStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: string, status: string }) =>
            updateGuaranteeStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["garantias-dashboard"] });
        },
    });
}
