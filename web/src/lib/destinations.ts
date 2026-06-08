export type PlatformId =
  | "kick"
  | "twitch"
  | "youtube"
  | "tiktok"
  | "facebook"
  | "instagram"
  | "restream"
  | "custom_rtmp"
  | "custom_srt";

export interface DestinationConfig {
  platformId: PlatformId;
  /** Display name shown on the row (typically the user's handle on that platform). */
  channelHandle: string;
  /** Free-form title shown live on the destination. */
  streamTitle: string;
  /** Custom ingest URL (used for custom_rtmp / custom_srt). */
  ingestUrl: string;
  /** Stream key for outbound RTMP. Never serialize to non-secret storage. */
  streamKey: string;
  /** OAuth refresh / access token for write actions (chat send, title update, etc.). */
  oauthToken: string;
  /** When true, this platform receives the next session. */
  enabled: boolean;
  /** Optional health/auth state surfaced as a banner under the row. */
  status?: DestinationStatus;
}

export type DestinationStatus =
  | { kind: "ok" }
  | { kind: "offline" }
  | { kind: "expired"; action: "reconnect" }
  | { kind: "pending_approval"; platformName: string };

export interface PlatformMeta {
  displayName: string;
  ingestHint: string;
  /** CSS variable name (without the `--color-` prefix) — matches `globals.css`. */
  colorVar: string;
  supportsChat: boolean;
  supportsBroadcast: boolean;
}

export const PLATFORM_META: Record<PlatformId, PlatformMeta> = {
  kick: {
    displayName: "Kick",
    ingestHint: "rtmps://fa723fc1b171.global-contribute.live-video.net",
    colorVar: "kick",
    supportsChat: true,
    supportsBroadcast: true,
  },
  twitch: {
    displayName: "Twitch",
    ingestHint: "rtmp://live.twitch.tv/app",
    colorVar: "twitch",
    supportsChat: true,
    supportsBroadcast: true,
  },
  youtube: {
    displayName: "YouTube Live",
    ingestHint: "rtmp://a.rtmp.youtube.com/live2",
    colorVar: "youtube",
    supportsChat: true,
    supportsBroadcast: true,
  },
  tiktok: {
    displayName: "TikTok Live",
    ingestHint: "",
    colorVar: "tiktok",
    supportsChat: false,
    supportsBroadcast: true,
  },
  facebook: {
    displayName: "Facebook Live",
    ingestHint: "rtmps://live-api-s.facebook.com:443/rtmp",
    colorVar: "facebook",
    supportsChat: true,
    supportsBroadcast: true,
  },
  instagram: {
    displayName: "Instagram Live",
    ingestHint: "",
    colorVar: "instagram",
    supportsChat: false,
    supportsBroadcast: false,
  },
  restream: {
    displayName: "Restream",
    ingestHint: "rtmp://live.restream.io/live",
    colorVar: "restream",
    supportsChat: false,
    supportsBroadcast: true,
  },
  custom_rtmp: {
    displayName: "RTMP custom",
    ingestHint: "",
    colorVar: "accent",
    supportsChat: false,
    supportsBroadcast: true,
  },
  custom_srt: {
    displayName: "SRT custom",
    ingestHint: "",
    colorVar: "accent",
    supportsChat: false,
    supportsBroadcast: true,
  },
};

export const PLATFORM_ORDER: PlatformId[] = [
  "kick",
  "twitch",
  "youtube",
  "tiktok",
  "facebook",
  "instagram",
  "restream",
  "custom_rtmp",
  "custom_srt",
];

/** First-letter avatar fallback so the channel row always renders something. */
export function avatarInitial(handle: string): string {
  const trimmed = handle.trim();
  if (trimmed.length === 0) return "?";
  return trimmed[0]!.toUpperCase();
}
