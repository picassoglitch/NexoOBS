import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "@/store/session.store";
import { BridgeCard, BridgeColors, Mono, TopBar } from "@/ui";

/**
 * Placeholder — real Streamer dashboard lands in commit 4 with remote
 * preview, chat drawer, permission toggles, and destinations.
 */
export default function StreamerHome() {
  const { profile, clearRole, logout } = useSession();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.body}>
        <TopBar onSettings={() => {}} />

        <Text style={styles.hero}>STREAMER MODE</Text>
        <Text style={styles.heroSub}>
          {profile?.name ? `Signed in as ${profile.name}.` : ""} Phase-0 home —
          commit 4 layers in the live dashboard, chat drawer, and permission
          toggles.
        </Text>

        <BridgeCard accent={BridgeColors.Primary}>
          <Text style={styles.cardTitle}>UP NEXT IN PHASE 0</Text>
          <Text style={styles.bullet}>· Streamer dashboard (commit 4)</Text>
          <Text style={styles.bullet}>· Real Kick chat (commit 5)</Text>
          <Text style={styles.bullet}>· Permission toggles (commit 6)</Text>
        </BridgeCard>

        <View style={{ flex: 1 }} />
        <View style={styles.row}>
          <Pressable onPress={clearRole} style={styles.linkBtn}>
            <Text style={styles.linkTxt}>SWITCH ROLE</Text>
          </Pressable>
          <Pressable onPress={logout} style={styles.linkBtn}>
            <Text style={styles.linkTxt}>SIGN OUT</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
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
  },
  cardTitle: {
    color: BridgeColors.Primary,
    fontFamily: Mono.fontFamily,
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  bullet: { color: BridgeColors.TextSecondary, fontSize: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    paddingBottom: 16,
  },
  linkBtn: { padding: 8 },
  linkTxt: {
    color: BridgeColors.TextTertiary,
    fontFamily: Mono.fontFamily,
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: "700",
  },
});
