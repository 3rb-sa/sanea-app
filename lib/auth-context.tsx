"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "./supabase";

export type Profile = {
  id: string;
  phone: string | null;
  full_name: string;
  created_at: string;
};

type AuthValue = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  signInWithGoogle: (redirectPath?: string) => Promise<{ error: string | null }>;
  completeProfile: (data: { fullName: string; phone: string }) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ error: string | null }>;
  checkHasProfile: () => Promise<boolean>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (error) return;
      setProfile(data as Profile | null);
    },
    [supabase]
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        fetchProfile(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  const signInWithGoogle = useCallback(
    async (redirectPath = "/login") => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}${redirectPath}` },
      });
      return { error: error?.message ?? null };
    },
    [supabase]
  );

  const completeProfile = useCallback(
    async ({ fullName, phone }: { fullName: string; phone: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return { error: "لا توجد جلسة دخول" };

      const { error } = await supabase.from("profiles").insert({
        id: user.id,
        phone,
        full_name: fullName,
      });
      if (error) {
        if (error.code === "23505") {
          await fetchProfile(user.id);
          return { error: null };
        }
        return { error: error.message };
      }
      await fetchProfile(user.id);
      return { error: null };
    },
    [supabase, fetchProfile]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, [supabase]);

  const deleteAccount = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return { error: "لا توجد جلسة دخول" };

    const res = await fetch("/api/account/delete", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { error: body.error ?? "تعذر حذف الحساب" };
    }

    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    return { error: null };
  }, [supabase]);

  const checkHasProfile = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return false;
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userData.user.id)
      .maybeSingle();
    if (error) return true;
    return !!data;
  }, [supabase]);

  const value: AuthValue = {
    loading,
    session,
    user: session?.user ?? null,
    profile,
    signInWithGoogle,
    completeProfile,
    signOut,
    deleteAccount,
    checkHasProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
