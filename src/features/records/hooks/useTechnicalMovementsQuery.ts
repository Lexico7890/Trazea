import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { TechnicalMovement } from '@/types/technical-movement';

export function useCreateTechnicalMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newMovement: TechnicalMovement) => {
      const { data, error } = await supabase
        .from('movimientos_tecnicos')
        .insert(newMovement)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    // Optimistic update: update cache before server responds
    onMutate: async (newMovement) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['technical-movements'] });

      // Snapshot the previous value
      const previousMovements = queryClient.getQueryData(['technical-movements']);

      // Optimistically update to the new value
      queryClient.setQueryData(['technical-movements'], (old: any) => {
        if (!old) return [{ ...newMovement, id: 'temp-' + Date.now() }];
        return [{ ...newMovement, id: 'temp-' + Date.now() }, ...old];
      });

      // Return a context object with the snapshotted value
      return { previousMovements };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (error: any, _newMovement, context) => {
      if (context?.previousMovements) {
        queryClient.setQueryData(['technical-movements'], context.previousMovements);
      }
      console.error('Error creating movement:', error);
      toast.error('Error al registrar el movimiento técnico');
    },
    // Always refetch after error or success to ensure we have the latest data
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['technical-movements'] });
    },
    onSuccess: () => {
      toast.success('Movimiento técnico registrado exitosamente');
    },
  });
}
