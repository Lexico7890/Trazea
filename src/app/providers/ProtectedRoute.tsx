// src/app/providers/ProtectedRoute.tsx

import { Navigate, Outlet } from 'react-router-dom';
import { useUserStore } from '@/entities/user';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  routeKey: string;
}

export const ProtectedRoute = ({ routeKey }: ProtectedRouteProps) => {
  const sessionData = useUserStore((state) => state.sessionData);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Dar tiempo para que el listener cargue los datos
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    // Si sessionData ya existe, cancelar el timer
    if (sessionData) {
      clearTimeout(timer);
      setIsLoading(false);
    }

    return () => clearTimeout(timer);
  }, [sessionData]);

  console.log('🔒 ProtectedRoute check:', {
    isAuthenticated,
    aprobado: sessionData?.user?.aprobado,
    activo: sessionData?.user?.activo,
    routeKey
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado
  if (!isAuthenticated || !sessionData) {
    console.log('❌ No autenticado, redirigiendo a /login');
    return <Navigate to="/login" replace />;
  }

  // Verificar aprobación (ESTRICTA)
  if (sessionData.user.aprobado !== true) {
    console.log('⏳ Usuario NO aprobado (aprobado =', sessionData.user.aprobado, ')');
    return <Navigate to="/pending-approval" replace />;
  }

  // Verificar activo (ESTRICTA)
  if (sessionData.user.activo !== true) {
    console.log('❌ Usuario NO activo (activo =', sessionData.user.activo, ')');
    return <Navigate to="/login" replace />;
  }

  // Verificar permisos
  const menuPermissions = sessionData.user.role?.permissions?.menu;
  const hasPermission = menuPermissions?.[routeKey]?.show_view === true;

  if (!hasPermission) {
    console.log('🚫 Sin permisos para', routeKey);
    return <Navigate to="/" replace />;
  }

  console.log('✅ Acceso permitido a', routeKey);
  return <Outlet />;
};