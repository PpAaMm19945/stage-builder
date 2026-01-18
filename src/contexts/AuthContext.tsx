import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, Student } from '@/types';
import { auth } from '@/lib/api';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  children: Student[];
  selectedChild: Student | null;
  setSelectedChild: (child: Student) => void;
  isAuthenticated: boolean;
  logout: () => void;
  signOut: () => void;  // Alias for logout
  refreshAuth: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children: childrenProp }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [studentChildren, setStudentChildren] = useState<Student[]>([]);
  const [selectedChild, setSelectedChild] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = useCallback(async () => {
    if (!auth.isAuthenticated()) {
      setUser(null);
      setStudentChildren([]);
      setSelectedChild(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await auth.getMe();
      const userData: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        avatarUrl: response.user.avatar_url,
        provider: 'google',
        role: response.user.role || 'parent',
        householdId: response.user.household_id || response.user.id, // Fallback to user id
        createdAt: response.user.created_at,
        updatedAt: response.user.updated_at,
      };

      const childrenData: Student[] = (response.children || []).map((child: any) => ({
        id: child.id,
        householdId: child.household_id || response.user.household_id || response.user.id,
        name: child.name,
        dateOfBirth: child.date_of_birth,
        ageInMonths: child.age_in_months,
        currentStage: child.current_stage || 'early-years',
        avatarUrl: child.avatar_url,
        createdAt: child.created_at,
        updatedAt: child.updated_at,
      }));

      setUser(userData);
      setStudentChildren(childrenData);
      setSelectedChild(childrenData[0] || null);
    } catch (error: any) {
      // Enhanced logging to diagnose refresh issues
      console.error('Failed to fetch user data:', error);
      console.log('Auth error details:', {
        isAuthError: error?.isAuthError,
        message: error?.message,
        status: error?.status,
      });

      // Show informative message for auth errors
      if (error?.isAuthError || error?.message?.includes('Session expired')) {
        toast.error('Session Expired', {
          description: 'Please sign in again to continue.',
          duration: 5000,
        });
      }

      // Token might be invalid, clear it
      auth.logout();
      setUser(null);
      setStudentChildren([]);
      setSelectedChild(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const logout = useCallback(() => {
    auth.logout();
    setUser(null);
    setStudentChildren([]);
    setSelectedChild(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        children: studentChildren,
        selectedChild,
        setSelectedChild,
        isAuthenticated: !!user,
        logout,
        signOut: logout,
        refreshAuth,
        isLoading,
      }}
    >
      {childrenProp}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
