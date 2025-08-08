'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase/client';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  impersonatedDoctorId: string | null;
  setImpersonatedDoctorId: (doctorId: string | null) => void;
  isImpersonating: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [impersonatedDoctorId, setImpersonatedDoctorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isImpersonating = !!impersonatedDoctorId;

  const saveSession = (session: Session | null) => {
    if (session) {
      document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=3600; secure; samesite=lax`;
      document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=3600; secure; samesite=lax`;
      localStorage.setItem('sb-session', JSON.stringify(session));
    } else {
      document.cookie = `sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
      document.cookie = `sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
      localStorage.removeItem('sb-session');
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('medoh_admin_impersonation');
      if (stored) setImpersonatedDoctorId(stored);
    }
  }, []);

  useEffect(() => {
    const loadSession = async () => {
      setLoading(true);
      const session = localStorage.getItem('supabase.auth.token');
      if (session) {
        const parsed = JSON.parse(session);
        await supabase.auth.setSession({
          access_token: parsed.access_token,
          refresh_token: parsed.refresh_token,
        });
        setUser(parsed.user || null);
      } else {
        const { data } = await supabase.auth.getUser();
        setUser(data?.user || null);
      }
      setLoading(false);
    };

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        localStorage.setItem('supabase.auth.token', JSON.stringify(session));
        setUser(session.user);
      } else {
        localStorage.removeItem('supabase.auth.token');
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const setImpersonatedDoctorIdWithPersistence = (doctorId: string | null) => {
    setImpersonatedDoctorId(doctorId);
    if (typeof window !== 'undefined') {
      if (doctorId) {
        localStorage.setItem('medoh_admin_impersonation', doctorId);
      } else {
        localStorage.removeItem('medoh_admin_impersonation');
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        impersonatedDoctorId,
        setImpersonatedDoctorId: setImpersonatedDoctorIdWithPersistence,
        isImpersonating,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
