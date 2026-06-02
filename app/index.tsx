import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useSession } from "@/store/session.store";
import { BridgeColors } from "@/ui";

/**
 * Phase tracker. Hydrate from secure-store on first mount, then redirect to
 * the correct screen for the current session phase. While loading, render a
 * dark splash so we never flash the wrong screen.
 */
export default function Index() {
  const { phase, role } = useSession();

  useEffect(() => {
    if (phase === "loading") return;
    if (phase === "loggedOut") {
      router.replace("/auth/login");
      return;
    }
    if (phase === "needsProfile") {
      router.replace("/auth/profile-select");
      return;
    }
    if (phase === "needsRole") {
      router.replace("/lobby");
      return;
    }
    if (phase === "ready") {
      router.replace(role === "operator" ? "/operator" : "/streamer");
    }
  }, [phase, role]);

  return (
    <View style={styles.splash}>
      <ActivityIndicator color={BridgeColors.Primary} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: BridgeColors.Background,
    alignItems: "center",
    justifyContent: "center",
  },
});
