import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/ErrorState';

interface ProtectedRouteProps {
    children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, error, refreshAuth } = useAuth();
    const location = useLocation();

    // Show loading skeleton while checking authentication
    if (isLoading) {
        return (
            <div className="flex h-screen w-full">
                {/* Sidebar skeleton */}
                <div className="w-64 border-r p-4 space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <div className="space-y-2 pt-4">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-8 w-full" />
                        ))}
                    </div>
                </div>
                {/* Main content skeleton */}
                <div className="flex-1 p-8 space-y-6">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-6 w-96" />
                    <div className="grid grid-cols-3 gap-4">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    // Show error state if network/server error occurred (but token preserved)
    if (error && !isAuthenticated) {
      return (
        <ErrorState
          title="Connection Error"
          message="We couldn't connect to your account. Please check your internet connection and try again."
          onRetry={() => refreshAuth()}
          showHomeButton={false}
          className="h-screen"
        />
      );
    }

    // Redirect to login if not authenticated (and no error, or auth error handled)
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Render children if authenticated
    return <>{children}</>;
}
