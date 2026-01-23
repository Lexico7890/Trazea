import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import type { MovementHistoryItem } from '../types';

const PAGE_SIZE = 10;

const fetchMovementHistory = async ({
  pageParam = 0,
  referencia,
  idLocalizacion,
}: {
  pageParam?: number;
  referencia: string;
  idLocalizacion: string;
}): Promise<MovementHistoryItem[]> => {
  const from = pageParam * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  console.log("referencia", referencia);
  console.log("idLocalizacion", idLocalizacion);

  const { data, error } = await supabase
    .from('vista_timeline_repuesto')
    .select('*')
    .eq('id_repuesto', referencia)
    .eq('id_localizacion', idLocalizacion)
    .order('fecha', { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export const useMovementHistory = (referencia: string, idLocalizacion: string) => {
  return useInfiniteQuery({
    queryKey: ['movementHistory', referencia, idLocalizacion], // Añade idLocalizacion aquí también
    queryFn: ({ pageParam }) => fetchMovementHistory({ pageParam, referencia, idLocalizacion }),
    initialPageParam: 0,
    // --- ESTA ES LA CLAVE ---
    enabled: !!referencia && !!idLocalizacion,
    // ------------------------
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length;
    },
  });
};
