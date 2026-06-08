/**
 * Defensive env reader so the app boots in dev without Supabase keys set —
 * the UI still renders, just without auth gating. Production must have all
 * three set or the middleware will let unauthenticated traffic through.
 */

export interface SupabaseEnv {
  url: string;
  anonKey: string;
  siteUrl: string;
}

export function readSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  if (!url || !anonKey) return null;
  return { url, anonKey, siteUrl };
}
