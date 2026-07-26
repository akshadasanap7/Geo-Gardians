import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { routeByRole } from '../../config/navigation';

export default function ProtectedRoute({ role }) {
  const { state } = useApp();
  const location = useLocation();

  if (!state.user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (role && state.user.role !== role) return <Navigate to={routeByRole[state.user.role] || '/login'} replace />;
  return <Outlet />;
}
