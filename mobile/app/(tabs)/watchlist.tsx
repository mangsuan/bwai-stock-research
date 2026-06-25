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

interface WatchlistItem {
  ticker: string;
  added_at: string | null;
}

export default function WatchlistScreen() {
  const { user, token } = useAuth();
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
      <View style={styles.centered}>
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={styles.lockTitle}>Sign in required</Text>
        <Text style={styles.lockDesc}>Login to save your favorite stocks</Text>
        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Add ticker */}
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="Add ticker (e.g., AAPL)"
          placeholderTextColor="#86868b"
          value={newTicker}
          onChangeText={setNewTicker}
          onSubmitEditing={addTicker}
          autoCapitalize="characters"
          maxLength={10}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.addButton, !newTicker.trim() && styles.addButtonDisabled]}
          onPress={addTicker}
          disabled={!newTicker.trim()}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0071e3" style={{ marginTop: 40 }} />
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>⭐</Text>
          <Text style={styles.emptyTitle}>No stocks yet</Text>
          <Text style={styles.emptyDesc}>Add some tickers to start tracking</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.ticker}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/research/${item.ticker}`)}
            >
              <View style={styles.cardLeft}>
                <View style={styles.cardIcon}>
                  <Text style={styles.cardIconText}>{item.ticker.charAt(0)}</Text>
                </View>
                <View>
                  <Text style={styles.cardTicker}>{item.ticker}</Text>
                  {item.added_at && (
                    <Text style={styles.cardDate}>
                      Added {new Date(item.added_at).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                onPress={() => removeTicker(item.ticker)}
                style={styles.removeBtn}
              >
                <Text style={styles.removeText}>✕</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff", padding: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  lockIcon: { fontSize: 48, marginBottom: 16 },
  lockTitle: { fontSize: 22, fontWeight: "600", color: "#1d1d1f", marginBottom: 8 },
  lockDesc: { fontSize: 15, color: "#6e6e73", marginBottom: 24 },
  signInButton: { backgroundColor: "#0071e3", borderRadius: 980, paddingHorizontal: 32, paddingVertical: 14 },
  signInText: { color: "#ffffff", fontSize: 17, fontWeight: "500" },
  addRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  input: {
    flex: 1,
    backgroundColor: "#fbfbfd",
    borderWidth: 1,
    borderColor: "#d2d2d7",
    borderRadius: 16,
    padding: 14,
    fontSize: 17,
    color: "#1d1d1f",
    fontFamily: "SpaceMono",
  },
  addButton: { backgroundColor: "#0071e3", borderRadius: 980, paddingHorizontal: 24, justifyContent: "center" },
  addButtonDisabled: { opacity: 0.4 },
  addButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "500" },
  empty: { alignItems: "center", marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "600", color: "#1d1d1f", marginBottom: 8 },
  emptyDesc: { fontSize: 15, color: "#6e6e73" },
  list: { gap: 12 },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d2d2d7",
    padding: 16,
  },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#f5f5f7",
    alignItems: "center",
    justifyContent: "center",
  },
  cardIconText: { fontSize: 20, fontWeight: "600", color: "#1d1d1f", fontFamily: "SpaceMono" },
  cardTicker: { fontSize: 18, fontWeight: "600", color: "#0071e3", fontFamily: "SpaceMono" },
  cardDate: { fontSize: 12, color: "#86868b", marginTop: 2 },
  removeBtn: { padding: 8 },
  removeText: { fontSize: 16, color: "#86868b" },
});
