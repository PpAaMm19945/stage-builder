import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, Student } from '@/types';
import { auth } from '@/lib/api';
import { normalizeChild } from '@/lib/normalizeChild';
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
  error: Error | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children: childrenProp }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [studentChildren, setStudentChildren] = useState<Student[]>([]);
  const [selectedChild, setSelectedChild] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshAuth = useCallback(async () => {
    const isAuth = auth.isAuthenticated();
    console.log('[AuthContext] refreshAuth called. isAuthenticated:', isAuth);

    // If no token exists, we are definitely not authenticated
    if (!isAuth) {
      console.log('[AuthContext] No token found. Resetting state.');
      setUser(null);
      setStudentChildren([]);
      setSelectedChild(null);
      setIsLoading(false);
      return;
    }

    setError(null);

    let retries = 3;
    let lastError: unknown = null;

    while (retries > 0) {
      try {
        console.log(`[AuthContext] Calling auth.getMe(). Attempt ${4 - retries}`);
        const response = await auth.getMe();
        console.log('[AuthContext] auth.getMe() success:', response);
        const userData: User = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          avatarUrl: response.user.avatar_url,
          provider: 'google',
          role: (response.user.role || 'parent') as 'parent' | 'teacher' | 'admin',
          householdId: response.user.household_id || response.user.id, // Fallback to user id
          createdAt: response.user.created_at,
          updatedAt: response.user.updated_at,
        };

        const childrenData: Student[] = (response.children || []).map((child) => {
          const student = normalizeChild(child);
          // Ensure householdId falls back to user context if missing on child
          if (student.householdId === 'unknown-household') {
            student.householdId = response.user.household_id || response.user.id;
          }
          return student;
        });

        setUser(userData);
        setStudentChildren(childrenData);
        setSelectedChild(childrenData[0] || null);
        setError(null);
        setIsLoading(false);
        return; // Success!
      } catch (err: unknown) {
        console.error('[AuthContext] auth.getMe() failed:', err);
        lastError = err;

        // Immediate failure for auth errors
        const isAuth = err instanceof Error && ('isAuthError' in err || err.message?.includes('Unauthorized'));
        if (isAuth) {
          console.log('[AuthContext] Auth error detected. Breaking retry loop.');
          break; // Exit retry loop to handle auth failure
        }

        console.warn(`Auth refresh attempt failed (${retries} retries left):`, err);
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s
        }
      }
    }

    // If we get here, we failed after retries OR had a fatal auth error
    const fatalError = lastError;

    // Enhanced logging to diagnose refresh issues
    console.error('Failed to fetch user data:', fatalError);

    // Type guards for unknown error
    const errorMessage = fatalError instanceof Error ? fatalError.message : String(fatalError);
    const isAuthErrorFlag = fatalError instanceof Error && 'isAuthError' in fatalError;

    console.log('Auth error details:', {
      isAuthError: isAuthErrorFlag,
      message: errorMessage,
    });

    const isAuthError = isAuthErrorFlag ||
      errorMessage.includes('Session expired') ||
      errorMessage.includes('Unauthorized');

    if (isAuthError) {
      console.log('[AuthContext] Handling fatal auth error. Logging out.');
      // Show informative message for auth errors
      toast.error('Session Expired', {
        description: 'Please sign in again to continue.',
        duration: 5000,
      });

      // Token IS invalid, clear it
      auth.logout();
      setUser(null);
      setStudentChildren([]);
      setSelectedChild(null);
      setIsLoading(false);
    } else {
      console.log('[AuthContext] Handling non-auth error.');
      // Non-auth error (Network, 500, etc)
      // Do NOT clear token. Do NOT logout.
      // Set error state so UI can show "Retry"
      setError(fatalError instanceof Error ? fatalError : new Error(errorMessage));
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const logout = useCallback(() => {
    console.log('[AuthContext] logout called.');
    auth.logout();
    setUser(null);
    setStudentChildren([]);
    setSelectedChild(null);
    setError(null);
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
        error,
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
