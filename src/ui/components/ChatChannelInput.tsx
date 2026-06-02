import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { t } from "@/i18n";
import { BridgeColors, Mono } from "../theme/colors";

interface Props {
  currentChannel: string;
  onSubmit: (channel: string) => void;
}

/** Compact "change Kick channel" input. Sits inside the chat surface. */
export function ChatChannelInput({ currentChannel, onSubmit }: Props) {
  const [value, setValue] = useState(currentChannel);

  return (
    <View style={styles.row}>
      <Text style={styles.prefix}>kick.com/</Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="canal"
        placeholderTextColor={BridgeColors.TextTertiary}
        style={styles.input}
        returnKeyType="go"
        onSubmitEditing={() => onSubmit(value)}
      />
      <Pressable
        onPress={() => onSubmit(value)}
        style={styles.cta}
        disabled={!value.trim() || value.trim() === currentChannel}
      >
        <Text style={styles.ctaTxt}>{t("chat.connect")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: BridgeColors.Surface,
    borderTopWidth: 1,
    borderColor: BridgeColors.Border,
  },
  prefix: {
    color: BridgeColors.TextTertiary,
    fontFamily: Mono.fontFamily,
    fontSize: 12,
  },
  input: {
    flex: 1,
    color: BridgeColors.TextPrimary,
    backgroundColor: BridgeColors.SurfaceElevated,
    borderWidth: 1,
    borderColor: BridgeColors.Border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontFamily: Mono.fontFamily,
    fontSize: 13,
  },
  cta: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0, 229, 255, 0.18)",
    borderWidth: 1,
    borderColor: BridgeColors.Primary,
  },
  ctaTxt: {
    color: BridgeColors.Primary,
    fontFamily: Mono.fontFamily,
    fontWeight: "800",
    fontSize: 11,
    letterSpacing: 1.2,
  },
});
