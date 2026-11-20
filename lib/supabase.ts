// Supabase client (production target). Returns null when the project is not
// configured — the app then uses the local store in lib/store.ts, and the
// schema + RLS policies in supabase/migrations/ are what a Supabase project
// is set up from. Never put the service role key in client code.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function supabaseConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function supabaseClient(): SupabaseClient | null {
  if (!supabaseConfigured()) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string);
}

export function supabaseAdmin(): SupabaseClient | null {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}
