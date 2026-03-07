'use client';

// FILE: apps/web/src/hooks/useAuth.tsx

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/types';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  googleAuth: (credential: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const applyToken = useCallback((token: string) => {
    localStorage.setItem('standor_token', token);
  }, []);

  const fetchMe = useCallback(async () => {
    try {
      const token = localStorage.getItem('standor_token');
      if (!token) return;
      const { data } = await api.get<User>('/api/auth/me');
      setUser(data);
    } catch {
      localStorage.removeItem('standor_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMe();
  }, [fetchMe]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{ token: string; user: User }>('/api/auth/login', { email, password });
    applyToken(data.token);
    setUser(data.user);
  }, [applyToken]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { data } = await api.post<{ token: string; user: User }>('/api/auth/register', { name, email, password });
    applyToken(data.token);
    setUser(data.user);
  }, [applyToken]);

  const googleAuth = useCallback(async (credential: string) => {
    const { data } = await api.post<{ token: string; user: User }>('/api/auth/google', { credential });
    applyToken(data.token);
    setUser(data.user);
  }, [applyToken]);

  const logout = useCallback(() => {
    localStorage.removeItem('standor_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
