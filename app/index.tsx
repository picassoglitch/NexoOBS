import { StyleSheet, Text, View } from "react-native";

export default function HomePlaceholder() {
  return (
    <View style={styles.shell}>
      <Text style={styles.headline}>NEXO-AI WORLD</Text>
      <Text style={styles.sub}>
        Phase 0 scaffold — real UI lands in commit 2.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: "#05050A",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  headline: {
    color: "#00E5FF",
    fontFamily: "monospace",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 2,
  },
  sub: {
    color: "#A0A6B0",
    marginTop: 12,
    fontSize: 13,
    textAlign: "center",
  },
});
