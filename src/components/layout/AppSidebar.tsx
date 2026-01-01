import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  Lightbulb,
  TrendUp,
  Gear,
  Lock,
  GraduationCap,
  Plant,
  BookOpen,
  Student as StudentIcon,
  SignOut,
  Pencil,
  House,
  UsersThree,
} from '@phosphor-icons/react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EditChildForm } from '@/components/children/EditChildForm';
import type { Student } from '@/types';

const earlyYearsLinks = [
  { title: 'Individual Today', url: '/early-years/today', icon: CalendarCheck },
  { title: 'Activities', url: '/early-years/activities', icon: Lightbulb },
  { title: 'Reading', url: '/early-years/reading', icon: BookOpen },
  { title: 'Progress', url: '/early-years/progress', icon: TrendUp },
];

const stageIcons = {
  'early-years': Plant,
  'lower-primary': BookOpen,
  'middle-school': StudentIcon,
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
              <GraduationCap className="h-5 w-5 text-primary-foreground" weight="duotone" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">
              SchoolOS
            </span>
          </button>
        </SidebarHeader>

        <SidebarContent>
          {/* Global / Family Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Overview
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
                      <House className="h-4 w-4" weight="duotone" />
                      <span className="font-semibold">Dashboard</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          {/* Children List (Explicit) */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>My Children</span>
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{children.length}</Badge>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {children.map((child) => (
                  <div key={child.id}>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => setSelectedChild(child)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                          selectedChild?.id === child.id
                            ? "bg-primary/5 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <Avatar className={cn("h-6 w-6 transition-transform", selectedChild?.id === child.id ? "scale-110 border-2 border-primary/20" : "")}>
                          <AvatarFallback className={cn("text-[10px]", selectedChild?.id === child.id ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground")}>
                            {getInitials(child.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className={cn("font-medium flex-1 truncate", selectedChild?.id === child.id ? "font-semibold" : "")}>
                          {child.name}
                        </span>
                        <div
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-background rounded-md transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingChild(child);
                          }}
                        >
                          <Pencil className="h-3 w-3" />
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* Expanded Sub-Menu for Selected Child */}
                    {selectedChild?.id === child.id && (
                       <div className="ml-9 border-l-2 border-primary/10 pl-2 mt-1 mb-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                         {earlyYearsLinks.map((link) => (
                           <NavLink
                             key={link.title}
                             to={link.url}
                             className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                             activeClassName="text-primary bg-primary/5 font-medium"
                           >
                             <link.icon className="h-3.5 w-3.5" weight="duotone" />
                             <span>{link.title}</span>
                           </NavLink>
                         ))}
                       </div>
                    )}
                  </div>
                ))}

                {children.length === 0 && (
                  <div className="px-3 py-4 text-center">
                    <p className="text-xs text-muted-foreground mb-3">No children added yet</p>
                    <Button variant="outline" size="sm" className="w-full h-8 text-xs" onClick={() => navigate('/settings')}>
                      Add Child
                    </Button>
                  </div>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          {/* Learning Stages (Reference Only) */}
          <SidebarGroup>
             <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
               Curriculum
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
                         <Icon className="h-4 w-4" weight="duotone" />
                         <span className="flex-1">{stage.shortLabel}</span>
                         {!isEnabled && (
                           <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-muted-foreground/30">
                             <Lock className="h-2.5 w-2.5 mr-1" weight="duotone" />
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
