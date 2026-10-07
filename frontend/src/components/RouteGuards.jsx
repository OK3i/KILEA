import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.jsx';

export function ProtectedRoute({ roles, children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const { user } = useAuth();
  if (roles && (!user || !roles.includes(user.role))) {
    return <Navigate to="/" replace state={{ denied: true, from: location }} />;
  }
  return children || <Outlet />;
}

export const RequireAuth = ProtectedRoute;

export function RequireRole({ roles }) {
  return <ProtectedRoute roles={roles} />;
}
