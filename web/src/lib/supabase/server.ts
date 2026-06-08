import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { readSupabaseEnv } from "./env";

/**
 * Server-side Supabase client. Returns null if env vars are missing so
 * callers can no-op gracefully during local dev / preview deploys.
 */
export async function getSupabaseServer() {
  const env = readSupabaseEnv();
  if (!env) return null;
  const cookieStore = await cookies();

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // setAll throws when called from a Server Component (read-only
          // cookies). Middleware handles the writes for those paths.
        }
      },
    },
  });
}
