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
    // Verificar sesión inicial SOLO si no estamos en auth-callback
    const initializeSession = async () => {
      // NO cargar sesión si estamos en la página de callback
      if (location.pathname === '/auth-callback') {
        console.log('🔄 En auth-callback, saltando inicialización de sesión');
        return;
      }

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

    initializeSession();

    // Escuchar eventos de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth event:', event, session?.user?.email);

      // NO procesar eventos SIGNED_IN si estamos en auth-callback
      // Dejar que AuthCallback maneje la redirección
      if (event === 'SIGNED_IN' && location.pathname === '/auth-callback') {
        console.log('🔄 SIGNED_IN durante auth-callback, dejando que AuthCallback maneje');
        return;
      }

      // Manejar login (después de que AuthCallback termine)
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

        // Solo redirigir si NO estamos ya en login o auth-callback
        const currentPath = location.pathname;
        if (currentPath !== '/login' && currentPath !== '/auth-callback') {
          navigate('/login', { replace: true });
        }
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
      if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refrescado');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSessionData, clearSessionData, navigate, location]);
};