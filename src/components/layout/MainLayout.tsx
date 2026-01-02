import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { BottomNav } from './BottomNav';
import { RightPanel, RightPanelSection } from './RightPanel';
import { FundingWidget } from '@/components/funding/FundingWidget';
import { useAuth } from '@/contexts/AuthContext';
import { FeedbackButton } from '@/components/feedback/FeedbackButton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CaretDown, DotsThreeVertical } from '@phosphor-icons/react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useState } from 'react';
import { DOMAIN_LABELS } from '@/types';

export function MainLayout() {
  const { isAuthenticated, isLoading, children, selectedChild, setSelectedChild } = useAuth();
  const location = useLocation();
  const [rightPanelOpen, setRightPanelOpen] = useState(false);

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatAge = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) return `${months} months`;
    if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`;
    return `${years}y ${remainingMonths}m`;
  };

  // Determine right panel title based on current route
  const getRightPanelTitle = () => {
    if (location.pathname === '/') return 'Quick Actions';
    if (location.pathname.includes('/activities')) return 'Filters';
    if (location.pathname.includes('/progress')) return 'Overview';
    return 'Options';
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
            <SidebarTrigger className="-ml-2" />

            {/* Spacer to push items right */}
            <div className="flex-1" />

            {/* Right Panel Toggle - Mobile only */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
            >
              <DotsThreeVertical className="h-5 w-5" weight="bold" />
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Child Selector - REMOVED (Now only in Sidebar) */}
          </header>
          <div className="flex-1 flex overflow-hidden">
            {/* Main Content */}
            <div className="flex-1 p-4 md:p-6 pb-20 lg:pb-6 overflow-y-auto overflow-x-hidden">
              <Outlet />
            </div>

            {/* Right Panel - Contextual */}
            <RightPanel
              title={getRightPanelTitle()}
              isOpen={rightPanelOpen}
              onClose={() => setRightPanelOpen(false)}
            >
              {/* Route-specific content */}
              {location.pathname === '/' && (
                <>
                  <RightPanelSection title="Quick Filters">
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                        🕐 5-minute activities
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                        🧹 Low mess only
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                        📦 Things I have
                      </Button>
                    </div>
                  </RightPanelSection>
                  <RightPanelSection title="Materials Needed Today">
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  </RightPanelSection>
                </>
              )}

              {location.pathname.includes('/activities') && (
                <RightPanelSection title="Filter Activities">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Domain</label>
                      <select className="w-full mt-1 border rounded-md p-2 text-sm bg-background">
                        <option>All Domains</option>
                        <option value="motor">{DOMAIN_LABELS['motor']}</option>
                        <option value="language">{DOMAIN_LABELS['language']}</option>
                        <option value="cognitive">{DOMAIN_LABELS['cognitive']}</option>
                        <option value="social-emotional">{DOMAIN_LABELS['social-emotional']}</option>
                        <option value="pre-academic">{DOMAIN_LABELS['pre-academic']}</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Duration</label>
                      <select className="w-full mt-1 border rounded-md p-2 text-sm bg-background">
                        <option>Any duration</option>
                        <option>Under 10 min</option>
                        <option>10-20 min</option>
                        <option>Over 20 min</option>
                      </select>
                    </div>
                  </div>
                </RightPanelSection>
              )}

              {location.pathname.includes('/progress') && (
                <RightPanelSection title="Child Stats">
                  <p className="text-sm text-muted-foreground">
                    Select a child to see detailed progress
                  </p>
                </RightPanelSection>
              )}

              {/* Funding Widget - Always visible */}
              <RightPanelSection>
                <FundingWidget raised={412} goal={500} />
              </RightPanelSection>
            </RightPanel>
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
      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </SidebarProvider>
  );
}
