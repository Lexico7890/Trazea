// src/hooks/useMovementsQuery.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/useUserStore';
import { toast } from 'sonner';
import type { ActionsMovements } from '@/types/movement';

interface CreateMovementParams {
  item_id: string;
  actionSelected: ActionsMovements;
  countItems: number;
  orderNumber?: string;
  notes?: string;
  fromLocationId?: number;
  toLocationId?: number;
}

export function useCreateMovement() {
  const queryClient = useQueryClient();
  const currentLocation = useUserStore((state) => state.currentLocation);
  const sessionData = useUserStore((state) => state.sessionData);

  return useMutation({
    mutationFn: async (params: CreateMovementParams) => {
      if (!currentLocation || !sessionData) {
        throw new Error('No location or user selected');
      }

      const { data, error } = await supabase
        .from('movements')
        .insert({
          location_id: currentLocation.id,
          user_id: sessionData.user.id,
          item_id: params.item_id,
          action: params.actionSelected,
          quantity: params.countItems,
          order_number: params.orderNumber,
          notes: params.notes,
          from_location_id: params.fromLocationId,
          to_location_id: params.toLocationId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Movimiento creado exitosamente');
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['movements', currentLocation?.id] });
      queryClient.invalidateQueries({ queryKey: ['items', currentLocation?.id] });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : (error as { message?: string })?.message ?? 'Error al crear movimiento';
      toast.error(message);
      console.error('Error creating movement:', error);
    },
  });
}