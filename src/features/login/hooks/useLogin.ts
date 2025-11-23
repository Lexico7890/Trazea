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
        const mockLocations = [
            {
                id: 1,
                name: "Main Workshop",
                type: "workshop",
                city: "Bogota",
                address: "Calle 123",
                role: { id: "1", name: "admin", permissions: { all: true } },
                is_active: true,
                joined_at: new Date().toISOString()
            }
        ];

        setSessionData({
          user: {
            id: data.user.id,
            email: data.user.email!,
            locations: mockLocations
          },
          locations: mockLocations
        });
        
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
