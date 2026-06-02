export type ChatPlatformId =
  | "kick"
  | "twitch"
  | "youtube"
  | "tiktok"
  | "restream"
  | "custom";

export interface ChatMessage {
  /** Stable per-platform message id. */
  id: string;
  platform: ChatPlatformId;
  /** Channel slug / login that the message belongs to. */
  channel: string;
  authorName: string;
  /** Display colour from the platform (Twitch/Kick badge colour, etc.). */
  authorColor: string | null;
  /** Badge slugs ('moderator', 'subscriber', 'broadcaster', etc.). */
  authorBadges: string[];
  content: string;
  /** Epoch ms (local time the message was received if platform didn't ship one). */
  sentAt: number;
}

export type ChatStatus =
  | "idle"
  | "connecting"
  | "open"
  | "reconnecting"
  | "error";
