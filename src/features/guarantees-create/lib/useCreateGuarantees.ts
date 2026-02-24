import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateGuarantees } from "../api";
import type { Guarantee } from "@/entities/guarantees";

export function useUpdateGuarantee() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (guaranteeData: Guarantee[]) => updateGuarantees(guaranteeData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["garantias-dashboard"] });
        },
    });
}