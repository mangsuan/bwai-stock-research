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
  theme: string;
  avatar_url: string | null;
  total_points: number;
  member_level: string;
  page_visibility: string | null;
  created_at: string | null;
}

const LEVELS = ["entry", "bronze", "silver", "gold", "platinum", "diamond", "master"];
const LEVEL_POINTS: Record<string, number> = { entry: 0, bronze: 100, silver: 200, gold: 300, platinum: 400, diamond: 500, master: 1000 };

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [createForm, setCreateForm] = useState({ username: "", email: "", password: "", role: "user" });
  const [editForm, setEditForm] = useState<Partial<AdminUser> & { total_points?: number }>({});
  const [saving, setSaving] = useState(false);
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

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }

  async function handleAction(userId: number, action: string) {
    if (!token) return;
    const res = await fetch(`${API_BASE}/admin/users/${userId}/${action}`, {
      method: action === "delete" ? "DELETE" : "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      showMessage("success", `User ${action}d successfully`);
      fetchUsers();
    } else {
      const err = await res.json();
      showMessage("error", err.detail || "Action failed");
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    const params = new URLSearchParams(createForm);
    const res = await fetch(`${API_BASE}/admin/users?${params}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      showMessage("success", "User created");
      setShowCreate(false);
      setCreateForm({ username: "", email: "", password: "", role: "user" });
      fetchUsers();
    } else {
      const err = await res.json();
      showMessage("error", err.detail || "Create failed");
    }
    setSaving(false);
  }

  function openEdit(user: AdminUser) {
    setEditUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      display_name: user.display_name || "",
      role: user.role,
      status: user.status,
      theme: user.theme,
      total_points: user.total_points,
    });
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !editUser) return;
    setSaving(true);

    const body: Record<string, unknown> = {};
    if (editForm.username) body.username = editForm.username;
    if (editForm.email) body.email = editForm.email;
    if (editForm.display_name !== undefined) body.display_name = editForm.display_name;
    if (editForm.role) body.role = editForm.role;
    if (editForm.status) body.status = editForm.status;
    if (editForm.theme) body.theme = editForm.theme;
    if (editForm.total_points !== undefined) body.total_points = editForm.total_points;

    const res = await fetch(`${API_BASE}/admin/users/${editUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      showMessage("success", "User updated");
      setEditUser(null);
      fetchUsers();
    } else {
      const err = await res.json();
      showMessage("error", err.detail || "Update failed");
    }
    setSaving(false);
  }

  function handleLevelSelect(level: string) {
    setEditForm({ ...editForm, total_points: LEVEL_POINTS[level] });
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
        <div className={`mb-4 p-3 rounded-xl text-sm animate-slide-down ${message.type === "success" ? "bg-[#34c759]/10 text-[#34c759]" : "bg-[#ff3b30]/10 text-[#ff3b30]"}`}>
          {message.text}
        </div>
      )}

      {/* Create User Form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="card-premium p-6 mb-6 animate-slide-down">
          <h3 className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">Create New User</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input placeholder="Username" value={createForm.username} onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })} className="input-premium" required />
            <input placeholder="Email" type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} className="input-premium" required />
            <input placeholder="Password" type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} className="input-premium" required />
            <select value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })} className="input-premium">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" disabled={saving} className="btn-apple text-sm !py-2 !px-4 disabled:opacity-50">{saving ? "Creating..." : "Create User"}</button>
            <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost text-sm">Cancel</button>
          </div>
        </form>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setEditUser(null)}>
          <div className="mx-4 w-full max-w-lg rounded-2xl bg-white dark:bg-[#2d2d2f] border border-[#d2d2d7] dark:border-[#38383a] p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Edit User: {editUser.username}</h3>
              <button onClick={() => setEditUser(null)} className="text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]">✕</button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#86868b] mb-1">Username</label>
                  <input value={editForm.username || ""} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} className="input-premium w-full" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#86868b] mb-1">Email</label>
                  <input value={editForm.email || ""} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="input-premium w-full" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#86868b] mb-1">Display Name</label>
                  <input value={editForm.display_name || ""} onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })} className="input-premium w-full" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#86868b] mb-1">Role</label>
                  <select value={editForm.role || "user"} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="input-premium w-full">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#86868b] mb-1">Status</label>
                  <select value={editForm.status || "active"} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="input-premium w-full">
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#86868b] mb-1">Theme</label>
                  <select value={editForm.theme || "light"} onChange={(e) => setEditForm({ ...editForm, theme: e.target.value })} className="input-premium w-full">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
              </div>

              {/* Points & Level */}
              <div className="pt-4 border-t border-[#d2d2d7] dark:border-[#38383a]">
                <h4 className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-3">Points & Level</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#86868b] mb-1">Total Points</label>
                    <input
                      type="number"
                      min={0}
                      value={editForm.total_points ?? 0}
                      onChange={(e) => setEditForm({ ...editForm, total_points: Number(e.target.value) })}
                      className="input-premium w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#86868b] mb-1">Set Level (auto-calculates points)</label>
                    <select
                      value=""
                      onChange={(e) => handleLevelSelect(e.target.value)}
                      className="input-premium w-full"
                    >
                      <option value="">Select level...</option>
                      {LEVELS.map((l) => (
                        <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)} ({LEVEL_POINTS[l]} pts)</option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-xs text-[#86868b] mt-2">Current level: <span className="font-medium capitalize">{editUser.member_level}</span> ({editUser.total_points} pts)</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving} className="btn-apple text-sm !py-2 !px-6 disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button>
                <button type="button" onClick={() => setEditUser(null)} className="btn-ghost text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="Search by username or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input-premium w-full mb-4"
      />

      {/* User List */}
      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => (
            <div key={u.id} className="card-premium p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{u.username}</span>
                  {u.role === "admin" && <span className="badge bg-[#ff9500]/10 text-[#ff9500]">Admin</span>}
                  {u.status === "suspended" && <span className="badge bg-[#ff3b30]/10 text-[#ff3b30]">Suspended</span>}
                  <span className="badge bg-[#f5f5f7] dark:bg-[#38383a] text-[#86868b] capitalize">{u.member_level}</span>
                </div>
                <p className="text-xs text-[#86868b] mt-0.5">
                  {u.email} · {u.total_points} pts · ID: {u.id}
                  {u.created_at && ` · Joined ${new Date(u.created_at).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(u)} className="btn-ghost text-xs text-[#0071e3]">Edit</button>
                {u.status === "active" ? (
                  <button onClick={() => handleAction(u.id, "suspend")} className="btn-ghost text-xs text-[#ff9500]">Suspend</button>
                ) : (
                  <button onClick={() => handleAction(u.id, "activate")} className="btn-ghost text-xs text-[#34c759]">Activate</button>
                )}
                <button onClick={() => { if (confirm(`Delete ${u.username}? This cannot be undone.`)) handleAction(u.id, "delete"); }} className="btn-ghost text-xs text-[#ff3b30]">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
