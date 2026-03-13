// src/app/providers/ProtectedRoute.tsx

import { Navigate, Outlet } from 'react-router-dom';
import { useUserStore } from '@/entities/user';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  routeKey: string;
}

// Mapeo de claves para compatibilidad entre formatos antiguo y nuevo
const ROUTE_KEY_MAP: Record<string, string> = {
  'inventario': 'inventory',
  'inventory': 'inventario',
  'repuestos': 'spares',
  'spares': 'repuestos',
  'ordenes': 'order_tracking',
  'order_tracking': 'ordenes',
  'registros': 'registers',
  'registers': 'registros',
};

// Función para obtener la clave correcta del permiso (soporta formato antiguo y nuevo)
const getPermissionKey = (routeKey: string): string => {
  // Si la clave ya existe en menu, usarla directamente
  return ROUTE_KEY_MAP[routeKey] || routeKey;
};

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
    return <Navigate to="/login" replace />;
  }

  // Verificar aprobación (ESTRICTA)
  if (sessionData.user.aprobado !== true) {
    return <Navigate to="/pending-approval" replace />;
  }

  // Verificar activo (ESTRICTA)
  if (sessionData.user.activo !== true) {
    return <Navigate to="/login" replace />;
  }

  // Verificar permisos - soporta formato nuevo y antiguo
  const menuPermissions = sessionData.user.role?.permissions?.menu;
  
  // Primero intentar con la clave nueva
  let hasPermission = menuPermissions?.[routeKey]?.show_view === true;
  
  // Si no tiene permiso con la clave nueva, intentar con la clave antigua mapeada
  if (!hasPermission) {
    const oldKey = getPermissionKey(routeKey);
    hasPermission = menuPermissions?.[oldKey]?.show_view === true;
  }
  
  // Si aún no tiene permiso, verificar si existe la clave en cualquier formato
  if (!hasPermission) {
    const mappedKey = ROUTE_KEY_MAP[routeKey];
    if (mappedKey) {
      hasPermission = menuPermissions?.[mappedKey]?.show_view === true;
    }
  }

  if (!hasPermission) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};