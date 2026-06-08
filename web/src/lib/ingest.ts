/**
 * Ingest endpoints shown in the encoder panel. The host is the shared relay
 * (one push from the encoder → fan-out to enabled destinations). The stream
 * key is per-tenant, issued by the relay/session row.
 *
 * Phase 0: the relay host is a fixed placeholder. When the real relay lands,
 * read it from NEXOOBS_RELAY_HOST and key auth off the tenant's stream key.
 */

export interface IngestCredentials {
  rtmpUrl: string;
  rtmpsUrl: string;
  srtUrl: string;
  whipUrl: string;
  streamKey: string;
}

const RELAY_HOST = "ingest.nexo-ai.world";

export function buildIngest(streamKey: string): IngestCredentials {
  return {
    rtmpUrl: `rtmp://${RELAY_HOST}/live`,
    rtmpsUrl: `rtmps://${RELAY_HOST}/live`,
    srtUrl: `srt://${RELAY_HOST}:8890?streamid=publish`,
    whipUrl: `https://${RELAY_HOST}/whip`,
    streamKey,
  };
}
