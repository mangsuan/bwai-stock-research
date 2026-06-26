"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface AgentScore {
  agent_name: string;
  score: number;
  explanation: string;
}

interface PotentialPick {
  id: number;
  ticker: string;
  company_name: string;
  sector: string;
  price_at_pick: number | null;
  potential_score: number;
  confidence: number | null;
  category: string;
  ai_summary: string;
  why_hidden: string;
  what_changed: string;
  growth_drivers: string[];
  catalysts: string[];
  risks: string[];
  agent_scores: AgentScore[];
  created_at: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getScoreColor(score: number): string {
  if (score >= 95) return "#ff9500";
  if (score >= 90) return "#34c759";
  if (score >= 80) return "#0071e3";
  return "#86868b";
}

export default function PotentialStockDetailClient() {
  const params = useParams();
  const ticker = params.ticker as string;
  const { token } = useAuth();

  const [pick, setPick] = useState<PotentialPick | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    if (ticker) {
      fetchPick();
      checkWatchlist();
    }
  }, [ticker]);

  async function fetchPick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/potential-stocks/${ticker}`);
      if (!res.ok) {
        throw new Error("No data found");
      }
      setPick(await res.json());
    } catch {
      setError("No potential stock data found for this ticker");
    } finally {
      setLoading(false);
    }
  }

  async function checkWatchlist() {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/watchlist/${ticker}/check`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInWatchlist(data.in_watchlist);
      }
    } catch {
      // ignore
    }
  }

  async function toggleWatchlist() {
    if (!token) return;
    try {
      if (inWatchlist) {
        await fetch(`${API_BASE}/watchlist/${ticker}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        setInWatchlist(false);
      } else {
        await fetch(`${API_BASE}/watchlist`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#0071e3] border-t-transparent mx-auto mb-4" />
          <p className="text-[#86868b]">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !pick) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#ff3b30]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">Not Found</h3>
          <p className="text-[#86868b] mb-6">{error}</p>
          <Link href="/potential-stocks" className="btn-apple text-sm">
            Back to Discoveries
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#f5f5f7] to-[#e8e8ed] dark:from-[#2d2d2f] dark:to-[#1d1d1f] py-12 px-6">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/potential-stocks"
            className="text-sm text-[#0071e3] hover:text-[#0077ed] mb-4 inline-block"
          >
            ← Back to Discoveries
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] font-mono">
                {pick.ticker}
              </h1>
              <p className="text-xl text-[#6e6e73] dark:text-[#a1a1a6] mt-1">
                {pick.company_name}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm px-3 py-1 rounded-full bg-[#f5f5f7] dark:bg-[#38383a] text-[#6e6e73] dark:text-[#a1a1a6]">
                  {pick.sector}
                </span>
                {pick.price_at_pick && (
                  <span className="text-sm text-[#86868b]">
                    ${pick.price_at_pick.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            <div className="text-center">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center ring-4"
                style={{
                  backgroundColor: getScoreColor(pick.potential_score) + "15",
                  outlineColor: getScoreColor(pick.potential_score) + "40",
                  boxShadow: `0 0 0 4px ${getScoreColor(pick.potential_score)}40`,
                }}
              >
                <div>
                  <span
                    className="text-3xl font-bold block"
                    style={{ color: getScoreColor(pick.potential_score) }}
                  >
                    {Math.round(pick.potential_score)}
                  </span>
                  <span className="text-xs text-[#86868b]">Score</span>
                </div>
              </div>
              <span
                className="text-xs font-medium mt-2 inline-block px-3 py-1 rounded-full"
                style={{
                  backgroundColor: getScoreColor(pick.potential_score) + "15",
                  color: getScoreColor(pick.potential_score),
                }}
              >
                {pick.category}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-6">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Actions */}
          <div className="flex items-center gap-3">
            {token && (
              <button
                onClick={toggleWatchlist}
                className={inWatchlist ? "btn-apple-secondary !py-2 !px-4 text-sm" : "btn-apple !py-2 !px-4 text-sm"}
              >
                {inWatchlist ? "★ Watching" : "☆ Add to Watchlist"}
              </button>
            )}
            <Link
              href={`/research/${pick.ticker}`}
              className="btn-apple-secondary !py-2 !px-4 text-sm"
            >
              Full Research →
            </Link>
          </div>

          {/* AI Summary */}
          {pick.ai_summary && (
            <div className="rounded-2xl border border-[#d2d2d7] dark:border-[#48484a] bg-white dark:bg-[#2d2d2f] p-6">
              <h2 className="text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-3">
                AI Summary
              </h2>
              <p className="text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed">
                {pick.ai_summary}
              </p>
            </div>
          )}

          {/* Key Insights */}
          <div className="grid md:grid-cols-2 gap-4">
            {pick.why_hidden && (
              <div className="rounded-2xl border border-[#ff9500]/30 bg-[#ff9500]/5 p-6">
                <h3 className="text-base font-semibold text-[#ff9500] mb-2 flex items-center gap-2">
                  👁️ Why This Stock Was Hidden
                </h3>
                <p className="text-sm text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed">
                  {pick.why_hidden}
                </p>
              </div>
            )}
            {pick.what_changed && (
              <div className="rounded-2xl border border-[#34c759]/30 bg-[#34c759]/5 p-6">
                <h3 className="text-base font-semibold text-[#34c759] mb-2 flex items-center gap-2">
                  📈 What Changed Recently
                </h3>
                <p className="text-sm text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed">
                  {pick.what_changed}
                </p>
              </div>
            )}
          </div>

          {/* Agent Breakdown */}
          {pick.agent_scores.length > 0 && (
            <div className="rounded-2xl border border-[#d2d2d7] dark:border-[#48484a] bg-white dark:bg-[#2d2d2f] p-6">
              <h2 className="text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">
                Agent Breakdown
              </h2>
              <div className="space-y-4">
                {pick.agent_scores.map((agent) => (
                  <div key={agent.agent_name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] capitalize">
                        {agent.agent_name.replace("_", " ")} Agent
                      </span>
                      <span
                        className="text-sm font-bold"
                        style={{ color: getScoreColor(agent.score) }}
                      >
                        {Math.round(agent.score)}/100
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#f5f5f7] dark:bg-[#38383a]">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${agent.score}%`,
                          backgroundColor: getScoreColor(agent.score),
                        }}
                      />
                    </div>
                    {agent.explanation && (
                      <p className="text-xs text-[#6e6e73] dark:text-[#a1a1a6] mt-1">
                        {agent.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Growth, Catalysts, Risks */}
          <div className="grid md:grid-cols-3 gap-4">
            {pick.growth_drivers.length > 0 && (
              <div className="rounded-2xl border border-[#d2d2d7] dark:border-[#48484a] bg-white dark:bg-[#2d2d2f] p-5">
                <h3 className="text-sm font-semibold text-[#0071e3] mb-3">🚀 Growth Drivers</h3>
                <ul className="space-y-2">
                  {pick.growth_drivers.map((item, i) => (
                    <li key={i} className="text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {pick.catalysts.length > 0 && (
              <div className="rounded-2xl border border-[#d2d2d7] dark:border-[#48484a] bg-white dark:bg-[#2d2d2f] p-5">
                <h3 className="text-sm font-semibold text-[#34c759] mb-3">⚡ Catalysts</h3>
                <ul className="space-y-2">
                  {pick.catalysts.map((item, i) => (
                    <li key={i} className="text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {pick.risks.length > 0 && (
              <div className="rounded-2xl border border-[#d2d2d7] dark:border-[#48484a] bg-white dark:bg-[#2d2d2f] p-5">
                <h3 className="text-sm font-semibold text-[#ff3b30] mb-3">⚠️ Risks</h3>
                <ul className="space-y-2">
                  {pick.risks.map((item, i) => (
                    <li key={i} className="text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-[#86868b] text-center pt-4 border-t border-[#f5f5f7] dark:border-[#38383a]">
            AI-generated analysis. Not financial advice. Always do your own research.
          </p>
        </div>
      </section>
    </div>
  );
}
