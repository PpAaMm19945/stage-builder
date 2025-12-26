import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Compass,
  BarChart3,
  Settings,
  Lock,
  ChevronDown,
  GraduationCap,
  Sparkles,
  BookOpen,
  School,
  LogOut,
  Pencil,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { STAGE_INFO, isStageEnabled } from '@/config/featureFlags';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EditChildForm } from '@/components/children/EditChildForm';
import type { Student } from '@/types';

const earlyYearsLinks = [
  { title: 'Today', url: '/early-years/today', icon: Calendar },
  { title: 'Activities', url: '/early-years/activities', icon: Compass },
  { title: 'Progress', url: '/early-years/progress', icon: BarChart3 },
];

const stageIcons = {
  'early-years': Sparkles,
  'lower-primary': BookOpen,
  'middle-school': School,
  'upper-school': GraduationCap,
};

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

  const handleStageClick = (stageId: string, enabled: boolean) => {
    if (enabled) {
      navigate(`/${stageId}/today`);
    } else {
      navigate(`/${stageId}`);
    }
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
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
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
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
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
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </SidebarHeader>

        <SidebarContent>
          {/* Family Navigation (Primary) */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Family
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/"
                      end
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span className="font-semibold">Family Plan</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          {/* Individual Child Navigation (Secondary) */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Individual {selectedChild ? `· ${selectedChild.name}` : ''}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {earlyYearsLinks.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        activeClassName="bg-primary/10 text-primary font-medium"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          {/* Other Stages */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Learning Stages
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {STAGE_INFO.filter((stage) => stage.id !== 'early-years').map((stage) => {
                  const Icon = stageIcons[stage.id];
                  const isEnabled = isStageEnabled(stage.id);

                  return (
                    <SidebarMenuItem key={stage.id}>
                      <SidebarMenuButton
                        onClick={() => handleStageClick(stage.id, isEnabled)}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors w-full',
                          isEnabled
                            ? 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            : 'text-muted-foreground/50 cursor-pointer'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="flex-1">{stage.shortLabel}</span>
                        {!isEnabled && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-muted-foreground/30">
                            <Lock className="h-2.5 w-2.5 mr-1" />
                            Soon
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
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
                  <Settings className="h-4 w-4" />
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
              <LogOut className="h-4 w-4" />
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
