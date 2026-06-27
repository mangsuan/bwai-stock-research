import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { apiFetch, API_BASE } from "@/lib/api";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<{ name: string; label: string }[]>([]);
  const { login, loginWithToken } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  useEffect(() => {
    fetch(`${API_BASE}/auth/providers`)
      .then((res) => res.json())
      .then((data) => setProviders(data.providers || []))
      .catch(() => {});
  }, []);

  async function handleOAuthCallback(code: string) {
    try {
      const res = await apiFetch(`/auth/google/callback?code=${code}`);
      if (res.ok) {
        const data = await res.json();
        if (data.access_token) {
          await loginWithToken(data.access_token);
          router.back();
        }
      }
    } catch {
      Alert.alert("OAuth Error", "Failed to complete authentication");
    }
  }

  async function handleLogin() {
    setLoading(true);
    try {
      await login(username, password);
      router.back();
    } catch (err: unknown) {
      Alert.alert("Login Failed", err instanceof Error ? err.message : "Try again");
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: string) {
    try {
      const result = await WebBrowser.openAuthSessionAsync(
        `${API_BASE}/auth/${provider}`,
        AuthSession.makeRedirectUri({ scheme: "bwai" })
      );

      if (result.type === "success" && result.url) {
        const url = new URL(result.url);
        const t = url.searchParams.get("token");
        if (t) {
          await loginWithToken(t);
          router.back();
        }
      }
    } catch {
      Alert.alert("OAuth Error", "Failed to open authentication");
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Sign In</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Welcome back to BWAI</Text>

        {/* OAuth Buttons */}
        {providers.length > 0 && (
          <View style={styles.oauthContainer}>
            {providers.map((p) => (
              <TouchableOpacity
                key={p.name}
                style={[
                  styles.oauthButton,
                  { borderColor: colors.cardBorder, backgroundColor: colors.card },
                  p.name === "facebook" && styles.oauthButtonFacebook,
                ]}
                onPress={() => handleOAuth(p.name)}
              >
                <Text style={[styles.oauthIcon, { color: colors.text }]}>{p.name === "google" ? "G" : "f"}</Text>
                <Text style={[styles.oauthText, { color: colors.text }, p.name === "facebook" && styles.oauthTextWhite]}>
                  Continue with {p.label}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.cardBorder }]} />
              <Text style={[styles.dividerText, { color: colors.textMuted }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.cardBorder }]} />
            </View>
          </View>
        )}

        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder, color: colors.text }]}
          placeholder="Username"
          placeholderTextColor={colors.textMuted}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder, color: colors.text }]}
          placeholder="Password"
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.accent }, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading || !username.trim() || !password.trim()}
        >
          <Text style={styles.buttonText}>
            {loading ? "Signing in..." : "Sign In"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace("/register")}>
          <Text style={[styles.link, { color: colors.textSecondary }]}>
            Don&apos;t have an account? <Text style={[styles.linkBold, { color: colors.accent }]}>Create one</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 36, fontWeight: "600", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 17, textAlign: "center", marginBottom: 40 },
  oauthContainer: { marginBottom: 20 },
  oauthButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  oauthButtonFacebook: {
    backgroundColor: "#1877F2",
    borderColor: "#1877F2",
  },
  oauthIcon: {
    fontSize: 20,
    fontWeight: "700",
    width: 24,
    textAlign: "center",
  },
  oauthText: {
    fontSize: 16,
    fontWeight: "500",
  },
  oauthTextWhite: {
    color: "#ffffff",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    fontSize: 17,
    marginBottom: 14,
  },
  button: {
    borderRadius: 980,
    padding: 18,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#ffffff", fontSize: 17, fontWeight: "500" },
  link: { fontSize: 15, textAlign: "center" },
  linkBold: { fontWeight: "500" },
});
