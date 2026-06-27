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

interface TimelineSnapshot {
  id: number;
  pick_id: number;
  ticker: string;
  day_label: string;
  snapshot_date: string;
  price: number | null;
  potential_score: number | null;
  ai_summary: string | null;
  market_cap: number | null;
  performance_pct: number | null;
  events: string[];
  created_at: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getScoreColor(score: number): string {
  if (score >= 95) return "#ff9500";
  if (score >= 90) return "#34c759";
  if (score >= 80) return "#0071e3";
  return "#86868b";
}

const POINTS_REQUIRED = 500;

export default function PotentialStockDetailClient() {
  const params = useParams();
  const ticker = params.ticker as string;
  const { user, token } = useAuth();

  const [pick, setPick] = useState<PotentialPick | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [timeline, setTimeline] = useState<TimelineSnapshot[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  useEffect(() => {
    if (ticker) {
      fetchPick();
      checkWatchlist();
      fetchTimeline();
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

  async function fetchTimeline() {
    setTimelineLoading(true);
    try {
      const res = await fetch(`${API_BASE}/potential-stocks/timeline/${ticker}`);
      if (res.ok) {
        const data = await res.json();
        setTimeline(data);
      }
    } catch {
      // ignore - timeline is optional
    } finally {
      setTimelineLoading(false);
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

  // Access guard: require 500+ points
  if (user && (user.total_points ?? 0) < POINTS_REQUIRED) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-[70vh] px-6 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-[#ff9500]/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🔒</span>
        </div>
        <h1 className="text-3xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-3">
          Premium Feature
        </h1>
        <p className="text-[#6e6e73] dark:text-[#a1a1a6] mb-2 text-center max-w-md">
          Only users with <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">500 points</span> or more can access AI Potential Stocks discovery.
        </p>
        <p className="text-sm text-[#86868b] mb-8 text-center">
          You currently have <span className="font-semibold">{user.total_points ?? 0}</span> points. You need <span className="font-semibold text-[#0071e3]">{POINTS_REQUIRED - (user.total_points ?? 0)}</span> more.
        </p>
        <div className="flex gap-4">
          <Link href="/profile" className="btn-apple text-sm !py-2.5 !px-6">
            Earn or Buy Points
          </Link>
          <Link href="/" className="btn-apple-secondary text-sm !py-2.5 !px-6">
            Go Home
          </Link>
        </div>
      </div>
    );
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

          {/* Hidden Gem Journey Timeline */}
          {timeline.length > 0 && (
            <div className="rounded-2xl border border-[#d2d2d7] dark:border-[#48484a] bg-white dark:bg-[#2d2d2f] p-6">
              <h2 className="text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                💎 Hidden Gem Journey Timeline
              </h2>
              <p className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] mb-6">
                Track how this discovery has performed since AI first identified it.
              </p>

              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#d2d2d7] dark:bg-[#48484a]" />

                <div className="space-y-6">
                  {timeline.map((snap, index) => {
                    const isFirst = index === 0;
                    const perfColor = snap.performance_pct !== null && snap.performance_pct >= 0
                      ? "#34c759"
                      : "#ff3b30";
                    const dayLabel = snap.day_label === "0"
                      ? "Discovery Day 0"
                      : `Day ${snap.day_label}`;

                    return (
                      <div key={snap.id} className="relative pl-16">
                        {/* Timeline node */}
                        <div
                          className={`absolute left-3 top-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                            isFirst
                              ? "bg-[#0071e3] text-white ring-4 ring-[#0071e3]/20"
                              : snap.performance_pct !== null && snap.performance_pct >= 0
                                ? "bg-[#34c759] text-white"
                                : "bg-[#ff3b30] text-white"
                          }`}
                        >
                          {isFirst ? "✦" : snap.performance_pct !== null && snap.performance_pct >= 0 ? "↑" : "↓"}
                        </div>

                        {/* Content card */}
                        <div className="rounded-xl border border-[#e8e8ed] dark:border-[#38383a] bg-[#fbfbfd] dark:bg-[#1d1d1f] p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                                {dayLabel}
                              </span>
                              <span className="text-xs text-[#86868b]">
                                {snap.snapshot_date
                                  ? new Date(snap.snapshot_date).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })
                                  : ""}
                              </span>
                            </div>
                            {snap.performance_pct !== null && (
                              <span
                                className="text-sm font-bold px-2.5 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: perfColor + "15",
                                  color: perfColor,
                                }}
                              >
                                {snap.performance_pct >= 0 ? "+" : ""}
                                {snap.performance_pct.toFixed(1)}%
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm mb-2">
                            {snap.price !== null && (
                              <span className="text-[#1d1d1f] dark:text-[#f5f5f7]">
                                Price: <strong>${snap.price.toFixed(2)}</strong>
                              </span>
                            )}
                            {snap.potential_score !== null && (
                              <span style={{ color: getScoreColor(snap.potential_score) }}>
                                Score: <strong>{Math.round(snap.potential_score)}</strong>
                              </span>
                            )}
                            {snap.market_cap !== null && snap.market_cap !== undefined && (
                              <span className="text-[#86868b]">
                                MCap: {typeof snap.market_cap === "number"
                                  ? snap.market_cap >= 1e9
                                    ? `$${(snap.market_cap / 1e9).toFixed(1)}B`
                                    : snap.market_cap >= 1e6
                                      ? `$${(snap.market_cap / 1e6).toFixed(1)}M`
                                      : `$${snap.market_cap.toLocaleString()}`
                                  : snap.market_cap}
                              </span>
                            )}
                          </div>

                          {snap.ai_summary && (
                            <p className="text-xs text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed">
                              {snap.ai_summary}
                            </p>
                          )}

                          {snap.events && snap.events.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {snap.events.map((event, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] px-2 py-0.5 rounded-full bg-[#0071e3]/10 text-[#0071e3]"
                                >
                                  {event}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Timeline loading state */}
          {timelineLoading && (
            <div className="rounded-2xl border border-[#d2d2d7] dark:border-[#48484a] bg-white dark:bg-[#2d2d2f] p-6 text-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#0071e3] border-t-transparent mx-auto mb-2" />
              <p className="text-sm text-[#86868b]">Loading journey timeline...</p>
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-[#86868b] text-center pt-4 border-t border-[#f5f5f7] dark:border-[#38383a]">
            AI-generated analysis. Not financial advice. Always do your own research.
          </p>
        </div>
      </section>
    </div>
  );
}
