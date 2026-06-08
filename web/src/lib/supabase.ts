import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase admin client for the shared Nexo-AI World project.
 * Uses the service-role key — it bypasses RLS, so EVERY query in this app
 * MUST filter by tenant_id (sourced from the verified session cookie). The
 * service key never reaches the browser; all data access goes through
 * Server Components / Server Actions / route handlers.
 *
 * Naming follows the NEXOOBS_* convention. The URL is the same Nexo-AI
 * World project that mints SSO tokens; the service-role key is its own
 * secret (NOT the anon key — we need to write to nexoobs_* tables).
 */

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXOOBS_SUPABASE_URL;
  const serviceKey = process.env.NEXOOBS_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase not configured — set NEXOOBS_SUPABASE_URL + NEXOOBS_SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXOOBS_SUPABASE_URL &&
      process.env.NEXOOBS_SUPABASE_SERVICE_ROLE_KEY,
  );
}
