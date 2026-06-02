import { StyleSheet, Text, View } from "react-native";
import { BridgeColors, Mono } from "../theme/colors";

interface Cell {
  label: string;
  value: string;
  highlight?: "good" | "warn" | "bad";
}

interface Props {
  cells: Cell[];
}

const VALUE_COLOR: Record<NonNullable<Cell["highlight"]>, string> = {
  good: BridgeColors.AccentGreen,
  warn: BridgeColors.AccentAmber,
  bad: BridgeColors.AccentRed,
};

/** Compact horizontal telemetry strip for the operator live view. */
export function HealthBar({ cells }: Props) {
  return (
    <View style={styles.row}>
      {cells.map((c, i) => (
        <View
          key={c.label}
          style={[styles.cell, i === cells.length - 1 && styles.cellLast]}
        >
          <Text style={styles.label}>{c.label}</Text>
          <Text
            style={[
              styles.value,
              c.highlight && { color: VALUE_COLOR[c.highlight] },
            ]}
          >
            {c.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BridgeColors.PrimarySoft,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  cell: {
    flex: 1,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderColor: BridgeColors.BorderSoft,
  },
  cellLast: { borderRightWidth: 0 },
  label: {
    color: BridgeColors.TextTertiary,
    fontFamily: Mono.fontFamily,
    fontSize: 9,
    letterSpacing: 1,
  },
  value: {
    color: BridgeColors.TextPrimary,
    fontFamily: Mono.fontFamily,
    fontWeight: "800",
    fontSize: 13,
    marginTop: 2,
  },
});
