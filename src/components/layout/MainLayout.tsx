import { Navigate, Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
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
import { ChevronDown, User } from 'lucide-react';

export function MainLayout() {
  const { isAuthenticated, isLoading, children, selectedChild, setSelectedChild } = useAuth();

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

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
            <SidebarTrigger className="-ml-2" />

            {/* Child Selector - Prominent display */}
            {selectedChild && children.length > 0 && (
              <div className="ml-auto flex items-center">
                {children.length > 1 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="gap-2 h-9 px-3">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(selectedChild.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{selectedChild.name}</span>
                        <span className="text-muted-foreground text-sm">
                          ({formatAge(selectedChild.ageInMonths)})
                        </span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover">
                      {children.map((child) => (
                        <DropdownMenuItem
                          key={child.id}
                          onClick={() => setSelectedChild(child)}
                          className={selectedChild?.id === child.id ? 'bg-muted' : ''}
                        >
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(child.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{child.name}</span>
                          <span className="ml-2 text-muted-foreground text-sm">
                            ({formatAge(child.ageInMonths)})
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(selectedChild.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{selectedChild.name}</span>
                    <span className="text-muted-foreground">
                      ({formatAge(selectedChild.ageInMonths)})
                    </span>
                  </div>
                )}
              </div>
            )}
          </header>
          <div className="flex-1 p-6">
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
