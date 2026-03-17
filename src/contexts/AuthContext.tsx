import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { auth } from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(auth.isAuthenticated());

  const login = useCallback(async (email: string, password: string) => {
    await auth.login(email, password);
    setIsAuthenticated(true);
  }, []);

  const register = useCallback(async (email: string, username: string, password: string) => {
    await auth.register({ email, username, password });
    await auth.login(email, password);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    auth.logout();
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
