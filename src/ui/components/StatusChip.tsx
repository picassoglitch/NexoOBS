import { Pressable, StyleSheet, Text, View } from "react-native";
import { BridgeColors, Health, Mono, healthColor } from "../theme/colors";

interface Props {
  label: string;
  value: string;
  health: Health;
  onPress?: () => void;
}

/** Small monospace chip used in the operator/streamer header row. */
export function StatusChip({ label, value, health, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.chip}>
      <View style={[styles.dot, { backgroundColor: healthColor[health] }]} />
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: BridgeColors.Surface,
    borderWidth: 1,
    borderColor: BridgeColors.PrimarySoft,
    marginRight: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 8,
  },
  label: {
    color: BridgeColors.TextTertiary,
    fontFamily: Mono.fontFamily,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    marginRight: 6,
  },
  value: {
    color: BridgeColors.TextPrimary,
    fontFamily: Mono.fontFamily,
    fontSize: 11,
    fontWeight: "700",
  },
});
