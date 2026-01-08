import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markMovementAsDownloaded } from "../api";

export function useMarkMovementAsDownloaded() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => markMovementAsDownloaded(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["technical-movements"] });
        },
    });
}