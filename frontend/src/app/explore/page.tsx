"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface Stock {
  symbol: string;
  name: string;
  exchange: string;
  sector?: string;
  industry?: string;
  price?: number | null;
  change_pct?: number | null;
  market_cap?: string | null;
  market_cap_raw?: number;
}

interface SectorGroup {
  name: string;
  stocks: Stock[];
  total_market_cap: string;
  count: number;
}

interface StocksResponse {
  stocks: Stock[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const SECTOR_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  Technology:               { bg: "bg-[#0071e3]/10", text: "text-[#0071e3]", icon: "💻" },
  Financial:                { bg: "bg-[#34c759]/10", text: "text-[#34c759]", icon: "🏦" },
  Healthcare:               { bg: "bg-[#ff3b30]/10", text: "text-[#ff3b30]", icon: "🏥" },
  "Consumer Cyclical":      { bg: "bg-[#ff9500]/10", text: "text-[#ff9500]", icon: "🛍️" },
  "Consumer Defensive":     { bg: "bg-[#af52de]/10", text: "text-[#af52de]", icon: "🛒" },
  Energy:                   { bg: "bg-[#ff2d55]/10", text: "text-[#ff2d55]", icon: "⚡" },
  "Communication Services": { bg: "bg-[#5856d6]/10", text: "text-[#5856d6]", icon: "📡" },
};

const DEFAULT_SECTOR_COLOR = { bg: "bg-[#86868b]/10", text: "text-[#86868b]", icon: "📊" };

function getSectorColor(name: string) {
  return SECTOR_COLORS[name] || DEFAULT_SECTOR_COLOR;
}

export default function ExplorePage() {
  const { user, token } = useAuth();

  const [sectors, setSectors] = useState<SectorGroup[]>([]);
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [expandedSector, setExpandedSector] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Fetch sectors (default view)
  const fetchSectors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/stocks/sectors`);
      if (!res.ok) throw new Error("Failed to load sectors");
      const data = await res.json();
      setSectors(data.sectors);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch search results
  const fetchSearch = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ q, page: "1", per_page: "100" });
      const res = await fetch(`${API_BASE}/stocks?${params}`);
      if (!res.ok) throw new Error("Failed to search stocks");
      const data: StocksResponse = await res.json();
      setSearchResults(data.stocks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchSectors();
  }, [fetchSectors]);

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
    if (value.trim()) {
      debounceRef.current = setTimeout(() => {
        fetchSearch(value);
      }, 300);
    } else {
      setSearchResults([]);
      if (sectors.length === 0) fetchSectors();
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

  const isSearching = query.trim().length > 0;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="bg-[#f5f5f7] dark:bg-[#2d2d2f] py-12 px-6">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-5xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">
            Explore Stocks
          </h1>
          <p className="text-lg text-[#6e6e73] dark:text-[#a1a1a6] mb-8">
            Browse by industry sector or search for any stock
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by symbol or company name..."
              aria-label="Search stocks by symbol or company name"
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

      {/* Content */}
      <section className="py-8 px-6">
        <div className="mx-auto max-w-5xl">

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
                <svg className="w-8 h-8 text-[#ff3b30]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">Failed to load</h3>
              <p className="text-[#86868b] mb-4">{error}</p>
              <button onClick={isSearching ? () => fetchSearch(query) : fetchSectors} className="btn-apple !py-2 !px-6 text-sm">
                Try again
              </button>
            </div>
          )}

          {/* Search Results */}
          {!loading && !error && isSearching && (
            <div>
              <p className="text-sm text-[#86868b] mb-4">
                {searchResults.length} result{searchResults.length !== 1 && "s"} for &quot;{query}&quot;
              </p>
              {searchResults.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-[#86868b]">No stocks found. Try a different search term.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((stock) => (
                    <StockRow key={stock.symbol} stock={stock} inWatchlist={watchlist.has(stock.symbol)} onToggleWatchlist={toggleWatchlist} showWatchlist={!!user} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sector Groups */}
          {!loading && !error && !isSearching && (
            <div className="space-y-8">
              {/* Sector summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {sectors.map((sector) => {
                  const colors = getSectorColor(sector.name);
                  const isExpanded = expandedSector === sector.name;
                  return (
                    <button
                      key={sector.name}
                      onClick={() => setExpandedSector(isExpanded ? null : sector.name)}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        isExpanded
                          ? `${colors.bg} border-current ${colors.text}`
                          : "border-[#d2d2d7] dark:border-[#48484a] bg-white dark:bg-[#2d2d2f] hover:border-[#0071e3]"
                      }`}
                    >
                      <span className="text-2xl">{colors.icon}</span>
                      <p className="font-semibold text-sm mt-2 text-[#1d1d1f] dark:text-[#f5f5f7]">{sector.name}</p>
                      <p className="text-xs text-[#86868b]">{sector.count} stocks · {sector.total_market_cap}</p>
                    </button>
                  );
                })}
              </div>

              {/* All sectors */}
              {sectors.map((sector) => {
                const colors = getSectorColor(sector.name);
                const isExpanded = expandedSector === null || expandedSector === sector.name;
                if (!isExpanded) return null;
                return (
                  <div key={sector.name}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xl">{colors.icon}</span>
                      <h2 className={`text-xl font-semibold ${colors.text}`}>{sector.name}</h2>
                      <span className="text-sm text-[#86868b]">{sector.count} stocks · {sector.total_market_cap}</span>
                    </div>
                    <div className="space-y-2">
                      {sector.stocks.map((stock) => (
                        <StockRow key={stock.symbol} stock={stock} inWatchlist={watchlist.has(stock.symbol)} onToggleWatchlist={toggleWatchlist} showWatchlist={!!user} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StockRow({ stock, inWatchlist, onToggleWatchlist, showWatchlist }: { stock: Stock; inWatchlist: boolean; onToggleWatchlist: (s: string) => void; showWatchlist: boolean }) {
  return (
    <div className="rounded-2xl border border-[#d2d2d7] dark:border-[#38383a] bg-white dark:bg-[#2d2d2f] p-4 flex items-center justify-between card-hover">
      <Link href={`/research/${stock.symbol}`} className="flex items-center gap-4 flex-1 min-w-0 group">
        <div className="w-11 h-11 rounded-xl bg-[#f5f5f7] dark:bg-[#38383a] flex items-center justify-center group-hover:bg-[#0071e3] transition-colors shrink-0">
          <span className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-white font-mono transition-colors">
            {stock.symbol.charAt(0)}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-[#0071e3] transition-colors font-mono">
              {stock.symbol}
            </span>
            {stock.sector && stock.sector !== "Unknown" && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#f5f5f7] dark:bg-[#38383a] text-[#86868b] hidden sm:inline">
                {stock.sector}
              </span>
            )}
          </div>
          <p className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] truncate">{stock.name}</p>
        </div>
      </Link>

      <div className="flex items-center gap-4 shrink-0">
        {/* Price & Change */}
        {stock.price != null && (
          <div className="text-right hidden sm:block">
            <p className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">${stock.price.toFixed(2)}</p>
            {stock.change_pct != null && (
              <p className={`text-xs ${stock.change_pct >= 0 ? "text-[#34c759]" : "text-[#ff3b30]"}`}>
                {stock.change_pct >= 0 ? "+" : ""}{stock.change_pct.toFixed(2)}%
              </p>
            )}
          </div>
        )}

        {/* Market Cap */}
        {stock.market_cap && (
          <span className="text-xs text-[#86868b] hidden md:block w-16 text-right">{stock.market_cap}</span>
        )}

        {/* Watchlist */}
        {showWatchlist && (
          <button
            onClick={() => onToggleWatchlist(stock.symbol)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              inWatchlist
                ? "bg-[#0071e3] text-white hover:bg-[#0077ed]"
                : "bg-[#f5f5f7] dark:bg-[#38383a] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-[#e8e8ed] dark:hover:bg-[#48484a]"
            }`}
          >
            {inWatchlist ? "✓" : "+"}
          </button>
        )}
      </div>
    </div>
  );
}
