import type { ChatMessage, ChatPlatformId, ChatStatus } from "./types";

/**
 * Pluggable chat backend. Phase 0 ships KickProvider (real, via Pusher
 * WebSocket); Twitch / YouTube / TikTok / Restream / Custom are stubs that
 * throw on connect with a TODO message until their flow lands.
 */
export interface ChatProvider {
  readonly platformId: ChatPlatformId;
  connect(channel: string): Promise<void>;
  disconnect(): void;
  /** Sending requires OAuth on most platforms — see per-provider notes. */
  sendMessage(content: string): Promise<void>;
  onMessage(handler: (m: ChatMessage) => void): () => void;
  onStatus(handler: (s: ChatStatus) => void): () => void;
}
