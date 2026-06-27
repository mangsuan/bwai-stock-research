"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

function ChartBarIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function CurrencyDollarIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ShoppingCartIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

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
          <svg className="w-10 h-10 text-[#ff3b30]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h1 className="text-3xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-3">Access Denied</h1>
        <p className="text-[#6e6e73] dark:text-[#a1a1a6] mb-6">You don&apos;t have permission to access the admin panel.</p>
        <Link href="/" className="btn-apple text-sm">Go Home</Link>
      </div>
    );
  }

  const tabs = [
    { href: "/admin", label: "Dashboard", icon: <ChartBarIcon /> },
    { href: "/admin/users", label: "Users", icon: <UsersIcon /> },
    { href: "/admin/transactions", label: "Transactions", icon: <CurrencyDollarIcon /> },
    { href: "/admin/purchases", label: "Purchases", icon: <ShoppingCartIcon /> },
  ];

  return (
    <div className="animate-fade-in">
      {/* Admin Header */}
      <section className="bg-gradient-to-br from-[#1d1d1f] to-[#2d2d2f] py-8 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#ff9500]/15 flex items-center justify-center">
              <BoltIcon />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">Admin Panel</h1>
              <p className="text-[#a1a1a6] text-sm">Manage users, transactions, and platform settings</p>
            </div>
          </div>
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
                  {tab.icon}
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
