import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/useUserStore';
import { toast as sonnerToast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { handleSupabaseError } from '@/lib/error-handler';

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const setSessionData = useUserStore((state) => state.setSessionData);
  const clearUser = useUserStore((state) => state.clearUser);
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        handleSupabaseError(error);
        return;
      }

      if (data.session && data.user) {
        const { data: user } = await supabase.from('usuarios').select('*').eq('id_usuario', data.user.id).single();
        const { data: rol } = await supabase.from('roles').select('*').eq('id_rol', user?.id_rol).single();
        const { data: locations } = await supabase.from('usuarios_localizacion').select('*').eq('id_usuario', data.user?.id);

        setSessionData({
          user: {
            id: data.user.id,
            email: data.user.email!,
            role: rol!
          },
          locations: locations
        });
        console.log("user ", user);
        console.log("rol ", rol);
        console.log("locations ", locations);
        
        sonnerToast.success('Bienvenido de nuevo');
      }
    } catch (error) {
      handleSupabaseError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        handleSupabaseError(error);
        return;
      }
      
      clearUser();
      sonnerToast.success('Sesión cerrada exitosamente');
      navigate('/login');
    } catch (error) {
      handleSupabaseError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    logout,
    isLoading,
  };
};
