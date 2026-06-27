"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface AdminUser {
  id: number;
  username: string;
  email: string;
  display_name: string | null;
  role: string;
  status: string;
  total_points: number;
  member_level: string;
  created_at: string | null;
}

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ username: "", email: "", password: "", role: "user" });
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => { fetchUsers(); }, [token]);

  function fetchUsers() {
    if (!token) return;
    setLoading(true);
    fetch(`${API_BASE}/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  async function handleAction(userId: number, action: string) {
    if (!token) return;
    const res = await fetch(`${API_BASE}/admin/users/${userId}/${action}`, {
      method: action === "delete" ? "DELETE" : "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setMessage({ type: "success", text: `User ${action}d successfully` });
      fetchUsers();
    } else {
      const err = await res.json();
      setMessage({ type: "error", text: err.detail || "Action failed" });
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setCreating(true);
    const params = new URLSearchParams(createForm);
    const res = await fetch(`${API_BASE}/admin/users?${params}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setMessage({ type: "success", text: "User created" });
      setShowCreate(false);
      setCreateForm({ username: "", email: "", password: "", role: "user" });
      fetchUsers();
    } else {
      const err = await res.json();
      setMessage({ type: "error", text: err.detail || "Create failed" });
    }
    setCreating(false);
  }

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Users ({users.length})</h2>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-apple text-sm !py-2 !px-4">
          + Create User
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-xl text-sm ${message.type === "success" ? "bg-[#34c759]/10 text-[#34c759]" : "bg-[#ff3b30]/10 text-[#ff3b30]"}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-2 opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {showCreate && (
        <form onSubmit={handleCreate} className="card-premium p-6 mb-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input placeholder="Username" value={createForm.username} onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })} className="input-premium" required />
            <input placeholder="Email" type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} className="input-premium" required />
            <input placeholder="Password" type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} className="input-premium" required />
            <select value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })} className="input-premium">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={creating} className="btn-apple text-sm !py-2 !px-4 disabled:opacity-50">{creating ? "Creating..." : "Create"}</button>
            <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost text-sm">Cancel</button>
          </div>
        </form>
      )}

      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input-premium w-full mb-4"
      />

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => (
            <div key={u.id} className="card-premium p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{u.username}</span>
                  {u.role === "admin" && <span className="badge bg-[#ff9500]/10 text-[#ff9500]">Admin</span>}
                  {u.status === "suspended" && <span className="badge bg-[#ff3b30]/10 text-[#ff3b30]">Suspended</span>}
                </div>
                <p className="text-xs text-[#86868b]">{u.email} · {u.total_points} pts · {u.member_level}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {u.status === "active" ? (
                  <button onClick={() => handleAction(u.id, "suspend")} className="btn-ghost text-xs text-[#ff9500]">Suspend</button>
                ) : (
                  <button onClick={() => handleAction(u.id, "activate")} className="btn-ghost text-xs text-[#34c759]">Activate</button>
                )}
                <button onClick={() => { if (confirm(`Delete ${u.username}?`)) handleAction(u.id, "delete"); }} className="btn-ghost text-xs text-[#ff3b30]">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
