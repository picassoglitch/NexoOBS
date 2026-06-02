import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useSession } from "@/store/session.store";
import type { Role } from "@/backend";
import { BridgeCard, BridgeColors, Mono, TopBar } from "@/ui";

const isIOS = Platform.OS === "ios";

export default function LobbyScreen() {
  const { profile, selectRole, logout } = useSession();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.body}>
        <TopBar />

        <Text style={styles.hero}>WHO ARE YOU TODAY?</Text>
        <Text style={styles.heroSub}>
          {profile?.name
            ? `${profile.name}, pick the role you'll play in this session.`
            : "Pick the role you'll play in this session."}
        </Text>

        <RoleCard
          id="streamer"
          title="STREAMER"
          subtitle="Remote preview · chat · permission control"
          bullets={[
            "Available on iPhone + Android",
            "Approve operator chat replies",
            "Switch destinations + overlays mid-stream",
          ]}
          accent={BridgeColors.Primary}
          onPick={() => selectRole("streamer")}
        />
        <RoleCard
          id="operator"
          title="CAMERA OPERATOR"
          subtitle="UVC preview · live chat overlay · stream health"
          bullets={[
            isIOS
              ? "Android-only — iOS can't host USB cameras"
              : "Wires the Osmo Pocket 3 via USB-C UVC",
            "Streams to platforms you've authorised",
            "Reply to chat only when streamer grants permission",
          ]}
          accent={BridgeColors.Magenta}
          onPick={() => selectRole("operator")}
          warning={
            isIOS
              ? "Operator mode requires Android — Apple doesn't allow USB UVC."
              : undefined
          }
        />

        <View style={{ flex: 1 }} />
        <Pressable onPress={logout} style={{ alignSelf: "center", padding: 8 }}>
          <Text style={styles.logout}>SIGN OUT</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

interface RoleCardProps {
  id: Role;
  title: string;
  subtitle: string;
  bullets: string[];
  accent: string;
  onPick: () => void;
  warning?: string;
}

function RoleCard({
  title,
  subtitle,
  bullets,
  accent,
  onPick,
  warning,
}: RoleCardProps) {
  return (
    <Pressable onPress={onPick} disabled={!!warning && false}>
      <LinearGradient
        colors={[`${accent}22`, BridgeColors.Surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, { borderColor: accent }]}
      >
        <Text style={[styles.cardTitle, { color: accent }]}>{title}</Text>
        <Text style={styles.cardSub}>{subtitle}</Text>
        <View style={{ gap: 6, marginTop: 8 }}>
          {bullets.map((b, i) => (
            <Text key={i} style={styles.bullet}>
              · {b}
            </Text>
          ))}
        </View>
        {warning && (
          <View style={styles.warnRow}>
            <Text style={styles.warn}>{warning}</Text>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BridgeColors.Background },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 8, gap: 14 },
  hero: {
    color: BridgeColors.TextPrimary,
    fontFamily: Mono.fontFamily,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 2,
    marginTop: 20,
  },
  heroSub: {
    color: BridgeColors.TextTertiary,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 4,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 16,
  },
  cardTitle: {
    fontFamily: Mono.fontFamily,
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 2,
  },
  cardSub: {
    color: BridgeColors.TextSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  bullet: {
    color: BridgeColors.TextSecondary,
    fontSize: 12,
  },
  warnRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: BridgeColors.Border,
  },
  warn: {
    color: BridgeColors.AccentAmber,
    fontSize: 11,
    fontFamily: Mono.fontFamily,
  },
  logout: {
    color: BridgeColors.TextTertiary,
    fontFamily: Mono.fontFamily,
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: "700",
    paddingBottom: 16,
  },
});
