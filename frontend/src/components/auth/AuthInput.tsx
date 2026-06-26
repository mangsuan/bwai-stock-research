"use client";

import { InputHTMLAttributes, ReactNode, useId } from "react";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  icon?: ReactNode;
  className?: string;
}

export default function AuthInput({
  label,
  error,
  icon,
  className = "",
  id: providedId,
  ...props
}: AuthInputProps) {
  const autoId = useId();
  const id = providedId || autoId;
  const errorId = `${id}-error`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b]">
            {icon}
          </div>
        )}
        <input
          id={id}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          className={`
            w-full rounded-xl border bg-[#fbfbfd] dark:bg-[#2d2d2f]
            px-4 py-3.5 text-[17px] leading-snug tracking-tight
            text-[#1d1d1f] dark:text-[#f5f5f7]
            placeholder:text-[#86868b] dark:placeholder:text-[#a1a1a6]
            transition-all duration-200
            focus:outline-none focus:ring-4 focus:ring-[#0071e3]/10
            ${
              error
                ? "border-[#ff3b30] focus:border-[#ff3b30] focus:ring-[#ff3b30]/10"
                : "border-[#d2d2d7] dark:border-[#38383a] focus:border-[#0071e3]"
            }
            ${icon ? "pl-11" : "pl-4"}
          `.trim()}
          {...props}
        />
      </div>
      {error && (
        <p
          id={errorId}
          role="alert"
          aria-live="polite"
          className="flex items-center gap-1.5 text-sm text-[#ff3b30]"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
