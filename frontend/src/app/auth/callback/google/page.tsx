"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get("code");
      if (!code) {
        router.push("/login?error=No code provided");
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/google/callback?code=${code}`);
        if (!res.ok) {
          throw new Error("Google authentication failed");
        }

        const data = await res.json();
        localStorage.setItem("bwai_token", data.access_token);
        window.location.href = "/";
      } catch (err) {
        router.push("/login?error=Google authentication failed");
      }
    }

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
        <p className="text-gray-500">Completing Google login...</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}
