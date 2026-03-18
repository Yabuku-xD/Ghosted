import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi } from '../api/services';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await authApi.me();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const storeTokens = (data: {
    access?: string;
    refresh?: string;
    tokens?: {
      access: string;
      refresh: string;
    };
  }) => {
    const access = data.access || data.tokens?.access;
    const refresh = data.refresh || data.tokens?.refresh;

    if (!access || !refresh) {
      throw new Error('Authentication tokens missing from response');
    }

    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  };

  const login = async (username: string, password: string) => {
    const response = await authApi.login(username, password);
    storeTokens(response.data);
    await fetchUser();
  };

  const register = async (username: string, email: string, password: string) => {
    const response = await authApi.register(username, email, password);
    storeTokens(response.data);
    await fetchUser();
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
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
