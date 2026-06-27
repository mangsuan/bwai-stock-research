"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#0071e3] border-t-transparent" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] px-6 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-[#ff3b30]/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🚫</span>
        </div>
        <h1 className="text-3xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-3">Access Denied</h1>
        <p className="text-[#6e6e73] dark:text-[#a1a1a6] mb-6">You don&apos;t have permission to access the admin panel.</p>
        <Link href="/" className="btn-apple text-sm">Go Home</Link>
      </div>
    );
  }

  const tabs = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/users", label: "Users", icon: "👥" },
    { href: "/admin/transactions", label: "Transactions", icon: "💰" },
    { href: "/admin/purchases", label: "Purchases", icon: "🛒" },
  ];

  return (
    <div className="animate-fade-in">
      {/* Admin Header */}
      <section className="bg-gradient-to-br from-[#1d1d1f] to-[#2d2d2f] py-8 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">⚡</span>
            <h1 className="text-3xl font-semibold tracking-tight text-white">Admin Panel</h1>
          </div>
          <p className="text-[#a1a1a6] text-sm">Manage users, transactions, and platform settings</p>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="border-b border-[#d2d2d7] dark:border-[#38383a] bg-white dark:bg-[#1d1d1f] sticky top-12 z-40">
        <div className="mx-auto max-w-5xl px-6">
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? "border-[#0071e3] text-[#0071e3]"
                      : "border-transparent text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:border-[#d2d2d7] dark:hover:border-[#48484a]"
                  }`}
                >
                  <span>{tab.icon}</span>
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
