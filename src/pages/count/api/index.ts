import { supabase } from "@/shared/api";

interface RegistrarConteoParams {
    id_localizacion: string;
    id_usuario: string;
    tipo: string;
    total_items_auditados: number;
    total_diferencia_encontrada: number;
    total_items_pq: number;
    observaciones?: string;
    items: any[];
}

/**
 * Fetches the history of inventory counts from the 'conteo' table.
 */
export async function getCountHistory() {
    const { data, error } = await supabase
        .from('vista_historial_conteos')
        .select('*')
        .eq('localizacion', localStorage.getItem('minca_location_id'))
        .order('fecha', { ascending: false });

    if (error) {
        console.error('Error fetching count history:', error);
        throw new Error(error.message);
    }

    return data;
}

/**
 * Registers a new inventory count with all its details.
 */
export async function registrarConteo(params: RegistrarConteoParams) {
    const { data, error } = await supabase.rpc('guardar_cierre_conteo', {
        p_id_localizacion: params.id_localizacion,
        p_id_usuario: params.id_usuario,
        p_tipo: params.tipo,
        p_total_items_auditados: params.total_items_auditados,
        p_total_diferencia_encontrada: params.total_diferencia_encontrada,
        p_total_items_pq: params.total_items_pq,
        p_observaciones: params.observaciones || null,
        p_items: params.items,
    });

    if (error) {
        console.error('Error registering count:', error);
        throw new Error(error.message);
    }

    return data;
}