"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface Stock {
  symbol: string;
  name: string;
  exchange: string;
}

interface StocksResponse {
  stocks: Stock[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ExplorePage() {
  const { user, token } = useAuth();

  const [stocks, setStocks] = useState<Stock[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Fetch stocks
  const fetchStocks = useCallback(async (q: string, p: number, append: boolean) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ page: String(p), per_page: "50" });
      if (q) params.set("q", q);

      const res = await fetch(`${API_BASE}/stocks?${params}`);
      if (!res.ok) throw new Error("Failed to load stocks");

      const data: StocksResponse = await res.json();
      setStocks((prev) => (append ? [...prev, ...data.stocks] : data.stocks));
      setPage(data.page);
      setTotalPages(data.total_pages);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchStocks("", 1, false);
  }, [fetchStocks]);

  // Load watchlist
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/watchlist`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((items: { ticker: string }[]) => {
        setWatchlist(new Set(items.map((i) => i.ticker)));
      })
      .catch(() => {});
  }, [token]);

  // Search with debounce
  function handleSearch(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchStocks(value, 1, false);
    }, 300);
  }

  // Load more
  function handleLoadMore() {
    if (page < totalPages && !loadingMore) {
      fetchStocks(query, page + 1, true);
    }
  }

  // Toggle watchlist
  async function toggleWatchlist(symbol: string) {
    if (!token) return;
    const inList = watchlist.has(symbol);

    try {
      if (inList) {
        await fetch(`${API_BASE}/watchlist/${symbol}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        setWatchlist((prev) => {
          const next = new Set(prev);
          next.delete(symbol);
          return next;
        });
      } else {
        await fetch(`${API_BASE}/watchlist`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ticker: symbol }),
        });
        setWatchlist((prev) => new Set(prev).add(symbol));
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="bg-[#f5f5f7] dark:bg-[#2d2d2f] py-12 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">
            Explore Stocks
          </h1>
          <p className="text-lg text-[#6e6e73] dark:text-[#a1a1a6] mb-8">
            Browse the market and build your watchlist
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by symbol or company name..."
              className="w-full rounded-2xl border border-[#d2d2d7] dark:border-[#38383a] bg-white dark:bg-[#1d1d1f] px-6 py-4 text-lg text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b] focus:border-[#0071e3] focus:outline-none focus:ring-4 focus:ring-[#0071e3]/10 transition-all"
            />
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868b]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-8 px-6">
        <div className="mx-auto max-w-4xl">
          {/* Status bar */}
          {!loading && !error && (
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-[#86868b]">
                {total.toLocaleString()} stocks found
                {query && ` for "${query}"`}
              </p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#0071e3] border-t-transparent mx-auto mb-4" />
              <p className="text-[#86868b]">Loading stocks...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-[#ff3b30]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                Failed to load stocks
              </h3>
              <p className="text-[#86868b] mb-4">{error}</p>
              <button
                onClick={() => fetchStocks(query, 1, false)}
                className="btn-apple !py-2 !px-6 text-sm"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && stocks.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-[#f5f5f7] dark:bg-[#38383a] flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-[#86868b]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                No stocks found
              </h3>
              <p className="text-[#86868b]">Try a different search term</p>
            </div>
          )}

          {/* Stock list */}
          {!loading && !error && stocks.length > 0 && (
            <div className="space-y-3">
              {stocks.map((stock) => {
                const inWatchlist = watchlist.has(stock.symbol);
                return (
                  <div
                    key={stock.symbol}
                    className="rounded-2xl border border-[#d2d2d7] dark:border-[#38383a] bg-white dark:bg-[#2d2d2f] p-5 flex items-center justify-between card-hover"
                  >
                    <Link
                      href={`/research/${stock.symbol}`}
                      className="flex items-center gap-4 flex-1 min-w-0 group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#f5f5f7] dark:bg-[#38383a] flex items-center justify-center group-hover:bg-[#0071e3] transition-colors shrink-0">
                        <span className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-white font-mono transition-colors">
                          {stock.symbol.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-[#0071e3] transition-colors font-mono">
                            {stock.symbol}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#f5f5f7] dark:bg-[#38383a] text-[#86868b]">
                            {stock.exchange}
                          </span>
                        </div>
                        <p className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] truncate">
                          {stock.name}
                        </p>
                      </div>
                    </Link>

                    {user && (
                      <button
                        onClick={() => toggleWatchlist(stock.symbol)}
                        className={`shrink-0 ml-4 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                          inWatchlist
                            ? "bg-[#0071e3] text-white hover:bg-[#0077ed]"
                            : "bg-[#f5f5f7] dark:bg-[#38383a] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-[#e8e8ed] dark:hover:bg-[#48484a]"
                        }`}
                      >
                        {inWatchlist ? "✓ Watching" : "+ Watch"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Load more */}
          {!loading && !error && page < totalPages && (
            <div className="text-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="btn-apple !py-3 !px-10 disabled:opacity-50"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Loading...
                  </span>
                ) : (
                  `Load more (${total - stocks.length} remaining)`
                )}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
