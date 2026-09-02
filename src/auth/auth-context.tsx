import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import * as authApi from '@/api/auth';
import { setAuthToken, setUnauthorizedHandler } from '@/api/client';
import { tokenStorage } from '@/utils/storage';

interface AuthContextValue {
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const signOut = useCallback(async () => {
    setAuthToken(null);
    await tokenStorage.clear();
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      signOut();
    });

    (async () => {
      const token = await tokenStorage.get();
      if (token) {
        setAuthToken(token);
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    })();

    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  const login = useCallback(async (email: string, password: string) => {
    const { token } = await authApi.login({ email, password });
    await tokenStorage.set(token);
    setAuthToken(token);
    setIsAuthenticated(true);
  }, []);

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      await authApi.register({ username, email, password });
      await login(email, password);
    },
    [login]
  );

  const value = useMemo(
    () => ({ isLoading, isAuthenticated, login, register, signOut }),
    [isLoading, isAuthenticated, login, register, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
