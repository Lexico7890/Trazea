import { supabase } from "@/shared/api";

/**
 * Sends the processed inventory count data to the backend.
 * This is a placeholder and will call a Supabase function.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendCountData(processedData: any, type: 'completo') {
    const { data, error } = await supabase.rpc('funcion_conteo', {
        items: processedData,
        tipo_conteo: type,
    });

    if (error) {
        console.error('Error sending count data:', error);
        throw new Error(error.message);
    }

    return data;
}

/**
 * Generates items for a partial inventory count.
 */
export async function generatePartialCountItems(locationId: string) {
    if (!locationId) {
        throw new Error('Location ID is required to generate partial count items.');
    }

    const { data, error } = await supabase.rpc('generar_items_conteo_parcial', {
        p_id_localizacion: locationId,
    });

    if (error) {
        console.error('Error generating partial count items:', error);
        throw new Error(error.message);
    }

    return data;
}