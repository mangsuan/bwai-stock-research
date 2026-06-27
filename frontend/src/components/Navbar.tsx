"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const POINTS_REQUIRED = 500;

/* SVG Icons */
function SunIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

function LockIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  );
}

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  function handlePotentialClick() {
    if (!user) { router.push("/login"); return; }
    if ((user.total_points ?? 0) < POINTS_REQUIRED) { setShowUpgradeModal(true); return; }
    router.push("/potential-stocks");
  }

  const navBtn = "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-[#6e6e73] dark:text-[#a1a1a6] hover:bg-[#f5f5f7] dark:hover:bg-[#38383a] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-all";

  return (
    <>
      <header className="glass sticky top-0 z-50 border-b border-[#d2d2d7]/60 dark:border-[#38383a]/60">
        <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] hover:text-[#0071e3] transition-colors">
            BWAI
          </Link>
          <nav className="flex items-center gap-0.5">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#f5f5f7] dark:hover:bg-[#38383a] transition-colors text-[#6e6e73] dark:text-[#a1a1a6]"
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? <MoonIcon /> : <SunIcon />}
            </button>

            {isLoading ? (
              <div className="h-9 w-28 animate-pulse rounded-lg bg-[#f5f5f7] dark:bg-[#38383a]" />
            ) : user ? (
              <>
                <Link href="/explore" className={navBtn}>Explore</Link>
                <Link href="/rankings" className={navBtn}>Rankings</Link>
                <button onClick={handlePotentialClick} className={navBtn}>
                  <SparklesIcon /> Potential
                </button>
                <Link href="/watchlist" className={navBtn}>Watchlist</Link>
                {user.role === "admin" && (
                  <Link href="/admin" className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold text-[#ff9500] hover:bg-[#ff9500]/10 transition-all">
                    <BoltIcon /> Admin
                  </Link>
                )}
                <div className="w-px h-5 bg-[#d2d2d7] dark:bg-[#38383a] mx-1" />
                <Link href="/profile" className="flex items-center gap-2 group">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url.startsWith("http") ? user.avatar_url : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${user.avatar_url}`}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover border-2 border-[#d2d2d7] dark:border-[#38383a] group-hover:border-[#0071e3] transition-colors"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center text-white text-xs font-semibold shadow-sm shadow-[#0071e3]/20">
                      {(user.display_name || user.username).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] hidden sm:inline">
                    {user.display_name || user.username}
                  </span>
                </Link>
                <button onClick={logout} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#ff3b30]/10 text-[#86868b] hover:text-[#ff3b30] transition-all" title="Sign Out">
                  <LogoutIcon />
                </button>
              </>
            ) : (
              <>
                <Link href="/explore" className={navBtn}>Explore</Link>
                <Link href="/login" className={navBtn}>Sign In</Link>
                <Link href="/register" className="btn-apple text-sm !py-2 !px-5 ml-1">
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowUpgradeModal(false)}>
          <div className="mx-4 w-full max-w-sm card-premium p-8 text-center animate-slide-down" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-2xl bg-[#ff9500]/10 flex items-center justify-center mx-auto mb-5">
              <LockIcon className="w-8 h-8 text-[#ff9500]" />
            </div>
            <h2 className="text-xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">Premium Feature</h2>
            <p className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] mb-1">
              Only users with <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">500 points</span> or more can access this feature.
            </p>
            <p className="text-sm text-[#86868b] mb-6">
              You have <span className="font-semibold">{user?.total_points ?? 0}</span> points. Need <span className="font-semibold text-[#0071e3]">{POINTS_REQUIRED - (user?.total_points ?? 0)}</span> more.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/profile" onClick={() => setShowUpgradeModal(false)} className="btn-apple text-sm !py-2.5">
                Earn or Buy Points
              </Link>
              <button onClick={() => setShowUpgradeModal(false)} className="btn-ghost text-sm">
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
