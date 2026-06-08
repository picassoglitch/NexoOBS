/**
 * GET /auth/sso?token=<hmac-signed>
 *
 * Endpoint Nexo-AI redirects the browser to after the user clicks "Launch
 * NexoOBS" from nexo-ai.world. We verify the HMAC signature against
 * NEXOOBS_SSO_SECRET, mint our own long-lived session cookie, and 303 to
 * /dashboard.
 *
 * Failure modes (token missing / bad signature / expired) render the
 * /login page with an `?error=` so operators can diagnose without seeing
 * server-side stack traces.
 */

import { NextRequest, NextResponse } from "next/server";
import { readNexoEnv } from "@/lib/env";
import { signSession, SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from "@/lib/session";
import { SsoTokenError, verifySsoToken } from "@/lib/sso";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  const env = readNexoEnv();
  if (!env) {
    return redirectToLogin(url, "service_not_configured");
  }
  if (!token) {
    return redirectToLogin(url, "missing_token");
  }

  let claims;
  try {
    claims = await verifySsoToken(token, { secret: env.ssoSecret });
  } catch (e) {
    const reason = e instanceof SsoTokenError ? e.message : "verify_failed";
    return redirectToLogin(url, reason);
  }

  const cookieValue = await signSession(
    {
      user_id: claims.user_id,
      email: claims.email,
      tenant_id: claims.tenant_id,
      tier: claims.tier,
    },
    env.sessionSecret,
  );

  const dashboard = new URL("/dashboard", url.origin);
  const response = NextResponse.redirect(dashboard, { status: 303 });
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: cookieValue,
    httpOnly: true,
    sameSite: "lax",
    secure: url.protocol === "https:",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return response;
}

function redirectToLogin(reqUrl: URL, reason: string): NextResponse {
  const login = new URL("/login", reqUrl.origin);
  login.searchParams.set("error", reason);
  return NextResponse.redirect(login, { status: 303 });
}
