import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bell, Shield, LogOut, Users, Pencil, Trash2, Loader2, Baby, Plus } from 'lucide-react';
import { EditChildForm } from '@/components/children/EditChildForm';
import { AddChildForm } from '@/components/children/AddChildForm';
import { students } from '@/lib/api';
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
import type { Student } from '@/types';

export default function Settings() {
  const { user, children, logout, refreshAuth, selectedChild, setSelectedChild } = useAuth();
  const [editingChild, setEditingChild] = useState<Student | null>(null);
  const [deletingChild, setDeletingChild] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    <div className="space-y-8 max-w-2xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

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
              {user?.picture && <AvatarImage src={user.picture} alt={user.name} />}
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
              toast.info('Your profile is synced from your Google account', {
                description: 'Sign in with a different Google account to change your name or email.'
              });
            }}
          >
            Edit Profile
          </Button>
        </CardContent>
      </Card>

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

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Notification settings coming soon.
          </p>
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
          <p className="text-sm text-muted-foreground">
            Privacy settings coming soon.
          </p>
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

