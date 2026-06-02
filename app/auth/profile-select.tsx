import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { t } from "@/i18n";
import { useSession } from "@/store/session.store";
import type { Profile } from "@/backend";
import { BridgeCard, BridgeColors, Mono, ScreenHeader } from "@/ui";

export default function ProfileSelectScreen() {
  const { profiles, selectProfile, logout } = useSession();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.body}>
        <ScreenHeader title={t("topBar.title")} onBack={logout} />
        <Text style={styles.hero}>{t("profileSelect.title")}</Text>
        <Text style={styles.heroSub}>{t("profileSelect.subtitle")}</Text>

        <FlatList
          data={profiles}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <ProfileRow profile={item} onPress={() => selectProfile(item.id)} />
          )}
          ListEmptyComponent={
            <BridgeCard accent={BridgeColors.AccentAmber}>
              <Text style={styles.empty}>{t("profileSelect.empty")}</Text>
            </BridgeCard>
          }
        />

        <Pressable style={styles.create} onPress={() => {}}>
          <Text style={styles.createTxt}>{t("profileSelect.createProfile")}</Text>
        </Pressable>
        <Pressable onPress={logout} style={{ alignSelf: "center", padding: 8 }}>
          <Text style={styles.logout}>{t("common.signOut")}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function ProfileRow({
  profile,
  onPress,
}: {
  profile: Profile;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <BridgeCard>
        <View style={styles.row}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>
              {profile.name.slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.handle}>
              {profile.handle}
              {profile.lastRole
                ? ` · ${t("profileSelect.lastAs")}: ${profile.lastRole.toUpperCase()}`
                : ""}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </View>
      </BridgeCard>
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
  empty: { color: BridgeColors.TextSecondary, fontSize: 12 },
  row: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BridgeColors.SurfaceHigh,
    borderWidth: 1,
    borderColor: BridgeColors.PrimarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTxt: {
    color: BridgeColors.Primary,
    fontFamily: Mono.fontFamily,
    fontWeight: "900",
    fontSize: 18,
  },
  name: {
    color: BridgeColors.TextPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  handle: {
    color: BridgeColors.TextTertiary,
    fontFamily: Mono.fontFamily,
    fontSize: 11,
    marginTop: 2,
  },
  chevron: {
    color: BridgeColors.TextTertiary,
    fontSize: 28,
    marginLeft: 8,
  },
  create: {
    borderWidth: 1,
    borderColor: BridgeColors.PrimarySoft,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  createTxt: {
    color: BridgeColors.Primary,
    fontFamily: Mono.fontFamily,
    fontWeight: "800",
    letterSpacing: 1.5,
    fontSize: 12,
  },
  logout: {
    color: BridgeColors.TextTertiary,
    fontFamily: Mono.fontFamily,
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: "700",
  },
});
