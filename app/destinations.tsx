import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { t } from "@/i18n";
import {
  DestinationConfig,
  PLATFORM_META,
  PLATFORM_ORDER,
  PlatformId,
} from "@/destinations/types";
import { useDestinations } from "@/destinations/store";
import { BridgeCard, BridgeColors, Mono, ScreenHeader } from "@/ui";

export default function DestinationsScreen() {
  const { destinations, update, toggleEnabled } = useDestinations();
  const [expanded, setExpanded] = useState<PlatformId | null>(null);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScreenHeader title={t("destinations.title")} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.intro}>{t("destinations.intro")}</Text>
        {PLATFORM_ORDER.map((id) => (
          <DestinationRow
            key={id}
            destination={destinations[id]}
            expanded={expanded === id}
            onExpand={() => setExpanded((cur) => (cur === id ? null : id))}
            onToggle={() => void toggleEnabled(id)}
            onChange={(patch) => void update(id, patch)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

interface RowProps {
  destination: DestinationConfig;
  expanded: boolean;
  onExpand: () => void;
  onToggle: () => void;
  onChange: (patch: Partial<DestinationConfig>) => void;
}

function DestinationRow({
  destination,
  expanded,
  onExpand,
  onToggle,
  onChange,
}: RowProps) {
  const meta = PLATFORM_META[destination.platformId];
  const [revealKey, setRevealKey] = useState(false);

  return (
    <BridgeCard accent={destination.enabled ? meta.accent : undefined}>
      <Pressable onPress={onExpand}>
        <View style={styles.row}>
          <View
            style={[
              styles.dot,
              { backgroundColor: `${meta.accent}33`, borderColor: meta.accent },
            ]}
          />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.name}>{meta.displayName}</Text>
            <Text style={styles.phase}>{meta.phaseNote}</Text>
            <Text style={styles.summary} numberOfLines={1}>
              {destination.channelSlug
                ? `${t("destinations.slug")}: ${destination.channelSlug}`
                : t("destinations.notConfigured")}
            </Text>
          </View>
          <Switch
            value={destination.enabled}
            onValueChange={onToggle}
            trackColor={{
              true: meta.accent,
              false: BridgeColors.SurfaceHigh,
            }}
            thumbColor={
              destination.enabled
                ? BridgeColors.Background
                : BridgeColors.TextTertiary
            }
          />
        </View>
      </Pressable>

      {expanded && (
        <View style={styles.expanded}>
          {meta.supportsChat && (
            <Field
              label={t("destinations.channel")}
              value={destination.channelSlug}
              placeholder="picassoglitch"
              prefix={`${meta.displayName.toLowerCase()}.com/`}
              onChange={(v) =>
                onChange({ channelSlug: v.trim().toLowerCase() })
              }
            />
          )}
          {(destination.platformId === "custom_rtmp" ||
            destination.platformId === "custom_srt") && (
            <Field
              label={t("destinations.ingestUrl")}
              value={destination.ingestUrl}
              placeholder={
                destination.platformId === "custom_srt"
                  ? "srt://host:port"
                  : "rtmp://host/app"
              }
              onChange={(v) => onChange({ ingestUrl: v.trim() })}
            />
          )}
          {meta.supportsBroadcast && (
            <Field
              label={t("destinations.streamKey")}
              value={destination.streamKey}
              placeholder="live_xxx..."
              secure={!revealKey}
              trailing={
                <Pressable
                  onPress={() => setRevealKey((v) => !v)}
                  style={styles.revealBtn}
                  hitSlop={8}
                >
                  <Text style={styles.revealTxt}>
                    {revealKey ? t("destinations.hide") : t("destinations.reveal")}
                  </Text>
                </Pressable>
              }
              onChange={(v) => onChange({ streamKey: v })}
            />
          )}
        </View>
      )}
    </BridgeCard>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  prefix?: string;
  secure?: boolean;
  trailing?: React.ReactNode;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  prefix,
  secure,
  trailing,
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldRow}>
        {prefix && <Text style={styles.fieldPrefix}>{prefix}</Text>}
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={BridgeColors.TextTertiary}
          secureTextEntry={secure}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.fieldInput}
        />
        {trailing}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BridgeColors.Background },
  body: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 32, gap: 12 },
  intro: {
    color: BridgeColors.TextTertiary,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 4,
  },
  row: { flexDirection: "row", alignItems: "center" },
  dot: { width: 40, height: 40, borderRadius: 12, borderWidth: 1 },
  name: {
    color: BridgeColors.TextPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  phase: {
    color: BridgeColors.TextTertiary,
    fontFamily: Mono.fontFamily,
    fontSize: 10,
    letterSpacing: 0.6,
    marginTop: 2,
  },
  summary: { color: BridgeColors.TextSecondary, fontSize: 12, marginTop: 4 },
  expanded: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: BridgeColors.Border,
    gap: 10,
  },
  field: { gap: 6 },
  fieldLabel: {
    color: BridgeColors.TextTertiary,
    fontFamily: Mono.fontFamily,
    fontSize: 10,
    letterSpacing: 1,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BridgeColors.SurfaceElevated,
    borderWidth: 1,
    borderColor: BridgeColors.Border,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  fieldPrefix: {
    color: BridgeColors.TextTertiary,
    fontFamily: Mono.fontFamily,
    fontSize: 12,
  },
  fieldInput: {
    flex: 1,
    color: BridgeColors.TextPrimary,
    paddingVertical: 10,
    fontFamily: Mono.fontFamily,
    fontSize: 13,
  },
  revealBtn: { paddingHorizontal: 8 },
  revealTxt: {
    color: BridgeColors.Primary,
    fontFamily: Mono.fontFamily,
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: "700",
  },
});
