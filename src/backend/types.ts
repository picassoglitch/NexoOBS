/**
 * Backend contract — Phase 0 ships an in-memory mock; later phases swap in
 * a real HTTP client without changing call sites.
 */

export type Role = "streamer" | "operator";

export interface Session {
  /** Opaque token; stored in expo-secure-store. */
  token: string;
  userId: string;
  email: string;
  displayName: string;
  /** Epoch ms. Phase 0 mock returns now() + 30 days. */
  expiresAt: number;
}

export interface Profile {
  id: string;
  name: string;
  /** "@handle" identity displayed in lobbies, chat ops, etc. */
  handle: string;
  /** Avatar URL or null; Phase 0 mock uses initials. */
  avatarUrl: string | null;
  /** Last-used role, if any. UI may default the lobby to this. */
  lastRole: Role | null;
  /** Default platform connections enabled for this profile. */
  defaultDestinations: PlatformId[];
}

export type PlatformId =
  | "kick"
  | "twitch"
  | "youtube"
  | "tiktok"
  | "restream"
  | "custom_rtmp"
  | "custom_srt";

export interface PlatformConnection {
  platformId: PlatformId;
  /** Channel handle / login name (e.g. Kick slug, Twitch login). */
  handle: string;
  /** Whether tokens are stored for sending (chat write, stream start, etc.). */
  hasAuth: boolean;
  /** When the user enabled this in their profile. */
  connectedAt: number;
}

export interface Permissions {
  /** Operator may send chat messages on behalf of the streamer. */
  chatReplyAllowed: boolean;
  /** Operator may start/stop the live stream. */
  streamControlAllowed: boolean;
  /** Operator may switch destinations on the fly. */
  destinationSwitchAllowed: boolean;
}

export const defaultPermissions: Permissions = {
  chatReplyAllowed: false,
  streamControlAllowed: false,
  destinationSwitchAllowed: false,
};

export interface HealthSample {
  ts: number;
  bitrateKbps: number;
  fps: number;
  droppedFrames: number;
  rttMs: number;
  batteryPct: number;
}
