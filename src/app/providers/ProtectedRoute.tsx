// src/app/providers/ProtectedRoute.tsx

import { Navigate, Outlet } from 'react-router-dom';
import { useUserStore } from '@/entities/user';

interface ProtectedRouteProps {
  routeKey: string;
}

export const ProtectedRoute = ({ routeKey }: ProtectedRouteProps) => {
  const sessionData = useUserStore((state) => state.sessionData);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  console.log('🔒 ProtectedRoute check:', {
    isAuthenticated,
    aprobado: sessionData?.user?.aprobado,
    activo: sessionData?.user?.activo,
    routeKey
  });

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