"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const FALLBACK_TICKERS = ["AAPL", "NVDA", "TSLA", "MSFT", "AMZN", "GOOG"];

export default function Home() {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = ticker.trim().toUpperCase();
    if (cleaned) {
      router.push(`/research/${cleaned}`);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[80vh] px-6">
        <div className="w-full max-w-2xl text-center animate-fade-in">
          <h1 className="text-6xl md:text-7xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">
            BWAI
          </h1>
          <p className="text-xl md:text-2xl text-[#6e6e73] dark:text-[#a1a1a6] mb-12 font-light">
            Stock research powered by multiple AI agents.
          </p>

          {/* Search Input */}
          <form onSubmit={handleSubmit} className="relative mb-8">
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="Enter stock ticker (e.g., AAPL)"
              aria-label="Enter stock ticker to research"
              className="w-full rounded-2xl border border-[#d2d2d7] dark:border-[#48484a] bg-[#fbfbfd] dark:bg-[#1d1d1f] px-6 py-5 text-lg text-center text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b] dark:placeholder:text-[#6e6e73] focus:border-[#0071e3] focus:outline-none focus:ring-4 focus:ring-[#0071e3]/10 transition-all"
              maxLength={10}
              autoFocus
            />
            <button
              type="submit"
              disabled={!ticker.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 btn-apple !py-3 !px-8 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Analyze
            </button>
          </form>

          {/* Quick Tickers */}
          <div className="flex flex-wrap justify-center gap-3 animate-fade-in-delay">
            {quickTickers.map((t) => (
              <button
                key={t}
                onClick={() => router.push(`/research/${t}`)}
                className="rounded-full bg-[#f5f5f7] dark:bg-[#38383a] px-5 py-2.5 text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-[#e8e8ed] dark:hover:bg-[#48484a] transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[#f5f5f7] dark:bg-[#2d2d2f] py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-4xl font-semibold text-center text-[#1d1d1f] dark:text-[#f5f5f7] mb-16">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#0071e3] flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-3">Enter a Ticker</h3>
              <p className="text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed">
                Type any stock symbol to begin your research journey.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#0071e3] flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-3">AI Agents Analyze</h3>
              <p className="text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed">
                Multiple AI agents research the stock in parallel, each with a unique perspective.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#0071e3] flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-3">Get Synthesis</h3>
              <p className="text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed">
                A judge AI combines all feedback into one balanced, actionable report.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-6">
            Start researching today
          </h2>
          <p className="text-lg text-[#6e6e73] dark:text-[#a1a1a6] mb-8">
            Free to use. No account required. Powered by AI.
          </p>
          <button
            onClick={() => {
              const input = document.querySelector("input");
              if (input) input.focus();
            }}
            className="btn-apple !py-4 !px-10 text-lg"
          >
            Try it now
          </button>
        </div>
      </section>
    </div>
  );
}
