import { createContext, useContext, useState, ReactNode } from 'react';
import { User, Student } from '@/types';

// Mock data for development
const MOCK_USER: User = {
  id: 'user-1',
  email: 'parent@schoolos.com',
  name: 'Sarah Mitchell',
  avatarUrl: undefined,
  provider: 'google',
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: new Date().toISOString(),
};

const MOCK_CHILDREN: Student[] = [
  {
    id: 'child-1',
    parentId: 'user-1',
    name: 'Emma',
    dateOfBirth: '2021-03-15',
    ageInMonths: 33,
    currentStage: 'early-years',
    avatarUrl: undefined,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'child-2',
    parentId: 'user-1',
    name: 'Lucas',
    dateOfBirth: '2022-08-22',
    ageInMonths: 16,
    currentStage: 'early-years',
    avatarUrl: undefined,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
];

interface AuthContextType {
  user: User | null;
  children: Student[];
  selectedChild: Student | null;
  setSelectedChild: (child: Student) => void;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children: childrenProp }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(MOCK_USER);
  const [studentChildren] = useState<Student[]>(MOCK_CHILDREN);
  const [selectedChild, setSelectedChild] = useState<Student | null>(MOCK_CHILDREN[0]);
  const [isLoading] = useState(false);

  const login = () => {
    setUser(MOCK_USER);
    setSelectedChild(MOCK_CHILDREN[0]);
  };

  const logout = () => {
    setUser(null);
    setSelectedChild(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        children: studentChildren,
        selectedChild,
        setSelectedChild,
        isAuthenticated: !!user,
        login,
        logout,
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
