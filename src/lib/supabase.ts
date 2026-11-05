import { createClient } from "@supabase/supabase-js";

// A publishable key is designed for browser use. Private data is protected by
// the database policies in supabase/migrations, not by hiding this key.
const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || "https://chkobsxfvyyposlmnmji.supabase.co";
const publishableKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) || "sb_publishable_Z7drsJbq6ErznTJ9C2SRAQ_HkDK-Wv0";

export const isSupabaseConfigured = Boolean(url && publishableKey);
export const supabase = isSupabaseConfigured ? createClient(url, publishableKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
}) : null;
