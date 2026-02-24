import type { TechnicalMovement } from '@/entities/movimientos';
import { supabase } from '@/shared/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useCreateTechnicalMovement() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newMovement: TechnicalMovement) => {
            const results = [];

            for (const repuesto of newMovement.repuestos) {
                const rpcParams = {
                    p_id_localizacion: newMovement.id_localizacion,
                    p_id_repuesto: repuesto.id_repuesto,
                    p_id_usuario_responsable: newMovement.id_usuario_responsable,
                    p_id_tecnico_asignado: newMovement.id_tecnico_asignado || null,
                    p_concepto: newMovement.concepto,
                    p_tipo: newMovement.tipo,
                    p_cantidad: repuesto.cantidad || 1,
                    p_numero_orden: newMovement.numero_orden || null,
                    p_descargada: newMovement.descargada || false
                };

                const { data, error } = await supabase
                    .rpc('registrar_movimiento_tecnico_garantia', rpcParams);

                if (error) throw error;

                if (!data.success) {
                    throw new Error(`${repuesto.nombre}: ${data.message}`);
                }

                results.push({
                    ...rpcParams,
                    id_movimientos_tecnicos: data.id_movimiento,
                    referencia: repuesto.referencia,
                    nombre: repuesto.nombre
                });
            }

            return results;
        },

        onMutate: async (newMovement) => {
            await queryClient.cancelQueries({ queryKey: ['technical-movements'] });
            const previousMovements = queryClient.getQueryData(['technical-movements']);

            queryClient.setQueryData(['technical-movements'], (old: unknown) => {
                const tempItems = newMovement.repuestos.map((repuesto, index) => ({
                    id_movimientos_tecnicos: `temp-${Date.now()}-${index}`,
                    id_localizacion: newMovement.id_localizacion,
                    id_repuesto: repuesto.id_repuesto,
                    id_usuario_responsable: newMovement.id_usuario_responsable,
                    id_tecnico_asignado: newMovement.id_tecnico_asignado,
                    concepto: newMovement.concepto,
                    tipo: newMovement.tipo,
                    cantidad: repuesto.cantidad || 1,
                    numero_orden: newMovement.numero_orden,
                    descargada: newMovement.descargada || false,
                }));

                if (!old) return tempItems;
                return [...tempItems, ...(old as unknown[])];
            });

            return { previousMovements };
        },

        onError: (error: Error, _newMovement, context) => {
            if (context?.previousMovements) {
                queryClient.setQueryData(['technical-movements'], context.previousMovements);
            }
            console.error('Error creating movement:', error);
            toast.error(`Error al registrar movimiento: ${error.message}`);
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['technical-movements'] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
        },

        onSuccess: (data) => {
            toast.success(`${data.length} movimiento(s) registrado(s) exitosamente`);
        },
    });
}