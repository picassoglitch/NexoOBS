import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { t } from "@/i18n";
import { useSession } from "@/store/session.store";
import { BridgeCard, BridgeColors, Mono, TopBar } from "@/ui";

const SIGNUP_URL = "https://nexo-ai.world/sign-up";

export default function LoginScreen() {
  const { signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    if (!email || !password) {
      setError(t("login.error"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("login.error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.body}>
          <TopBar />
          <Text style={styles.hero}>{t("login.title")}</Text>
          <Text style={styles.heroSub}>{t("login.subtitle")}</Text>

          <BridgeCard>
            <Text style={styles.label}>{t("login.email")}</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              placeholder="tu@correo.com"
              placeholderTextColor={BridgeColors.TextTertiary}
              style={styles.input}
            />
            <View style={{ height: 12 }} />
            <Text style={styles.label}>{t("login.password")}</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              placeholder="••••••••"
              placeholderTextColor={BridgeColors.TextTertiary}
              style={styles.input}
            />
          </BridgeCard>

          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            onPress={onSubmit}
            disabled={busy}
            style={[styles.cta, busy && styles.ctaDisabled]}
          >
            {busy ? (
              <ActivityIndicator color={BridgeColors.Background} />
            ) : (
              <Text style={styles.ctaTxt}>{t("login.cta")}</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => Linking.openURL(SIGNUP_URL)}
            style={styles.noAccountBtn}
          >
            <Text style={styles.noAccountTxt}>{t("login.noAccount")}</Text>
          </Pressable>

          <Text style={styles.footer}>{t("login.footer")}</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BridgeColors.Background },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 8, gap: 14 },
  hero: {
    color: BridgeColors.TextPrimary,
    fontFamily: Mono.fontFamily,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 2,
    marginTop: 24,
  },
  heroSub: {
    color: BridgeColors.TextTertiary,
    fontSize: 12,
    lineHeight: 17,
  },
  label: {
    color: BridgeColors.TextTertiary,
    fontFamily: Mono.fontFamily,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    color: BridgeColors.TextPrimary,
    backgroundColor: BridgeColors.SurfaceElevated,
    borderWidth: 1,
    borderColor: BridgeColors.Border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: Mono.fontFamily,
    fontSize: 14,
  },
  error: {
    color: BridgeColors.AccentRed,
    fontSize: 12,
    paddingHorizontal: 4,
  },
  cta: {
    height: 56,
    borderRadius: 12,
    backgroundColor: BridgeColors.Primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  ctaDisabled: { opacity: 0.5 },
  ctaTxt: {
    color: BridgeColors.Background,
    fontFamily: Mono.fontFamily,
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 2,
  },
  noAccountBtn: { alignSelf: "center", padding: 6 },
  noAccountTxt: {
    color: BridgeColors.Primary,
    fontFamily: Mono.fontFamily,
    fontSize: 12,
    letterSpacing: 1,
  },
  footer: {
    color: BridgeColors.TextTertiary,
    fontSize: 11,
    textAlign: "center",
    marginTop: "auto",
    paddingBottom: 24,
  },
});
