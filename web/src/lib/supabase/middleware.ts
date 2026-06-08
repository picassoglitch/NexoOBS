import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { readSupabaseEnv } from "./env";

const PROTECTED_PREFIXES = ["/dashboard", "/settings", "/analytics"];
const AUTH_ROUTES = ["/login", "/auth/callback"];

/**
 * Refresh the Supabase session cookie on every request, then redirect
 * unauthenticated users away from protected routes. Defensive: if env vars
 * are missing the middleware is a no-op so the UI still loads.
 */
export async function updateSession(request: NextRequest) {
  const env = readSupabaseEnv();
  if (!env) return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT: don't run any logic between createServerClient and getUser —
  // the @supabase/ssr docs warn this can silently expire sessions.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p));

  if (!user && isProtected) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isAuthRoute && pathname !== "/auth/callback") {
    const dashUrl = request.nextUrl.clone();
    dashUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashUrl);
  }

  return response;
}
