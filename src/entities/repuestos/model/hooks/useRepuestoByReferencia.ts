import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import type { Repuesto } from '../types';

const fetchRepuestoByReferencia = async (referencia: string): Promise<Repuesto | null> => {
  const { data, error } = await supabase
    .from('repuestos')
    .select('*')
    .eq('referencia', referencia)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // No rows found
      return null;
    }
    throw new Error(error.message);
  }

  return data;
};

export const useRepuestoByReferencia = (referencia: string) => {
  return useQuery({
    queryKey: ['repuesto', referencia],
    queryFn: () => fetchRepuestoByReferencia(referencia),
    enabled: !!referencia, // Solo ejecutar si la referencia existe
  });
};
