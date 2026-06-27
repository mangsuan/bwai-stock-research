"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface AdminStats {
  total_users: number;
  active_users: number;
  suspended_users: number;
  admin_users: number;
  pending_purchases: number;
  total_transactions: number;
  total_points_distributed: number;
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
    );
  }

  if (!stats) return <p className="text-[#86868b]">Failed to load stats.</p>;

  const cards = [
    { label: "Total Users", value: stats.total_users, icon: "👥", color: "#0071e3" },
    { label: "Active Users", value: stats.active_users, icon: "✅", color: "#34c759" },
    { label: "Suspended", value: stats.suspended_users, icon: "⛔", color: "#ff3b30" },
    { label: "Admins", value: stats.admin_users, icon: "⚡", color: "#ff9500" },
    { label: "Pending Purchases", value: stats.pending_purchases, icon: "⏳", color: "#af52de" },
    { label: "Total Transactions", value: stats.total_transactions, icon: "💰", color: "#5856d6" },
    { label: "Points Distributed", value: stats.total_points_distributed.toLocaleString(), icon: "🎯", color: "#0071e3" },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-6">Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="card-premium p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{card.icon}</span>
              <span className="text-xs text-[#86868b] uppercase tracking-wider">{card.label}</span>
            </div>
            <p className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]" style={{ color: card.color }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
