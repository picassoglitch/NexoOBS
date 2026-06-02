import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useChat } from "@/store/chat.store";
import { t } from "@/i18n";
import { BridgeColors, Mono } from "../theme/colors";
import { ChatList } from "./ChatList";
import { ChatChannelInput } from "./ChatChannelInput";

interface Props {
  visible: boolean;
  onClose: () => void;
}

/** Full-screen modal drawer used in Streamer mode. */
export function ChatDrawer({ visible, onClose }: Props) {
  const { messages, status, channel, error, setChannel } = useChat();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
      statusBarTranslucent
    >
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
            <Text style={styles.closeTxt}>‹</Text>
          </Pressable>
          <Text style={styles.title}>{t("chat.title")}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <ChatList
          messages={messages}
          status={status}
          channel={channel}
          error={error}
        />
        <ChatChannelInput
          currentChannel={channel}
          onSubmit={(c) => {
            void setChannel(c);
          }}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BridgeColors.Background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: BridgeColors.Border,
    gap: 8,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: BridgeColors.Surface,
    borderWidth: 1,
    borderColor: BridgeColors.PrimarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  closeTxt: {
    color: BridgeColors.Primary,
    fontFamily: Mono.fontFamily,
    fontSize: 28,
    lineHeight: 28,
    marginTop: -4,
  },
  title: {
    flex: 1,
    color: BridgeColors.TextPrimary,
    fontFamily: Mono.fontFamily,
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 1.5,
    textAlign: "center",
  },
  headerSpacer: { width: 40, height: 40 },
});
