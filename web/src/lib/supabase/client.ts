"use client";

import { createBrowserClient } from "@supabase/ssr";
import { readSupabaseEnv } from "./env";

export function getSupabaseBrowser() {
  const env = readSupabaseEnv();
  if (!env) {
    throw new Error(
      "Supabase env vars missing — set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }
  return createBrowserClient(env.url, env.anonKey);
}
