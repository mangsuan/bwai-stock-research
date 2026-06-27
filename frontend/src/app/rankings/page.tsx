"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface RankedStock {
  rank: number;
  ticker: string;
  name: string;
  sector: string;
  country: string;
  flag: string;
  price: number | null;
  change_pct: number | null;
  market_cap: string;
}

export default function GlobalRankingPage() {
  const [stocks, setStocks] = useState<RankedStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/rankings/global?limit=50`)
      .then((res) => res.json())
      .then((data) => setStocks(data.stocks || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-[#86868b]">{stocks.length} companies ranked by market cap</p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : (
        <div className="card-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#d2d2d7] dark:border-[#38383a] bg-[#f5f5f7]/50 dark:bg-[#2d2d2f]/50">
                  <th className="text-left text-xs font-semibold text-[#86868b] uppercase tracking-wider px-4 py-3 w-12">#</th>
                  <th className="text-left text-xs font-semibold text-[#86868b] uppercase tracking-wider px-4 py-3">Company</th>
                  <th className="text-right text-xs font-semibold text-[#86868b] uppercase tracking-wider px-4 py-3">Market Cap</th>
                  <th className="text-right text-xs font-semibold text-[#86868b] uppercase tracking-wider px-4 py-3">Price</th>
                  <th className="text-right text-xs font-semibold text-[#86868b] uppercase tracking-wider px-4 py-3">Change</th>
                  <th className="text-left text-xs font-semibold text-[#86868b] uppercase tracking-wider px-4 py-3 hidden md:table-cell">Country</th>
                  <th className="text-left text-xs font-semibold text-[#86868b] uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Sector</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock) => (
                  <tr key={stock.ticker} className="border-b border-[#f5f5f7] dark:border-[#38383a]/50 hover:bg-[#f5f5f7]/50 dark:hover:bg-[#38383a]/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${stock.rank <= 3 ? "text-[#ff9500]" : "text-[#86868b]"}`}>
                        {stock.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/research/${stock.ticker}`} className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-lg bg-[#f5f5f7] dark:bg-[#38383a] flex items-center justify-center group-hover:bg-[#0071e3] transition-colors shrink-0">
                          <span className="text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-white font-mono">
                            {stock.ticker.charAt(0)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-[#0071e3] transition-colors truncate">
                            {stock.name}
                          </p>
                          <p className="text-xs text-[#86868b] font-mono">{stock.ticker}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{stock.market_cap}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">
                        {stock.price != null ? `$${stock.price.toFixed(2)}` : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {stock.change_pct != null ? (
                        <span className={`text-sm font-medium ${stock.change_pct >= 0 ? "text-[#34c759]" : "text-[#ff3b30]"}`}>
                          {stock.change_pct >= 0 ? "+" : ""}{stock.change_pct.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-sm text-[#86868b]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-[#6e6e73] dark:text-[#a1a1a6]">
                        {stock.flag} {stock.country}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs px-2 py-1 rounded-full bg-[#f5f5f7] dark:bg-[#38383a] text-[#86868b]">
                        {stock.sector}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
