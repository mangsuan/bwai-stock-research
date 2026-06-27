"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function RankingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { href: "/rankings", label: "Global Ranking", icon: "🌍" },
    { href: "/rankings/countries", label: "By Country", icon: "🏳️" },
    { href: "/rankings/categories", label: "By Category", icon: "📊" },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#f5f5f7] to-[#e8e8ed] dark:from-[#2d2d2f] dark:to-[#1d1d1f] py-12 px-6">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0071e3]/8 dark:bg-[#0071e3]/15 text-[#0071e3] text-sm font-medium mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            Live Market Data
          </div>
          <h1 className="text-5xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] mb-4 heading-tight">
            Stock Rankings
          </h1>
          <p className="text-lg text-[#6e6e73] dark:text-[#a1a1a6] max-w-2xl mx-auto">
            Global companies ranked by market capitalization with live prices
          </p>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="border-b border-[#d2d2d7] dark:border-[#38383a] bg-white dark:bg-[#1d1d1f] sticky top-14 z-40">
        <div className="mx-auto max-w-5xl px-6">
          <nav className="flex gap-1 overflow-x-auto py-1">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-[#0071e3]/10 text-[#0071e3]"
                      : "text-[#6e6e73] dark:text-[#a1a1a6] hover:bg-[#f5f5f7] dark:hover:bg-[#38383a] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 px-6">
        <div className="mx-auto max-w-5xl">
          {children}
        </div>
      </section>
    </div>
  );
}
