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
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0071e3" />
        <Text style={styles.loadingText}>Researching {ticker}…</Text>
        <Text style={styles.loadingSubtext}>Querying multiple AI agents</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkText}>← Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!research) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Text style={styles.sector}>{research.sector}</Text>
      <Text style={styles.companyName}>{research.company_name}</Text>
      <Text style={styles.ticker}>{research.ticker}</Text>

      {/* Price */}
      {quote && quote.price && (
        <View style={styles.priceCard}>
          <Text style={styles.price}>${quote.price.toFixed(2)}</Text>
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
              <Text style={styles.priceDetail}>Mkt Cap: {quote.market_cap}</Text>
            )}
            {quote.fifty_two_week_high && (
              <Text style={styles.priceDetail}>
                52w High: ${quote.fifty_two_week_high.toFixed(2)}
              </Text>
            )}
            {quote.fifty_two_week_low && (
              <Text style={styles.priceDetail}>
                52w Low: ${quote.fifty_two_week_low.toFixed(2)}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Watchlist button */}
      {token && (
        <TouchableOpacity
          style={[styles.watchlistBtn, inWatchlist && styles.watchlistBtnActive]}
          onPress={toggleWatchlist}
        >
          <Text style={[styles.watchlistText, inWatchlist && styles.watchlistTextActive]}>
            {inWatchlist ? "★ Watching" : "☆ Add to Watchlist"}
          </Text>
        </TouchableOpacity>
      )}

      {/* Agents used */}
      <View style={styles.agentsRow}>
        <Text style={styles.agentsLabel}>Analyzed by: </Text>
        {research.agents_used.map((name) => (
          <View key={name} style={styles.agentBadge}>
            <Text style={styles.agentBadgeText}>{name}</Text>
          </View>
        ))}
      </View>

      {/* Final Synthesis */}
      <Text style={styles.sectionTitle}>Final Synthesis</Text>
      <View style={styles.synthesisCard}>
        <Text style={styles.summary}>{research.summary}</Text>

        <Text style={styles.subsectionTitle}>🐂 Bull Case</Text>
        {research.bull_factors.map((f, i) => (
          <Text key={i} style={styles.listItem}>
            • {f}
          </Text>
        ))}

        <Text style={styles.subsectionTitle}>🐻 Bear Case</Text>
        {research.bear_factors.map((f, i) => (
          <Text key={i} style={styles.listItem}>
            • {f}
          </Text>
        ))}

        <Text style={styles.subsectionTitle}>⚠️ Risks</Text>
        {research.risks.map((r, i) => (
          <Text key={i} style={styles.listItem}>
            • {r}
          </Text>
        ))}

        <Text style={styles.subsectionTitle}>Conclusion</Text>
        <Text style={styles.conclusion}>{research.conclusion}</Text>
      </View>

      {/* Agent Analyses */}
      {research.agent_analyses.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Agent Analyses</Text>
          {research.agent_analyses.map((agent) => (
            <TouchableOpacity
              key={agent.agent_name}
              style={styles.agentCard}
              onPress={() =>
                setActiveAgent(activeAgent === agent.agent_name ? null : agent.agent_name)
              }
            >
              <View style={styles.agentHeader}>
                <Text style={styles.agentName}>{agent.agent_name}</Text>
                {agent.response_time_ms && (
                  <Text style={styles.agentTime}>
                    {(agent.response_time_ms / 1000).toFixed(1)}s
                  </Text>
                )}
              </View>

              {activeAgent === agent.agent_name && (
                <View style={styles.agentDetails}>
                  <Text style={styles.agentSummary}>{agent.summary}</Text>
                  <Text style={styles.agentLabel}>Bull:</Text>
                  {agent.bull_factors.map((f, i) => (
                    <Text key={i} style={styles.agentItem}>
                      • {f}
                    </Text>
                  ))}
                  <Text style={styles.agentLabel}>Bear:</Text>
                  {agent.bear_factors.map((f, i) => (
                    <Text key={i} style={styles.agentItem}>
                      • {f}
                    </Text>
                  ))}
                  <Text style={styles.agentConclusion}>{agent.conclusion}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </>
      )}

      <Text style={styles.disclaimer}>
        AI-generated analysis. Not financial advice.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  content: { padding: 20, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  loadingText: { fontSize: 20, fontWeight: "500", color: "#1d1d1f", marginTop: 16 },
  loadingSubtext: { fontSize: 15, color: "#6e6e73", marginTop: 6 },
  errorText: { fontSize: 17, color: "#ff3b30", marginBottom: 16, textAlign: "center" },
  linkText: { fontSize: 17, color: "#0071e3" },
  sector: { fontSize: 14, color: "#6e6e73", textAlign: "center", marginBottom: 4 },
  companyName: { fontSize: 32, fontWeight: "600", color: "#1d1d1f", textAlign: "center", marginBottom: 4 },
  ticker: { fontSize: 17, color: "#6e6e73", textAlign: "center", marginBottom: 20, fontFamily: "SpaceMono" },
  priceCard: { alignItems: "center", backgroundColor: "#f5f5f7", borderRadius: 20, padding: 20, marginBottom: 16 },
  price: { fontSize: 40, fontWeight: "600", color: "#1d1d1f" },
  change: { fontSize: 22, fontWeight: "500", marginTop: 4 },
  priceDetails: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 16, marginTop: 12 },
  priceDetail: { fontSize: 13, color: "#6e6e73" },
  watchlistBtn: { borderWidth: 1, borderColor: "#d2d2d7", borderRadius: 980, padding: 14, alignItems: "center", marginBottom: 16 },
  watchlistBtnActive: { backgroundColor: "#0071e3", borderColor: "#0071e3" },
  watchlistText: { fontSize: 15, fontWeight: "500", color: "#1d1d1f" },
  watchlistTextActive: { color: "#ffffff" },
  agentsRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", marginBottom: 20, gap: 8 },
  agentsLabel: { fontSize: 14, color: "#6e6e73" },
  agentBadge: { backgroundColor: "#f5f5f7", borderRadius: 980, paddingHorizontal: 12, paddingVertical: 6 },
  agentBadgeText: { fontSize: 13, fontWeight: "500", color: "#1d1d1f" },
  sectionTitle: { fontSize: 24, fontWeight: "600", color: "#1d1d1f", marginBottom: 12, marginTop: 8 },
  synthesisCard: { backgroundColor: "#fbfbfd", borderRadius: 20, borderWidth: 1, borderColor: "#d2d2d7", padding: 20, marginBottom: 20 },
  summary: { fontSize: 16, color: "#1d1d1f", lineHeight: 24, marginBottom: 16 },
  subsectionTitle: { fontSize: 17, fontWeight: "600", color: "#1d1d1f", marginTop: 12, marginBottom: 8 },
  listItem: { fontSize: 15, color: "#1d1d1f", lineHeight: 22, marginBottom: 4 },
  conclusion: { fontSize: 15, color: "#6e6e73", lineHeight: 22 },
  agentCard: { backgroundColor: "#f5f5f7", borderRadius: 16, padding: 16, marginBottom: 12 },
  agentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  agentName: { fontSize: 17, fontWeight: "600", color: "#1d1d1f" },
  agentTime: { fontSize: 13, color: "#86868b" },
  agentDetails: { marginTop: 12 },
  agentSummary: { fontSize: 14, color: "#1d1d1f", lineHeight: 20, marginBottom: 8 },
  agentLabel: { fontSize: 13, fontWeight: "600", color: "#6e6e73", marginTop: 8, marginBottom: 4 },
  agentItem: { fontSize: 13, color: "#6e6e73", lineHeight: 18 },
  agentConclusion: { fontSize: 13, color: "#1d1d1f", marginTop: 8, fontStyle: "italic" },
  disclaimer: { fontSize: 12, color: "#86868b", textAlign: "center", marginTop: 20 },
});
