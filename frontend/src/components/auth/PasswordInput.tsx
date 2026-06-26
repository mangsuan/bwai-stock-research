"use client";

import { InputHTMLAttributes, useState, useId } from "react";

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string | null;
  className?: string;
}

export default function PasswordInput({
  label,
  error,
  className = "",
  id: providedId,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
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
        {/* Lock icon */}
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b]">
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <input
          id={id}
          type={visible ? "text" : "password"}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          autoComplete={props.autoComplete || "current-password"}
          className={`
            w-full rounded-xl border bg-[#fbfbfd] dark:bg-[#2d2d2f]
            pl-11 pr-12 py-3.5 text-[17px] leading-snug tracking-tight
            text-[#1d1d1f] dark:text-[#f5f5f7]
            placeholder:text-[#86868b] dark:placeholder:text-[#a1a1a6]
            transition-all duration-200
            focus:outline-none focus:ring-4 focus:ring-[#0071e3]/10
            ${
              error
                ? "border-[#ff3b30] focus:border-[#ff3b30] focus:ring-[#ff3b30]/10"
                : "border-[#d2d2d7] dark:border-[#38383a] focus:border-[#0071e3]"
            }
          `.trim()}
          {...props}
        />

        {/* Show / Hide toggle */}
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg
                     text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]
                     hover:bg-[#f5f5f7] dark:hover:bg-[#38383a]
                     transition-colors duration-150"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            // Eye-off icon
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                clipRule="evenodd"
              />
              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
            </svg>
          ) : (
            // Eye icon
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
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
