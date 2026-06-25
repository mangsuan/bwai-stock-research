"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<{ name: string; label: string }[]>([]);
  const { register } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetch(`${API_BASE}/auth/providers`)
      .then((res) => res.json())
      .then((data) => setProviders(data.providers || []))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(username, email, password);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  function handleOAuth(provider: string) {
    window.location.href = `${API_BASE}/auth/${provider}`;
  }

  return (
    <div className="flex flex-1 items-center justify-center min-h-[80vh] px-6">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-semibold text-[#1d1d1f] mb-3">Create Account</h1>
          <p className="text-[#6e6e73]">Start your research journey</p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 border border-red-100 p-4 text-sm text-[#ff3b30]">
            {error}
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-8">
          <button
            onClick={() => handleOAuth("google")}
            disabled={!providers.find((p) => p.name === "google")}
            className="w-full flex items-center justify-center gap-3 rounded-2xl border border-[#d2d2d7] bg-white px-6 py-4 text-[#1d1d1f] font-medium transition-all hover:bg-[#f5f5f7] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <button
            onClick={() => handleOAuth("facebook")}
            disabled={!providers.find((p) => p.name === "facebook")}
            className="w-full flex items-center justify-center gap-3 rounded-2xl bg-[#1877F2] px-6 py-4 text-white font-medium transition-all hover:bg-[#166FE5] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5" fill="white" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Continue with Facebook
          </button>
        </div>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#d2d2d7]" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-[#86868b]">or</span>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full rounded-2xl border border-[#d2d2d7] bg-[#fbfbfd] px-6 py-4 text-[#1d1d1f] placeholder:text-[#86868b] focus:border-[#0071e3] focus:outline-none focus:ring-4 focus:ring-[#0071e3]/10 transition-all"
              required
              minLength={3}
            />
          </div>

          <div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-2xl border border-[#d2d2d7] bg-[#fbfbfd] px-6 py-4 text-[#1d1d1f] placeholder:text-[#86868b] focus:border-[#0071e3] focus:outline-none focus:ring-4 focus:ring-[#0071e3]/10 transition-all"
              required
            />
          </div>

          <div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-2xl border border-[#d2d2d7] bg-[#fbfbfd] px-6 py-4 text-[#1d1d1f] placeholder:text-[#86868b] focus:border-[#0071e3] focus:outline-none focus:ring-4 focus:ring-[#0071e3]/10 transition-all"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-apple !py-4 !text-base disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[#6e6e73]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#0071e3] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
