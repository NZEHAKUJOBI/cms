import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  requireAdmin?: boolean;
  requirePharmacist?: boolean;
  requireStateManager?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false, requirePharmacist = false, requireStateManager = false }: Props) {
  const { isAuthenticated, isAdmin, isPharmacist, isStateManager } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/inventory" replace />;
  if (requirePharmacist && !isPharmacist) return <Navigate to="/inventory" replace />;
  if (requireStateManager && !isStateManager) return <Navigate to="/inventory" replace />;

  return <>{children}</>;
}
