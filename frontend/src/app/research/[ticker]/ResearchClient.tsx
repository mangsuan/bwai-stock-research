"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface AgentAnalysis {
  agent_name: string;
  model_id: string;
  summary: string;
  bull_factors: string[];
  bear_factors: string[];
  risks: string[];
  conclusion: string;
  confidence: number | null;
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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const AGENT_COLORS: Record<string, { bg: string; text: string; border: string; accent: string }> = {
  deepseek:   { bg: "bg-[#0071e3]/10", text: "text-[#0071e3]", border: "border-[#0071e3]/30", accent: "#0071e3" },
  mimo:       { bg: "bg-[#34c759]/10", text: "text-[#34c759]", border: "border-[#34c759]/30", accent: "#34c759" },
  "mimo-pro": { bg: "bg-[#af52de]/10", text: "text-[#af52de]", border: "border-[#af52de]/30", accent: "#af52de" },
};

const AGENT_ROLES: Record<string, string> = {
  deepseek:   "Quick Analysis",
  mimo:       "Deep Analysis",
  "mimo-pro":  "Validation",
};

const DEFAULT_AGENT_COLOR = { bg: "bg-[#86868b]/10", text: "text-[#86868b]", border: "border-[#86868b]/30", accent: "#86868b" };
const POINTS_REQUIRED_AGENTS = 200;

function getAgentColor(name: string) {
  return AGENT_COLORS[name] || DEFAULT_AGENT_COLOR;
}

/* ─── Skeleton Loader ─── */

function ResearchSkeleton() {
  return (
    <div className="animate-fade-in">
      <section className="bg-gradient-hero py-16 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <div className="skeleton w-24 h-4" />
            <div className="skeleton w-20 h-8 rounded-full" />
          </div>
          <div className="text-center">
            <div className="skeleton w-20 h-4 mx-auto mb-3" />
            <div className="skeleton w-64 h-12 mx-auto mb-3" />
            <div className="skeleton w-16 h-5 mx-auto" />
          </div>
          <div className="mt-10 text-center">
            <div className="skeleton w-48 h-14 mx-auto mb-4" />
            <div className="flex justify-center gap-8">
              <div className="skeleton w-20 h-10" />
              <div className="skeleton w-20 h-10" />
              <div className="skeleton w-20 h-10" />
            </div>
          </div>
        </div>
      </section>
      <section className="py-10 px-6">
        <div className="mx-auto max-w-4xl flex justify-center gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton w-40 h-14 rounded-2xl" />
          ))}
        </div>
      </section>
      <section className="py-16 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="skeleton w-48 h-8 mx-auto mb-8" />
          <div className="skeleton w-full h-64 rounded-3xl" />
        </div>
      </section>
    </div>
  );
}

export default function ResearchPage() {
  const params = useParams();
  const ticker = (params.ticker as string).toUpperCase();
  const { user, token } = useAuth();

  const [research, setResearch] = useState<StockResearch | null>(null);
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [researchRes, quoteRes] = await Promise.all([
          fetch(`${API_BASE}/research/${ticker}`),
          fetch(`${API_BASE}/quote/${ticker}`),
        ]);
        if (!researchRes.ok) {
          const err = await researchRes.json();
          throw new Error(err.detail || "Failed to fetch research");
        }
        const researchData = await researchRes.json();
        setResearch(researchData);
        if (quoteRes.ok) setQuote(await quoteRes.json());
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    if (token) {
      fetch(`${API_BASE}/watchlist/${ticker}/check`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setInWatchlist(data.in_watchlist))
        .catch(() => {});
    }
  }, [ticker, token]);

  async function toggleWatchlist() {
    if (!token) return;
    try {
      if (inWatchlist) {
        await fetch(`${API_BASE}/watchlist/${ticker}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
        setInWatchlist(false);
      } else {
        await fetch(`${API_BASE}/watchlist`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ ticker }) });
        setInWatchlist(true);
      }
    } catch { /* ignore */ }
  }

  if (loading) return <ResearchSkeleton />;

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[60vh]">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[#ff3b30]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-3">{error}</h2>
          <p className="text-[#86868b] mb-6">We couldn&apos;t load the research data. Please try again.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/" className="btn-apple text-sm">← New search</Link>
            <button onClick={() => window.location.reload()} className="btn-apple-secondary text-sm">Try again</button>
          </div>
        </div>
      </div>
    );
  }

  if (!research) return null;

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative bg-gradient-hero py-16 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
        <div className="relative mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="text-[#0071e3] hover:text-[#0077ed] text-sm font-medium flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              New search
            </Link>
            {user && (
              <button
                onClick={toggleWatchlist}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                  inWatchlist
                    ? "bg-[#0071e3] text-white shadow-lg shadow-[#0071e3]/20"
                    : "bg-white dark:bg-[#2d2d2f] text-[#1d1d1f] dark:text-[#f5f5f7] border border-[#d2d2d7] dark:border-[#48484a] hover:border-[#0071e3]"
                }`}
              >
                {inWatchlist ? "★ Watching" : "☆ Watch"}
              </button>
            )}
          </div>

          <div className="text-center animate-fade-in">
            <span className="inline-block px-3 py-1 rounded-full bg-[#0071e3]/8 dark:bg-[#0071e3]/15 text-[#0071e3] text-xs font-medium mb-4">
              {research.sector}
            </span>
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] mb-3 heading-tight">
              {research.company_name}
            </h1>
            <p className="text-lg text-[#6e6e73] dark:text-[#a1a1a6] font-mono font-medium">{research.ticker}</p>
          </div>

          {/* Price Card */}
          {quote && quote.price && (
            <div className="mt-10 animate-fade-in-delay">
              <div className="card-premium max-w-md mx-auto p-6 text-center">
                <div className="inline-flex items-baseline gap-3">
                  <span className="text-5xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                    ${quote.price.toFixed(2)}
                  </span>
                  {quote.change_pct !== null && (
                    <span className={`text-xl font-medium ${quote.change_pct >= 0 ? "text-[#34c759]" : "text-[#ff3b30]"}`}>
                      {quote.change_pct >= 0 ? "+" : ""}{quote.change_pct.toFixed(2)}%
                    </span>
                  )}
                </div>
                <div className="divider my-4" />
                <div className="flex justify-center gap-8 text-sm">
                  {quote.market_cap && (
                    <div>
                      <span className="block text-xs text-[#86868b] uppercase tracking-wider mb-0.5">Market Cap</span>
                      <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{quote.market_cap}</span>
                    </div>
                  )}
                  {quote.fifty_two_week_high && (
                    <div>
                      <span className="block text-xs text-[#86868b] uppercase tracking-wider mb-0.5">52w High</span>
                      <span className="font-medium text-[#34c759]">${quote.fifty_two_week_high.toFixed(2)}</span>
                    </div>
                  )}
                  {quote.fifty_two_week_low && (
                    <div>
                      <span className="block text-xs text-[#86868b] uppercase tracking-wider mb-0.5">52w Low</span>
                      <span className="font-medium text-[#ff3b30]">${quote.fifty_two_week_low.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Agents Used */}
      <section className="py-10 px-6 border-b border-[#d2d2d7] dark:border-[#38383a]">
        <div className="mx-auto max-w-4xl">
          {user && (user.total_points ?? 0) >= POINTS_REQUIRED_AGENTS ? (
            <>
              <div className="text-center mb-6">
                <p className="text-xs text-[#86868b] uppercase tracking-wider mb-1">Powered by</p>
                <h3 className="text-2xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {research.agents_used.length} AI Agents
                </h3>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                {research.agents_used.map((name, index) => {
                  const colors = getAgentColor(name);
                  return (
                    <div key={`card-${name}`} className={`flex items-center gap-3 rounded-2xl border ${colors.border} ${colors.bg} px-5 py-3 card-hover`}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: colors.accent }}>
                        {index + 1}
                      </div>
                      <div>
                        <p className={`font-semibold ${colors.text}`}>{name}</p>
                        <p className="text-xs text-[#86868b]">{AGENT_ROLES[name] || "Analysis"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-center text-xs text-[#86868b] mt-4">Each agent analyzes independently for unbiased, multi-perspective research</p>
            </>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="text-sm text-[#6e6e73] dark:text-[#a1a1a6]">Analyzed by</span>
              {research.agents_used.map((name) => (
                <span key={`pill-${name}`} className="rounded-full bg-[#f5f5f7] dark:bg-[#38383a] px-4 py-1.5 text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Final Synthesis */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">Final Synthesis</h2>
          </div>

          <div className="card-premium p-8 md:p-12">
            <p className="text-lg text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed mb-8">
              {research.summary}
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Bull Case */}
              <div className="rounded-2xl bg-[#34c759]/5 dark:bg-[#34c759]/8 border border-[#34c759]/15 p-6">
                <h3 className="text-lg font-semibold text-[#34c759] mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-[#34c759]/10 flex items-center justify-center text-sm">↑</span>
                  Bull Case
                </h3>
                <ul className="space-y-3">
                  {research.bull_factors.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-[#1d1d1f] dark:text-[#f5f5f7] text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#34c759] mt-2 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bear Case */}
              <div className="rounded-2xl bg-[#ff3b30]/5 dark:bg-[#ff3b30]/8 border border-[#ff3b30]/15 p-6">
                <h3 className="text-lg font-semibold text-[#ff3b30] mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-[#ff3b30]/10 flex items-center justify-center text-sm">↓</span>
                  Bear Case
                </h3>
                <ul className="space-y-3">
                  {research.bear_factors.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-[#1d1d1f] dark:text-[#f5f5f7] text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] mt-2 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Risks */}
            <div className="mt-8 rounded-2xl bg-[#ff9500]/5 dark:bg-[#ff9500]/8 border border-[#ff9500]/15 p-6">
              <h3 className="text-lg font-semibold text-[#ff9500] mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#ff9500]/10 flex items-center justify-center text-sm">!</span>
                Risks
              </h3>
              <ul className="space-y-3">
                {research.risks.map((r, i) => (
                  <li key={i} className="flex items-start gap-3 text-[#1d1d1f] dark:text-[#f5f5f7] text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff9500] mt-2 flex-shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* Conclusion */}
            <div className="mt-8 pt-8 border-t border-[#d2d2d7] dark:border-[#38383a]">
              <h3 className="text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-3">Conclusion</h3>
              <p className="text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed">{research.conclusion}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Individual Agent Analyses */}
      {research.agent_analyses.length > 0 && (
        <section className="py-16 px-6 bg-[#f5f5f7] dark:bg-[#2d2d2f]">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] mb-8 text-center">
              Agent Analyses
            </h2>

            {/* Agent Tabs */}
            <div className="flex justify-center gap-3 mb-10 flex-wrap">
              {research.agent_analyses.map((agent) => {
                const colors = getAgentColor(agent.agent_name);
                const isActive = activeAgent === agent.agent_name;
                return (
                  <button
                    key={`tab-${agent.agent_name}`}
                    onClick={() => setActiveAgent(isActive ? null : agent.agent_name)}
                    className={`rounded-full px-6 py-3 text-sm font-medium transition-all border ${
                      isActive
                        ? `${colors.bg} ${colors.text} ${colors.border} shadow-sm`
                        : "bg-white dark:bg-[#2d2d2f] text-[#1d1d1f] dark:text-[#f5f5f7] border-[#d2d2d7] dark:border-[#48484a] hover:border-[#1d1d1f] dark:hover:border-[#f5f5f7] hover:shadow-sm"
                    }`}
                  >
                    {agent.agent_name}
                    {agent.response_time_ms && (
                      <span className="ml-2 text-xs opacity-60">{(agent.response_time_ms / 1000).toFixed(1)}s</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Agent Cards */}
            <div className="space-y-6">
              {research.agent_analyses.map((agent) => {
                if (activeAgent && activeAgent !== agent.agent_name) return null;
                const colors = getAgentColor(agent.agent_name);
                return (
                  <div key={`analysis-${agent.agent_name}`} className="card-premium p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg" style={{ backgroundColor: colors.accent, boxShadow: `0 4px 14px ${colors.accent}30` }}>
                          {agent.agent_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className={`text-xl font-semibold ${colors.text}`}>{agent.agent_name}</h3>
                          <p className="text-sm text-[#6e6e73] dark:text-[#a1a1a6]">{agent.model_id} · {AGENT_ROLES[agent.agent_name] || "Analysis"}</p>
                        </div>
                      </div>
                      {agent.response_time_ms && (
                        <span className="badge bg-[#f5f5f7] dark:bg-[#38383a] text-[#86868b]">{(agent.response_time_ms / 1000).toFixed(1)}s</span>
                      )}
                    </div>

                    <p className="text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed mb-6">{agent.summary}</p>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="rounded-xl bg-[#34c759]/5 dark:bg-[#34c759]/8 p-4">
                        <h4 className="text-sm font-semibold text-[#34c759] uppercase tracking-wider mb-3">Bull</h4>
                        <ul className="space-y-2">
                          {agent.bull_factors.map((f, i) => (
                            <li key={i} className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] flex items-start gap-2">
                              <span className="w-1 h-1 rounded-full bg-[#34c759] mt-2 flex-shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-xl bg-[#ff3b30]/5 dark:bg-[#ff3b30]/8 p-4">
                        <h4 className="text-sm font-semibold text-[#ff3b30] uppercase tracking-wider mb-3">Bear</h4>
                        <ul className="space-y-2">
                          {agent.bear_factors.map((f, i) => (
                            <li key={i} className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] flex items-start gap-2">
                              <span className="w-1 h-1 rounded-full bg-[#ff3b30] mt-2 flex-shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-[#d2d2d7] dark:border-[#38383a]">
                      <h4 className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">Conclusion</h4>
                      <p className="text-sm text-[#6e6e73] dark:text-[#a1a1a6]">{agent.conclusion}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <section className="py-12 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ff9500]/8 dark:bg-[#ff9500]/15 text-[#ff9500] text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            AI-generated analysis from {research.agents_used.length} agents. Not financial advice. Always do your own research.
          </div>
        </div>
      </section>
    </div>
  );
}
