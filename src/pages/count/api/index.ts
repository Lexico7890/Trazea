import { supabase } from "@/shared/api";
import type { CountDetail, CountDetailItem, RegistrarConteoParams } from "../model/types";

/**
 * Fetches the history of inventory counts from the 'conteo' table with pagination.
 */
export async function getCountHistory(page = 1, pageSize = 10) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await supabase
        .from('vista_historial_conteos')
        .select('*', { count: 'exact' })
        .eq('localizacion', localStorage.getItem('minca_location_id'))
        .order('fecha', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching count history:', error);
        throw new Error(error.message);
    }

    return { data, count };
}

/**
 * Fetches the details of a specific count from vista_detalle_conteos
 */
export async function getCountDetails(idConteo: string): Promise<CountDetail | null> {
    console.log('Fetching count details for ID:', idConteo);

    const { data, error } = await supabase
        .from('vista_detalle_conteo_by_id')
        .select('*')
        .eq('id_conteo', idConteo)
        .single();

    console.log('Count details response:', { data, error });

    if (error) {
        console.error('Error fetching count details:', error);
        throw new Error(error.message);
    }

    return data;
}

/**
 * Fetches the items/details of a specific count from vista_detalles_conteo
 */
export async function getCountDetailItems(idConteo: string): Promise<CountDetailItem[]> {
    const { data, error } = await supabase
        .from('vista_detalles_conteo')
        .select('*')
        .eq('id_conteo', idConteo)
        .order('fecha_detalle', { ascending: true });

    if (error) {
        console.error('Error fetching count detail items:', error);
        throw new Error(error.message);
    }

    return data || [];
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
