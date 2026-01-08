import { supabase } from "@/shared/api";


/**
 * Fetches the history of inventory counts from the 'conteo' table.
 */
export async function getCountHistory() {
    const { data, error } = await supabase
        .from('conteo')
        .select('fecha, tipo, usuario')
        .order('fecha', { ascending: false });

    if (error) {
        console.error('Error fetching count history:', error);
        throw new Error(error.message);
    }

    return data;
}