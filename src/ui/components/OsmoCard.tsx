import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { t } from "@/i18n";
import { useUsbCamera } from "@/hooks/useUsbCamera";
import { BridgeColors, Mono } from "../theme/colors";
import { BridgeCard } from "./BridgeCard";

/**
 * Operator-mode card that drives the Osmo USB capture flow.
 *
 *   no module       → "necesita dev client" (Expo Go / iOS)
 *   no device       → idle hint
 *   no permission   → "GRANT USB PERMISSION" → system dialog
 *   permission OK   → "WAKE OSMO (CLAIM UVC)" → claimInterface (Osmo
 *                       leaves idle countdown the instant the interface
 *                       is claimed)
 *   initialized     → green; "RELEASE OSMO"
 *   pump active     → shows negotiated resolution + format
 */
export function OsmoCard() {
  const {
    available,
    reason,
    device,
    initialized,
    initializeResult,
    initializing,
    permissionPending,
    previewActive,
    previewResult,
    pumpError,
    requestPermission,
    initialize,
    release,
  } = useUsbCamera();

  if (!available) {
    return (
      <BridgeCard accent={BridgeColors.AccentAmber}>
        <Text style={styles.headerWarn}>{t("osmo.headerDevClientRequired")}</Text>
        <Text style={styles.body}>{reason ?? t("osmo.reasonGeneric")}</Text>
      </BridgeCard>
    );
  }

  if (!device) {
    return (
      <BridgeCard>
        <Text style={styles.headerIdle}>{t("osmo.headerNotConnected")}</Text>
        <Text style={styles.body}>{t("osmo.notConnectedHint")}</Text>
      </BridgeCard>
    );
  }

  const label =
    device.productName ??
    `USB Camera ${device.vendorHex}/${device.productHex}`;

  return (
    <BridgeCard
      accent={
        initialized
          ? BridgeColors.AccentGreen
          : device.permissionGranted
            ? BridgeColors.AccentBlue
            : BridgeColors.AccentAmber
      }
    >
      <View style={styles.headerRow}>
        <Text
          style={[
            styles.headerOk,
            initialized && { color: BridgeColors.AccentGreen },
          ]}
        >
          {device.isDji ? "OSMO" : "USB UVC"} · {label.toUpperCase()}
        </Text>
        <Text style={styles.idHex}>
          {device.vendorHex}/{device.productHex}
        </Text>
      </View>
      <Text style={styles.body}>
        {initialized
          ? previewActive
            ? t("osmo.streaming", {
                w: previewResult?.width ?? "?",
                h: previewResult?.height ?? "?",
                fps: previewResult?.fps ?? "?",
                fmt: previewResult?.format ?? "",
                uvc: initializeResult?.uvcVersion
                  ? ` · UVC ${initializeResult.uvcVersion}`
                  : "",
              })
            : t("osmo.claimedStartingPreview", {
                uvc: initializeResult?.uvcVersion
                  ? ` UVC ${initializeResult.uvcVersion}`
                  : "",
              })
          : device.permissionGranted
            ? t("osmo.tapWake")
            : t("osmo.tapGrantPermission")}
      </Text>
      {!device.permissionGranted ? (
        <Pressable
          onPress={requestPermission}
          disabled={permissionPending}
          style={[styles.btn, { borderColor: BridgeColors.AccentAmber }]}
        >
          {permissionPending ? (
            <ActivityIndicator color={BridgeColors.AccentAmber} />
          ) : (
            <Text style={[styles.btnTxt, { color: BridgeColors.AccentAmber }]}>
              {t("osmo.grantPermission")}
            </Text>
          )}
        </Pressable>
      ) : !initialized ? (
        <Pressable
          onPress={initialize}
          disabled={initializing}
          style={[styles.btn, { borderColor: BridgeColors.AccentBlue }]}
        >
          {initializing ? (
            <ActivityIndicator color={BridgeColors.AccentBlue} />
          ) : (
            <Text style={[styles.btnTxt, { color: BridgeColors.AccentBlue }]}>
              {t("osmo.wake")}
            </Text>
          )}
        </Pressable>
      ) : (
        <Pressable
          onPress={release}
          style={[styles.btn, { borderColor: BridgeColors.AccentRed }]}
        >
          <Text style={[styles.btnTxt, { color: BridgeColors.AccentRed }]}>
            {t("osmo.release")}
          </Text>
        </Pressable>
      )}
      {initializeResult?.message && !initialized && (
        <Text style={[styles.body, { color: BridgeColors.AccentRed, marginTop: 8 }]}>
          {initializeResult.message}
        </Text>
      )}
      {pumpError && (
        <Text style={[styles.body, { color: BridgeColors.AccentRed, marginTop: 8 }]}>
          {t("osmo.pumpError", { message: pumpError })}
        </Text>
      )}
    </BridgeCard>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerOk: {
    color: BridgeColors.AccentBlue,
    fontFamily: Mono.fontFamily,
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 1.2,
  },
  headerWarn: {
    color: BridgeColors.AccentAmber,
    fontFamily: Mono.fontFamily,
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  headerIdle: {
    color: BridgeColors.TextTertiary,
    fontFamily: Mono.fontFamily,
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  idHex: {
    color: BridgeColors.TextTertiary,
    fontFamily: Mono.fontFamily,
    fontSize: 10,
  },
  body: {
    color: BridgeColors.TextSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
  },
  btn: {
    marginTop: 12,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  btnTxt: {
    fontFamily: Mono.fontFamily,
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 1.5,
  },
});
