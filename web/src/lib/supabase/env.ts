/**
 * Defensive env reader so the app boots in dev without Supabase keys set —
 * the UI still renders, just without auth gating. Production must have all
 * three set or the middleware will let unauthenticated traffic through.
 *
 * Naming convention follows the shared Nexo-AI World pattern (NEXO_AI_*,
 * NEXOCLIP_*, NEXOCRYPTO_*, NEXOOBS_*). No NEXT_PUBLIC_ prefix because we
 * only ever read these on the server — OAuth init runs as a Server Action,
 * the @supabase/ssr clients run in Server Components / middleware. The
 * Supabase URL + anon key never reach the browser bundle.
 */

export interface SupabaseEnv {
  url: string;
  anonKey: string;
  siteUrl: string;
}

export function readSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.NEXOOBS_SUPABASE_URL;
  const anonKey = process.env.NEXOOBS_SUPABASE_ANON_KEY;
  const siteUrl =
    process.env.NEXOOBS_SITE_URL ?? "http://localhost:3000";
  if (!url || !anonKey) return null;
  return { url, anonKey, siteUrl };
}
