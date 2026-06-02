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
import { kv } from "./kv";

const MAX_MESSAGES = 250;
const CHANNEL_KEY = "nexo.chat.kickChannel.v1";
/** No demo default — the user's own Kick channel slug. They set it in the
 *  destinations screen (commit 6) or directly in the chat input until then. */
const DEFAULT_KICK_CHANNEL = "";

interface ChatRuntime {
  messages: ChatMessage[];
  status: ChatStatus;
  channel: string;
  error: string | null;
  setChannel: (channel: string) => Promise<void>;
  clearMessages: () => void;
}

const Ctx = createContext<ChatRuntime | null>(null);

export function ChatRuntimeProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [channel, setChannelState] = useState<string>(DEFAULT_KICK_CHANNEL);
  const [error, setError] = useState<string | null>(null);
  const providerRef = useRef<KickProvider | null>(null);

  // Hydrate the saved channel preference once.
  useEffect(() => {
    (async () => {
      const saved = await kv.get(CHANNEL_KEY);
      if (saved && saved.trim().length > 0) setChannelState(saved.trim());
    })();
  }, []);

  // Connect / reconnect whenever the channel changes. Empty channel = unconfigured.
  useEffect(() => {
    if (!channel || channel.trim().length === 0) {
      setStatus("idle");
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
  }, [channel]);

  const setChannel = useCallback(async (next: string) => {
    const trimmed = next.trim().toLowerCase();
    if (!trimmed) return;
    await kv.set(CHANNEL_KEY, trimmed);
    setChannelState(trimmed);
  }, []);

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
