"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: "primary" | "secondary" | "outline";
  icon?: ReactNode;
  className?: string;
}

export default function AuthButton({
  loading = false,
  loadingText,
  variant = "primary",
  icon,
  children,
  className = "",
  disabled,
  ...props
}: AuthButtonProps) {
  const isDisabled = disabled || loading;

  const baseStyles = `
    relative flex items-center justify-center gap-2.5
    w-full py-3.5 px-6 rounded-xl
    text-[17px] font-medium leading-snug tracking-tight
    transition-all duration-200
    focus:outline-none focus:ring-4 focus:ring-[#0071e3]/20
    disabled:cursor-not-allowed
  `;

  const variantStyles = {
    primary: `
      bg-[#0071e3] text-white
      hover:bg-[#0077ed] active:bg-[#006edb]
      disabled:bg-[#0071e3]/50 disabled:text-white/70
      hover:scale-[1.02] active:scale-[0.98]
      disabled:hover:scale-100
    `,
    secondary: `
      bg-transparent text-[#0071e3] border border-[#0071e3]
      hover:bg-[#0071e3] hover:text-white
      disabled:border-[#0071e3]/30 disabled:text-[#0071e3]/50
      disabled:hover:bg-transparent disabled:hover:text-[#0071e3]/50
    `,
    outline: `
      bg-white dark:bg-[#2d2d2f]
      text-[#1d1d1f] dark:text-[#f5f5f7]
      border border-[#d2d2d7] dark:border-[#38383a]
      hover:bg-[#f5f5f7] dark:hover:bg-[#38383a]
      disabled:opacity-50
    `,
  };

  return (
    <button
      disabled={isDisabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`.trim()}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="h-5 w-5 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          {loadingText || children}
        </>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
