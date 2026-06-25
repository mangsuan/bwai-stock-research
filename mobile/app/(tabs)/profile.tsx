import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { apiFetch } from "@/lib/api";
import MemberBadge from "@/components/MemberBadge";

export default function ProfileScreen() {
  const { user, token, logout, refreshUser, updateProfile } = useAuth();
  const { theme, colors, toggleTheme } = useTheme();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pointsInfo, setPointsInfo] = useState<any>(null);
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);
  const [buyAmount, setBuyAmount] = useState("50");
  const [earnAmount, setEarnAmount] = useState("10");

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || "");
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      fetchPoints();
    }
  }, [token]);

  async function fetchPoints() {
    try {
      const [pointsRes, historyRes] = await Promise.all([
        apiFetch("/member/points", { headers: { Authorization: `Bearer ${token}` } }),
        apiFetch("/member/history", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (pointsRes.ok) setPointsInfo(await pointsRes.json());
      if (historyRes.ok) setPointsHistory(await historyRes.json());
    } catch {
      // ignore
    }
  }

  if (!user) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={styles.avatarEmoji}>👤</Text>
        <Text style={[styles.title, { color: colors.text }]}>Welcome to BWAI</Text>
        <Text style={[styles.desc, { color: colors.textSecondary }]}>
          Sign in to access your profile and watchlist
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.accent }]}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buttonSecondary, { borderColor: colors.accent }]}
          onPress={() => router.push("/register")}
        >
          <Text style={[styles.buttonSecondaryText, { color: colors.accent }]}>Create Account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function handleAvatarUpload() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    setUploading(true);
    try {
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append("file", {
        uri: asset.uri,
        name: "avatar.jpg",
        type: "image/jpeg",
      } as any);

      const res = await apiFetch("/auth/avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      await refreshUser();
      setMessage({ type: "success", text: "Avatar updated!" });
    } catch {
      setMessage({ type: "error", text: "Failed to upload avatar" });
    } finally {
      setUploading(false);
    }
  }

  async function handleSaveProfile() {
    setSaving(true);
    setMessage(null);
    try {
      await updateProfile({ display_name: displayName || undefined });
      setMessage({ type: "success", text: "Profile updated!" });
    } catch {
      setMessage({ type: "error", text: "Failed to save profile" });
    } finally {
      setSaving(false);
    }
  }

  async function handleBuyPoints() {
    const amount = parseInt(buyAmount) || 0;
    if (amount <= 0) return;
    try {
      const res = await apiFetch("/member/points/purchase", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setPointsInfo(data);
      await refreshUser();
      await fetchPoints();
      setMessage({ type: "success", text: `Purchased ${amount} points!` });
    } catch {
      setMessage({ type: "error", text: "Failed to purchase points" });
    }
  }

  async function handleEarnPoints() {
    const amount = parseInt(earnAmount) || 0;
    if (amount <= 0) return;
    try {
      const res = await apiFetch("/member/points/earn", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount, description: "Ad reward" }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setPointsInfo(data);
      await refreshUser();
      await fetchPoints();
      setMessage({ type: "success", text: `Earned ${amount} points!` });
    } catch {
      setMessage({ type: "error", text: "Failed to earn points" });
    }
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {message && (
        <View style={[styles.messageBox, { backgroundColor: message.type === "success" ? "#d1fae5" : "#fee2e2" }]}>
          <Text style={{ color: message.type === "success" ? "#065f46" : "#991b1b", fontSize: 14 }}>
            {message.text}
          </Text>
        </View>
      )}

      {/* Avatar */}
      <TouchableOpacity onPress={handleAvatarUpload} disabled={uploading} style={styles.avatarWrapper}>
        {user.avatar_url ? (
          <View style={[styles.avatarCircle, { borderColor: colors.cardBorder }]}>
            <Text style={styles.avatarText}>{user.display_name?.charAt(0) || user.username.charAt(0)}</Text>
          </View>
        ) : (
          <View style={[styles.avatarCircle, { backgroundColor: colors.accent }]}>
            <Text style={styles.avatarInitial}>
              {(user.display_name || user.username).charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={[styles.cameraBtn, { backgroundColor: colors.accent }]}>
          <Text style={styles.cameraIcon}>{uploading ? "..." : "📷"}</Text>
        </View>
      </TouchableOpacity>

      <Text style={[styles.username, { color: colors.text }]}>{user.display_name || user.username}</Text>
      <Text style={[styles.handle, { color: colors.textSecondary }]}>@{user.username}</Text>
      <Text style={[styles.email, { color: colors.textMuted }]}>{user.email}</Text>

      {/* Edit Profile */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Edit Profile</Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Display Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder, color: colors.text }]}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder={user.username}
          placeholderTextColor={colors.textMuted}
        />
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.accent }]}
          onPress={handleSaveProfile}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? "Saving..." : "Save Changes"}</Text>
        </TouchableOpacity>
      </View>

      {/* Theme */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.themeRow}>
          <View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Appearance</Text>
            <Text style={[styles.themeDesc, { color: colors.textSecondary }]}>
              Currently using {theme} mode
            </Text>
          </View>
          <TouchableOpacity onPress={toggleTheme} style={[styles.toggle, { backgroundColor: theme === "dark" ? colors.accent : "#e5e5ea" }]}>
            <View style={[styles.toggleKnob, { transform: [{ translateX: theme === "dark" ? 20 : 0 }] }]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Member Section */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Membership</Text>
        <MemberBadge
          level={user.member_level}
          points={user.total_points}
          showProgress
          progressPct={pointsInfo?.progress_pct ?? 0}
          pointsToNext={pointsInfo?.points_to_next}
          nextThreshold={pointsInfo?.next_threshold}
          darkMode={theme === "dark"}
        />

        {/* Earn Points */}
        <View style={[styles.divider, { borderColor: colors.cardBorder }]} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Earn Points (Watch Ads)</Text>
        <View style={styles.pointsRow}>
          <TextInput
            style={[styles.pointsInput, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder, color: colors.text }]}
            value={earnAmount}
            onChangeText={setEarnAmount}
            keyboardType="numeric"
            placeholderTextColor={colors.textMuted}
          />
          <TouchableOpacity style={[styles.earnBtn, { backgroundColor: colors.accent }]} onPress={handleEarnPoints}>
            <Text style={styles.earnBtnText}>Watch Ad (+{earnAmount})</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.hint, { color: colors.textMuted }]}>Simulated ad watching for demo</Text>

        {/* Buy Points */}
        <View style={[styles.divider, { borderColor: colors.cardBorder }]} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Buy Points</Text>
        <View style={styles.pointsRow}>
          <TextInput
            style={[styles.pointsInput, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder, color: colors.text }]}
            value={buyAmount}
            onChangeText={setBuyAmount}
            keyboardType="numeric"
            placeholderTextColor={colors.textMuted}
          />
          <TouchableOpacity style={[styles.buyBtn, { borderColor: colors.accent }]} onPress={handleBuyPoints}>
            <Text style={[styles.buyBtnText, { color: colors.accent }]}>Buy {buyAmount} Points</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Points History */}
      {pointsHistory.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Points History</Text>
          {pointsHistory.map((txn: any) => (
            <View key={txn.id} style={[styles.historyItem, { borderColor: colors.cardBorder }]}>
              <View>
                <Text style={[styles.historySource, { color: colors.text }]}>
                  {txn.source === "ad_reward" ? "🎬 Ad Reward" : "💰 Purchase"}
                </Text>
                {txn.description && (
                  <Text style={[styles.historyDesc, { color: colors.textMuted }]}>{txn.description}</Text>
                )}
              </View>
              <Text style={[styles.historyAmount, { color: colors.success }]}>+{txn.amount}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Sign Out */}
      <TouchableOpacity style={[styles.logoutButton, { borderColor: colors.error }]} onPress={logout}>
        <Text style={[styles.logoutText, { color: colors.error }]}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={[styles.version, { color: colors.textMuted }]}>BWAI v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { alignItems: "center", padding: 24, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  avatarEmoji: { fontSize: 64, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "600", marginBottom: 8 },
  desc: { fontSize: 15, textAlign: "center", marginBottom: 32 },
  button: { borderRadius: 980, paddingHorizontal: 40, paddingVertical: 16, marginBottom: 12 },
  buttonText: { color: "#ffffff", fontSize: 17, fontWeight: "500" },
  buttonSecondary: { borderWidth: 1, borderRadius: 980, paddingHorizontal: 40, paddingVertical: 16 },
  buttonSecondaryText: { fontSize: 17, fontWeight: "500" },
  messageBox: { width: "100%", borderRadius: 16, padding: 16, marginBottom: 16 },
  avatarWrapper: { position: "relative", marginBottom: 16, marginTop: 20 },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
  },
  avatarInitial: { fontSize: 36, fontWeight: "600", color: "#ffffff" },
  avatarText: { fontSize: 36, fontWeight: "600", color: "#ffffff" },
  cameraBtn: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraIcon: { fontSize: 14 },
  username: { fontSize: 24, fontWeight: "600", marginBottom: 2 },
  handle: { fontSize: 15, marginBottom: 4 },
  email: { fontSize: 13, marginBottom: 24 },
  card: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16 },
  label: { fontSize: 14, marginBottom: 8 },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    fontSize: 17,
    marginBottom: 16,
  },
  saveBtn: { borderRadius: 980, paddingVertical: 14, alignItems: "center" },
  saveBtnText: { color: "#ffffff", fontSize: 17, fontWeight: "500" },
  themeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  themeDesc: { fontSize: 14, marginTop: 4 },
  toggle: { width: 50, height: 30, borderRadius: 15, padding: 3, justifyContent: "center" },
  toggleKnob: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#ffffff", shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  divider: { borderTopWidth: 1, marginVertical: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "500", marginBottom: 12 },
  pointsRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  pointsInput: {
    width: 80,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 16,
    textAlign: "center",
  },
  earnBtn: { flex: 1, borderRadius: 980, paddingVertical: 12, alignItems: "center" },
  earnBtnText: { color: "#ffffff", fontSize: 15, fontWeight: "500" },
  buyBtn: { flex: 1, borderRadius: 980, borderWidth: 1, paddingVertical: 12, alignItems: "center" },
  buyBtnText: { fontSize: 15, fontWeight: "500" },
  hint: { fontSize: 12, marginTop: 8 },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  historySource: { fontSize: 14, fontWeight: "500" },
  historyDesc: { fontSize: 12, marginTop: 2 },
  historyAmount: { fontSize: 16, fontWeight: "600" },
  logoutButton: {
    borderWidth: 1,
    borderRadius: 980,
    paddingHorizontal: 40,
    paddingVertical: 16,
    width: "100%",
    alignItems: "center",
    marginTop: 8,
  },
  logoutText: { fontSize: 17, fontWeight: "500" },
  version: { fontSize: 12, marginTop: 24 },
});
