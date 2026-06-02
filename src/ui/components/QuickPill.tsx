import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { BridgeColors, Mono } from "../theme/colors";

interface Props {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
}

/** Compact mono CTA used in the home action row (CHAT / HEALTH / DEST). */
export function QuickPill({ label, onPress, style }: Props) {
  return (
    <Pressable onPress={onPress} style={[styles.pill, style]}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: BridgeColors.Surface,
    borderWidth: 1,
    borderColor: BridgeColors.PrimarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: BridgeColors.TextPrimary,
    fontFamily: Mono.fontFamily,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
