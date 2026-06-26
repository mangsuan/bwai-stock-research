import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

interface WatchlistItem {
  ticker: string;
  added_at: string | null;
}

export default function WatchlistScreen() {
  const { user, token } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTicker, setNewTicker] = useState("");

  useEffect(() => {
    if (token) fetchWatchlist();
    else setLoading(false);
  }, [token]);

  async function fetchWatchlist() {
    try {
      const res = await apiFetch("/watchlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setItems(await res.json());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function addTicker() {
    const ticker = newTicker.trim().toUpperCase();
    if (!ticker || !token) return;

    try {
      const res = await apiFetch("/watchlist", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ticker }),
      });
      if (res.ok) {
        setNewTicker("");
        fetchWatchlist();
      }
    } catch {
      // ignore
    }
  }

  async function removeTicker(ticker: string) {
    if (!token) return;
    try {
      const res = await apiFetch(`/watchlist/${ticker}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setItems(items.filter((i) => i.ticker !== ticker));
    } catch {
      // ignore
    }
  }

  if (!user) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={[styles.lockTitle, { color: colors.text }]}>Sign in required</Text>
        <Text style={[styles.lockDesc, { color: colors.textSecondary }]}>Login to save your favorite stocks</Text>
        <TouchableOpacity
          style={[styles.signInButton, { backgroundColor: colors.accent }]}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Add ticker */}
      <View style={styles.addRow}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.cardBorder, color: colors.text }]}
          placeholder="Add ticker (e.g., AAPL)"
          placeholderTextColor={colors.textMuted}
          value={newTicker}
          onChangeText={setNewTicker}
          onSubmitEditing={addTicker}
          autoCapitalize="characters"
          maxLength={10}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.accent }, !newTicker.trim() && styles.addButtonDisabled]}
          onPress={addTicker}
          disabled={!newTicker.trim()}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>⭐</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No stocks yet</Text>
          <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>Add some tickers to start tracking</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.ticker}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              onPress={() => router.push(`/research/${item.ticker}`)}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.cardIcon, { backgroundColor: colors.card }]}>
                  <Text style={[styles.cardIconText, { color: colors.text }]}>{item.ticker.charAt(0)}</Text>
                </View>
                <View>
                  <Text style={[styles.cardTicker, { color: colors.accent }]}>{item.ticker}</Text>
                  {item.added_at && (
                    <Text style={[styles.cardDate, { color: colors.textMuted }]}>
                      Added {new Date(item.added_at).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                onPress={() => removeTicker(item.ticker)}
                style={styles.removeBtn}
              >
                <Text style={[styles.removeText, { color: colors.textMuted }]}>✕</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  lockIcon: { fontSize: 48, marginBottom: 16 },
  lockTitle: { fontSize: 22, fontWeight: "600", marginBottom: 8 },
  lockDesc: { fontSize: 15, marginBottom: 24 },
  signInButton: { borderRadius: 980, paddingHorizontal: 32, paddingVertical: 14 },
  signInText: { color: "#ffffff", fontSize: 17, fontWeight: "500" },
  addRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    fontSize: 17,
    fontFamily: "SpaceMono",
  },
  addButton: { borderRadius: 980, paddingHorizontal: 24, justifyContent: "center" },
  addButtonDisabled: { opacity: 0.4 },
  addButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "500" },
  empty: { alignItems: "center", marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "600", marginBottom: 8 },
  emptyDesc: { fontSize: 15 },
  list: { gap: 12 },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardIconText: { fontSize: 20, fontWeight: "600", fontFamily: "SpaceMono" },
  cardTicker: { fontSize: 18, fontWeight: "600", fontFamily: "SpaceMono" },
  cardDate: { fontSize: 12, marginTop: 2 },
  removeBtn: { padding: 8 },
  removeText: { fontSize: 16 },
});
