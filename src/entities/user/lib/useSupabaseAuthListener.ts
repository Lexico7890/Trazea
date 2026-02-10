// src/shared/lib/hooks/useSupabaseAuthListener.ts

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useUserStore } from '../model/useUserStore';
import { fetchUserSessionData, supabase } from '@/shared/api';

export const useSupabaseAuthListener = () => {
  const navigate = useNavigate();
  const setSessionData = useUserStore((state) => state.setSessionData);
  const clearSessionData = useUserStore((state) => state.clearSessionData);

  useEffect(() => {
    // Verificar sesión inicial
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        try {
          console.log('📌 Cargando sesión inicial...');
          const sessionData = await fetchUserSessionData(session.user);
          setSessionData(sessionData);
          console.log('✅ Sesión inicial cargada');
        } catch (error) {
          console.error('Error al cargar sesión inicial:', error);
        }
      }
    };

    initSession();

    // Escuchar eventos de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth event:', event, session?.user?.email);

      // Manejar login con OAuth (Google)
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          console.log('✅ Usuario autenticado, cargando datos...');
          const sessionData = await fetchUserSessionData(session.user);
          setSessionData(sessionData);
          console.log('✅ Datos de sesión cargados');
        } catch (error) {
          console.error('Error al cargar datos de usuario:', error);
          toast.error('Error al cargar datos de usuario.');
        }
      }

      // Manejar recuperación de contraseña
      if (event === 'PASSWORD_RECOVERY' && session?.user) {
        try {
          const sessionData = await fetchUserSessionData(session.user);
          setSessionData(sessionData);
          console.log('🔑 Sesión de recuperación cargada');
        } catch (error) {
          console.error('Error al cargar datos en recuperación:', error);
          toast.error('Error al cargar datos de usuario.');
        }
      }

      // Manejar cierre de sesión
      if (event === 'SIGNED_OUT') {
        console.log('🚪 Usuario cerró sesión');
        clearSessionData();
        navigate('/login', { replace: true });
      }

      // Manejar actualización de usuario
      if (event === 'USER_UPDATED' && session?.user) {
        try {
          console.log('👤 Usuario actualizado');
          const sessionData = await fetchUserSessionData(session.user);
          setSessionData(sessionData);
        } catch (error) {
          console.error('Error al actualizar datos:', error);
        }
      }

      // Manejar token refrescado
      if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log('🔄 Token refrescado');
        // Opcional: recargar datos si es necesario
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSessionData, clearSessionData, navigate]);
};