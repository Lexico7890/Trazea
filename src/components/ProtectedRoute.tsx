import { Navigate, Outlet } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';

interface ProtectedRouteProps {
  routeKey: string;
}

export const ProtectedRoute = ({ routeKey }: ProtectedRouteProps) => {
  const canViewRoute = useUserStore((state) => state.canViewRoute);

  // console.log(`ProtectedRoute: Checking ${routeKey}`);
  const allowed = canViewRoute(routeKey);

  if (!allowed) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
