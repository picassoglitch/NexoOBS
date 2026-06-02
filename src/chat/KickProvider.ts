import type { ChatProvider } from "./ChatProvider";
import type { ChatMessage, ChatPlatformId, ChatStatus } from "./types";

/**
 * Kick chat is the only real provider in Phase 0. Kick doesn't have an
 * official public WebSocket SDK yet, but its chat infrastructure runs on a
 * shared Pusher cluster and the app key has been reverse-engineered from
 * their web app for a long time. Read-only is uncomplicated; sending
 * messages requires Kick's official OAuth 2.1 + chat:write scope (Phase 0.5).
 *
 * Flow:
 *   1. GET https://kick.com/api/v2/channels/{slug}  →  chatroom.id
 *   2. wss://ws-us2.pusher.com/app/<KEY>?...        →  pusher:connection_established
 *   3. pusher:subscribe to "chatrooms.{chatroomId}.v2"
 *   4. Receive `App\\Events\\ChatMessageEvent` events with data JSON
 *      containing sender + content + identity.badges.
 */
const PUSHER_KEY = "eb1d5f283081a78b932c";
const PUSHER_URL = `wss://ws-us2.pusher.com/app/${PUSHER_KEY}?protocol=7&client=js&version=7.6.0&flash=false`;

interface PusherFrame {
  event: string;
  data?: string;
  channel?: string;
}

interface KickChatMessageData {
  id: string;
  chatroom_id: number;
  content: string;
  type: string;
  created_at: string;
  sender: {
    id: number;
    username: string;
    slug: string;
    identity?: {
      color?: string;
      badges?: Array<{ type: string; text?: string }>;
    };
  };
}

export class KickProvider implements ChatProvider {
  readonly platformId: ChatPlatformId = "kick";

  private ws: WebSocket | null = null;
  private chatroomId: number | null = null;
  private channel: string | null = null;
  private messageHandlers = new Set<(m: ChatMessage) => void>();
  private statusHandlers = new Set<(s: ChatStatus) => void>();
  private status: ChatStatus = "idle";
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private retries = 0;
  private explicitlyDisconnected = false;

  async connect(channel: string): Promise<void> {
    this.disconnect();
    this.explicitlyDisconnected = false;
    this.channel = channel.trim().toLowerCase();
    if (!this.channel) {
      this.setStatus("error");
      throw new Error("Canal vacío");
    }
    this.setStatus("connecting");

    try {
      this.chatroomId = await this.resolveChatroomId(this.channel);
    } catch (err) {
      this.setStatus("error");
      throw err;
    }
    this.openSocket();
  }

  disconnect(): void {
    this.explicitlyDisconnected = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        /* noop */
      }
      this.ws = null;
    }
    this.chatroomId = null;
    this.channel = null;
    this.retries = 0;
    this.setStatus("idle");
  }

  async sendMessage(_content: string): Promise<void> {
    // TODO(phase-0.5): Kick OAuth 2.1 PKCE + POST api.kick.com/public/v1/chat
    throw new Error(
      "Enviar mensajes a Kick requiere OAuth (lo añadimos en Fase 0.5).",
    );
  }

  onMessage(handler: (m: ChatMessage) => void): () => void {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  onStatus(handler: (s: ChatStatus) => void): () => void {
    this.statusHandlers.add(handler);
    handler(this.status);
    return () => {
      this.statusHandlers.delete(handler);
    };
  }

  // ---- internals ----------------------------------------------------------

  private async resolveChatroomId(channel: string): Promise<number> {
    const res = await fetch(
      `https://kick.com/api/v2/channels/${encodeURIComponent(channel)}`,
      { headers: { Accept: "application/json" } },
    );
    if (res.status === 404) {
      throw new Error(`Canal "${channel}" no encontrado en Kick`);
    }
    if (!res.ok) {
      throw new Error(`Kick API respondió ${res.status}`);
    }
    const data = (await res.json()) as { chatroom?: { id?: number } };
    const id = data.chatroom?.id;
    if (!id) throw new Error("Kick no devolvió chatroom.id");
    return id;
  }

  private openSocket(): void {
    if (!this.chatroomId) return;
    const ws = new WebSocket(PUSHER_URL);
    this.ws = ws;

    ws.onmessage = (event) => this.handleFrame(event.data);
    ws.onerror = () => {
      this.setStatus("error");
    };
    ws.onclose = () => {
      if (this.explicitlyDisconnected) return;
      // Exponential backoff, capped at 30s.
      const delay = Math.min(30_000, 1000 * 2 ** Math.min(this.retries, 5));
      this.retries++;
      this.setStatus("reconnecting");
      this.reconnectTimer = setTimeout(() => this.openSocket(), delay);
    };
  }

  private handleFrame(raw: unknown): void {
    if (typeof raw !== "string") return;
    let frame: PusherFrame;
    try {
      frame = JSON.parse(raw);
    } catch {
      return;
    }

    if (frame.event === "pusher:connection_established") {
      this.subscribe();
      return;
    }
    if (frame.event === "pusher_internal:subscription_succeeded") {
      this.retries = 0;
      this.setStatus("open");
      return;
    }
    if (frame.event === "pusher:ping") {
      this.ws?.send(JSON.stringify({ event: "pusher:pong", data: {} }));
      return;
    }
    if (frame.event === "App\\Events\\ChatMessageEvent" && frame.data) {
      try {
        const data = JSON.parse(frame.data) as KickChatMessageData;
        const msg: ChatMessage = {
          id: data.id,
          platform: "kick",
          channel: this.channel ?? "",
          authorName: data.sender.username,
          authorColor: data.sender.identity?.color ?? null,
          authorBadges:
            data.sender.identity?.badges?.map((b) => b.type) ?? [],
          content: data.content,
          sentAt: Date.parse(data.created_at) || Date.now(),
        };
        this.messageHandlers.forEach((h) => h(msg));
      } catch {
        // Malformed payload — ignore
      }
    }
  }

  private subscribe(): void {
    if (!this.ws || !this.chatroomId) return;
    this.ws.send(
      JSON.stringify({
        event: "pusher:subscribe",
        data: { auth: "", channel: `chatrooms.${this.chatroomId}.v2` },
      }),
    );
  }

  private setStatus(s: ChatStatus): void {
    if (this.status === s) return;
    this.status = s;
    this.statusHandlers.forEach((h) => h(s));
  }
}
