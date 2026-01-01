import { Navigate, Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { FeedbackButton } from '@/components/feedback/FeedbackButton';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export function MainLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
            <SidebarTrigger className="-ml-2" />

            {/* Spacer to push items right */}
            <div className="flex-1" />

            {/* Theme Toggle */}
            <ThemeToggle />
          </header>
          <div className="flex-1 p-4 md:p-6 pb-safe">
            <Outlet />
          </div>
          {/* Footer with legal links */}
          <footer className="py-6 text-center text-xs text-muted-foreground">
            <a href="/privacy" className="hover:underline">Privacy Policy</a>
            {' · '}
            <a href="/terms" className="hover:underline">Terms of Service</a>
            {' · '}
            © 2024 SchoolOS
          </footer>
        </main>
        {/* Floating Feedback Button */}
        <FeedbackButton />
      </div>
    </SidebarProvider>
  );
}
