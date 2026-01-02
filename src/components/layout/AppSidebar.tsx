import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  House,
  Books,
  TrendUp,
  SlidersHorizontal,
  Lock,
  CaretDown,
  CaretRight,
  GraduationCap,
  Heart,
  SignOut,
  Pencil,
  Baby,
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
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EditChildForm } from '@/components/children/EditChildForm';
import type { Student } from '@/types';

// Simplified primary navigation - 3 main items
const primaryLinks = [
  { title: 'Today', url: '/', icon: House },
  { title: 'Library', url: '/early-years/activities', icon: Books },
  { title: 'Progress', url: '/early-years/progress', icon: TrendUp },
];

// Coming soon stages
const comingSoonStages = [
  { id: 'lower-primary', label: 'Lower Primary', ages: '5-8' },
  { id: 'middle-school', label: 'Middle School', ages: '9-12' },
  { id: 'upper-school', label: 'Upper School', ages: '13+' },
];

export function AppSidebar() {
  const { user, children, selectedChild, setSelectedChild, logout } = useAuth();
  const { setOpenMobile, isMobile } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const [editingChild, setEditingChild] = useState<Student | null>(null);

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
      <Sidebar className="border-r border-border/50">
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

          {/* Child Selector */}
          {children.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="mt-4 flex w-full items-center gap-3 rounded-lg bg-muted/50 p-3 text-left transition-colors hover:bg-muted">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {selectedChild ? getInitials(selectedChild.name) : '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {selectedChild?.name || 'Select child'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedChild ? `${selectedChild.ageInMonths} months` : ''}
                    </p>
                  </div>
                  <CaretDown className="h-4 w-4 text-muted-foreground shrink-0" weight="duotone" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
                {children.map((child) => (
                  <DropdownMenuItem
                    key={child.id}
                    className={cn(
                      'flex items-center gap-3 p-3',
                      selectedChild?.id === child.id && 'bg-muted'
                    )}
                  >
                    <div
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => {
                        setSelectedChild(child);
                        if (isMobile) setOpenMobile(false);
                      }}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(child.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{child.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {child.ageInMonths} months
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingChild(child);
                        if (isMobile) setOpenMobile(false);
                      }}
                    >
                      <Pencil className="h-4 w-4" weight="duotone" />
                    </Button>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </SidebarHeader>

        <SidebarContent>
          {/* Stages Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel>Stages</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Early Years - Active */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location.pathname === '/' || location.pathname.startsWith('/early-years')}
                    onClick={() => handleNavigation('/')}
                    className="h-auto py-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-md text-indigo-600 dark:text-indigo-400 mt-0.5">
                        <Baby className="h-5 w-5" weight="duotone" />
                      </div>
                      <div className="flex-1 text-left">
                        <span className="font-medium block text-foreground">Early Years</span>
                        <span className="text-xs text-muted-foreground">0-5 years</span>
                      </div>
                      <div className={`w-1.5 h-1.5 rounded-full mt-2 ${location.pathname === '/' || location.pathname.startsWith('/early-years') ? 'bg-primary' : 'bg-transparent'}`} />
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Locked Stages */}
                {comingSoonStages.map((stage) => (
                  <SidebarMenuItem key={stage.id}>
                    <SidebarMenuButton
                      onClick={() => handleNavigation(`/${stage.id}`)}
                      className="h-auto py-2 opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="p-1.5 bg-muted rounded-md text-muted-foreground">
                          <Lock className="h-4 w-4" weight="duotone" />
                        </div>
                        <div className="flex-1 text-left">
                          <span className="font-medium block text-sm">{stage.label}</span>
                          <span className="text-[10px] text-muted-foreground">{stage.ages}</span>
                        </div>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
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
                    onClick={() => handleNavigation('/settings#support')}
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
                <span>Command Center</span>
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

      {/* Edit Child Modal */}
      {
        editingChild && (
          <EditChildForm
            child={editingChild}
            open={!!editingChild}
            onOpenChange={(open) => !open && setEditingChild(null)}
          />
        )
      }
    </>
  );
}
