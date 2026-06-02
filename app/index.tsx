import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BridgeCard,
  BridgeColors,
  GoLiveButton,
  Mono,
  QuickPill,
  Segmented,
  StatusChip,
  TopBar,
} from "@/ui";

type Mode = "solo" | "co_op" | "multicast";

/**
 * Phase-0 gallery — exercises every primitive so we can eyeball them on
 * device. Replaced by the real role/auth flow in commit 3.
 */
export default function GalleryPlaceholder() {
  const [mode, setMode] = useState<Mode>("solo");
  const [isLive, setIsLive] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <TopBar onSettings={() => {}} />

        <Text style={styles.sectionLabel}>STATUS CHIPS</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 8 }}
        >
          <StatusChip label="ROLE" value="STREAMER" health="good" />
          <StatusChip label="CAM" value="OSMO" health="good" />
          <StatusChip label="NET" value="WIFI·92%" health="good" />
          <StatusChip label="BAT" value="78%" health="good" />
          <StatusChip label="CHAT" value="KICK" health="warn" />
        </ScrollView>

        <Text style={styles.sectionLabel}>SEGMENTED</Text>
        <Segmented
          value={mode}
          onChange={setMode}
          segments={[
            { id: "solo", label: "SOLO" },
            { id: "co_op", label: "CO-OP" },
            { id: "multicast", label: "MULTICAST" },
          ]}
        />

        <Text style={styles.sectionLabel}>GO LIVE</Text>
        <GoLiveButton
          isLive={isLive}
          anyEnabled
          durationMs={isLive ? Date.now() % 200_000 : 0}
          subtitle="Kick · YouTube · Twitch"
          onPress={() => setIsLive((v) => !v)}
        />

        <Text style={styles.sectionLabel}>QUICK PILLS</Text>
        <View style={styles.pillRow}>
          <QuickPill label="CHAT" onPress={() => {}} style={{ flex: 1 }} />
          <QuickPill label="HEALTH" onPress={() => {}} style={{ flex: 1 }} />
          <QuickPill
            label="DESTINATIONS"
            onPress={() => {}}
            style={{ flex: 1 }}
          />
        </View>

        <Text style={styles.sectionLabel}>CARD STATES</Text>
        <BridgeCard>
          <Text style={styles.cardTitle}>DEFAULT CARD</Text>
          <Text style={styles.cardBody}>
            Used for neutral information panels — chat statuses, recent
            messages, telemetry rows.
          </Text>
        </BridgeCard>
        <View style={{ height: 12 }} />
        <BridgeCard accent={BridgeColors.AccentAmber}>
          <Text style={[styles.cardTitle, { color: BridgeColors.AccentAmber }]}>
            WARNING CARD
          </Text>
          <Text style={styles.cardBody}>
            Used for permission gates, missing setup, fallback active states.
          </Text>
        </BridgeCard>
        <View style={{ height: 12 }} />
        <BridgeCard accent={BridgeColors.AccentGreen}>
          <Text style={[styles.cardTitle, { color: BridgeColors.AccentGreen }]}>
            SUCCESS CARD
          </Text>
          <Text style={styles.cardBody}>
            Used for live-streaming-OK, claimed-interface, healthy outputs.
          </Text>
        </BridgeCard>

        <Text style={styles.footer}>Phase 0 · commit 2 · UI primitives</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BridgeColors.Background,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 12,
  },
  sectionLabel: {
    color: BridgeColors.TextTertiary,
    fontFamily: Mono.fontFamily,
    fontSize: 10,
    letterSpacing: 1.5,
    marginTop: 14,
    marginBottom: 2,
  },
  pillRow: {
    flexDirection: "row",
    gap: 10,
  },
  cardTitle: {
    color: BridgeColors.TextPrimary,
    fontFamily: Mono.fontFamily,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  cardBody: {
    color: BridgeColors.TextSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  footer: {
    color: BridgeColors.TextTertiary,
    fontSize: 10,
    textAlign: "center",
    marginTop: 24,
    fontFamily: Mono.fontFamily,
  },
});
