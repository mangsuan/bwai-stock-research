"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

interface PasswordRule {
  label: string;
  met: boolean;
}

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<{ name: string; label: string }[]>([]);
  const { register } = useAuth();
  const router = useRouter();

  // Fetch OAuth providers
  useEffect(() => {
    fetch(`${API_BASE}/auth/providers`)
      .then((res) => res.json())
      .then((data) => setProviders(data.providers || []))
      .catch(() => {});
  }, []);

  // Password strength rules
  const passwordRules: PasswordRule[] = useMemo(
    () => [
      { label: "At least 8 characters", met: password.length >= 8 },
      { label: "One uppercase letter", met: /[A-Z]/.test(password) },
      { label: "One number", met: /[0-9]/.test(password) },
      { label: "One special character", met: /[^A-Za-z0-9]/.test(password) },
    ],
    [password]
  );

  const passwordScore = passwordRules.filter((r) => r.met).length;

  const strengthLabel = useMemo(() => {
    if (!password) return null;
    if (passwordScore <= 1) return { text: "Weak", color: "bg-[#ff3b30]", width: "25%" };
    if (passwordScore === 2) return { text: "Fair", color: "bg-[#ff9500]", width: "50%" };
    if (passwordScore === 3) return { text: "Good", color: "bg-[#ffcc00]", width: "75%" };
    return { text: "Strong", color: "bg-[#34c759]", width: "100%" };
  }, [password, passwordScore]);

  // Field-level validation
  const validateField = useCallback(
    (field: "username" | "email" | "password" | "confirmPassword" | "terms") => {
      const errors: FieldErrors = {};

      if (field === "username") {
        if (!username.trim()) {
          errors.username = "Username is required";
        } else if (username.trim().length < 3) {
          errors.username = "Username must be at least 3 characters";
        }
      }

      if (field === "email") {
        if (!email.trim()) {
          errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          errors.email = "Please enter a valid email address";
        }
      }

      if (field === "password") {
        if (!password) {
          errors.password = "Password is required";
        } else if (passwordScore < 4) {
          errors.password = "Password does not meet all requirements";
        }
      }

      if (field === "confirmPassword") {
        if (!confirmPassword) {
          errors.confirmPassword = "Please confirm your password";
        } else if (password !== confirmPassword) {
          errors.confirmPassword = "Passwords do not match";
        }
      }

      if (field === "terms") {
        if (!agreed) {
          errors.terms = "You must agree to the terms";
        }
      }

      setFieldErrors((prev) => ({
        ...prev,
        ...errors,
        ...(Object.keys(errors).length === 0 ? { [field]: undefined } : {}),
      }));
      return Object.keys(errors).length === 0;
    },
    [username, email, password, confirmPassword, agreed, passwordScore]
  );

  // Full form validation
  const validateAll = useCallback(() => {
    const errors: FieldErrors = {};

    if (!username.trim()) {
      errors.username = "Username is required";
    } else if (username.trim().length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (passwordScore < 4) {
      errors.password = "Password does not meet all requirements";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!agreed) {
      errors.terms = "You must agree to the terms";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [username, email, password, confirmPassword, agreed, passwordScore]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!validateAll()) return;

    setLoading(true);

    try {
      await register(username.trim(), email.trim(), password);
      router.push("/login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
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
        title="Create Your Account"
        subtitle="Build watchlists, research stocks, and unlock AI-powered market insights."
        icon={
          <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
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
            or create with email
          </span>
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <AuthInput
          id="register-username"
          label="Username"
          type="text"
          placeholder="Choose a username"
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

        <AuthInput
          id="register-email"
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => validateField("email")}
          error={fieldErrors.email}
          autoComplete="email"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          }
        />

        <div className="space-y-1.5">
          <PasswordInput
            id="register-password"
            label="Password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => validateField("password")}
            error={fieldErrors.password}
            autoComplete="new-password"
          />

          {/* Password Strength Meter */}
          {password && (
            <div className="space-y-2 pt-1">
              {/* Strength bar */}
              <div className="h-1.5 w-full rounded-full bg-[#d2d2d7] dark:bg-[#38383a] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${strengthLabel?.color}`}
                  style={{ width: strengthLabel?.width }}
                />
              </div>

              {/* Strength label */}
              <p className="text-xs font-medium text-[#6e6e73] dark:text-[#a1a1a6]">
                {strengthLabel?.text}
              </p>

              {/* Requirements checklist */}
              <ul className="space-y-1">
                {passwordRules.map((rule) => (
                  <li
                    key={rule.label}
                    className={`flex items-center gap-2 text-xs transition-colors ${
                      rule.met
                        ? "text-[#34c759]"
                        : "text-[#86868b] dark:text-[#a1a1a6]"
                    }`}
                  >
                    {rule.met ? (
                      <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 11.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {rule.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <PasswordInput
          id="register-confirm-password"
          label="Confirm Password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={() => validateField("confirmPassword")}
          error={fieldErrors.confirmPassword}
          autoComplete="new-password"
        />

        {/* Terms & Privacy */}
        <div className="space-y-1.5">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => {
                setAgreed(e.target.checked);
                if (e.target.checked) {
                  setFieldErrors((prev) => ({ ...prev, terms: undefined }));
                }
              }}
              className="mt-0.5 h-4 w-4 rounded border-[#d2d2d7] dark:border-[#38383a] text-[#0071e3] focus:ring-[#0071e3]/20"
            />
            <span className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed">
              I agree to the{" "}
              <Link href="#" className="text-[#0071e3] hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-[#0071e3] hover:underline">
                Privacy Policy
              </Link>
            </span>
          </label>
          {fieldErrors.terms && (
            <p
              role="alert"
              aria-live="polite"
              className="flex items-center gap-1.5 text-sm text-[#ff3b30] pl-7"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              {fieldErrors.terms}
            </p>
          )}
        </div>

        <AuthButton
          type="submit"
          loading={loading}
          loadingText="Creating account..."
          disabled={!agreed}
        >
          Create Account
        </AuthButton>
      </form>

      {/* Investor Value Section */}
      <div className="mt-6 rounded-xl bg-[#f5f5f7] dark:bg-[#1d1d1f] border border-[#d2d2d7] dark:border-[#38383a] p-4">
        <p className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-3">
          With your account you can:
        </p>
        <ul className="space-y-2">
          {[
            "Save watchlists",
            "Track favorite stocks",
            "Access AI stock analysis",
            "Receive personalized research",
          ].map((item) => (
            <li
              key={item}
              className="flex items-center gap-2.5 text-sm text-[#6e6e73] dark:text-[#a1a1a6]"
            >
              <svg className="h-4 w-4 shrink-0 text-[#34c759]" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Secondary navigation */}
      <p className="mt-6 text-center text-sm text-[#6e6e73] dark:text-[#a1a1a6]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-[#0071e3] hover:text-[#0077ed] font-medium transition-colors"
        >
          Sign In
        </Link>
      </p>
    </AuthCard>
  );
}
