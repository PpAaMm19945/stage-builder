import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  House,
  Books,
  TrendUp,
  Gear,
  Lock,
  CaretDown,
  CaretRight,
  GraduationCap,
  Heart,
  SignOut,
  Pencil,
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



  return (
    <>
      <Sidebar className="border-r border-border/50">
        <SidebarHeader className="p-4">
          {/* Logo - Clickable to Dashboard */}
          <button
            onClick={() => navigate('/')}
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
                      onClick={() => setSelectedChild(child)}
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
          {/* Primary Navigation */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {primaryLinks.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === '/'}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        activeClassName="bg-primary/10 text-primary font-medium"
                      >
                        <item.icon className="h-5 w-5" weight="duotone" />
                        <span className="font-medium">{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          {/* Coming Soon - Collapsible */}
          <SidebarGroup>
            <Collapsible defaultOpen={false}>
              <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors group">
                <span>Coming Soon</span>
                <CaretRight className="h-3 w-3 transition-transform group-data-[state=open]:rotate-90" weight="bold" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {comingSoonStages.map((stage) => (
                      <SidebarMenuItem key={stage.id}>
                        <SidebarMenuButton
                          onClick={() => navigate(`/${stage.id}`)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground/60 transition-colors hover:bg-muted/50 w-full"
                        >
                          <Lock className="h-4 w-4" weight="duotone" />
                          <span className="flex-1">{stage.label}</span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-muted-foreground/30 opacity-60">
                            {stage.ages}
                          </Badge>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>

          <SidebarSeparator />

          {/* Support Link */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate('/settings#support')}
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
              <SidebarMenuButton asChild>
                <NavLink
                  to="/settings"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  activeClassName="bg-primary/10 text-primary font-medium"
                >
                  <Gear className="h-4 w-4" weight="duotone" />
                  <span>Settings</span>
                </NavLink>
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
