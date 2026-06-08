/**
 * NexoOBS env vars — Nexo-AI World shared convention (NEXO_AI_*, NEXOCLIP_*,
 * NEXOCRYPTO_*, NEXOOBS_*). No NEXT_PUBLIC_ prefix anywhere: every read
 * happens on the server (SSO route, middleware, admin endpoints).
 *
 * Defensive: when any required var is missing, getNexoEnv() returns null and
 * the affected surface degrades gracefully — the UI still renders, but
 * protected routes redirect to the login screen which surfaces the missing
 * env name so operators see it immediately on deploy.
 */

export interface NexoEnv {
  /** HMAC-SHA256 secret shared with Nexo-AI. Must match the value Nexo-AI
   *  stores as `NEXOOBS_SSO_SECRET` so signLaunchToken + verify line up. */
  ssoSecret: string;
  /** Bearer token Nexo-AI presents on POST /api/admin/* calls. */
  adminToken: string;
  /** Independent HMAC secret used to sign OUR session cookie. NOT shared
   *  with Nexo-AI — only NexoOBS mints + verifies its own session. */
  sessionSecret: string;
  /** Absolute public URL of this NexoOBS deploy. Used to construct
   *  return_to on the login redirect. */
  publicUrl: string;
  /** Where to send unauthenticated visitors. Shared variable in Railway
   *  (`NEXO_AI_LOGIN_URL`) so every Nexo engine points at the same login. */
  nexoAiLoginUrl: string;
}

export function readNexoEnv(): NexoEnv | null {
  const ssoSecret = process.env.NEXOOBS_SSO_SECRET;
  const adminToken = process.env.NEXOOBS_ADMIN_TOKEN;
  const sessionSecret = process.env.NEXOOBS_SESSION_SECRET;
  const publicUrl =
    process.env.NEXOOBS_PUBLIC_URL ?? "http://localhost:3000";
  const nexoAiLoginUrl =
    process.env.NEXO_AI_LOGIN_URL ?? "https://nexo-ai.world/login";

  if (!ssoSecret || !adminToken || !sessionSecret) return null;
  return { ssoSecret, adminToken, sessionSecret, publicUrl, nexoAiLoginUrl };
}

/**
 * Resolve the public-facing origin (scheme + host) for building absolute
 * redirect URLs. Behind Railway's proxy, `request.url` is the internal bind
 * address (http://localhost:8080), so naive `url.origin` redirects send the
 * browser to localhost. Priority:
 *   1. NEXOOBS_PUBLIC_URL (authoritative — set in Railway)
 *   2. x-forwarded-proto + x-forwarded-host (proxy-injected)
 *   3. the request's own origin (local dev fallback)
 */
export function resolvePublicOrigin(request: Request): string {
  const fromEnv = process.env.NEXOOBS_PUBLIC_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const proto = request.headers.get("x-forwarded-proto");
  const host = request.headers.get("x-forwarded-host");
  if (proto && host) return `${proto}://${host}`;

  return new URL(request.url).origin;
}

/**
 * Shared bearer the nexoclip-live relay presents on the internal live
 * webhooks (/api/internal/live/*). Must equal the relay's
 * NEXOCLIP_INTERNAL_SIGNING_SECRET. Separate from the SSO/admin secrets —
 * this is the NexoOBS ↔ relay trust boundary.
 */
export function readRelaySecret(): string | null {
  return process.env.NEXOOBS_RELAY_SECRET ?? null;
}

/** List the env vars that are missing — used by the login page to tell
 *  operators exactly what to set in Railway. Returns [] when all present. */
export function missingNexoEnvVars(): string[] {
  const missing: string[] = [];
  if (!process.env.NEXOOBS_SSO_SECRET) missing.push("NEXOOBS_SSO_SECRET");
  if (!process.env.NEXOOBS_ADMIN_TOKEN) missing.push("NEXOOBS_ADMIN_TOKEN");
  if (!process.env.NEXOOBS_SESSION_SECRET) missing.push("NEXOOBS_SESSION_SECRET");
  return missing;
}
