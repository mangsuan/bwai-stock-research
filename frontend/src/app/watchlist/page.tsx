"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface WatchlistItem {
  ticker: string;
  added_at: string | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function WatchlistPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTicker, setNewTicker] = useState("");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (token) {
      fetchWatchlist();
    }
  }, [token]);

  async function fetchWatchlist() {
    try {
      const res = await fetch(`${API_BASE}/watchlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setItems(await res.json());
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function addTicker(e: React.FormEvent) {
    e.preventDefault();
    const ticker = newTicker.trim().toUpperCase();
    if (!ticker) return;

    try {
      const res = await fetch(`${API_BASE}/watchlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ticker }),
      });
      if (res.ok) {
        setNewTicker("");
        fetchWatchlist();
      }
    } catch {
      // ignore
    }
  }

  async function removeTicker(ticker: string) {
    try {
      const res = await fetch(`${API_BASE}/watchlist/${ticker}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setItems(items.filter((i) => i.ticker !== ticker));
      }
    } catch {
      // ignore
    }
  }

  if (isLoading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#0071e3] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="bg-[#f5f5f7] dark:bg-[#2d2d2f] py-16 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">Watchlist</h1>
          <p className="text-lg text-[#6e6e73] dark:text-[#a1a1a6]">Your saved stocks for quick access</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-6">
        <div className="mx-auto max-w-2xl">
          {/* Add ticker form */}
          <form onSubmit={addTicker} className="mb-10">
            <div className="flex gap-3">
              <input
                type="text"
                value={newTicker}
                onChange={(e) => setNewTicker(e.target.value)}
                placeholder="Enter stock ticker (e.g., AAPL)"
                aria-label="Stock ticker symbol"
                className="flex-1 rounded-2xl border border-[#d2d2d7] dark:border-[#48484a] bg-[#fbfbfd] dark:bg-[#1d1d1f] px-6 py-4 text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b] dark:placeholder:text-[#6e6e73] focus:border-[#0071e3] focus:outline-none focus:ring-4 focus:ring-[#0071e3]/10 transition-all font-mono uppercase"
                maxLength={10}
              />
              <button
                type="submit"
                disabled={!newTicker.trim()}
                className="btn-apple !py-4 !px-8 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </form>

          {/* Watchlist items */}
          {loading ? (
            <div className="text-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#0071e3] border-t-transparent mx-auto" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-[#f5f5f7] dark:bg-[#38383a] flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-[#86868b] dark:text-[#6e6e73]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">No stocks yet</h3>
              <p className="text-[#6e6e73] dark:text-[#a1a1a6]">Add some tickers to start tracking</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.ticker}
                  className="rounded-2xl border border-[#d2d2d7] dark:border-[#48484a] bg-white dark:bg-[#2d2d2f] p-6 flex items-center justify-between card-hover"
                >
                  <Link
                    href={`/research/${item.ticker}`}
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#f5f5f7] dark:bg-[#38383a] flex items-center justify-center group-hover:bg-[#0071e3] transition-colors">
                      <span className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-white font-mono transition-colors">
                        {item.ticker.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-[#0071e3] transition-colors font-mono">
                        {item.ticker}
                      </span>
                      {item.added_at && (
                        <p className="text-sm text-[#86868b] dark:text-[#6e6e73]">
                          Added {new Date(item.added_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </Link>
                  <button
                    onClick={() => removeTicker(item.ticker)}
                    className="rounded-full p-2 text-[#86868b] dark:text-[#6e6e73] hover:text-[#ff3b30] hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    title="Remove from watchlist"
                    aria-label={`Remove ${item.ticker} from watchlist`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
