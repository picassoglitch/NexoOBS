import { useEffect, useRef } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import type { ChatMessage, ChatStatus } from "@/chat";
import { t } from "@/i18n";
import { BridgeColors, Mono, healthColor } from "../theme/colors";
import { MessageItem } from "./MessageItem";

interface Props {
  messages: ChatMessage[];
  status: ChatStatus;
  channel: string;
  error: string | null;
}

/** Auto-scrolls to bottom on new messages — standard chat behaviour. */
export function ChatList({ messages, status, channel, error }: Props) {
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    if (messages.length === 0) return;
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages]);

  return (
    <View style={styles.shell}>
      <View style={styles.header}>
        <View
          style={[styles.dot, { backgroundColor: statusColor(status) }]}
        />
        <Text style={styles.channel}>kick.com/{channel || "—"}</Text>
        <Text style={styles.status}>{statusLabel(status)}</Text>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <MessageItem message={item} />}
        contentContainerStyle={{ paddingVertical: 8 }}
        ListEmptyComponent={
          !error ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTxt}>{t("chat.emptyHint")}</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

function statusColor(s: ChatStatus): string {
  switch (s) {
    case "open":
      return healthColor.good;
    case "connecting":
    case "reconnecting":
      return healthColor.warn;
    case "error":
      return healthColor.bad;
    default:
      return healthColor.idle;
  }
}

function statusLabel(s: ChatStatus): string {
  switch (s) {
    case "open":
      return t("chat.status.open");
    case "connecting":
      return t("chat.status.connecting");
    case "reconnecting":
      return t("chat.status.reconnecting");
    case "error":
      return t("chat.status.error");
    default:
      return t("chat.status.idle");
  }
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: BridgeColors.Background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: BridgeColors.Border,
    gap: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  channel: {
    color: BridgeColors.TextPrimary,
    fontFamily: Mono.fontFamily,
    fontSize: 12,
    fontWeight: "800",
    flex: 1,
  },
  status: {
    color: BridgeColors.TextTertiary,
    fontFamily: Mono.fontFamily,
    fontSize: 10,
    letterSpacing: 1,
  },
  empty: { paddingVertical: 28, alignItems: "center" },
  emptyTxt: {
    color: BridgeColors.TextTertiary,
    fontSize: 12,
    textAlign: "center",
  },
  error: {
    color: BridgeColors.AccentRed,
    fontFamily: Mono.fontFamily,
    fontSize: 11,
    padding: 10,
  },
});
