import { DestinationConfig } from "./destinations";

/**
 * Mock data for the Phase 0 web prototype — mirrors the screenshots so the
 * UI feels real before the relay backend lands. Swap for a Supabase-backed
 * loader once the API contract is locked.
 */

export interface SessionInfo {
  title: string;
  isLive: boolean;
  recordEnabled: boolean;
  /** Per-user ingest credentials issued by the relay. */
  ingest: IngestCredentials;
}

export interface IngestCredentials {
  rtmpUrl: string;
  rtmpsUrl: string;
  srtUrl: string;
  whipUrl: string;
  streamKey: string;
}

export const MOCK_SESSION: SessionInfo = {
  title: "Lavando la camioneta antes de salir de viaje",
  isLive: false,
  recordEnabled: true,
  ingest: {
    rtmpUrl: "rtmp://ingest.nexo-ai.world/live",
    rtmpsUrl: "rtmps://ingest.nexo-ai.world/live",
    srtUrl: "srt://ingest.nexo-ai.world:8890?streamid=publish",
    whipUrl: "https://ingest.nexo-ai.world/whip",
    streamKey: "nexo_live_8f3c2a1d9b7e4f60a1d2c3b4e5f60718",
  },
};

export const MOCK_DESTINATIONS: DestinationConfig[] = [
  {
    platformId: "tiktok",
    channelHandle: "Picassoglitch",
    streamTitle: "Lavando la camioneta antes de salir de viaje",
    ingestUrl: "",
    streamKey: "",
    oauthToken: "stub",
    enabled: false,
    status: { kind: "pending_approval", platformName: "TikTok" },
  },
  {
    platformId: "twitch",
    channelHandle: "aldov1llanueva",
    streamTitle: "Lavando la camioneta antes de salir de viaje",
    ingestUrl: "rtmp://live.twitch.tv/app",
    streamKey: "live_stub",
    oauthToken: "stub",
    enabled: true,
    status: { kind: "offline" },
  },
  {
    platformId: "instagram",
    channelHandle: "aldov1llanueva",
    streamTitle: "Go to Instagram to edit title.",
    ingestUrl: "",
    streamKey: "",
    oauthToken: "stub",
    enabled: false,
    status: { kind: "offline" },
  },
  {
    platformId: "kick",
    channelHandle: "aldov1llanueva",
    streamTitle: "Lavando la camioneta antes de salir de viaje",
    ingestUrl: "rtmps://fa723fc1b171.global-contribute.live-video.net",
    streamKey: "sk_stub",
    oauthToken: "stub",
    enabled: true,
    status: { kind: "expired", action: "reconnect" },
  },
];
