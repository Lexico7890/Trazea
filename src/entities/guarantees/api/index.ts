import { supabase } from "@/shared/api";

const id_localizacion = localStorage.getItem('minca_location_id');

export async function getGarantiasDashboard() {
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