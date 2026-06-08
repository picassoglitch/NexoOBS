"use server";

import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { readSupabaseEnv } from "@/lib/supabase/env";

/**
 * Server-side OAuth init. The browser never sees the Supabase URL or anon
 * key — Supabase returns a fully-formed authorization URL, we 302 to it.
 */
export async function signInWithGoogle(formData: FormData): Promise<void> {
  const next = String(formData.get("next") ?? "/dashboard");
  const env = readSupabaseEnv();
  const supabase = await getSupabaseServer();
  if (!env || !supabase) {
    redirect("/login?error=not_configured");
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${env.siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data?.url) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? "oauth_failed")}`);
  }

  redirect(data.url);
}
