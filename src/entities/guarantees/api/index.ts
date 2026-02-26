import { useUserStore } from "@/entities/user";
import { supabase } from "@/shared/api";


export async function getGarantiasDashboard() {
    const id_localizacion = useUserStore.getState().currentLocation?.id_localizacion;
    const { data, error } = await supabase
        .from('v_garantias_dashboard')
        .select('*')
        .eq('id_localizacion', id_localizacion)
        .order('fecha_reporte', { ascending: false });

    if (error) {
        console.error('Error fetching warranties dashboard:', error);
        throw new Error(error.message);
    }

    return data;
}

export async function updateGuaranteeStatus(id: string, status: string) {
    const { data, error } = await supabase
        .from('garantias')
        .update({
            estado: status,
            updated_at: new Date().toISOString()
        })
        .eq('id_garantia', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating guarantee status:', error);
        throw new Error(error.message);
    }

    return data;
}