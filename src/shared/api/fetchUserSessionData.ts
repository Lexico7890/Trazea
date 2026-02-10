import { supabase } from '@/shared/api';
import type { User } from '@supabase/supabase-js';

export const fetchUserSessionData = async (supabaseUser: User) => {
    const { data: user, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id_usuario', supabaseUser.id)
        .single();

    if (userError) {
        console.error('Error al obtener usuario:', userError);
        throw userError;
    }

    if (!user) {
        throw new Error('Usuario no encontrado en la base de datos');
    }

    const { data: rol } = await supabase
        .from('roles')
        .select('*')
        .eq('id_rol', user?.id_rol)
        .single();

    const { data: locations } = await supabase
        .from('usuarios_localizacion')
        .select('*')
        .eq('id_usuario', supabaseUser.id);

    return {
        user: {
            id: supabaseUser.id,
            email: supabaseUser.email!,
            nombre: user.nombre,
            activo: user.activo,
            aprobado: user.aprobado,
            role: rol!
        },
        locations: locations
    };
};