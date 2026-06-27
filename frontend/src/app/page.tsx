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
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-6 overflow-hidden bg-gradient-hero">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-mesh" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#0071e3]/5 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-[#34c759]/4 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />

        <div className="relative z-10 w-full max-w-2xl text-center animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0071e3]/8 dark:bg-[#0071e3]/15 text-[#0071e3] text-sm font-medium mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3] animate-pulse" />
            AI-Powered Stock Research
          </div>

          <h1 className="text-6xl md:text-7xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] mb-4 heading-tight">
            <span className="gradient-text-accent">BWAI</span>
          </h1>
          <p className="text-xl md:text-2xl text-[#6e6e73] dark:text-[#a1a1a6] mb-12 font-light text-balance">
            Stock research powered by multiple AI agents.
          </p>

          {/* Search Input */}
          <form onSubmit={handleSubmit} className="relative mb-8">
            <div className="relative">
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder="Enter stock ticker (e.g., AAPL)"
                aria-label="Enter stock ticker to research"
                className="w-full rounded-2xl border-2 border-[#d2d2d7] dark:border-[#48484a] bg-white dark:bg-[#2d2d2f] px-6 py-5 text-lg text-center text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b] dark:placeholder:text-[#6e6e73] focus:border-[#0071e3] focus:outline-none focus:ring-4 focus:ring-[#0071e3]/10 transition-all shadow-sm"
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
            </div>
          </form>

          {/* Quick Tickers */}
          <div className="flex flex-wrap justify-center gap-3 animate-fade-in-delay">
            {quickTickers.slice(0, 6).map((t) => (
              <button
                key={t}
                onClick={() => router.push(`/research/${t}`)}
                className="rounded-full bg-white/80 dark:bg-[#2d2d2f]/80 backdrop-blur-sm border border-[#d2d2d7] dark:border-[#48484a] px-5 py-2.5 text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-[#0071e3] hover:text-white hover:border-[#0071e3] transition-all"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-[#0071e3] uppercase tracking-wider mb-3">How It Works</p>
            <h2 className="text-4xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] heading-tight">
              Three steps to smarter research
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: (
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
                title: "Enter a Ticker",
                desc: "Type any stock symbol to begin your research journey.",
              },
              {
                step: "02",
                icon: (
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
                title: "AI Agents Analyze",
                desc: "Multiple AI agents research in parallel, each with a unique perspective.",
              },
              {
                step: "03",
                icon: (
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Get Synthesis",
                desc: "A judge AI combines all feedback into one balanced, actionable report.",
              },
            ].map((item) => (
              <div key={item.step} className="card-premium p-8 text-center group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-accent flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#0071e3]/20 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <p className="text-xs font-semibold text-[#0071e3] uppercase tracking-wider mb-2">Step {item.step}</p>
                <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-3">{item.title}</h3>
                <p className="text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By Numbers */}
      <section className="py-20 px-6 bg-[#f5f5f7] dark:bg-[#2d2d2f]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-[#0071e3] uppercase tracking-wider mb-3">Why BWAI</p>
            <h2 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
              Trusted by smart investors
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "3", label: "AI Agents", desc: "Independent analysis" },
              { value: "7", label: "Sectors", desc: "Industry coverage" },
              { value: "24/7", label: "Available", desc: "Always online" },
              { value: "< 4h", label: "Fresh Data", desc: "Cache refresh" },
            ].map((stat) => (
              <div key={stat.label} className="card-premium p-6 text-center">
                <p className="text-3xl font-semibold gradient-text-accent mb-1">{stat.value}</p>
                <p className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{stat.label}</p>
                <p className="text-xs text-[#86868b] mt-1">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] mb-6 heading-tight">
            Start researching today
          </h2>
          <p className="text-lg text-[#6e6e73] dark:text-[#a1a1a6] mb-8 text-balance">
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
