import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { KickProvider } from "@/chat/KickProvider";
import type { ChatMessage, ChatStatus } from "@/chat";
import { useDestinations } from "@/destinations/store";

const MAX_MESSAGES = 250;

interface ChatRuntime {
  messages: ChatMessage[];
  status: ChatStatus;
  /** Channel slug we're currently connected to (from destinations.kick). */
  channel: string;
  error: string | null;
  /** Inline override — writes back to the Kick destination row. */
  setChannel: (channel: string) => Promise<void>;
  clearMessages: () => void;
}

const Ctx = createContext<ChatRuntime | null>(null);

/**
 * Chat reads the user's OWN Kick channel from the destinations store —
 * the same row used to broadcast to that platform. Single source of truth.
 *
 * If the user hasn't filled in their Kick slug yet, we sit in idle until
 * they do (via the destinations screen or the chat input).
 */
export function ChatRuntimeProvider({ children }: { children: ReactNode }) {
  const { destinations, update, loaded } = useDestinations();
  const channel = destinations.kick.channelSlug.trim().toLowerCase();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const providerRef = useRef<KickProvider | null>(null);

  useEffect(() => {
    if (!loaded) return;
    if (!channel) {
      setStatus("idle");
      setMessages([]);
      return;
    }

    const provider = new KickProvider();
    providerRef.current = provider;
    setError(null);
    setMessages([]);

    const unsubM = provider.onMessage((m) => {
      setMessages((cur) => {
        const next = cur.concat(m);
        return next.length > MAX_MESSAGES
          ? next.slice(next.length - MAX_MESSAGES)
          : next;
      });
    });
    const unsubS = provider.onStatus(setStatus);

    provider.connect(channel).catch((e) => {
      setError(e instanceof Error ? e.message : "Error al conectar");
    });

    return () => {
      unsubM();
      unsubS();
      provider.disconnect();
      providerRef.current = null;
    };
  }, [channel, loaded]);

  const setChannel = useCallback(
    async (next: string) => {
      const trimmed = next.trim().toLowerCase();
      if (!trimmed) return;
      await update("kick", { channelSlug: trimmed });
    },
    [update],
  );

  const clearMessages = useCallback(() => setMessages([]), []);

  const value = useMemo<ChatRuntime>(
    () => ({ messages, status, channel, error, setChannel, clearMessages }),
    [messages, status, channel, error, setChannel, clearMessages],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useChat(): ChatRuntime {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useChat must be used inside ChatRuntimeProvider");
  return ctx;
}
