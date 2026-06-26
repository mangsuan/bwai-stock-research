"use client";

import { ReactNode } from "react";

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
}

export default function AuthHeader({
  title,
  subtitle,
  icon,
  className = "",
}: AuthHeaderProps) {
  return (
    <div className={`text-center mb-8 ${className}`}>
      {/* Logo / Icon */}
      {icon && (
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0071e3] to-[#00c7ff] flex items-center justify-center shadow-lg shadow-[#0071e3]/20">
            {icon}
          </div>
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight mb-2">
        {title}
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-[17px] text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
