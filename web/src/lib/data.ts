import "server-only";
import { getSupabaseAdmin } from "./supabase";
import {
  DestinationConfig,
  DestinationStatus,
  PLATFORM_META,
  PlatformId,
} from "./destinations";

/**
 * Per-tenant data layer. Every function takes a tenantId (from the verified
 * session cookie) and scopes all queries to it — the service-role client
 * bypasses RLS, so this code is the tenant boundary.
 *
 * Tables (see nexo-ai migration 0023):
 *   nexoobs_sessions      1 row per tenant — title, flags, ingest stream key
 *   nexoobs_destinations  N rows per tenant — one per connected platform
 */

export interface TenantSession {
  title: string;
  isLive: boolean;
  recordEnabled: boolean;
  streamKey: string;
}

const DEFAULT_TITLE = "Mi transmisión en vivo";

/** Generate a fresh ingest stream key. Format mirrors the mock so the UI
 *  reads the same. Crypto-random, server-side. */
function freshStreamKey(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `nexo_live_${hex}`;
}

/** Load the tenant's session row, creating a default one (with a freshly
 *  generated stream key) on first access. */
export async function getOrCreateSession(
  tenantId: string,
): Promise<TenantSession> {
  const db = getSupabaseAdmin();
  const { data } = await db
    .from("nexoobs_sessions")
    .select("title, is_live, record_enabled, stream_key")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (data) {
    return {
      title: data.title as string,
      isLive: data.is_live as boolean,
      recordEnabled: data.record_enabled as boolean,
      streamKey: data.stream_key as string,
    };
  }

  const fresh: TenantSession = {
    title: DEFAULT_TITLE,
    isLive: false,
    recordEnabled: true,
    streamKey: freshStreamKey(),
  };
  await db.from("nexoobs_sessions").insert({
    tenant_id: tenantId,
    title: fresh.title,
    is_live: fresh.isLive,
    record_enabled: fresh.recordEnabled,
    stream_key: fresh.streamKey,
  });
  return fresh;
}

export async function updateSession(
  tenantId: string,
  patch: Partial<TenantSession>,
): Promise<void> {
  const db = getSupabaseAdmin();
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.isLive !== undefined) row.is_live = patch.isLive;
  if (patch.recordEnabled !== undefined) row.record_enabled = patch.recordEnabled;
  if (patch.streamKey !== undefined) row.stream_key = patch.streamKey;
  await db.from("nexoobs_sessions").update(row).eq("tenant_id", tenantId);
}

export async function regenerateStreamKey(tenantId: string): Promise<string> {
  const key = freshStreamKey();
  await updateSession(tenantId, { streamKey: key });
  return key;
}

// ── Destinations ───────────────────────────────────────────────────────────

interface DestinationRow {
  id: string;
  platform_id: string;
  channel_handle: string;
  stream_title: string;
  ingest_url: string;
  stream_key: string;
  oauth_token: string;
  enabled: boolean;
  status_kind: string | null;
  status_platform_name: string | null;
}

function rowToConfig(r: DestinationRow): DestinationConfig & { id: string } {
  let status: DestinationStatus | undefined;
  switch (r.status_kind) {
    case "ok":
      status = { kind: "ok" };
      break;
    case "offline":
      status = { kind: "offline" };
      break;
    case "expired":
      status = { kind: "expired", action: "reconnect" };
      break;
    case "pending_approval":
      status = {
        kind: "pending_approval",
        platformName: r.status_platform_name ?? "Plataforma",
      };
      break;
    default:
      status = undefined;
  }
  return {
    id: r.id,
    platformId: r.platform_id as PlatformId,
    channelHandle: r.channel_handle,
    streamTitle: r.stream_title,
    ingestUrl: r.ingest_url,
    streamKey: r.stream_key,
    oauthToken: r.oauth_token,
    enabled: r.enabled,
    status,
  };
}

export async function getDestinations(
  tenantId: string,
): Promise<(DestinationConfig & { id: string })[]> {
  const db = getSupabaseAdmin();
  const { data } = await db
    .from("nexoobs_destinations")
    .select(
      "id, platform_id, channel_handle, stream_title, ingest_url, stream_key, oauth_token, enabled, status_kind, status_platform_name",
    )
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: true });
  return (data ?? []).map((r) => rowToConfig(r as DestinationRow));
}

export async function addDestination(
  tenantId: string,
  platformId: PlatformId,
): Promise<void> {
  const db = getSupabaseAdmin();
  // Seed the ingest URL from the platform's known hint so named platforms
  // (Twitch/YouTube/Kick/Facebook) are pre-filled; the user only adds the
  // stream key. custom_rtmp / custom_srt start empty for manual entry.
  const ingestUrl = PLATFORM_META[platformId]?.ingestHint ?? "";
  await db.from("nexoobs_destinations").insert({
    tenant_id: tenantId,
    platform_id: platformId,
    ingest_url: ingestUrl,
    enabled: false,
    status_kind: "offline",
  });
}

/** Update editable fields on a destination. Marks status 'offline' once a
 *  stream key is present (configured but not live) so the row reads as ready
 *  rather than erroring. Scoped by tenant. */
export async function updateDestination(
  tenantId: string,
  id: string,
  patch: {
    channelHandle?: string;
    streamTitle?: string;
    ingestUrl?: string;
    streamKey?: string;
  },
): Promise<void> {
  const db = getSupabaseAdmin();
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.channelHandle !== undefined) row.channel_handle = patch.channelHandle;
  if (patch.streamTitle !== undefined) row.stream_title = patch.streamTitle;
  if (patch.ingestUrl !== undefined) row.ingest_url = patch.ingestUrl;
  if (patch.streamKey !== undefined) row.stream_key = patch.streamKey;
  await db
    .from("nexoobs_destinations")
    .update(row)
    .eq("tenant_id", tenantId)
    .eq("id", id);
}

/** Whether a destination has the minimum config to broadcast: an ingest URL
 *  and a stream key. Used to gate the enabled toggle. */
export function isDestinationConfigured(d: {
  ingestUrl: string;
  streamKey: string;
}): boolean {
  return d.ingestUrl.trim().length > 0 && d.streamKey.trim().length > 0;
}

export async function toggleDestination(
  tenantId: string,
  id: string,
): Promise<void> {
  const db = getSupabaseAdmin();
  const { data } = await db
    .from("nexoobs_destinations")
    .select("enabled")
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .maybeSingle();
  if (!data) return;
  await db
    .from("nexoobs_destinations")
    .update({ enabled: !data.enabled, updated_at: new Date().toISOString() })
    .eq("tenant_id", tenantId)
    .eq("id", id);
}

export async function updateAllTitles(
  tenantId: string,
  title: string,
): Promise<void> {
  const db = getSupabaseAdmin();
  await db
    .from("nexoobs_destinations")
    .update({ stream_title: title, updated_at: new Date().toISOString() })
    .eq("tenant_id", tenantId);
}

export async function removeDestination(
  tenantId: string,
  id: string,
): Promise<void> {
  const db = getSupabaseAdmin();
  await db
    .from("nexoobs_destinations")
    .delete()
    .eq("tenant_id", tenantId)
    .eq("id", id);
}

// ── Relay integration (called by the nexoclip-live MediaMTX hooks) ──────────

/** Resolve a publish stream key → tenant. Used by /api/internal/live/authorize
 *  so the relay knows whether to accept the push + whose destinations to fan
 *  out to. Returns null for an unknown key (relay rejects). */
export async function getTenantByStreamKey(
  streamKey: string,
): Promise<string | null> {
  const db = getSupabaseAdmin();
  const { data } = await db
    .from("nexoobs_sessions")
    .select("tenant_id")
    .eq("stream_key", streamKey)
    .maybeSingle();
  return (data?.tenant_id as string | undefined) ?? null;
}

/** Fan-out targets for the relay: enabled + fully-configured destinations,
 *  each as a complete RTMP push URL (ingest + key) the relay feeds to
 *  `ffmpeg -c copy -f flv`. */
export async function getFanoutDestinations(
  tenantId: string,
): Promise<{ platform: string; push_url: string }[]> {
  const db = getSupabaseAdmin();
  const { data } = await db
    .from("nexoobs_destinations")
    .select("platform_id, ingest_url, stream_key, enabled")
    .eq("tenant_id", tenantId)
    .eq("enabled", true);
  return (data ?? [])
    .filter(
      (r) =>
        ((r.ingest_url as string) ?? "").trim().length > 0 &&
        ((r.stream_key as string) ?? "").trim().length > 0,
    )
    .map((r) => {
      const base = (r.ingest_url as string).replace(/\/+$/, "");
      return {
        platform: r.platform_id as string,
        push_url: `${base}/${r.stream_key as string}`,
      };
    });
}
