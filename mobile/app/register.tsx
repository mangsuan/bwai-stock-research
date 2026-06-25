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
import * as WebBrowser from "expo-web-browser";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE } from "@/lib/api";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<{ name: string; label: string }[]>([]);
  const { register } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetch(`${API_BASE}/auth/providers`)
      .then((res) => res.json())
      .then((data) => setProviders(data.providers || []))
      .catch(() => {});
  }, []);

  async function handleRegister() {
    setLoading(true);
    try {
      await register(username, email, password);
      router.back();
    } catch (err: unknown) {
      Alert.alert("Registration Failed", err instanceof Error ? err.message : "Try again");
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: string) {
    try {
      const result = await WebBrowser.openAuthSessionAsync(
        `${API_BASE}/auth/${provider}`,
        null
      );
      if (result.type === "success" && result.url) {
        router.back();
      }
    } catch {
      Alert.alert("OAuth Error", "Failed to open authentication");
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Start your research journey</Text>

        {/* OAuth Buttons */}
        {providers.length > 0 && (
          <View style={styles.oauthContainer}>
            {providers.map((p) => (
              <TouchableOpacity
                key={p.name}
                style={[styles.oauthButton, p.name === "facebook" && styles.oauthButtonFacebook]}
                onPress={() => handleOAuth(p.name)}
              >
                <Text style={styles.oauthIcon}>{p.name === "google" ? "G" : "f"}</Text>
                <Text style={[styles.oauthText, p.name === "facebook" && styles.oauthTextWhite]}>
                  Continue with {p.label}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#86868b"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#86868b"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#86868b"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading || !username.trim() || !email.trim() || !password.trim()}
        >
          <Text style={styles.buttonText}>
            {loading ? "Creating account..." : "Create Account"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace("/login")}>
          <Text style={styles.link}>
            Already have an account? <Text style={styles.linkBold}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  content: { flex: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 36, fontWeight: "600", color: "#1d1d1f", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 17, color: "#6e6e73", textAlign: "center", marginBottom: 40 },
  oauthContainer: { marginBottom: 20 },
  oauthButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#d2d2d7",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    backgroundColor: "#ffffff",
  },
  oauthButtonFacebook: {
    backgroundColor: "#1877F2",
    borderColor: "#1877F2",
  },
  oauthIcon: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1d1d1f",
    width: 24,
    textAlign: "center",
  },
  oauthText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1d1d1f",
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
    backgroundColor: "#d2d2d7",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#86868b",
  },
  input: {
    backgroundColor: "#fbfbfd",
    borderWidth: 1,
    borderColor: "#d2d2d7",
    borderRadius: 16,
    padding: 18,
    fontSize: 17,
    color: "#1d1d1f",
    marginBottom: 14,
  },
  button: {
    backgroundColor: "#0071e3",
    borderRadius: 980,
    padding: 18,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#ffffff", fontSize: 17, fontWeight: "500" },
  link: { fontSize: 15, color: "#6e6e73", textAlign: "center" },
  linkBold: { color: "#0071e3", fontWeight: "500" },
});
