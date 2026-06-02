import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useSession } from "@/store/session.store";
import { BridgeColors } from "@/ui";

/**
 * Splash + initial-route dispatcher. The global SessionRouter watches phase
 * changes from anywhere in the tree; this screen just hands off the first
 * navigation when the app boots from scratch.
 */
export default function Index() {
  const { phase, role } = useSession();

  useEffect(() => {
    if (phase === "loading") return;
    if (phase === "loggedOut") {
      router.replace("/auth/login");
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
