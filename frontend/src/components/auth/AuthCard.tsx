"use client";

import { ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
  className?: string;
}

export default function AuthCard({ children, className = "" }: AuthCardProps) {
  return (
    <div className="flex flex-1 items-center justify-center min-h-[80vh] px-4 sm:px-6">
      <div
        className={`
          w-full max-w-[420px]
          rounded-2xl border border-[#d2d2d7] dark:border-[#38383a]
          bg-white dark:bg-[#2d2d2f]
          p-6 sm:p-8
          shadow-sm
          animate-fade-in
          ${className}
        `.trim()}
      >
        {children}
      </div>
    </div>
  );
}
