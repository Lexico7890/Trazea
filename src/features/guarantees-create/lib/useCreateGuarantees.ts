import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGuarantee } from "../api";

export function useCreateGuarantee() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (guaranteeData: Record<string, unknown>) => createGuarantee(guaranteeData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["garantias-dashboard"] });
        },
    });
}