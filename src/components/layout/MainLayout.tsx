import { Outlet, Link } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { BottomNav } from './BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { FeedbackButton } from '@/components/feedback/FeedbackButton';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

import { ChatSidebar } from '@/components/chat';
import { checkWeeklyReportNotification } from '@/hooks/useNotifications';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChatCircle } from '@phosphor-icons/react';

export function MainLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(true);

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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:p-4 focus:bg-background focus:text-foreground focus:rounded-md focus:shadow-md focus:ring-2 focus:ring-primary"
      >
        Skip to main content
      </a>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <AppSidebar />

        {/* Main content area - flex-1 to take remaining space */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 shrink-0">
            <SidebarTrigger className="-ml-2" />

            {/* Spacer to push items right */}
            <div className="flex-1" />

            {/* Chat Toggle */}
            {isAuthenticated && (
              <Button
                variant={isChatOpen ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="hidden lg:flex"
                aria-label="Toggle chat"
              >
                <ChatCircle className="h-5 w-5" weight={isChatOpen ? "fill" : "regular"} />
              </Button>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />
          </header>

          {/* Main Content */}
          <div
            id="main-content"
            tabIndex={-1}
            className="flex-1 p-4 md:p-6 pb-20 lg:pb-6 overflow-y-auto overflow-x-hidden focus:outline-none"
          >
            <Outlet />
          </div>

          {/* Footer with legal links */}
          <footer className="py-6 text-center text-xs text-muted-foreground shrink-0">
            <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
            {' · '}
            <Link to="/terms" className="hover:underline">Terms of Service</Link>
            {' · '}
            © 2025 FamilyPath
          </footer>
        </main>

        {/* Chat Sidebar - Right side on desktop, floating on mobile */}
        {isAuthenticated && (
          <ChatSidebar
            className="hidden lg:flex"
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
          />
        )}

        {/* Floating Feedback Button - Only for authenticated users */}
        {isAuthenticated && <FeedbackButton />}
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />


      {/* Mobile Chat - ChatSidebar handles its own floating button internally */}
      {isAuthenticated && (
        <div className="lg:hidden">
          <ChatSidebar />
        </div>
      )}
    </SidebarProvider>
  );
}

