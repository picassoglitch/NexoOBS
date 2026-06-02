import { Pressable, StyleSheet, Text, View } from "react-native";
import { t } from "@/i18n";
import { useChat } from "@/store/chat.store";
import { BridgeColors, Mono, healthColor } from "../theme/colors";

interface Props {
  onExpand: () => void;
}

/**
 * Compact tappable strip used as the operator's chat peek. Shows the latest
 * message and connection state; tap to open the full ChatDrawer.
 */
export function ChatOverlay({ onExpand }: Props) {
  const { messages, status, channel } = useChat();
  const last = messages[messages.length - 1];

  const dotColor =
    status === "open"
      ? healthColor.good
      : status === "error"
        ? healthColor.bad
        : status === "idle"
          ? healthColor.idle
          : healthColor.warn;

  return (
    <Pressable onPress={onExpand} style={styles.shell}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <View style={{ flex: 1 }}>
        {last ? (
          <Text style={styles.preview} numberOfLines={1}>
            <Text style={styles.author}>{last.authorName}: </Text>
            <Text style={styles.content}>{last.content}</Text>
          </Text>
        ) : (
          <Text style={styles.placeholder} numberOfLines={1}>
            {t("chat.overlayHint", { channel })}
          </Text>
        )}
      </View>
      <Text style={styles.expand}>{t("chat.expand")}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BridgeColors.PrimarySoft,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  preview: { color: BridgeColors.TextPrimary, fontSize: 12 },
  author: {
    color: BridgeColors.Primary,
    fontFamily: Mono.fontFamily,
    fontWeight: "800",
  },
  content: { color: BridgeColors.TextPrimary },
  placeholder: {
    color: BridgeColors.TextTertiary,
    fontFamily: Mono.fontFamily,
    fontSize: 11,
    letterSpacing: 0.6,
  },
  expand: {
    color: BridgeColors.Primary,
    fontFamily: Mono.fontFamily,
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: "800",
  },
});
