/**
 * Ingest endpoints shown in the encoder panel.
 *
 * The relay base is the address the encoder pushes to (the NexoOBS relay
 * fans out to enabled destinations). It MUST be the raw reachable RTMP
 * endpoint — for a Railway service that's the TCP-proxy host:port
 * (e.g. rtmp://acela.proxy.rlwy.net:26151/live), NOT the HTTP custom
 * domain (ingest.nexo-ai.world only carries HTTP, not RTMP on 1935).
 *
 * Set NEXOOBS_RELAY_RTMP_URL to that base. The value is read server-side
 * and passed into the client, so it never hardcodes a proxy port that can
 * change.
 */

export interface IngestCredentials {
  /** Server field for OBS/vMix (no key). */
  rtmpUrl: string;
  /** Single-field encoders (DJI Osmo / Mimo, GoPro, phones): server + key
   *  combined into one URL. */
  fullRtmpUrl: string;
  rtmpsUrl: string;
  srtUrl: string;
  whipUrl: string;
  streamKey: string;
}

/** Fallback used only when NEXOOBS_RELAY_RTMP_URL isn't set. */
const DEFAULT_RELAY_RTMP = "rtmp://ingest.nexo-ai.world/live";

export function buildIngest(
  streamKey: string,
  relayRtmp: string = DEFAULT_RELAY_RTMP,
): IngestCredentials {
  const base = relayRtmp.replace(/\/+$/, "");
  // Derive the host (without scheme) for the SRT/WHIP hints. These are
  // best-effort — the RTMP path is the one that's actually wired.
  const host = base.replace(/^rtmps?:\/\//, "").split("/")[0] ?? "";
  return {
    rtmpUrl: base,
    fullRtmpUrl: `${base}/${streamKey}`,
    rtmpsUrl: base.replace(/^rtmp:/, "rtmps:"),
    srtUrl: `srt://${host}?streamid=publish:${streamKey}`,
    whipUrl: `https://${host}/whip`,
    streamKey,
  };
}
