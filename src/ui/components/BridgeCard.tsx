import { ReactNode } from "react";
import { StyleSheet, View, ViewProps, ViewStyle } from "react-native";
import { BridgeColors } from "../theme/colors";

interface Props extends ViewProps {
  /** Optional accent ring colour. When set, overrides the default border. */
  accent?: string;
  children: ReactNode;
  /** Inner padding override; defaults to 14px on all sides. */
  contentStyle?: ViewStyle;
}

/** Themed surface used by every panel in Streamer + Operator modes. */
export function BridgeCard({
  accent,
  children,
  style,
  contentStyle,
  ...rest
}: Props) {
  return (
    <View
      {...rest}
      style={[styles.card, accent ? { borderColor: accent } : null, style]}
    >
      <View style={[styles.inner, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    backgroundColor: BridgeColors.Surface,
    borderWidth: 1,
    borderColor: BridgeColors.Border,
    overflow: "hidden",
  },
  inner: {
    padding: 14,
  },
});
