import { supabase } from "@/lib/supabase";
import type { InventoryItem } from "@/types/common-types";

export async function getListMovements() {
    const { data, error } = await supabase
    .from('movimientos_tecnicos')
    .select('*')
    .order('fecha', { ascending: false })
    .limit(10);

    if (error) {
        console.error('Error searching inventory:', error);
        throw new Error(error.message);
    }

    return data as InventoryItem[];
}