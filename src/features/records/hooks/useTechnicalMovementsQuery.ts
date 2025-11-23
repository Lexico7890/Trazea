import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { TechnicalMovement } from '@/types/technical-movement';
import { handleSupabaseError } from '@/lib/error-handler';

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
    onSuccess: () => {
      toast.success('Movimiento técnico registrado exitosamente');
      
      // Invalidate relevant queries to refresh data
      // Adjust the query key as needed based on where you fetch this data
      queryClient.invalidateQueries({ queryKey: ['technical-movements'] });
    },
    onError: (error: unknown) => {
      handleSupabaseError(error);
    },
  });
}
