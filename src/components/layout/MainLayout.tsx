import { Navigate, Outlet, Link } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { BottomNav } from './BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { FeedbackButton } from '@/components/feedback/FeedbackButton';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { TomorrowsPrepModal } from '@/components/evening/TomorrowsPrepModal';
import { ChatSidebar } from '@/components/chat';
import { checkWeeklyReportNotification } from '@/hooks/useNotifications';
import { useEffect } from 'react';

export function MainLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      checkWeeklyReportNotification();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background overflow-x-hidden">
        <AppSidebar />

        {/* Main content area - flex-1 to take remaining space */}
        <main className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
            <SidebarTrigger className="-ml-2" />

            {/* Spacer to push items right */}
            <div className="flex-1" />

            {/* Theme Toggle */}
            <ThemeToggle />
          </header>

          {/* Main Content */}
          <div className="flex-1 p-4 md:p-6 pb-20 lg:pb-6 overflow-y-auto overflow-x-hidden">
            <Outlet />
          </div>

          {/* Footer with legal links */}
          <footer className="py-6 text-center text-xs text-muted-foreground">
            <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
            {' · '}
            <Link to="/terms" className="hover:underline">Terms of Service</Link>
            {' · '}
            © 2024 SchoolOS
          </footer>
        </main>

        {/* Chat Sidebar - Right side on desktop, floating on mobile */}
        {isAuthenticated && (
          <ChatSidebar className="hidden lg:flex" />
        )}

        {/* Floating Feedback Button - Only for authenticated users */}
        {isAuthenticated && <FeedbackButton />}
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Evening Prep Modal - Only for authenticated users */}
      {isAuthenticated && <TomorrowsPrepModal />}

      {/* Mobile Chat - ChatSidebar handles its own floating button internally */}
      {isAuthenticated && (
        <div className="lg:hidden">
          <ChatSidebar />
        </div>
      )}
    </SidebarProvider>
  );
}

