import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export interface AppUser {
  id: string;
  email: string;
  name: string;
}

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  cloudEnabled: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, inviteCode: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const DEMO_SESSION = "memory-map-demo-session";

function toAppUser(user: SupabaseUser): AppUser {
  return {
    id: user.id,
    email: user.email ?? "friend@memorymap.local",
    name: String(user.user_metadata?.display_name ?? user.email?.split("@")[0] ?? "Friend"),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      const saved = sessionStorage.getItem(DEMO_SESSION);
      setUser(saved ? JSON.parse(saved) as AppUser : null);
      setLoading(false);
      return;
    }
    void supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? toAppUser(data.user) : null);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? toAppUser(session.user) : null);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    cloudEnabled: isSupabaseConfigured,
    signIn: async (email, password) => {
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) setUser(toAppUser(data.user));
        return;
      }
      if (password.length < 8) throw new Error("Password must be at least 8 characters.");
      const demo = { id: "alex", email, name: email.split("@")[0] || "Alex" };
      sessionStorage.setItem(DEMO_SESSION, JSON.stringify(demo));
      setUser(demo);
    },
    register: async (email, password, inviteCode, name) => {
      if (password.length < 8) throw new Error("Choose a password with at least 8 characters.");
      if (inviteCode.trim().length < 6) throw new Error("Enter the invitation code you received.");
      if (supabase) {
        const { error } = await supabase.functions.invoke("register-by-invite", {
          body: { email, password, inviteCode: inviteCode.trim(), displayName: name.trim() },
        });
        if (error) throw error;
        const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) throw loginError;
        if (data.user) setUser(toAppUser(data.user));
        return;
      }
      const demo = { id: "alex", email, name: name.trim() || email.split("@")[0] || "Alex" };
      sessionStorage.setItem(DEMO_SESSION, JSON.stringify(demo));
      setUser(demo);
    },
    signOut: async () => {
      if (supabase) await supabase.auth.signOut();
      sessionStorage.removeItem(DEMO_SESSION);
      setUser(null);
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
