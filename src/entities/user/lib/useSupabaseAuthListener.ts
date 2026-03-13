// src/shared/lib/hooks/useSupabaseAuthListener.ts

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useUserStore } from '../model/useUserStore';
import { fetchUserSessionData, supabase } from '@/shared/api';

export const useSupabaseAuthListener = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setSessionData = useUserStore((state) => state.setSessionData);
  const clearSessionData = useUserStore((state) => state.clearSessionData);

  useEffect(() => {
    // Inicializar sesión si existe (para refresh de página)
    const initSession = async () => {
      // NO cargar si estamos en auth-callback (deja que AuthCallback lo maneje)
      if (location.pathname === '/auth-callback') {
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        try {
          const sessionData = await fetchUserSessionData(session.user);
          setSessionData(sessionData);
        } catch (error) {
          console.error('Error loading initial session:', error);
        }
      }
    };

    initSession();

    // Listener simple - solo eventos esenciales
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // PASSWORD_RECOVERY: Usuario hizo clic en link de recuperación
      if (event === 'PASSWORD_RECOVERY' && session?.user) {
        try {
          const sessionData = await fetchUserSessionData(session.user);
          setSessionData(sessionData);
        } catch (error) {
          console.error('Error on password recovery:', error);
          toast.error('Error al cargar datos de usuario.');
        }
      }

      // SIGNED_OUT: Usuario cerró sesión
      if (event === 'SIGNED_OUT') {
        clearSessionData();
        // Solo redirigir si no estamos en login o auth-callback
        if (location.pathname !== '/login' && location.pathname !== '/auth-callback') {
          navigate('/login', { replace: true });
        }
      }

      // TOKEN_REFRESHED: Token renovado automáticamente
      // No necesitamos hacer nada aquí - Supabase ya actualizó el token
      // y las próximas queries usarán el nuevo token automáticamente
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSessionData, clearSessionData, navigate, location]);
};