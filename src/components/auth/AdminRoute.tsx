import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

const ADMIN_EMAILS = [
  'antmwes104.1@gmail.com',
  'test@gmail.com',
];

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  return (
    <ProtectedRoute>
      <AdminGuard>{children}</AdminGuard>
    </ProtectedRoute>
  );
}

function AdminGuard({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
