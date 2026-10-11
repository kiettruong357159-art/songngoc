'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SessionPayload, hasPermission } from '@/lib/auth';

interface AuthContextValue {
  user: SessionPayload | null;
  loading: boolean;
  can: (permission: string) => boolean;
  logout: () => Promise<void>;
  setUser: (user: SessionPayload | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
  initialUser?: SessionPayload | null;
}> = ({ children, initialUser = null }) => {
  const [user, setUser] = useState<SessionPayload | null>(initialUser);
  const [loading, setLoading] = useState(!initialUser);
  const router = useRouter();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.user) {
          setUser(json.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Nếu chưa có initialUser thì mới cần gọi API me ngay lập tức
    if (!initialUser) {
      fetchCurrentUser();
    }
  }, [fetchCurrentUser, initialUser]);

  const can = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      return hasPermission(user.permissions, permission);
    },
    [user]
  );

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, can, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
