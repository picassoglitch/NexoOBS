import { useEffect, useRef } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { t } from "@/i18n";
import { BridgeColors, Mono } from "../theme/colors";

interface Props {
  isLive: boolean;
  /** Phase 0 = phone-cam stand-in. Phase 2 swaps to the Osmo UVC source. */
  facing?: "front" | "back";
  /** When true (streamer mode), don't open the camera — show a remote
   *  preview placeholder instead. Real WebRTC ingest lands in Phase 3. */
  remote?: boolean;
}

/**
 * 16:9 preview shell with HUD overlays. In operator mode it renders the
 * phone camera via expo-camera (works in Expo Go). In streamer mode it
 * renders a remote-preview placeholder.
 */
export function CameraPreview({ isLive, facing = "back", remote }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (remote) return;
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission, remote]);

  const borderColor = isLive
    ? BridgeColors.Magenta
    : BridgeColors.PrimaryHover;

  return (
    <View style={[styles.shell, { borderColor }]}>
      {remote ? (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderTitle}>{t("camera.remote.title")}</Text>
          <Text style={styles.placeholderSub}>{t("camera.remote.sub")}</Text>
        </View>
      ) : permission?.granted ? (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          mode="video"
        />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderTitle}>
            {permission?.canAskAgain === false
              ? t("camera.permDenied")
              : t("camera.permRequest")}
          </Text>
          <Text style={styles.placeholderSub}>
            {Platform.OS === "web"
              ? t("camera.webHint")
              : t("camera.permHint")}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 16,
    backgroundColor: "#05050A",
    borderWidth: 2,
    overflow: "hidden",
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  placeholderTitle: {
    color: BridgeColors.TextPrimary,
    fontFamily: Mono.fontFamily,
    fontWeight: "700",
    fontSize: 13,
    textAlign: "center",
    letterSpacing: 1.5,
  },
  placeholderSub: {
    color: BridgeColors.TextTertiary,
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 17,
  },
});
