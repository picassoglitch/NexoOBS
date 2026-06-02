import { Pressable, StyleSheet, Text, View } from "react-native";
import { BridgeColors, Mono } from "../theme/colors";

interface Segment<T extends string> {
  id: T;
  label: string;
}

interface Props<T extends string> {
  value: T;
  segments: readonly Segment<T>[];
  onChange: (id: T) => void;
}

/**
 * Generic segmented control. Used for mode pickers, profile selectors,
 * destination filters, etc. Replaces the role-specific ModePicker so the
 * primitive stays reusable across screens.
 */
export function Segmented<T extends string>({
  value,
  segments,
  onChange,
}: Props<T>) {
  return (
    <View style={styles.row}>
      {segments.map((seg) => {
        const selected = seg.id === value;
        return (
          <Pressable
            key={seg.id}
            onPress={() => onChange(seg.id)}
            style={[styles.cell, selected && styles.cellActive]}
          >
            <Text style={[styles.label, selected && styles.labelActive]}>
              {seg.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    height: 44,
    borderRadius: 12,
    backgroundColor: BridgeColors.Surface,
    borderWidth: 1,
    borderColor: BridgeColors.PrimarySoft,
    padding: 3,
    gap: 3,
  },
  cell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  cellActive: {
    backgroundColor: "rgba(0, 229, 255, 0.18)",
    borderColor: "rgba(0, 229, 255, 0.6)",
  },
  label: {
    color: BridgeColors.TextTertiary,
    fontFamily: Mono.fontFamily,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  labelActive: {
    color: BridgeColors.Primary,
  },
});
