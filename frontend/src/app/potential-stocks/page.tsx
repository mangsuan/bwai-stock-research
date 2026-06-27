"use client";

import { useEffect, useState } from "react";
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

function getScoreRing(score: number): string {
  if (score >= 95) return "ring-[#ff9500]/30";
  if (score >= 90) return "ring-[#34c759]/30";
  if (score >= 80) return "ring-[#0071e3]/30";
  return "ring-[#86868b]/30";
}

const POINTS_REQUIRED = 500;

export default function PotentialStocksPage() {
  const { user, token } = useAuth();
  const [picks, setPicks] = useState<PotentialPick[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPicks();
  }, []);

  async function fetchPicks() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/potential-stocks/today`);
      if (res.ok) {
        setPicks(await res.json());
      }
    } catch {
      setError("Failed to load potential stocks");
    } finally {
      setLoading(false);
    }
  }

  async function runDiscovery() {
    setRunning(true);
    try {
      const res = await fetch(`${API_BASE}/potential-stocks/run?max_stocks=15`, {
        method: "POST",
      });
      if (res.ok) {
        await fetchPicks();
      }
    } catch {
      setError("Discovery run failed");
    } finally {
      setRunning(false);
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

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#f5f5f7] to-[#e8e8ed] dark:from-[#2d2d2f] dark:to-[#1d1d1f] py-16 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-sm font-medium mb-6">
            ✨ AI-Powered Discovery
          </div>
          <h1 className="text-5xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">
            Potential Stocks
          </h1>
          <p className="text-lg text-[#6e6e73] dark:text-[#a1a1a6] max-w-2xl mx-auto">
            AI discovers underfollowed, hidden gem stocks with strong growth potential before they become popular.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-6">
        <div className="mx-auto max-w-4xl">
          {/* Action bar */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                Today&apos;s Discoveries
              </h2>
              <p className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] mt-1">
                {picks.length > 0
                  ? `${picks.length} hidden gems found`
                  : "No discoveries yet"}
              </p>
            </div>
            <button
              onClick={runDiscovery}
              disabled={running}
              className="btn-apple !py-2.5 !px-6 text-sm disabled:opacity-50"
            >
              {running ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Analyzing...
                </span>
              ) : (
                "🔍 Run Discovery"
              )}
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#0071e3] border-t-transparent mx-auto mb-4" />
              <p className="text-[#86868b]">Loading potential stocks...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#ff3b30]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">Something went wrong</h3>
              <p className="text-[#86868b] mb-6">{error}</p>
              <button onClick={fetchPicks} className="btn-apple text-sm">
                Try Again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && picks.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-[#f5f5f7] dark:bg-[#38383a] flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🎯</span>
              </div>
              <h3 className="text-xl font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                No discoveries yet
              </h3>
              <p className="text-[#6e6e73] dark:text-[#a1a1a6] mb-6 max-w-md mx-auto">
                Click &quot;Run Discovery&quot; to let AI analyze the market and find hidden gem stocks for you.
              </p>
              <button onClick={runDiscovery} disabled={running} className="btn-apple disabled:opacity-50">
                {running ? "Analyzing..." : "🔍 Run Discovery"}
              </button>
            </div>
          )}

          {/* Pick cards */}
          {!loading && picks.length > 0 && (
            <div className="space-y-6">
              {picks.map((pick, index) => (
                <div
                  key={pick.id}
                  className="rounded-2xl border border-[#d2d2d7] dark:border-[#48484a] bg-white dark:bg-[#2d2d2f] p-6 card-hover"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center ring-4 ${getScoreRing(pick.potential_score)}`}
                          style={{ backgroundColor: getScoreColor(pick.potential_score) + "15" }}
                        >
                          <span
                            className="text-xl font-bold"
                            style={{ color: getScoreColor(pick.potential_score) }}
                          >
                            {Math.round(pick.potential_score)}
                          </span>
                        </div>
                        {index < 3 && (
                          <span className="absolute -top-1 -right-1 text-lg">
                            {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                          </span>
                        )}
                      </div>
                      <div>
                        <Link
                          href={`/research/${pick.ticker}`}
                          className="text-xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] hover:text-[#0071e3] transition-colors font-mono"
                        >
                          {pick.ticker}
                        </Link>
                        <p className="text-[#6e6e73] dark:text-[#a1a1a6]">{pick.company_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#f5f5f7] dark:bg-[#38383a] text-[#6e6e73] dark:text-[#a1a1a6]">
                            {pick.sector}
                          </span>
                          {pick.price_at_pick && (
                            <span className="text-xs text-[#86868b]">
                              ${pick.price_at_pick.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span
                      className="text-xs font-medium px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: getScoreColor(pick.potential_score) + "15",
                        color: getScoreColor(pick.potential_score),
                      }}
                    >
                      {pick.category}
                    </span>
                  </div>

                  {/* AI Summary */}
                  {pick.ai_summary && (
                    <p className="text-sm text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed mb-4">
                      {pick.ai_summary}
                    </p>
                  )}

                  {/* Key insights */}
                  <div className="grid md:grid-cols-2 gap-3 mb-4">
                    {pick.why_hidden && (
                      <div className="rounded-xl bg-[#ff9500]/5 border border-[#ff9500]/20 p-3">
                        <p className="text-xs font-medium text-[#ff9500] mb-1 flex items-center gap-1">
                          👁️ Why Hidden
                        </p>
                        <p className="text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">
                          {pick.why_hidden}
                        </p>
                      </div>
                    )}
                    {pick.what_changed && (
                      <div className="rounded-xl bg-[#34c759]/5 border border-[#34c759]/20 p-3">
                        <p className="text-xs font-medium text-[#34c759] mb-1 flex items-center gap-1">
                          📈 What Changed
                        </p>
                        <p className="text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">
                          {pick.what_changed}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Agent scores */}
                  {pick.agent_scores.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {pick.agent_scores.map((agent) => (
                        <div
                          key={agent.agent_name}
                          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[#f5f5f7] dark:bg-[#38383a]"
                        >
                          <span className="text-[#6e6e73] dark:text-[#a1a1a6] capitalize">
                            {agent.agent_name.replace("_", " ")}
                          </span>
                          <span
                            className="font-semibold"
                            style={{ color: getScoreColor(agent.score) }}
                          >
                            {Math.round(agent.score)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-3 border-t border-[#f5f5f7] dark:border-[#38383a]">
                    <Link
                      href={`/potential-stocks/${pick.ticker}`}
                      className="btn-apple-secondary !py-2 !px-4 text-xs"
                    >
                      View Analysis
                    </Link>
                    <Link
                      href={`/research/${pick.ticker}`}
                      className="text-xs text-[#0071e3] hover:text-[#0077ed] font-medium transition-colors"
                    >
                      Full Research →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
