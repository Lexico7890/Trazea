import { supabase } from "@/lib/supabase";
import type { InventoryItem } from "@/types/common-types";

export async function getListMovements() {
    const { data, error } = await supabase
  .from('v_movimientos_detallados') // <--- Usas la vista
  .select('*')
    .order('fecha', { ascending: false })
    .limit(10);

    if (error) {
        console.error('Error searching inventory:', error);
        throw new Error(error.message);
    }

    return data as InventoryItem[];
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
