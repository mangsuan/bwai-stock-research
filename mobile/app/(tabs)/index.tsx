import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { API_BASE } from "../../lib/api";

const FALLBACK_TICKERS = ["AAPL", "NVDA", "TSLA", "MSFT", "AMZN", "GOOG"];

export default function HomeScreen() {
  const [ticker, setTicker] = useState("");
  const [quickTickers, setQuickTickers] = useState(FALLBACK_TICKERS);
  const router = useRouter();

  useEffect(() => {
    fetch(`${API_BASE}/stocks/popular`)
      .then((res) => res.json())
      .then((data) => {
        if (data.stocks?.length) {
          setQuickTickers(data.stocks.map((s: { symbol: string }) => s.symbol));
        }
      })
      .catch(() => {});
  }, []);

  function handleSearch() {
    const cleaned = ticker.trim().toUpperCase();
    if (cleaned) {
      router.push(`/research/${cleaned}`);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.title}>BWAI</Text>
          <Text style={styles.subtitle}>
            Stock research powered by{"\n"}multiple AI agents
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter stock ticker (e.g., AAPL)"
            placeholderTextColor="#86868b"
            value={ticker}
            onChangeText={setTicker}
            onSubmitEditing={handleSearch}
            autoCapitalize="characters"
            maxLength={10}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={[styles.button, !ticker.trim() && styles.buttonDisabled]}
            onPress={handleSearch}
            disabled={!ticker.trim()}
          >
            <Text style={styles.buttonText}>Analyze</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Tickers */}
        <View style={styles.tickersContainer}>
          {quickTickers.map((t) => (
            <TouchableOpacity
              key={t}
              style={styles.tickerChip}
              onPress={() => router.push(`/research/${t}`)}
            >
              <Text style={styles.tickerText}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>How it works</Text>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🔍</Text>
            <Text style={styles.featureTitle}>Enter a Ticker</Text>
            <Text style={styles.featureDesc}>
              Type any stock symbol to begin your research
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🤖</Text>
            <Text style={styles.featureTitle}>AI Agents Analyze</Text>
            <Text style={styles.featureDesc}>
              Multiple AI agents research the stock in parallel
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureTitle}>Get Synthesis</Text>
            <Text style={styles.featureDesc}>
              A judge AI combines all feedback into one report
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  hero: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 64,
    fontWeight: "600",
    color: "#1d1d1f",
    letterSpacing: -2,
  },
  subtitle: {
    fontSize: 18,
    color: "#6e6e73",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 26,
  },
  searchContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#fbfbfd",
    borderWidth: 1,
    borderColor: "#d2d2d7",
    borderRadius: 16,
    padding: 18,
    fontSize: 17,
    color: "#1d1d1f",
    textAlign: "center",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#0071e3",
    borderRadius: 980,
    padding: 16,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "500",
  },
  tickersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginBottom: 40,
  },
  tickerChip: {
    backgroundColor: "#f5f5f7",
    borderRadius: 980,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tickerText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1d1d1f",
  },
  featuresContainer: {
    gap: 16,
  },
  featuresTitle: {
    fontSize: 28,
    fontWeight: "600",
    color: "#1d1d1f",
    textAlign: "center",
    marginBottom: 8,
  },
  featureCard: {
    backgroundColor: "#f5f5f7",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  featureIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1d1d1f",
    marginBottom: 6,
  },
  featureDesc: {
    fontSize: 15,
    color: "#6e6e73",
    textAlign: "center",
    lineHeight: 22,
  },
});
