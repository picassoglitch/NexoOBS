import "server-only";

/**
 * NexoClip handoff — when "Get Clips" is on, NexoOBS forwards the stream's
 * lifecycle to NexoClip's internal live webhooks so the recording runs
 * through NexoClip's (already-tested) auto-clip pipeline.
 *
 * NexoOBS plays the relay's role toward NexoClip: same {stream_id,
 * tenant_id, recording_path} contract, same bearer
 * (NEXOCLIP_INTERNAL_SIGNING_SECRET, shared across relay + NexoClip +
 * NexoOBS). NexoClip pulls the recording from object storage by stream_id.
 *
 * Env:
 *   NEXOCLIP_INTERNAL_URL   base of NexoClip's internal API
 *                           (e.g. https://nexoclip.nexo-ai.world)
 *   NEXOCLIP_INTERNAL_SECRET bearer == NexoClip's signing secret
 */

function base(): string | null {
  const v = process.env.NEXOCLIP_INTERNAL_URL;
  return v ? v.replace(/\/+$/, "") : null;
}

function secret(): string | null {
  return process.env.NEXOCLIP_INTERNAL_SECRET ?? null;
}

export function isNexoclipConfigured(): boolean {
  return Boolean(base() && secret());
}

/** Register the live stream with NexoClip so it creates its streams row. */
export async function nexoclipStarted(args: {
  streamId: string;
  tenantId: string;
  recordingPath: string;
}): Promise<void> {
  const b = base();
  const s = secret();
  if (!b || !s) return;
  try {
    await fetch(`${b}/api/internal/live/started`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${s}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stream_id: args.streamId,
        tenant_id: args.tenantId,
        recording_path: args.recordingPath,
      }),
      cache: "no-store",
    });
  } catch {
    // Best-effort — never block the relay webhook on a NexoClip hiccup.
  }
}

/** Tell NexoClip the stream ended → triggers its auto-clip pipeline. */
export async function nexoclipEnded(args: {
  streamId: string;
  durationS?: number;
}): Promise<void> {
  const b = base();
  const s = secret();
  if (!b || !s) return;
  try {
    await fetch(`${b}/api/internal/live/ended`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${s}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stream_id: args.streamId,
        ...(args.durationS != null ? { duration_s: args.durationS } : {}),
      }),
      cache: "no-store",
    });
  } catch {
    // Best-effort.
  }
}
