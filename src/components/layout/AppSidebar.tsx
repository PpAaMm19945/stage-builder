import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  House,
  Books,
  TrendUp,
  SlidersHorizontal,
  GraduationCap,
  Heart,
  SignOut,
  Baby,
  Calendar,
  ListBullets,
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

// Simplified primary navigation (stage-agnostic)
// Simplified primary navigation (stage-agnostic)
const primaryLinks = [
  { title: 'Home', url: '/', icon: House },
  { title: 'Library', url: '/early-years/activities', icon: Books }, // Combined Books + Activities
  { title: 'Progress', url: '/early-years/progress', icon: TrendUp },
];

export function AppSidebar() {
  const { user, children, logout } = useAuth();
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

  return (
    <>
      <Sidebar className="border-r border-border/50" collapsible="icon">
        <SidebarHeader className="p-4">
          {/* Logo - Clickable to Dashboard */}
          <button
            onClick={() => handleNavigation('/')}
            className="flex items-center gap-2 px-2 rounded-lg transition-colors hover:bg-muted/50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" weight="duotone" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">
              SchoolOS
            </span>
          </button>
        </SidebarHeader>

        <SidebarContent>
          {/* Primary Navigation Links */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {primaryLinks.map((link) => (
                  <SidebarMenuItem key={link.url}>
                    <SidebarMenuButton
                      isActive={
                        location.pathname === link.url ||
                        (link.url !== '/' && location.pathname.startsWith(link.url))
                      }
                      onClick={() => handleNavigation(link.url)}
                      className="flex items-center gap-3"
                    >
                      <link.icon className="h-4 w-4" weight="duotone" />
                      <span>{link.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                {/* Daily Practices - Only visible for families with infants */}
                {children.some(c => c.ageInMonths <= 12) && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={location.pathname === '/early-years/daily-practices'}
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
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-green-600 dark:text-green-400 transition-colors hover:bg-green-50 dark:hover:bg-green-900/20 w-full"
                  >
                    <Heart className="h-4 w-4" weight="fill" />
                    <span className="font-medium">Support SchoolOS</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => handleNavigation('/settings')}
                isActive={location.pathname === '/settings'}
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
            <button
              onClick={logout}
              className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <SignOut className="h-4 w-4" weight="duotone" />
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
