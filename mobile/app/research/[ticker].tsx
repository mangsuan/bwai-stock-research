import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

interface AgentAnalysis {
  agent_name: string;
  model_id: string;
  summary: string;
  bull_factors: string[];
  bear_factors: string[];
  risks: string[];
  conclusion: string;
  response_time_ms: number | null;
}

interface StockResearch {
  ticker: string;
  company_name: string;
  sector: string;
  summary: string;
  bull_factors: string[];
  bear_factors: string[];
  risks: string[];
  conclusion: string;
  agents_used: string[];
  agent_analyses: AgentAnalysis[];
}

interface StockQuote {
  ticker: string;
  company_name: string;
  price: number | null;
  change_pct: number | null;
  market_cap: string | null;
  fifty_two_week_high: number | null;
  fifty_two_week_low: number | null;
}

export default function ResearchScreen() {
  const { ticker } = useLocalSearchParams<{ ticker: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const { colors } = useTheme();

  const [research, setResearch] = useState<StockResearch | null>(null);
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    fetchData();
  }, [ticker]);

  async function fetchData() {
    setLoading(true);
    setError(null);

    try {
      const [researchRes, quoteRes] = await Promise.all([
        apiFetch(`/research/${ticker}`),
        apiFetch(`/quote/${ticker}`),
      ]);

      if (!researchRes.ok) {
        const err = await researchRes.json();
        throw new Error(err.detail || "Failed to fetch research");
      }

      setResearch(await researchRes.json());
      if (quoteRes.ok) setQuote(await quoteRes.json());

      if (token) {
        const checkRes = await apiFetch(`/watchlist/${ticker}/check`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (checkRes.ok) {
          const data = await checkRes.json();
          setInWatchlist(data.in_watchlist);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function toggleWatchlist() {
    if (!token) return;
    try {
      if (inWatchlist) {
        await apiFetch(`/watchlist/${ticker}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        setInWatchlist(false);
      } else {
        await apiFetch(`/watchlist`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ticker }),
        });
        setInWatchlist(true);
      }
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Researching {ticker}…</Text>
        <Text style={[styles.loadingSubtext, { color: colors.textSecondary }]}>Querying multiple AI agents</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.linkText, { color: colors.accent }]}>← Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!research) return null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Header */}
      <Text style={[styles.sector, { color: colors.textSecondary }]}>{research.sector}</Text>
      <Text style={[styles.companyName, { color: colors.text }]}>{research.company_name}</Text>
      <Text style={[styles.ticker, { color: colors.textSecondary }]}>{research.ticker}</Text>

      {/* Price */}
      {quote && quote.price && (
        <View style={[styles.priceCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.price, { color: colors.text }]}>${quote.price.toFixed(2)}</Text>
          {quote.change_pct !== null && (
            <Text
              style={[
                styles.change,
                { color: quote.change_pct >= 0 ? "#34c759" : "#ff3b30" },
              ]}
            >
              {quote.change_pct >= 0 ? "+" : ""}
              {quote.change_pct.toFixed(2)}%
            </Text>
          )}
          <View style={styles.priceDetails}>
            {quote.market_cap && (
              <Text style={[styles.priceDetail, { color: colors.textSecondary }]}>Mkt Cap: {quote.market_cap}</Text>
            )}
            {quote.fifty_two_week_high && (
              <Text style={[styles.priceDetail, { color: colors.textSecondary }]}>
                52w High: ${quote.fifty_two_week_high.toFixed(2)}
              </Text>
            )}
            {quote.fifty_two_week_low && (
              <Text style={[styles.priceDetail, { color: colors.textSecondary }]}>
                52w Low: ${quote.fifty_two_week_low.toFixed(2)}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Watchlist button */}
      {token && (
        <TouchableOpacity
          style={[
            styles.watchlistBtn,
            { borderColor: colors.cardBorder },
            inWatchlist && { backgroundColor: colors.accent, borderColor: colors.accent },
          ]}
          onPress={toggleWatchlist}
        >
          <Text style={[
            styles.watchlistText,
            { color: colors.text },
            inWatchlist && { color: "#ffffff" },
          ]}>
            {inWatchlist ? "★ Watching" : "☆ Add to Watchlist"}
          </Text>
        </TouchableOpacity>
      )}

      {/* Agents used */}
      <View style={styles.agentsRow}>
        <Text style={[styles.agentsLabel, { color: colors.textSecondary }]}>Analyzed by: </Text>
        {research.agents_used.map((name) => (
          <View key={name} style={[styles.agentBadge, { backgroundColor: colors.card }]}>
            <Text style={[styles.agentBadgeText, { color: colors.text }]}>{name}</Text>
          </View>
        ))}
      </View>

      {/* Final Synthesis */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Final Synthesis</Text>
      <View style={[styles.synthesisCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.summary, { color: colors.text }]}>{research.summary}</Text>

        <Text style={[styles.subsectionTitle, { color: colors.text }]}>🐂 Bull Case</Text>
        {research.bull_factors.map((f, i) => (
          <Text key={i} style={[styles.listItem, { color: colors.text }]}>
            • {f}
          </Text>
        ))}

        <Text style={[styles.subsectionTitle, { color: colors.text }]}>🐻 Bear Case</Text>
        {research.bear_factors.map((f, i) => (
          <Text key={i} style={[styles.listItem, { color: colors.text }]}>
            • {f}
          </Text>
        ))}

        <Text style={[styles.subsectionTitle, { color: colors.text }]}>⚠️ Risks</Text>
        {research.risks.map((r, i) => (
          <Text key={i} style={[styles.listItem, { color: colors.text }]}>
            • {r}
          </Text>
        ))}

        <Text style={[styles.subsectionTitle, { color: colors.text }]}>Conclusion</Text>
        <Text style={[styles.conclusion, { color: colors.textSecondary }]}>{research.conclusion}</Text>
      </View>

      {/* Agent Analyses */}
      {research.agent_analyses.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Agent Analyses</Text>
          {research.agent_analyses.map((agent) => (
            <TouchableOpacity
              key={agent.agent_name}
              style={[styles.agentCard, { backgroundColor: colors.card }]}
              onPress={() =>
                setActiveAgent(activeAgent === agent.agent_name ? null : agent.agent_name)
              }
            >
              <View style={styles.agentHeader}>
                <Text style={[styles.agentName, { color: colors.text }]}>{agent.agent_name}</Text>
                {agent.response_time_ms && (
                  <Text style={[styles.agentTime, { color: colors.textMuted }]}>
                    {(agent.response_time_ms / 1000).toFixed(1)}s
                  </Text>
                )}
              </View>

              {activeAgent === agent.agent_name && (
                <View style={styles.agentDetails}>
                  <Text style={[styles.agentSummary, { color: colors.text }]}>{agent.summary}</Text>
                  <Text style={[styles.agentLabel, { color: colors.textSecondary }]}>Bull:</Text>
                  {agent.bull_factors.map((f, i) => (
                    <Text key={i} style={[styles.agentItem, { color: colors.textSecondary }]}>
                      • {f}
                    </Text>
                  ))}
                  <Text style={[styles.agentLabel, { color: colors.textSecondary }]}>Bear:</Text>
                  {agent.bear_factors.map((f, i) => (
                    <Text key={i} style={[styles.agentItem, { color: colors.textSecondary }]}>
                      • {f}
                    </Text>
                  ))}
                  <Text style={[styles.agentConclusion, { color: colors.text }]}>{agent.conclusion}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </>
      )}

      <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
        AI-generated analysis. Not financial advice.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  loadingText: { fontSize: 20, fontWeight: "500", marginTop: 16 },
  loadingSubtext: { fontSize: 15, marginTop: 6 },
  errorText: { fontSize: 17, color: "#ff3b30", marginBottom: 16, textAlign: "center" },
  linkText: { fontSize: 17 },
  sector: { fontSize: 14, textAlign: "center", marginBottom: 4 },
  companyName: { fontSize: 32, fontWeight: "600", textAlign: "center", marginBottom: 4 },
  ticker: { fontSize: 17, textAlign: "center", marginBottom: 20, fontFamily: "SpaceMono" },
  priceCard: { alignItems: "center", borderRadius: 20, padding: 20, marginBottom: 16 },
  price: { fontSize: 40, fontWeight: "600" },
  change: { fontSize: 22, fontWeight: "500", marginTop: 4 },
  priceDetails: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 16, marginTop: 12 },
  priceDetail: { fontSize: 13 },
  watchlistBtn: { borderWidth: 1, borderRadius: 980, padding: 14, alignItems: "center", marginBottom: 16 },
  watchlistText: { fontSize: 15, fontWeight: "500" },
  agentsRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", marginBottom: 20, gap: 8 },
  agentsLabel: { fontSize: 14 },
  agentBadge: { borderRadius: 980, paddingHorizontal: 12, paddingVertical: 6 },
  agentBadgeText: { fontSize: 13, fontWeight: "500" },
  sectionTitle: { fontSize: 24, fontWeight: "600", marginBottom: 12, marginTop: 8 },
  synthesisCard: { borderRadius: 20, borderWidth: 1, padding: 20, marginBottom: 20 },
  summary: { fontSize: 16, lineHeight: 24, marginBottom: 16 },
  subsectionTitle: { fontSize: 17, fontWeight: "600", marginTop: 12, marginBottom: 8 },
  listItem: { fontSize: 15, lineHeight: 22, marginBottom: 4 },
  conclusion: { fontSize: 15, lineHeight: 22 },
  agentCard: { borderRadius: 16, padding: 16, marginBottom: 12 },
  agentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  agentName: { fontSize: 17, fontWeight: "600" },
  agentTime: { fontSize: 13 },
  agentDetails: { marginTop: 12 },
  agentSummary: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  agentLabel: { fontSize: 13, fontWeight: "600", marginTop: 8, marginBottom: 4 },
  agentItem: { fontSize: 13, lineHeight: 18 },
  agentConclusion: { fontSize: 13, marginTop: 8, fontStyle: "italic" },
  disclaimer: { fontSize: 12, textAlign: "center", marginTop: 20 },
});
