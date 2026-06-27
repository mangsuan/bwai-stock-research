"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Transaction {
  id: number;
  user_id: number;
  username: string;
  amount: number;
  source: string;
  description: string | null;
  approval_status: string;
  approved_by: number | null;
  approved_at: string | null;
  created_at: string | null;
}

export default function AdminTransactionsPage() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/admin/transactions?limit=200`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setTransactions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = transactions.filter((t) => {
    if (filter === "all") return true;
    if (filter === "purchase") return t.source === "purchase";
    if (filter === "ad_reward") return t.source === "ad_reward";
    if (filter === "pending") return t.approval_status === "pending";
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Transactions ({transactions.length})</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-premium !py-2 !px-3 text-sm">
          <option value="all">All</option>
          <option value="purchase">Purchases</option>
          <option value="ad_reward">Ad Rewards</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton h-14 rounded-2xl" />)}</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => (
            <div key={t.id} className="card-premium p-4 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{t.username}</span>
                  <span className="badge bg-[#f5f5f7] dark:bg-[#38383a] text-[#86868b]">
                    {t.source === "ad_reward" ? "🎬 Ad" : "💰 Purchase"}
                  </span>
                  {t.approval_status === "pending" && <span className="badge bg-[#ff9500]/10 text-[#ff9500]">Pending</span>}
                  {t.approval_status === "approved" && <span className="badge bg-[#34c759]/10 text-[#34c759]">Approved</span>}
                  {t.approval_status === "rejected" && <span className="badge bg-[#ff3b30]/10 text-[#ff3b30]">Rejected</span>}
                </div>
                {t.description && <p className="text-xs text-[#86868b]">{t.description}</p>}
              </div>
              <div className="text-right shrink-0">
                <span className={`font-semibold ${t.amount > 0 ? "text-[#34c759]" : "text-[#ff3b30]"}`}>
                  {t.amount > 0 ? "+" : ""}{t.amount}
                </span>
                <p className="text-xs text-[#86868b]">{t.created_at ? new Date(t.created_at).toLocaleDateString() : ""}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
