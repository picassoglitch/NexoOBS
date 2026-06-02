import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BridgeColors, Mono } from "../theme/colors";

interface Props {
  title: string;
  /** When provided, renders a left-edge back button calling this. */
  onBack?: () => void;
  /** Optional right-edge slot (settings icon, action button, etc.). */
  right?: ReactNode;
}

/**
 * Sub-screen header with optional back arrow + title. Use this on any screen
 * that isn't the role-home (auth flow, settings, destinations, etc.). The
 * branded TopBar stays on the home screens.
 */
export function ScreenHeader({ title, onBack, right }: Props) {
  return (
    <View style={styles.row}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.backBtn} hitSlop={8}>
          <Text style={styles.backTxt}>‹</Text>
        </Pressable>
      ) : (
        <View style={styles.spacer} />
      )}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.rightSlot}>{right ?? <View style={styles.spacer} />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: BridgeColors.Surface,
    borderWidth: 1,
    borderColor: BridgeColors.PrimarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  backTxt: {
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
  rightSlot: {
    minWidth: 40,
    alignItems: "flex-end",
  },
  spacer: {
    width: 40,
    height: 40,
  },
});
