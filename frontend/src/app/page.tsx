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

      {/* Social Media */}
      <section className="bg-[#f5f5f7] dark:bg-[#2d2d2f] py-16 px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-3">
            Follow Us
          </h2>
          <p className="text-[#6e6e73] dark:text-[#a1a1a6] mb-8">
            Stay updated with the latest market insights and features.
          </p>
          <div className="flex justify-center gap-5">
            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 rounded-2xl bg-[#1877f2] flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg shadow-[#1877f2]/20"
              title="Facebook"
            >
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            {/* X (Twitter) */}
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 rounded-2xl bg-[#000000] dark:bg-[#ffffff] flex items-center justify-center text-white dark:text-[#1d1d1f] hover:scale-110 transition-transform shadow-lg shadow-black/20"
              title="X (Twitter)"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg shadow-[#dd2a7b]/20"
              title="Instagram"
            >
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
            {/* YouTube */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 rounded-2xl bg-[#ff0000] flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg shadow-[#ff0000]/20"
              title="YouTube"
            >
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            {/* LinkedIn */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 rounded-2xl bg-[#0a66c2] flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg shadow-[#0a66c2]/20"
              title="LinkedIn"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
