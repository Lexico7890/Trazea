import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export const fetchUserSessionData = async (supabaseUser: User) => {
  const { data: user } = await supabase.from('usuarios').select('*').eq('id_usuario', supabaseUser.id).single();
  const { data: rol } = await supabase.from('roles').select('*').eq('id_rol', user?.id_rol).single();
  const { data: locations } = await supabase.from('usuarios_localizacion').select('*').eq('id_usuario', supabaseUser.id);

  return {
    user: {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      role: rol!
    },
    locations: locations
  };
};
