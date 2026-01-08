import { supabase } from "@/shared/api";
import type { MovementFilters } from "../model/types";

const id_localizacion = localStorage.getItem('minca_location_id');

export async function getListMovements(filters: MovementFilters) {
    const {
        page = 1,
        pageSize = 10,
        technicianId,
        startDate,
        endDate,
        orderNumber,
        concept,
        downloaded
    } = filters;

    let query = supabase
        .from('v_movimientos_detallados')
        .select('*', { count: 'exact' })
        .eq('id_localizacion', id_localizacion);

    // Apply filters
    if (technicianId) {
        query = query.eq('id_tecnico_asignado', technicianId);
    }

    if (startDate) {
        query = query.gte('fecha', startDate);
    }

    if (endDate) {
        // Assume end date implies end of that day if user picks a date.
        // Typically UI inputs return YYYY-MM-DD.
        // To include the whole end day, we might need to add time or check < next day.
        // For simplicity with standard inputs, let's assume the user inputs or we handle it.
        // If it's just a date string, standard comparison works fine if strict.
        // However, usually end date should include the day.
        // Let's assume the caller handles the time part or we treat it inclusive.
        // If we get "2023-01-01", we probably want everything up to "2023-01-01 23:59:59".
        // A simple way is to use .lte if the input includes time, or add 1 day and use .lt.
        // I'll stick to simple .lte for now, assuming standard usage.
        query = query.lte('fecha', `${endDate}T23:59:59`);
    }

    if (orderNumber) {
        query = query.ilike('numero_orden', `%${orderNumber}%`);
    }

    if (concept && concept !== 'all') {
        query = query.eq('concepto', concept);
    }

    if (downloaded && downloaded !== 'all') {
        query = query.eq('descargada', downloaded === 'true');
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query
        .order('fecha', { ascending: false })
        .range(from, to);

    const { data, error, count } = await query;

    if (error) {
        console.error('Error searching inventory:', error);
        throw new Error(error.message);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { data: data as any[], count };
}