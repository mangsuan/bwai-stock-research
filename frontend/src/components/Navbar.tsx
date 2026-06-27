"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const POINTS_REQUIRED = 500;

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  function handlePotentialClick() {
    if (!user) {
      router.push("/login");
      return;
    }
    if ((user.total_points ?? 0) < POINTS_REQUIRED) {
      setShowUpgradeModal(true);
      return;
    }
    router.push("/potential-stocks");
  }

  return (
    <>
      <header className="glass sticky top-0 z-50 border-b border-[#d2d2d7] dark:border-[#38383a] dark:bg-[#1d1d1f]/80">
        <div className="mx-auto max-w-5xl px-6 h-12 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] hover:text-[#0071e3] transition-colors">
            BWAI
          </Link>
          <nav className="flex items-center gap-4">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7] dark:hover:bg-[#38383a] transition-colors text-lg"
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>

            {isLoading ? (
              <div className="h-8 w-24 animate-pulse rounded-full bg-[#f5f5f7] dark:bg-[#38383a]" />
            ) : user ? (
              <>
                <Link
                  href="/explore"
                  className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors"
                >
                  Explore
                </Link>
                <button
                  onClick={handlePotentialClick}
                  className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors"
                >
                  ✨ Potential
                </button>
                <Link
                  href="/watchlist"
                  className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors"
                >
                  Watchlist
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 group"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url.startsWith("http") ? user.avatar_url : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${user.avatar_url}`}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover border-2 border-[#d2d2d7] dark:border-[#38383a] group-hover:border-[#0071e3] transition-colors"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#0071e3] flex items-center justify-center text-white text-sm font-medium">
                      {(user.display_name || user.username).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] hidden sm:inline">
                    {user.display_name || user.username}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#ff3b30] transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/explore"
                  className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors"
                >
                  Explore
                </Link>
                <Link
                  href="/login"
                  className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="btn-apple text-sm !py-2 !px-5"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowUpgradeModal(false)}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-2xl bg-white dark:bg-[#2d2d2f] border border-[#d2d2d7] dark:border-[#38383a] p-8 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
              Premium Feature
            </h2>
            <p className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] mb-1">
              Only users with <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">500 points</span> or more can access this feature.
            </p>
            <p className="text-sm text-[#86868b] mb-6">
              You currently have <span className="font-semibold">{user?.total_points ?? 0}</span> points. You need <span className="font-semibold text-[#0071e3]">{POINTS_REQUIRED - (user?.total_points ?? 0)}</span> more.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/profile"
                onClick={() => setShowUpgradeModal(false)}
                className="btn-apple text-sm !py-2.5"
              >
                Earn or Buy Points
              </Link>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
