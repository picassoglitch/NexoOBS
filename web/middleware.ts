import { NextRequest, NextResponse } from "next/server";
import { readNexoEnv } from "@/lib/env";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/session";

/**
 * Edge-runtime middleware. Reads the NexoOBS session cookie; if missing or
 * invalid on a protected route, redirects to /login which itself shows the
 * "Sign in with Nexo-AI" button. Defensive: when env vars are missing the
 * middleware no-ops so the UI is still browsable for preview deploys (the
 * login page then surfaces which vars need to be set in Railway).
 */

const PROTECTED_PREFIXES = ["/dashboard", "/settings", "/analytics"];

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const env = readNexoEnv();
  if (!env) return NextResponse.next(); // preview deploy without secrets — let through

  const cookie = request.cookies.get(SESSION_COOKIE_NAME);
  if (cookie?.value) {
    try {
      await verifySession(cookie.value, env.sessionSecret);
      return NextResponse.next();
    } catch {
      // fall through to redirect — cookie is bad/expired
    }
  }

  const login = request.nextUrl.clone();
  login.pathname = "/login";
  login.searchParams.set("next", pathname);
  const response = NextResponse.redirect(login);
  // Clear the bad cookie so the user isn't stuck in a redirect loop.
  if (cookie) response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}

export const config = {
  matcher: [
    /*
     * Run on every request except:
     *   - /api/admin/*    — admin bearer, NOT session
     *   - /api/internal/* — relay bearer, NOT session
     *   - Next.js internals
     *   - static assets
     */
    "/((?!api/admin|api/internal|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
