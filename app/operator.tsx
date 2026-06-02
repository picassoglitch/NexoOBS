import { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { t } from "@/i18n";
import { useSession } from "@/store/session.store";
import { usePermissions } from "@/store/permissions.store";
import {
  BridgeColors,
  ChatDrawer,
  ChatOverlay,
  HealthBar,
  Mono,
  ScreenHeader,
} from "@/ui";

/**
 * Camera Operator live view. In Phase 0 (Expo Go) we point the phone camera
 * via expo-camera; in Phase 2 (dev build) the Osmo Pocket 3 UVC source takes
 * over via the CameraSource interface. The layout is full-bleed preview with
 * floating HUD overlays so the operator can monitor live without occluding
 * the frame more than necessary.
 */
export default function OperatorLive() {
  const { session, clearRole, signOut } = useSession();
  const { permissions } = usePermissions();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [isLive, setIsLive] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const canControlStream = permissions.streamControlAllowed;

  const name = session?.fullName ?? session?.email?.split("@")[0] ?? null;

  // Lazy-load CameraView so iOS / web (no UVC + Apple's USB block) doesn't
  // try to negotiate before we even render.
  const { CameraView, useCameraPermissions } = require("expo-camera") as
    typeof import("expo-camera");
  const [permission, requestPermission] = useCameraPermissions();

  if (permission && !permission.granted && permission.canAskAgain) {
    void requestPermission();
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {/* Full-bleed camera surface. */}
      {permission?.granted ? (
        <CameraView style={StyleSheet.absoluteFill} mode="video" facing="back" />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.permFallback]}>
          <Text style={styles.permTitle}>
            {permission?.canAskAgain === false
              ? t("camera.permDenied")
              : t("camera.permRequest")}
          </Text>
          <Text style={styles.permHint}>{t("camera.permHint")}</Text>
        </View>
      )}

      {/* Top overlay — header, source, chips. */}
      <LinearGradient
        colors={["rgba(0,0,0,0.85)", "rgba(0,0,0,0)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.topOverlay, isLandscape && styles.topOverlayLandscape]}
        pointerEvents="box-none"
      >
        <ScreenHeader
          title={t("operator.title")}
          onBack={clearRole}
          right={
            <Pressable onPress={signOut} hitSlop={8}>
              <Text style={styles.signOutPill}>{t("common.signOut")}</Text>
            </Pressable>
          }
        />
        {name && (
          <Text style={styles.greeting}>
            {t("operator.signedInAs", { name })}
          </Text>
        )}
        <View style={styles.sourceRow}>
          <Text style={styles.sourceLabel}>{t("operator.sourceLabel")}</Text>
          <Text style={styles.sourceValue}>
            {Platform.OS === "ios"
              ? t("values.phoneCam")
              : t("values.phoneCam")}
          </Text>
        </View>
      </LinearGradient>

      {/* Bottom overlay — health bar, chat peek, big stop CTA. */}
      <LinearGradient
        colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.9)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.bottomOverlay, isLandscape && styles.bottomOverlayLandscape]}
        pointerEvents="box-none"
      >
        <HealthBar
          cells={[
            { label: t("operator.healthBitrate"), value: "—", highlight: "warn" },
            { label: t("operator.healthFps"), value: "—" },
            { label: t("operator.healthDrops"), value: "0", highlight: "good" },
            { label: t("operator.healthRtt"), value: "—" },
            { label: t("operator.healthBat"), value: "—" },
          ]}
        />

        <ChatOverlay onExpand={() => setChatOpen(true)} />

        <View style={styles.ctaRow}>
          <Pressable
            onPress={() => canControlStream && setIsLive((v) => !v)}
            disabled={!canControlStream}
            style={[
              styles.cta,
              {
                borderColor: !canControlStream
                  ? BridgeColors.TextTertiary
                  : isLive
                    ? BridgeColors.AccentRed
                    : BridgeColors.AccentGreen,
                backgroundColor: !canControlStream
                  ? "rgba(111, 117, 128, 0.18)"
                  : isLive
                    ? "rgba(255, 77, 109, 0.18)"
                    : "rgba(0, 255, 163, 0.18)",
              },
            ]}
          >
            <Text
              style={[
                styles.ctaTxt,
                {
                  color: !canControlStream
                    ? BridgeColors.TextTertiary
                    : isLive
                      ? BridgeColors.AccentRed
                      : BridgeColors.AccentGreen,
                },
              ]}
            >
              {isLive ? t("streamer.stopStream") : t("streamer.goLive")}
            </Text>
          </Pressable>
        </View>

        {!canControlStream && (
          <Text style={styles.permGated}>{t("operator.permGated")}</Text>
        )}

        <Text style={styles.osmoTip}>{t("operator.osmoTip")}</Text>
      </LinearGradient>

      <ChatDrawer visible={chatOpen} onClose={() => setChatOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#000" },
  permFallback: {
    backgroundColor: BridgeColors.Background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  permTitle: {
    color: BridgeColors.TextPrimary,
    fontFamily: Mono.fontFamily,
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 1.5,
    textAlign: "center",
  },
  permHint: {
    color: BridgeColors.TextTertiary,
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  topOverlayLandscape: { paddingTop: 8 },
  greeting: {
    color: BridgeColors.TextPrimary,
    fontFamily: Mono.fontFamily,
    fontSize: 11,
    marginTop: 6,
    letterSpacing: 1,
  },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  sourceLabel: {
    color: BridgeColors.TextTertiary,
    fontFamily: Mono.fontFamily,
    fontSize: 9,
    letterSpacing: 1.2,
  },
  sourceValue: {
    color: BridgeColors.Primary,
    fontFamily: Mono.fontFamily,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  signOutPill: {
    color: BridgeColors.TextTertiary,
    fontFamily: Mono.fontFamily,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  bottomOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 24,
    gap: 12,
  },
  bottomOverlayLandscape: { paddingBottom: 12 },
  chatPeek: {
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BridgeColors.PrimarySoft,
    padding: 10,
  },
  chatPeekTxt: {
    color: BridgeColors.TextTertiary,
    fontFamily: Mono.fontFamily,
    fontSize: 10,
    letterSpacing: 1.5,
    textAlign: "center",
  },
  ctaRow: { flexDirection: "row", gap: 10 },
  cta: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaTxt: {
    fontFamily: Mono.fontFamily,
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 2,
  },
  osmoTip: {
    color: BridgeColors.TextTertiary,
    fontSize: 10,
    textAlign: "center",
    fontStyle: "italic",
  },
  permGated: {
    color: BridgeColors.AccentAmber,
    fontFamily: Mono.fontFamily,
    fontSize: 11,
    letterSpacing: 0.6,
    textAlign: "center",
  },
});
