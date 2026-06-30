import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch, refreshAuthSession } from '../services/apiClient';

export interface PlatformUser {
  platform_user_id: string;
  email: string;
  role: 'user' | 'admin';
  full_name: string;
  is_active: boolean;
}

interface AuthContextValue {
  user: PlatformUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const SESSION_REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const LOCAL_AUTH_BYPASS =
  import.meta.env.DEV &&
  import.meta.env.VITE_LOCAL_AUTH_BYPASS === 'true' &&
  ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
const LOCAL_DEV_USER: PlatformUser = {
  platform_user_id: 'local-dev-user',
  email: 'local@compass.dev',
  role: 'admin',
  full_name: 'Local Dev',
  is_active: true,
};

const readUser = async (): Promise<PlatformUser | null> => {
  const response = await apiFetch('/auth/me', undefined, { retryOnUnauthorized: false });
  if (!response.ok) return null;
  const data = await response.json();
  return data.user ?? null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<PlatformUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (LOCAL_AUTH_BYPASS) {
      setUser(LOCAL_DEV_USER);
      return true;
    }
    const refreshed = await refreshAuthSession();
    if (!refreshed) {
      setUser(null);
      return false;
    }
    const nextUser = await readUser();
    setUser(nextUser);
    return Boolean(nextUser);
  }, []);

  const loadInitialUser = useCallback(async () => {
    setIsLoading(true);
    try {
      if (LOCAL_AUTH_BYPASS) {
        setUser(LOCAL_DEV_USER);
        return;
      }
      const currentUser = await readUser();
      if (currentUser) {
        setUser(currentUser);
        return;
      }
      await refresh();
    } finally {
      setIsLoading(false);
    }
  }, [refresh]);

  useEffect(() => {
    void loadInitialUser();
  }, [loadInitialUser]);

  useEffect(() => {
    if (!user) return;
    const intervalId = window.setInterval(() => {
      void refresh();
    }, SESSION_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [refresh, user]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        void refresh();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refresh, user]);

  const login = useCallback(async (email: string, password: string) => {
    if (LOCAL_AUTH_BYPASS) {
      setUser(LOCAL_DEV_USER);
      return;
    }
    const response = await apiFetch(
      '/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      },
      { retryOnUnauthorized: false }
    );
    if (!response.ok) {
      throw new Error(response.status === 429 ? 'Demasiados intentos. Intenta nuevamente en unos minutos.' : 'Credenciales invalidas.');
    }
    const data = await response.json();
    setUser(data.user ?? null);
  }, []);

  const logout = useCallback(async () => {
    if (LOCAL_AUTH_BYPASS) {
      setUser(null);
      return;
    }
    await apiFetch('/auth/logout', { method: 'POST' }, { retryOnUnauthorized: false });
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, login, logout, refresh }),
    [user, isLoading, login, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
