import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, Student } from '@/types';
import { auth } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  children: Student[];
  selectedChild: Student | null;
  setSelectedChild: (child: Student) => void;
  isAuthenticated: boolean;
  logout: () => void;
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
        createdAt: response.user.created_at,
        updatedAt: response.user.updated_at,
      };
      
      const childrenData: Student[] = (response.children || []).map((child: any) => ({
        id: child.id,
        parentId: child.parent_id,
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
    } catch (error) {
      console.error('Failed to fetch user data:', error);
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
