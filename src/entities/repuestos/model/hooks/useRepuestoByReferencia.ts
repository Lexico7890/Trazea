import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import type { Repuesto } from '../types';

const fetchRepuestoByReferencia = async (referencia: string, location: string): Promise<Repuesto | null> => {
  console.log("fetchRepuestoByReferencia - referencia:", referencia, "currentLocation:", location);
  const { data, error } = await supabase
    .from('vista_repuestos_inventario')
    .select('*')
    .eq('referencia', referencia)
    .eq('id_localizacion', location)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // No rows found
      return null;
    }
    throw new Error(error.message);
  }

  return data;
};

export const useRepuestoByReferencia = (referencia: string, location: string) => {
  return useQuery({
    queryKey: ['repuesto', referencia],
    queryFn: () => fetchRepuestoByReferencia(referencia, location),
    enabled: !!referencia, // Solo ejecutar si la referencia existe
  });
};
