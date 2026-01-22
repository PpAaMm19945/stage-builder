import { Link, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Path, ArrowLeft } from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';

export function PublicLibraryLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50">
        <div className="container max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Path className="h-5 w-5 text-primary-foreground" weight="duotone" />
              </div>
              <span className="font-display text-lg font-bold text-foreground hidden sm:inline">
                FamilyPath
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {!isLoading && !isAuthenticated && (
              <Link to="/login">
                <Button size="sm" variant="default">
                  Sign In
                </Button>
              </Link>
            )}
            {!isLoading && isAuthenticated && (
              <Link to="/dashboard">
                <Button size="sm" variant="outline">
                  Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6">
        <div className="container max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2024 FamilyPath</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/support" className="hover:text-foreground transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
