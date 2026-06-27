"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface PendingPurchase {
  id: number;
  user_id: number;
  username: string;
  amount: number;
  description: string | null;
  created_at: string | null;
}

export default function AdminPurchasesPage() {
  const { token } = useAuth();
  const [purchases, setPurchases] = useState<PendingPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => { fetchPurchases(); }, [token]);

  function fetchPurchases() {
    if (!token) return;
    setLoading(true);
    fetch(`${API_BASE}/admin/purchases/pending`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then(setPurchases)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  async function handleAction(id: number, action: "approve" | "reject") {
    if (!token) return;
    const res = await fetch(`${API_BASE}/admin/purchases/${id}/${action}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setMessage({ type: "success", text: `Purchase ${action}d` });
      fetchPurchases();
    } else {
      const err = await res.json();
      setMessage({ type: "error", text: err.detail || "Action failed" });
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-6">Pending Purchases ({purchases.length})</h2>

      {message && (
        <div className={`mb-4 p-3 rounded-xl text-sm ${message.type === "success" ? "bg-[#34c759]/10 text-[#34c759]" : "bg-[#ff3b30]/10 text-[#ff3b30]"}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-2 opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      ) : purchases.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-[#f5f5f7] dark:bg-[#38383a] flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <p className="text-[#86868b]">No pending purchases</p>
        </div>
      ) : (
        <div className="space-y-3">
          {purchases.map((p) => (
            <div key={p.id} className="card-premium p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{p.username}</span>
                    <span className="badge bg-[#ff9500]/10 text-[#ff9500]">Pending</span>
                  </div>
                  <p className="text-sm text-[#86868b]">
                    {p.description || "Point purchase"} · {p.created_at ? new Date(p.created_at).toLocaleString() : ""}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-semibold text-[#0071e3]">+{p.amount} pts</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleAction(p.id, "approve")} className="btn-apple text-sm !py-2 !px-4">
                      Approve
                    </button>
                    <button onClick={() => handleAction(p.id, "reject")} className="btn-apple-secondary text-sm !py-2 !px-4 !border-[#ff3b30] !text-[#ff3b30] hover:!bg-[#ff3b30] hover:!text-white">
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
