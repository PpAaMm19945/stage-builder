import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  House,
  Books,
  TrendUp,
  SlidersHorizontal,
  Path,
  Heart,
  SignOut,
  Baby,
  Calendar,
  ListBullets,
  FileText,
  ShieldCheck,
  ArrowRight,
} from '@phosphor-icons/react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Student } from '@/types';
import { FundingWidget } from '@/components/funding/FundingWidget';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Button } from '@/components/ui/button';

// Simplified primary navigation (stage-agnostic)
// HACKATHON PIVOT: Simplified Navigation
const primaryLinks = [
  { title: 'Home', url: '/dashboard', icon: House },
  { title: 'Library', url: '/library', icon: Books },
  // { title: 'Progress', url: '/progress', icon: TrendUp },
  // { title: 'Reports', url: '/reports', icon: FileText },
];

// Guest navigation
const guestLinks = [
  { title: 'Home', url: '/', icon: House },
  { title: 'Library', url: '/library', icon: Books },
];

export function AppSidebar() {
  const { user, children, logout, isAuthenticated } = useAuth();
  const { setOpenMobile, isMobile } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const activeLinks = isAuthenticated ? primaryLinks : guestLinks;

  return (
    <>
      <Sidebar className="border-r border-border/50" collapsible="offcanvas">
        <SidebarHeader className="h-14 flex flex-row items-center px-4 border-b border-border/50">
          {/* Logo - Clickable to Dashboard or Home */}
          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => handleNavigation(isAuthenticated ? '/dashboard' : '/')}
              className="flex items-center gap-2 px-2 rounded-lg transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Path className="h-5 w-5 text-primary-foreground" weight="duotone" />
              </div>
              <span className="font-display text-lg font-bold text-foreground">
                FamilyPath
              </span>
            </button>

            {isAuthenticated && <NotificationBell />}
          </div>
        </SidebarHeader>

        <SidebarContent>
          {/* Navigation Links */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {activeLinks.map((link) => {
                  const isActive =
                    location.pathname === link.url ||
                    (link.url !== '/' &&
                      link.url !== '/dashboard' &&
                      location.pathname.startsWith(link.url));
                  return (
                    <SidebarMenuItem key={link.url}>
                      <SidebarMenuButton
                        isActive={isActive}
                        aria-current={isActive ? 'page' : undefined}
                        onClick={() => handleNavigation(link.url)}
                        className="flex items-center gap-3"
                      >
                        <link.icon className="h-4 w-4" weight="duotone" />
                        <span>{link.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}

                {/* Daily Practices - Only visible for AUTHENTICATED families with infants */}
                {isAuthenticated && children.some((c) => c.ageInMonths <= 12) && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={location.pathname === '/early-years/daily-practices'}
                      aria-current={
                        location.pathname === '/early-years/daily-practices'
                          ? 'page'
                          : undefined
                      }
                      onClick={() => handleNavigation('/early-years/daily-practices')}
                      className="flex items-center gap-3"
                    >
                      <Baby className="h-4 w-4" weight="duotone" />
                      <span>Daily Practices</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          {/* Support Link */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleNavigation('/support')}
                    isActive={location.pathname === '/support'}
                    aria-current={location.pathname === '/support' ? 'page' : undefined}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-green-600 dark:text-green-400 transition-colors hover:bg-green-50 dark:hover:bg-green-900/20 w-full"
                  >
                    <Heart className="h-4 w-4" weight="fill" />
                    <span className="font-medium">Support FamilyPath</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleNavigation('/trust')}
                    isActive={location.pathname === '/trust'}
                    aria-current={location.pathname === '/trust' ? 'page' : undefined}
                    className="flex items-center gap-3"
                  >
                    <ShieldCheck className="h-4 w-4" weight="duotone" />
                    <span>Trust Covenant</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4">
          {isAuthenticated ? (
            <>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleNavigation('/settings')}
                    isActive={location.pathname === '/settings'}
                    aria-current={location.pathname === '/settings' ? 'page' : undefined}
                    className="flex items-center gap-3"
                  >
                    <SlidersHorizontal className="h-4 w-4" weight="duotone" />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>

              {/* User Info */}
              <div className="mt-4 flex items-center gap-3 rounded-lg bg-muted/30 p-3">
                <Avatar className="h-8 w-8">
                  {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                  <AvatarFallback className="bg-secondary/20 text-secondary-foreground text-sm">
                    {user ? getInitials(user.name) : '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={logout}
                      className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                      aria-label="Sign out"
                    >
                      <SignOut className="h-4 w-4" weight="duotone" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sign out</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Funding Progress */}
              <div className="mt-4">
                <FundingWidget raised={412} goal={500} />
              </div>
            </>
          ) : (
            <div className="mt-auto">
              <Button
                onClick={() => handleNavigation('/login')}
                className="w-full flex items-center justify-center gap-2"
              >
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" weight="bold" />
              </Button>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
