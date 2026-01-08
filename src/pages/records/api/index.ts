import { supabase } from "@/shared/api";

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