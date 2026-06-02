import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { t } from "@/i18n";
import { useSession } from "@/store/session.store";
import { useChat } from "@/store/chat.store";
import {
  BridgeCard,
  BridgeColors,
  CameraPreview,
  ChatDrawer,
  GoLiveButton,
  Mono,
  QuickPill,
  ScreenHeader,
  StatusChip,
} from "@/ui";

/**
 * Streamer dashboard — the role the user picks on iPhone or Android when they
 * want to watch what the operator is shooting + control the broadcast.
 *
 * Phase 0 scope: full visual shell with mock telemetry. Real WebRTC remote
 * preview lands in Phase 3; real chat in commit 5; permission writes in commit
 * 6. Everything is wired against the local useState so the UI feels real even
 * before the wire goes live.
 */
export default function StreamerHome() {
  const { session, clearRole, signOut } = useSession();
  const { channel: kickChannel, status: kickStatus } = useChat();
  const [isLive, setIsLive] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [perms, setPerms] = useState({
    chatReply: false,
    streamControl: true,
    destSwitch: false,
  });

  const name = session?.fullName ?? session?.email?.split("@")[0] ?? null;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title={t("streamer.title")} onBack={clearRole} />

        {name && (
          <Text style={styles.greeting}>
            {t("streamer.signedInAs", { name })}
          </Text>
        )}
        <Text style={styles.sub}>{t("streamer.sub")}</Text>

        {/* Operator chips strip — telemetry the operator's device reports. */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 8 }}
        >
          <StatusChip
            label={t("chips.role")}
            value={t("values.operator")}
            health="warn"
          />
          <StatusChip
            label={t("chips.cam")}
            value={t("values.phoneCam")}
            health="good"
          />
          <StatusChip
            label={t("chips.net")}
            value="WIFI·92%"
            health="good"
          />
          <StatusChip label={t("chips.bat")} value="78%" health="good" />
          <StatusChip
            label={t("chips.out")}
            value={t("values.noDestinations")}
            health="warn"
          />
          <StatusChip
            label={t("chips.chat")}
            value={`KICK·${kickChannel.toUpperCase()}`}
            health={
              kickStatus === "open"
                ? "good"
                : kickStatus === "error"
                  ? "bad"
                  : kickStatus === "idle"
                    ? "idle"
                    : "warn"
            }
            onPress={() => setChatOpen(true)}
          />
        </ScrollView>

        <Text style={styles.sectionLabel}>{t("streamer.sectionStream")}</Text>
        <CameraPreview isLive={isLive} remote />

        <Text style={styles.sectionLabel}>{t("streamer.destinations")}</Text>
        <BridgeCard accent={BridgeColors.AccentAmber}>
          <Text style={styles.placeholderTxt}>
            Configura destinos en commit 5 (Kick) y commit 6+.
          </Text>
        </BridgeCard>

        <Text style={styles.sectionLabel}>
          {t("streamer.sectionPermissions")}
        </Text>
        <BridgeCard>
          <PermRow
            label={t("streamer.permChatReply")}
            value={perms.chatReply}
            onChange={(v) => setPerms((p) => ({ ...p, chatReply: v }))}
          />
          <Divider />
          <PermRow
            label={t("streamer.permStreamControl")}
            value={perms.streamControl}
            onChange={(v) => setPerms((p) => ({ ...p, streamControl: v }))}
          />
          <Divider />
          <PermRow
            label={t("streamer.permSwitch")}
            value={perms.destSwitch}
            onChange={(v) => setPerms((p) => ({ ...p, destSwitch: v }))}
          />
          <Text style={styles.permHint}>{t("streamer.permLaterHint")}</Text>
        </BridgeCard>

        <Text style={styles.sectionLabel}>{t("streamer.sectionActions")}</Text>
        <GoLiveButton
          isLive={isLive}
          anyEnabled
          durationMs={isLive ? Date.now() % 200_000 : 0}
          subtitle={
            isLive ? t("streamer.goLiveSubLive") : t("streamer.goLiveSubIdle")
          }
          onPress={() => setIsLive((v) => !v)}
        />
        <View style={styles.pillsRow}>
          <QuickPill
            label={t("streamer.actChat")}
            onPress={() => setChatOpen(true)}
            style={{ flex: 1 }}
          />
          <QuickPill
            label={t("streamer.actHealth")}
            onPress={() => {}}
            style={{ flex: 1 }}
          />
          <QuickPill
            label={t("streamer.actDestinations")}
            onPress={() => router.push("/diagnostics" as never)}
            style={{ flex: 1 }}
          />
        </View>

        <ChatDrawer visible={chatOpen} onClose={() => setChatOpen(false)} />

        <View style={styles.footerRow}>
          <Pressable onPress={clearRole} style={styles.linkBtn}>
            <Text style={styles.linkTxt}>{t("streamer.switchRole")}</Text>
          </Pressable>
          <Pressable onPress={signOut} style={styles.linkBtn}>
            <Text style={styles.linkTxt}>{t("common.signOut")}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PermRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.permRow}>
      <Text style={styles.permLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{
          true: BridgeColors.Primary,
          false: BridgeColors.SurfaceHigh,
        }}
        thumbColor={
          value ? BridgeColors.Background : BridgeColors.TextTertiary
        }
      />
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BridgeColors.Background },
  body: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 12,
  },
  greeting: {
    color: BridgeColors.TextPrimary,
    fontFamily: Mono.fontFamily,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 10,
  },
  sub: {
    color: BridgeColors.TextTertiary,
    fontSize: 12,
    lineHeight: 17,
  },
  sectionLabel: {
    color: BridgeColors.TextTertiary,
    fontFamily: Mono.fontFamily,
    fontSize: 10,
    letterSpacing: 1.5,
    marginTop: 10,
    marginBottom: -2,
  },
  placeholderTxt: { color: BridgeColors.TextSecondary, fontSize: 12 },
  permRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  permLabel: {
    color: BridgeColors.TextPrimary,
    fontSize: 13,
    flex: 1,
    paddingRight: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BridgeColors.Border,
    marginVertical: 4,
  },
  permHint: {
    color: BridgeColors.TextTertiary,
    fontSize: 11,
    marginTop: 8,
    fontStyle: "italic",
  },
  pillsRow: { flexDirection: "row", gap: 10 },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 16,
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
