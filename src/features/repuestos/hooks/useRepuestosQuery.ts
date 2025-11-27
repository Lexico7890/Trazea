import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRepuestos, createRepuesto, updateRepuesto, deleteRepuesto } from '../services';
import type { RepuestosParams, RepuestoFormData } from '../types';
import { toast } from 'sonner';

export const REPUESTOS_KEYS = {
  all: ['repuestos'] as const,
  lists: () => [...REPUESTOS_KEYS.all, 'list'] as const,
  list: (params: RepuestosParams) => [...REPUESTOS_KEYS.lists(), params] as const,
};

export function useRepuestosQuery(params: RepuestosParams) {
  return useQuery({
    queryKey: REPUESTOS_KEYS.list(params),
    queryFn: () => getRepuestos(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useRepuestosMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createRepuesto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REPUESTOS_KEYS.lists() });
      toast.success('Repuesto creado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al crear repuesto: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RepuestoFormData> }) =>
      updateRepuesto(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REPUESTOS_KEYS.lists() });
      toast.success('Repuesto actualizado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar repuesto: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRepuesto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REPUESTOS_KEYS.lists() });
      toast.success('Repuesto eliminado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar repuesto: ${error.message}`);
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
