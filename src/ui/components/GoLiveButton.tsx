import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BridgeColors, Mono } from "../theme/colors";

interface Props {
  isLive: boolean;
  /** When false + !isLive, button shows the "set up destinations" state. */
  anyEnabled: boolean;
  durationMs: number;
  /** Right-side context line (e.g. enabled destinations summary). */
  subtitle: string;
  onPress: () => void;
}

function formatDuration(ms: number): string {
  if (ms <= 0) return "00:00";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export function GoLiveButton({
  isLive,
  anyEnabled,
  durationMs,
  subtitle,
  onPress,
}: Props) {
  const disabled = !isLive && !anyEnabled;
  const accent = isLive
    ? BridgeColors.Magenta
    : disabled
      ? BridgeColors.TextTertiary
      : BridgeColors.Primary;

  return (
    <Pressable onPress={onPress} style={{ borderRadius: 12 }}>
      <LinearGradient
        colors={
          isLive
            ? ["rgba(255, 45, 127, 0.35)", "rgba(255, 77, 109, 0.25)"]
            : [`${accent}33`, BridgeColors.Surface]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.shell, { borderColor: accent }]}
      >
        <View style={styles.center}>
          <View style={[styles.dot, { backgroundColor: accent }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: isLive ? "#fff" : accent }]}>
              {disabled
                ? "SET UP DESTINATION FIRST"
                : isLive
                  ? "STOP STREAM"
                  : "GO LIVE"}
            </Text>
            <Text style={styles.sub} numberOfLines={1}>
              {disabled
                ? "Tap to add a platform"
                : isLive
                  ? `${formatDuration(durationMs)}  ·  ${subtitle}`
                  : subtitle}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    height: 64,
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  center: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 8,
  },
  title: {
    fontFamily: Mono.fontFamily,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  sub: {
    color: BridgeColors.TextSecondary,
    fontFamily: Mono.fontFamily,
    fontSize: 10,
    marginTop: 2,
  },
});
