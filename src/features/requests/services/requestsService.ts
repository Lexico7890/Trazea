import { supabase } from '@/lib/supabase';
import type { Destination } from '../store/useRequestsStore';

export async function getLocations(): Promise<Destination[]> {
  const { data, error } = await supabase
    .from('localizacion')
    .select('id_localizacion, nombre');

  if (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }

  return data || [];
}
