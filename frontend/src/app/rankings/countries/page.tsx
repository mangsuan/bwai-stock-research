"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface CountryStock {
  rank: number;
  ticker: string;
  name: string;
  price: number | null;
  change_pct: number | null;
  market_cap: string;
}

interface Country {
  name: string;
  flag: string;
  stocks: CountryStock[];
  total_market_cap: string;
  count: number;
}

export default function CountriesRankingPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/rankings/countries`)
      .then((res) => res.json())
      .then((data) => setCountries(data.countries || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-[#86868b]">{countries.length} countries</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {countries.map((country) => {
            const isOpen = expanded === country.name;
            return (
              <div key={country.name} className="card-premium overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : country.name)}
                  className="w-full flex items-center justify-between p-5 hover:bg-[#f5f5f7]/50 dark:hover:bg-[#38383a]/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{country.flag}</span>
                    <div>
                      <h3 className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{country.name}</h3>
                      <p className="text-xs text-[#86868b]">{country.count} companies</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold text-[#0071e3]">{country.total_market_cap}</span>
                    <svg
                      className={`w-5 h-5 text-[#86868b] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-[#d2d2d7] dark:border-[#38383a]">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#f5f5f7]/50 dark:bg-[#2d2d2f]/50">
                          <th className="text-left text-xs font-semibold text-[#86868b] uppercase tracking-wider px-4 py-2 w-12">#</th>
                          <th className="text-left text-xs font-semibold text-[#86868b] uppercase tracking-wider px-4 py-2">Company</th>
                          <th className="text-right text-xs font-semibold text-[#86868b] uppercase tracking-wider px-4 py-2">Market Cap</th>
                          <th className="text-right text-xs font-semibold text-[#86868b] uppercase tracking-wider px-4 py-2">Price</th>
                          <th className="text-right text-xs font-semibold text-[#86868b] uppercase tracking-wider px-4 py-2">Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        {country.stocks.map((stock, i) => (
                          <tr key={stock.ticker} className="border-t border-[#f5f5f7] dark:border-[#38383a]/50">
                            <td className="px-4 py-2.5 text-sm text-[#86868b]">{i + 1}</td>
                            <td className="px-4 py-2.5">
                              <Link href={`/research/${stock.ticker}`} className="group">
                                <span className="font-medium text-sm text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-[#0071e3] transition-colors">
                                  {stock.name}
                                </span>
                                <span className="ml-2 text-xs text-[#86868b] font-mono">{stock.ticker}</span>
                              </Link>
                            </td>
                            <td className="px-4 py-2.5 text-right text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{stock.market_cap}</td>
                            <td className="px-4 py-2.5 text-right text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">
                              {stock.price != null ? `$${stock.price.toFixed(2)}` : "—"}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              {stock.change_pct != null ? (
                                <span className={`text-sm font-medium ${stock.change_pct >= 0 ? "text-[#34c759]" : "text-[#ff3b30]"}`}>
                                  {stock.change_pct >= 0 ? "+" : ""}{stock.change_pct.toFixed(2)}%
                                </span>
                              ) : <span className="text-sm text-[#86868b]">—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
