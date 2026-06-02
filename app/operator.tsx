import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { t } from "@/i18n";
import { useSession } from "@/store/session.store";
import { BridgeCard, BridgeColors, Mono, ScreenHeader } from "@/ui";

export default function OperatorHome() {
  const { session, clearRole, signOut } = useSession();
  const name =
    session?.fullName ?? session?.email?.split("@")[0] ?? null;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.body}>
        <ScreenHeader title={t("operator.title")} onBack={clearRole} />

        <Text style={styles.heroSub}>
          {name ? t("operator.signedInAs", { name }) : ""}{" "}
          {t("operator.phase0Hint")}
        </Text>

        <BridgeCard accent={BridgeColors.Magenta}>
          <Text style={[styles.cardTitle, { color: BridgeColors.Magenta }]}>
            {t("operator.upNext")}
          </Text>
          <Text style={styles.bullet}>· {t("operator.bulletLive")}</Text>
          <Text style={styles.bullet}>· {t("operator.bulletChat")}</Text>
          <Text style={styles.bullet}>· {t("operator.bulletPerms")}</Text>
        </BridgeCard>

        <View style={{ flex: 1 }} />
        <View style={styles.row}>
          <Pressable onPress={clearRole} style={styles.linkBtn}>
            <Text style={styles.linkTxt}>{t("streamer.switchRole")}</Text>
          </Pressable>
          <Pressable onPress={signOut} style={styles.linkBtn}>
            <Text style={styles.linkTxt}>{t("common.signOut")}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BridgeColors.Background },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 8, gap: 14 },
  heroSub: {
    color: BridgeColors.TextTertiary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
  },
  cardTitle: {
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
