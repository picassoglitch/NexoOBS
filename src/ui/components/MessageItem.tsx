import { StyleSheet, Text, View } from "react-native";
import type { ChatMessage } from "@/chat";
import { BridgeColors, Mono } from "../theme/colors";

interface Props {
  message: ChatMessage;
}

/** Single chat row — author colour + badges + content. */
export function MessageItem({ message }: Props) {
  const color = message.authorColor ?? BridgeColors.Primary;
  const showBadges = message.authorBadges.length > 0;

  return (
    <View style={styles.row}>
      <View style={styles.header}>
        {showBadges && (
          <Text style={styles.badges}>
            {message.authorBadges.map((b) => b.toUpperCase()).join(" · ")}
          </Text>
        )}
        <Text style={[styles.author, { color }]} numberOfLines={1}>
          {message.authorName}
        </Text>
      </View>
      <Text style={styles.content}>{message.content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  badges: {
    color: BridgeColors.TextTertiary,
    fontFamily: Mono.fontFamily,
    fontSize: 8,
    letterSpacing: 0.8,
  },
  author: {
    fontFamily: Mono.fontFamily,
    fontWeight: "800",
    fontSize: 12,
  },
  content: {
    color: BridgeColors.TextPrimary,
    fontSize: 13,
    lineHeight: 17,
    marginTop: 1,
  },
});
