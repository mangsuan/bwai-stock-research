"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import MemberBadge from "@/components/MemberBadge";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ProfilePage() {
  const { user, token, isLoading, refreshUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pointsInfo, setPointsInfo] = useState<any>(null);
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);
  const [buyAmount, setBuyAmount] = useState(50);
  const [earnAmount, setEarnAmount] = useState(10);

  // Initialize form when user loads
  useState(() => {
    if (user) {
      setDisplayName(user.display_name || "");
      setUsername(user.username);
    }
  });

  // Fetch points info
  useState(() => {
    if (token) {
      fetch(`${API_BASE}/member/points`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then(setPointsInfo)
        .catch(() => {});

      fetch(`${API_BASE}/member/history`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then(setPointsHistory)
        .catch(() => {});
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-[#0071e3] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  async function handleSaveProfile() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          display_name: displayName || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      await refreshUser();
      setMessage({ type: "success", text: "Profile updated!" });
    } catch {
      setMessage({ type: "error", text: "Failed to save profile" });
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/auth/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      await refreshUser();
      setMessage({ type: "success", text: "Avatar updated!" });
    } catch {
      setMessage({ type: "error", text: "Failed to upload avatar" });
    } finally {
      setUploading(false);
    }
  }

  async function handleBuyPoints() {
    try {
      const res = await fetch(`${API_BASE}/member/points/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: buyAmount }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setPointsInfo(data);
      await refreshUser();
      setMessage({ type: "success", text: `Purchased ${buyAmount} points!` });
    } catch {
      setMessage({ type: "error", text: "Failed to purchase points" });
    }
  }

  async function handleEarnPoints() {
    try {
      const res = await fetch(`${API_BASE}/member/points/earn`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: earnAmount, description: "Ad reward" }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setPointsInfo(data);
      await refreshUser();
      setMessage({ type: "success", text: `Earned ${earnAmount} points!` });
    } catch {
      setMessage({ type: "error", text: "Failed to earn points" });
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#111111]">
      {/* Hero */}
      <section className="bg-[#f5f5f7] dark:bg-[#2d2d2f] py-12">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h1 className="text-4xl font-semibold tracking-tight mb-2">Profile</h1>
          <p className="text-[#6e6e73] dark:text-[#a1a1a6]">Manage your account and membership</p>
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-6 py-8 space-y-6">
        {message && (
          <div className={`rounded-2xl p-4 text-sm ${message.type === "success" ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
            {message.text}
          </div>
        )}

        {/* Avatar Section */}
        <div className="bg-white dark:bg-[#2d2d2f] rounded-3xl border border-[#d2d2d7] dark:border-[#38383a] p-8">
          <h2 className="text-lg font-semibold mb-6">Profile Picture</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url.startsWith("http") ? user.avatar_url : `${API_BASE}${user.avatar_url}`}
                  alt={user.username}
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#f5f5f7] dark:border-[#38383a]"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#0071e3] flex items-center justify-center text-white text-3xl font-medium">
                  {(user.display_name || user.username).charAt(0).toUpperCase()}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#0071e3] rounded-full flex items-center justify-center text-white text-sm hover:bg-[#0077ed] transition-colors disabled:opacity-50"
              >
                {uploading ? "..." : "📷"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <div>
              <p className="font-medium text-lg">{user.display_name || user.username}</p>
              <p className="text-sm text-[#6e6e73] dark:text-[#a1a1a6]">@{user.username}</p>
              <p className="text-sm text-[#86868b]">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="bg-white dark:bg-[#2d2d2f] rounded-3xl border border-[#d2d2d7] dark:border-[#38383a] p-8">
          <h2 className="text-lg font-semibold mb-6">Edit Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#6e6e73] dark:text-[#a1a1a6] mb-2">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={user.username}
                className="w-full px-4 py-3 rounded-2xl border border-[#d2d2d7] dark:border-[#48484a] bg-[#fbfbfd] dark:bg-[#1d1d1f] focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6e6e73] dark:text-[#a1a1a6] mb-2">Username</label>
              <input
                type="text"
                value={username}
                disabled
                className="w-full px-4 py-3 rounded-2xl border border-[#d2d2d7] dark:border-[#48484a] bg-[#f5f5f7] dark:bg-[#38383a] text-[#86868b] cursor-not-allowed"
              />
              <p className="text-xs text-[#86868b] mt-1">Username cannot be changed</p>
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="btn-apple disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Theme */}
        <div className="bg-white dark:bg-[#2d2d2f] rounded-3xl border border-[#d2d2d7] dark:border-[#38383a] p-8">
          <h2 className="text-lg font-semibold mb-6">Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-[#6e6e73] dark:text-[#a1a1a6]">
                Currently using {theme} mode
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="w-14 h-8 rounded-full bg-[#e5e5ea] dark:bg-[#48484a] relative transition-colors"
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-all ${theme === "dark" ? "left-7" : "left-1"}`} />
            </button>
          </div>
        </div>

        {/* Member Section */}
        <div className="bg-white dark:bg-[#2d2d2f] rounded-3xl border border-[#d2d2d7] dark:border-[#38383a] p-8">
          <h2 className="text-lg font-semibold mb-6">Membership</h2>

          <div className="mb-6">
            <MemberBadge
              level={user.member_level}
              points={user.total_points}
              showProgress
              progressPct={pointsInfo?.progress_pct ?? 0}
              pointsToNext={pointsInfo?.points_to_next}
              nextThreshold={pointsInfo?.next_threshold}
            />
          </div>

          {/* Earn Points */}
          <div className="border-t border-[#d2d2d7] dark:border-[#38383a] pt-6 mb-6">
            <h3 className="font-medium mb-3">Earn Points (Watch Ads)</h3>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                value={earnAmount}
                onChange={(e) => setEarnAmount(Number(e.target.value))}
                className="w-24 px-3 py-2 rounded-xl border border-[#d2d2d7] dark:border-[#48484a] bg-[#fbfbfd] dark:bg-[#1d1d1f] focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10 outline-none"
              />
              <button onClick={handleEarnPoints} className="btn-apple text-sm !py-2 !px-5">
                Watch Ad (+{earnAmount} pts)
              </button>
            </div>
            <p className="text-xs text-[#86868b] mt-2">Simulated ad watching for demo purposes</p>
          </div>

          {/* Buy Points */}
          <div className="border-t border-[#d2d2d7] dark:border-[#38383a] pt-6">
            <h3 className="font-medium mb-3">Buy Points</h3>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                value={buyAmount}
                onChange={(e) => setBuyAmount(Number(e.target.value))}
                className="w-24 px-3 py-2 rounded-xl border border-[#d2d2d7] dark:border-[#48484a] bg-[#fbfbfd] dark:bg-[#1d1d1f] focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10 outline-none"
              />
              <button onClick={handleBuyPoints} className="btn-apple-secondary text-sm !py-2 !px-5">
                Buy {buyAmount} Points
              </button>
            </div>
          </div>
        </div>

        {/* Points History */}
        {pointsHistory.length > 0 && (
          <div className="bg-white dark:bg-[#2d2d2f] rounded-3xl border border-[#d2d2d7] dark:border-[#38383a] p-8">
            <h2 className="text-lg font-semibold mb-6">Points History</h2>
            <div className="space-y-3">
              {pointsHistory.map((txn: any) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between py-2 border-b border-[#f5f5f7] dark:border-[#38383a] last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {txn.source === "ad_reward" ? "🎬 Ad Reward" : "💰 Purchase"}
                    </p>
                    {txn.description && (
                      <p className="text-xs text-[#86868b]">{txn.description}</p>
                    )}
                  </div>
                  <span className={`font-medium ${txn.amount > 0 ? "text-[#34c759]" : "text-[#ff3b30]"}`}>
                    +{txn.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
