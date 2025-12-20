import { supabase } from "@/lib/supabase";
import type { InventoryItem } from "@/types/common-types";

interface MovementFilters {
    page: number;
    pageSize: number;
    technicianId?: string;
    startDate?: string;
    endDate?: string;
    orderNumber?: string;
    concept?: string;
    downloaded?: string; // 'all', 'true', 'false'
}

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
        .select('*', { count: 'exact' });

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

    return { data: data as InventoryItem[], count };
}

export async function getTechniciansByLocation(locationId: string) {
    const { data, error } = await supabase
        .from('v_tecnicos_por_localizacion')
        .select('id_usuario, nombre_usuario')
        .eq('id_localizacion', locationId);

    if (error) {
        console.error('Error fetching technicians:', error);
        throw new Error(error.message);
    }

    return data;
}

export async function markMovementAsDownloaded(id: string) {
    const { error } = await supabase
        .from('movimientos_tecnicos')
        .update({ descargada: true })
        .eq('id_movimientos_tecnicos', id);

    if (error) {
        console.error('Error marking movement as downloaded:', error);
        throw new Error(error.message);
    }
}

export async function getGarantiasDashboard() {
    const { data, error } = await supabase
        .from('v_garantias_dashboard')
        .select('*')
        .order('fecha_reporte', { ascending: false });

    if (error) {
        console.error('Error fetching warranties dashboard:', error);
        throw new Error(error.message);
    }

    return data;
}

export async function uploadWarrantyImage(file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `warranty-evidence/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('imagenes-repuestos-garantias')
        .upload(filePath, file);

    if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw new Error(uploadError.message);
    }

    const { data: { publicUrl } } = supabase.storage
        .from('imagenes-repuestos-garantias')
        .getPublicUrl(filePath);

    return publicUrl;
}

export async function createWarranty(warrantyData: Record<string, unknown>) {
    const { error } = await supabase
        .from('garantias')
        .insert([warrantyData]);

    if (error) {
        console.error('Error creating warranty:', error);
        throw new Error(error.message);
    }
}
