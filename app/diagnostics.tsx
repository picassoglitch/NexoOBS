import { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Clipboard from "expo-clipboard";
import { t } from "@/i18n";
import { useSession } from "@/store/session.store";
import { usePermissions } from "@/store/permissions.store";
import { useChat } from "@/store/chat.store";
import {
  enabledDestinationsList,
  useDestinations,
} from "@/destinations/store";
import { PLATFORM_META } from "@/destinations/types";
import { BridgeCard, BridgeColors, Mono, ScreenHeader } from "@/ui";

function runtimeLabel(): string {
  switch (Constants.executionEnvironment) {
    case ExecutionEnvironment.StoreClient:
      return t("diagnostics.runtimeExpoGo");
    case ExecutionEnvironment.Standalone:
    case "bare":
      return t("diagnostics.runtimeBare");
    default:
      return t("diagnostics.runtimeDevClient");
  }
}

export default function DiagnosticsScreen() {
  const { session, signOut } = useSession();
  const { permissions } = usePermissions();
  const { destinations, clearAll } = useDestinations();
  const { channel: kickChannel, status: kickStatus, error: kickError } = useChat();
  const [copyHint, setCopyHint] = useState<string | null>(null);

  const enabled = enabledDestinationsList(destinations);
  const isExpoGo =
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

  const appName = (Constants.expoConfig?.name as string | undefined) ?? "Nexo-AI World";
  const appVersion =
    (Constants.expoConfig?.version as string | undefined) ?? "0.0.0";
  const sdkVersion = Constants.expoConfig?.sdkVersion ?? "?";

  async function copyDebug() {
    const bundle = {
      app: { name: appName, version: appVersion, sdkVersion },
      runtime: runtimeLabel(),
      device: {
        platform: Platform.OS,
        osVersion: Platform.Version,
        model: Constants.deviceName ?? null,
      },
      session: session
        ? {
            userId: session.userId,
            email: session.email,
            fullName: session.fullName,
            tier: session.tier,
            role: session.role,
            selectedEngineId: session.selectedEngineId,
          }
        : null,
      destinations: enabled.map((d) => ({
        platformId: d.platformId,
        channelSlug: d.channelSlug,
        hasStreamKey: d.streamKey.length > 0,
      })),
      chat: { kickChannel, kickStatus, kickError },
      permissions,
    };
    await Clipboard.setStringAsync(JSON.stringify(bundle, null, 2));
    setCopyHint(t("diagnostics.copied"));
    setTimeout(() => setCopyHint(null), 1800);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScreenHeader
        title={t("diagnostics.title")}
        onBack={() => router.back()}
      />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.intro}>{t("diagnostics.intro")}</Text>

        <Section title={t("diagnostics.sectionApp")}>
          <Row label="name" value={appName} />
          <Row label="version" value={appVersion} />
          <Row label="expo sdk" value={String(sdkVersion)} />
          <Row label="runtime" value={runtimeLabel()} highlight />
        </Section>

        <Section title={t("diagnostics.sectionDevice")}>
          <Row label="platform" value={Platform.OS} />
          <Row label="os version" value={String(Platform.Version)} />
          <Row
            label="device"
            value={Constants.deviceName ?? t("diagnostics.notSet")}
          />
        </Section>

        <Section title={t("diagnostics.sectionSession")}>
          {session ? (
            <>
              <Row label="email" value={session.email ?? "—"} />
              <Row label="full_name" value={session.fullName ?? "—"} />
              <Row label="userId" value={session.userId} mono />
              <Row label="tier" value={session.tier} highlight />
              <Row label="role" value={session.role} />
              <Row
                label="selected_engine_id"
                value={session.selectedEngineId ?? t("diagnostics.none")}
              />
            </>
          ) : (
            <Text style={styles.dim}>{t("diagnostics.none")}</Text>
          )}
        </Section>

        <Section title={t("diagnostics.sectionDestinations")}>
          {enabled.length === 0 ? (
            <Text style={styles.dim}>{t("diagnostics.none")}</Text>
          ) : (
            enabled.map((d) => (
              <View key={d.platformId} style={styles.destBlock}>
                <Text style={styles.destTitle}>
                  {PLATFORM_META[d.platformId].displayName}
                </Text>
                <Row
                  label="channel"
                  value={d.channelSlug || t("diagnostics.notSet")}
                />
                <Row
                  label="stream key"
                  value={
                    d.streamKey.length > 0
                      ? t("diagnostics.keyPresent")
                      : t("diagnostics.keyMissing")
                  }
                  highlight={d.streamKey.length > 0}
                />
              </View>
            ))
          )}
        </Section>

        <Section title={t("diagnostics.sectionChat")}>
          <Row
            label="channel"
            value={kickChannel || t("diagnostics.notSet")}
          />
          <Row label="status" value={kickStatus} highlight />
          {kickError && <Row label="error" value={kickError} />}
        </Section>

        <Section title={t("diagnostics.sectionPermissions")}>
          <Row
            label="chatReplyAllowed"
            value={permissions.chatReplyAllowed ? t("diagnostics.yes") : t("diagnostics.no")}
          />
          <Row
            label="streamControlAllowed"
            value={
              permissions.streamControlAllowed
                ? t("diagnostics.yes")
                : t("diagnostics.no")
            }
          />
          <Row
            label="destinationSwitchAllowed"
            value={
              permissions.destinationSwitchAllowed
                ? t("diagnostics.yes")
                : t("diagnostics.no")
            }
          />
        </Section>

        <Section title={t("diagnostics.sectionModules")}>
          <Text style={styles.dim}>
            {isExpoGo
              ? t("diagnostics.modulesPhase0")
              : t("diagnostics.modulesDevClient")}
          </Text>
        </Section>

        <Text style={styles.sectionLabel}>{t("diagnostics.actionsTitle")}</Text>
        <View style={styles.actions}>
          <ActionButton
            label={t("diagnostics.actionCopyDebug")}
            color={BridgeColors.Primary}
            onPress={copyDebug}
          />
          <ActionButton
            label={t("diagnostics.actionClearDestinations")}
            color={BridgeColors.AccentAmber}
            onPress={() => void clearAll()}
          />
          <ActionButton
            label={t("diagnostics.actionSignOut")}
            color={BridgeColors.AccentRed}
            onPress={() => void signOut()}
          />
        </View>

        {copyHint && <Text style={styles.copyHint}>{copyHint}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Text style={styles.sectionLabel}>{title}</Text>
      <BridgeCard>{children}</BridgeCard>
    </>
  );
}

function Row({
  label,
  value,
  highlight,
  mono,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  mono?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text
        style={[
          styles.rowValue,
          highlight && { color: BridgeColors.Primary },
          mono && { fontFamily: Mono.fontFamily, fontSize: 11 },
        ]}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

function ActionButton({
  label,
  color,
  onPress,
}: {
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.action, { borderColor: color }]}
    >
      <Text style={[styles.actionTxt, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BridgeColors.Background },
  body: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 32, gap: 10 },
  intro: {
    color: BridgeColors.TextTertiary,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 6,
  },
  sectionLabel: {
    color: BridgeColors.TextTertiary,
    fontFamily: Mono.fontFamily,
    fontSize: 10,
    letterSpacing: 1.5,
    marginTop: 10,
    marginBottom: -2,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 4,
    gap: 12,
  },
  rowLabel: {
    color: BridgeColors.TextTertiary,
    fontFamily: Mono.fontFamily,
    fontSize: 11,
    width: 130,
  },
  rowValue: {
    flex: 1,
    color: BridgeColors.TextPrimary,
    fontSize: 13,
    textAlign: "right",
  },
  dim: { color: BridgeColors.TextTertiary, fontSize: 12, fontStyle: "italic" },
  destBlock: {
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: BridgeColors.Border,
  },
  destTitle: {
    color: BridgeColors.Primary,
    fontFamily: Mono.fontFamily,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 4,
  },
  actions: { gap: 8, marginTop: 4 },
  action: {
    height: 48,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTxt: {
    fontFamily: Mono.fontFamily,
    fontWeight: "900",
    letterSpacing: 1.5,
    fontSize: 12,
  },
  copyHint: {
    color: BridgeColors.AccentGreen,
    fontFamily: Mono.fontFamily,
    fontSize: 11,
    textAlign: "center",
    letterSpacing: 1,
    marginTop: 6,
  },
});
