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
import { useTheme } from "@/contexts/ThemeContext";

const FALLBACK_TICKERS = ["AAPL", "NVDA", "TSLA", "MSFT", "AMZN", "GOOG"];

export default function HomeScreen() {
  const [ticker, setTicker] = useState("");
  const [quickTickers, setQuickTickers] = useState(FALLBACK_TICKERS);
  const { colors } = useTheme();
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
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={[styles.title, { color: colors.text }]}>BWAI</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Stock research powered by{"\n"}multiple AI agents
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.cardBorder, color: colors.text }]}
            placeholder="Enter stock ticker (e.g., AAPL)"
            placeholderTextColor={colors.textMuted}
            value={ticker}
            onChangeText={setTicker}
            onSubmitEditing={handleSearch}
            autoCapitalize="characters"
            maxLength={10}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.accent }, !ticker.trim() && styles.buttonDisabled]}
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
              style={[styles.tickerChip, { backgroundColor: colors.card }]}
              onPress={() => router.push(`/research/${t}`)}
            >
              <Text style={[styles.tickerText, { color: colors.text }]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <Text style={[styles.featuresTitle, { color: colors.text }]}>How it works</Text>

          <View style={[styles.featureCard, { backgroundColor: colors.card }]}>
            <Text style={styles.featureIcon}>🔍</Text>
            <Text style={[styles.featureTitle, { color: colors.text }]}>Enter a Ticker</Text>
            <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
              Type any stock symbol to begin your research
            </Text>
          </View>

          <View style={[styles.featureCard, { backgroundColor: colors.card }]}>
            <Text style={styles.featureIcon}>🤖</Text>
            <Text style={[styles.featureTitle, { color: colors.text }]}>AI Agents Analyze</Text>
            <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
              Multiple AI agents research the stock in parallel
            </Text>
          </View>

          <View style={[styles.featureCard, { backgroundColor: colors.card }]}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={[styles.featureTitle, { color: colors.text }]}>Get Synthesis</Text>
            <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
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
    letterSpacing: -2,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 26,
  },
  searchContainer: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    fontSize: 17,
    textAlign: "center",
    marginBottom: 12,
  },
  button: {
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
    borderRadius: 980,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tickerText: {
    fontSize: 15,
    fontWeight: "500",
  },
  featuresContainer: {
    gap: 16,
  },
  featuresTitle: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  featureCard: {
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
    marginBottom: 6,
  },
  featureDesc: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});
