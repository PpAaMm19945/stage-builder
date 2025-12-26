import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bell, Shield, LogOut, Users, Pencil, Trash2, Loader2, Baby, Plus, Box, Check, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { EditChildForm } from '@/components/children/EditChildForm';
import { AddChildForm } from '@/components/children/AddChildForm';
import { students, family } from '@/lib/api';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Student, MaterialItem } from '@/types';

// Common core kit items to suggest
const COMMON_MATERIALS = [
  'Blocks', 'Balls', 'Books', 'Crayons', 'Paper',
  'Playdough', 'Bubbles', 'Cardboard Boxes', 'Containers',
  'Scarves/Fabric', 'Tape', 'Glue', 'Safety Scissors',
  'Puzzles', 'Toy Cars', 'Dolls/Puppets', 'Musical Instruments'
];

export default function Settings() {
  const { user, children, logout, refreshAuth, selectedChild, setSelectedChild } = useAuth();
  const [editingChild, setEditingChild] = useState<Student | null>(null);
  const [deletingChild, setDeletingChild] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  // Materials Query
  const { data: serverMaterials, isLoading: isMaterialsLoading, error: materialsError, refetch: refetchMaterials } = useQuery({
    queryKey: ['family-materials'],
    queryFn: family.getMaterials,
  });

  // Local state for materials editing
  const [materialsState, setMaterialsState] = useState<MaterialItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync server data to local state
  useEffect(() => {
    if (serverMaterials) {
      // Merge common materials with server materials
      const merged = COMMON_MATERIALS.map(name => {
        const existing = serverMaterials.find((m: MaterialItem) => m?.name === name);
        return {
          name,
          status: existing?.status || 'unknown'
        } as MaterialItem;
      });

      // Also add any server materials that aren't in common list
      serverMaterials.forEach((m: MaterialItem) => {
        // Defensive check: ensure m has a valid name
        if (m?.name && typeof m.name === 'string' && !COMMON_MATERIALS.includes(m.name)) {
          merged.push(m);
        }
      });

      // Defensive sorting: ensure both names exist before comparing
      setMaterialsState(merged.sort((a, b) => {
        const nameA = a?.name || '';
        const nameB = b?.name || '';
        return nameA.localeCompare(nameB);
      }));
    }
  }, [serverMaterials]);

  // Update Material Mutation
  const updateMaterialsMutation = useMutation({
    mutationFn: family.updateMaterials,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-materials'] });
      queryClient.invalidateQueries({ queryKey: ['family-today'] }); // Refresh dashboard too
      toast.success('Materials updated successfully');
      setHasChanges(false);
    },
    onError: (error: any) => {
      console.error('Materials update failed:', error);
      toast.error('Couldn\'t save materials. Please try again. If it keeps happening, contact support.', {
        description: error?.message || 'Unknown error occurred'
      });
    }
  });

  const handleMaterialToggle = (name: string) => {
    setMaterialsState(prev => prev.map(m => {
      if (m.name !== name) return m;

      // Cycle: unknown -> have -> willing_to_buy -> not_interested -> have...
      // Simplified Cycle: unknown/not_interested -> have -> willing_to_buy -> not_interested
      let nextStatus: MaterialItem['status'] = 'unknown';
      if (m.status === 'unknown' || m.status === 'not_interested') nextStatus = 'have';
      else if (m.status === 'have') nextStatus = 'willing_to_buy';
      else if (m.status === 'willing_to_buy') nextStatus = 'not_interested';

      return { ...m, status: nextStatus };
    }));
    setHasChanges(true);
  };

  const handleSaveMaterials = () => {
    // Validate before sending: filter out any invalid entries
    const validStatuses = ['have', 'willing_to_buy', 'not_interested', 'unknown'];
    const validMaterials = materialsState.filter(m =>
      m?.name && typeof m.name === 'string' && validStatuses.includes(m.status)
    );

    if (validMaterials.length === 0) {
      toast.error('No valid materials to save');
      return;
    }

    updateMaterialsMutation.mutate(validMaterials);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const now = new Date();
    const ageMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 +
      (now.getMonth() - birthDate.getMonth());
    const years = Math.floor(ageMonths / 12);
    const months = ageMonths % 12;
    if (years === 0) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
    return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`;
  };

  const handleDeleteChild = async () => {
    if (!deletingChild) return;

    setIsDeleting(true);
    try {
      await students.delete(deletingChild.id);

      // If we deleted the currently selected child, clear selection
      if (selectedChild?.id === deletingChild.id) {
        const remainingChildren = children.filter(c => c.id !== deletingChild.id);
        if (remainingChildren.length > 0) {
          setSelectedChild(remainingChildren[0]);
        } else {
          setSelectedChild(null);
        }
      }

      await refreshAuth();
      toast.success(`${deletingChild.name} has been removed`);
      setDeletingChild(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete child');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto pb-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account, family, and materials</p>
      </div>

      {/* Children Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Children
          </CardTitle>
          <CardDescription>
            Manage your registered children
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {children.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Baby className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-muted-foreground font-medium">No children registered yet.</p>
                <p className="text-sm text-muted-foreground">Add a child to get started.</p>
              </div>
              <AddChildForm />
            </div>
          ) : (
            <div className="space-y-3">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getInitials(child.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{child.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {calculateAge(child.dateOfBirth)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingChild(child)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit {child.name}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingChild(child)}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete {child.name}</span>
                    </Button>
                  </div>
                </div>
              ))}
              {children.length < 5 && (
                <div className="pt-2 flex justify-center">
                  <AddChildForm />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Materials Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Box className="h-5 w-5" />
              My Family's Materials
            </CardTitle>
            {hasChanges && (
              <Button size="sm" onClick={handleSaveMaterials} disabled={updateMaterialsMutation.isPending}>
                {updateMaterialsMutation.isPending && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                Save Changes
              </Button>
            )}
          </div>
          <CardDescription>
            Tell us what you have at home so we can suggest activities you're ready for!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isMaterialsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : materialsError ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-semibold text-foreground">Failed to load materials</p>
                <p className="text-sm text-muted-foreground">We couldn't fetch your materials. Please try again.</p>
              </div>
              <Button onClick={() => refetchMaterials()} size="sm">
                Retry
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* How This Works Explainer */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <p className="text-sm font-semibold text-foreground">How this works:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-muted-foreground">Have at home</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Circle className="w-4 h-4 text-blue-600" />
                    <span className="text-muted-foreground">Willing to buy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground opacity-60">➖</span>
                    <span className="text-muted-foreground">Not interested</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const basics = ['Blocks', 'Balls', 'Books', 'Crayons', 'Paper'];
                    setMaterialsState(prev => prev.map(m =>
                      basics.includes(m.name) ? { ...m, status: 'have' } : m
                    ));
                    setHasChanges(true);
                  }}
                >
                  ✅ Mark Common Basics as Have
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMaterialsState(prev => prev.map(m => ({ ...m, status: 'unknown' })));
                    setHasChanges(true);
                  }}
                >
                  Reset All to Unknown
                </Button>
              </div>

              {/* Search/Filter */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search materials... (blocks, cars, paper)"
                  className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filter materials based on search query */}
              {(() => {
                const filteredMaterials = searchQuery
                  ? materialsState.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  : materialsState;

                return (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredMaterials.length === 0 && searchQuery ? (
                        <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
                          No materials found matching "{searchQuery}"
                        </div>
                      ) : (
                        filteredMaterials.map((material) => (
                          <div
                            key={material.name}
                            className={`
                                flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all
                                ${material.status === 'have' ? 'bg-green-50 border-green-200' : ''}
                                ${material.status === 'willing_to_buy' ? 'bg-blue-50 border-blue-200' : ''}
                                ${material.status === 'not_interested' ? 'bg-muted/50 opacity-60' : ''}
                            `}
                            onClick={() => handleMaterialToggle(material.name)}
                          >
                            <span className="font-medium text-sm">{material.name}</span>

                            <div className="flex items-center">
                              {material.status === 'have' && (
                                <div className="flex items-center gap-1.5 text-green-700 text-xs font-medium bg-white/50 px-2 py-1 rounded-full">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Have
                                </div>
                              )}
                              {material.status === 'willing_to_buy' && (
                                <div className="flex items-center gap-1.5 text-blue-700 text-xs font-medium bg-white/50 px-2 py-1 rounded-full">
                                  <Circle className="w-3.5 h-3.5" /> Will Buy
                                </div>
                              )}
                              {material.status === 'not_interested' && (
                                <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium bg-black/5 px-2 py-1 rounded-full">
                                  <LogOut className="w-3.5 h-3.5" /> No
                                </div>
                              )}
                              {material.status === 'unknown' && (
                                <span className="text-xs text-muted-foreground px-2">Click to set</span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      Tap an item to cycle: Have → Will Buy → Not Interested
                    </p>
                  </>
                );
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {user ? getInitials(user.name) : '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Separator />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast.info('Your profile is synced from your Google account');
            }}
          >
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5" />
            Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button variant="link" className="px-0 h-auto" onClick={() => window.location.href = '/privacy'}>
              Privacy Policy
            </Button>
            <br />
            <Button variant="link" className="px-0 h-auto" onClick={() => window.location.href = '/terms'}>
              Terms of Service
            </Button>
          </div>
          <Separator className="my-4" />
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Request deletion of your account and all associated data.
            </p>
            <Button
              variant="outline"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
              onClick={() => {
                window.open('mailto:antmwes104.1@gmail.com?subject=SchoolOS%20Account%20Deletion%20Request&body=Please%20delete%20my%20account%20and%20all%20associated%20data.', '_blank');
                toast.info('Account deletion request', {
                  description: 'Your email client should open. Send the email to complete your request.'
                });
              }}
            >
              Request Account Deletion
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card className="border-destructive/20">
        <CardContent className="pt-6">
          <Button variant="destructive" onClick={logout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* Edit Child Dialog */}
      {
        editingChild && (
          <EditChildForm
            child={editingChild}
            open={!!editingChild}
            onOpenChange={(open) => !open && setEditingChild(null)}
            onSuccess={() => setEditingChild(null)}
          />
        )
      }

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingChild} onOpenChange={(open) => !open && setDeletingChild(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deletingChild?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {deletingChild?.name} and all their activity observations and progress data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChild}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
}
