"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import AuthCard from "@/components/auth/AuthCard";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthInput from "@/components/auth/AuthInput";
import PasswordInput from "@/components/auth/PasswordInput";
import AuthButton from "@/components/auth/AuthButton";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface FieldErrors {
  username?: string;
  password?: string;
}

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<{ name: string; label: string }[]>([]);
  const { login } = useAuth();
  const router = useRouter();

  // Load remembered username
  useEffect(() => {
    const saved = localStorage.getItem("bwai_remembered_user");
    if (saved) {
      setUsername(saved);
      setRemember(true);
    }
  }, []);

  // Fetch OAuth providers
  useEffect(() => {
    fetch(`${API_BASE}/auth/providers`)
      .then((res) => res.json())
      .then((data) => setProviders(data.providers || []))
      .catch(() => {});
  }, []);

  // Field-level validation
  const validateField = useCallback(
    (field: "username" | "password") => {
      const errors: FieldErrors = {};

      if (field === "username") {
        if (!username.trim()) {
          errors.username = "Username is required";
        } else if (username.trim().length < 3) {
          errors.username = "Username must be at least 3 characters";
        }
      }

      if (field === "password") {
        if (!password) {
          errors.password = "Password is required";
        }
      }

      setFieldErrors((prev) => ({ ...prev, ...errors, ...(Object.keys(errors).length === 0 ? { [field]: undefined } : {}) }));
      return Object.keys(errors).length === 0;
    },
    [username, password]
  );

  // Full form validation
  const validateAll = useCallback(() => {
    const errors: FieldErrors = {};

    if (!username.trim()) {
      errors.username = "Username is required";
    } else if (username.trim().length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!password) {
      errors.password = "Password is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [username, password]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!validateAll()) return;

    setLoading(true);

    try {
      await login(username.trim(), password);

      // Remember Me
      if (remember) {
        localStorage.setItem("bwai_remembered_user", username.trim());
      } else {
        localStorage.removeItem("bwai_remembered_user");
      }

      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function handleOAuth(provider: string) {
    window.location.href = `${API_BASE}/auth/${provider}`;
  }

  const googleProvider = providers.find((p) => p.name === "google");
  const facebookProvider = providers.find((p) => p.name === "facebook");

  return (
    <AuthCard>
      <AuthHeader
        title="Sign In"
        subtitle="Welcome back to BWAI"
        icon={
          <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        }
      />

      {/* Global error banner */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-6 flex items-center gap-3 rounded-xl bg-[#ff3b30]/5 dark:bg-[#ff3b30]/10 border border-[#ff3b30]/20 p-4 text-sm text-[#ff3b30]"
        >
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}

      {/* OAuth Buttons */}
      <div className="space-y-3 mb-6">
        <AuthButton
          type="button"
          variant="outline"
          onClick={() => handleOAuth("google")}
          disabled={!googleProvider}
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          }
        >
          Continue with Google
        </AuthButton>

        <AuthButton
          type="button"
          variant="outline"
          onClick={() => handleOAuth("facebook")}
          disabled={!facebookProvider}
          className="!bg-[#1877F2] !text-white !border-[#1877F2] hover:!bg-[#166FE5] disabled:!bg-[#1877F2]/40 disabled:!border-[#1877F2]/40"
          icon={
            <svg className="h-5 w-5" fill="white" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          }
        >
          Continue with Facebook
        </AuthButton>
      </div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#d2d2d7] dark:border-[#38383a]" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white dark:bg-[#2d2d2f] px-4 text-[#86868b]">
            or continue with username
          </span>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <AuthInput
          id="login-username"
          label="Username"
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onBlur={() => validateField("username")}
          error={fieldErrors.username}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          icon={
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            </svg>
          }
        />

        <PasswordInput
          id="login-password"
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => validateField("password")}
          error={fieldErrors.password}
          autoComplete="current-password"
        />

        {/* Remember Me + Forgot Password row */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-[#d2d2d7] dark:border-[#38383a] text-[#0071e3] focus:ring-[#0071e3]/20"
            />
            <span className="text-sm text-[#6e6e73] dark:text-[#a1a1a6]">
              Remember me
            </span>
          </label>
        </div>

        <AuthButton
          type="submit"
          loading={loading}
          loadingText="Signing in..."
        >
          Sign In
        </AuthButton>
      </form>

      {/* Secondary navigation */}
      <p className="mt-6 text-center text-sm text-[#6e6e73] dark:text-[#a1a1a6]">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-[#0071e3] hover:text-[#0077ed] font-medium transition-colors"
        >
          Create Account
        </Link>
      </p>

      {/* Security indicators */}
      <div className="mt-6 pt-5 border-t border-[#d2d2d7] dark:border-[#38383a]">
        <div className="flex items-center justify-center gap-5 text-xs text-[#86868b]">
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            Secure
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Encrypted
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            Private
          </span>
        </div>
      </div>
    </AuthCard>
  );
}
