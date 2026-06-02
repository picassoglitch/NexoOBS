import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { t } from "@/i18n";
import { useSession } from "@/store/session.store";
import type { Role } from "@/backend";
import { BridgeColors, Mono, ScreenHeader } from "@/ui";

const isIOS = Platform.OS === "ios";

export default function LobbyScreen() {
  const { profile, selectRole, clearProfile, logout } = useSession();

  const subtitle = profile?.name
    ? t("lobby.subtitleNamed", { name: profile.name })
    : t("lobby.subtitle");

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.body}>
        <ScreenHeader title={t("topBar.title")} onBack={clearProfile} />

        <Text style={styles.hero}>{t("lobby.title")}</Text>
        <Text style={styles.heroSub}>{subtitle}</Text>

        <RoleCard
          id="streamer"
          title={t("lobby.streamer.title")}
          subtitle={t("lobby.streamer.sub")}
          bullets={[
            t("lobby.streamer.bulletA"),
            t("lobby.streamer.bulletB"),
            t("lobby.streamer.bulletC"),
          ]}
          accent={BridgeColors.Primary}
          onPick={() => selectRole("streamer")}
        />
        <RoleCard
          id="operator"
          title={t("lobby.operator.title")}
          subtitle={t("lobby.operator.sub")}
          bullets={[
            isIOS
              ? t("lobby.operator.bulletUsbAndroid")
              : t("lobby.operator.bulletUsbConnect"),
            t("lobby.operator.bulletStreams"),
            t("lobby.operator.bulletChatPerm"),
          ]}
          accent={BridgeColors.Magenta}
          onPick={() => selectRole("operator")}
          warning={isIOS ? t("lobby.operator.iosWarning") : undefined}
        />

        <View style={{ flex: 1 }} />
        <Pressable onPress={logout} style={{ alignSelf: "center", padding: 8 }}>
          <Text style={styles.logout}>{t("common.signOut")}</Text>
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
    <Pressable onPress={onPick}>
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
    marginTop: 12,
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
