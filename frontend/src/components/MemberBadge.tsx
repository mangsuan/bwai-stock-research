"use client";

const LEVEL_COLORS: Record<string, { bg: string; text: string; border: string; accent: string }> = {
  entry:    { bg: "bg-[#86868b]/10", text: "text-[#86868b]", border: "border-[#86868b]/20", accent: "#86868b" },
  bronze:   { bg: "bg-[#cd7f32]/10", text: "text-[#cd7f32]", border: "border-[#cd7f32]/20", accent: "#cd7f32" },
  silver:   { bg: "bg-[#a1a1a6]/10", text: "text-[#a1a1a6]", border: "border-[#a1a1a6]/20", accent: "#a1a1a6" },
  gold:     { bg: "bg-[#ff9500]/10", text: "text-[#ff9500]", border: "border-[#ff9500]/20", accent: "#ff9500" },
  platinum: { bg: "bg-[#af52de]/10", text: "text-[#af52de]", border: "border-[#af52de]/20", accent: "#af52de" },
  diamond:  { bg: "bg-[#0071e3]/10", text: "text-[#0071e3]", border: "border-[#0071e3]/20", accent: "#0071e3" },
  master:   { bg: "bg-[#ff3b30]/10", text: "text-[#ff3b30]", border: "border-[#ff3b30]/20", accent: "#ff3b30" },
};

const LEVEL_ICONS: Record<string, React.ReactNode> = {
  entry: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  ),
  bronze: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
    </svg>
  ),
  silver: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
    </svg>
  ),
  gold: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
    </svg>
  ),
  platinum: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  ),
  diamond: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  master: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  ),
};

interface MemberBadgeProps {
  level: string;
  points?: number;
  showProgress?: boolean;
  progressPct?: number;
  pointsToNext?: number;
  nextThreshold?: number;
}

export default function MemberBadge({
  level,
  points,
  showProgress = false,
  progressPct = 0,
  pointsToNext,
  nextThreshold,
}: MemberBadgeProps) {
  const colors = LEVEL_COLORS[level] || LEVEL_COLORS.entry;
  const icon = LEVEL_ICONS[level] || LEVEL_ICONS.entry;

  return (
    <div className="flex flex-col gap-2">
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium ${colors.bg} ${colors.text} ${colors.border}`}>
        {icon}
        <span className="capitalize">{level}</span>
        {points !== undefined && (
          <span className="text-xs opacity-75">({points} pts)</span>
        )}
      </div>
      {showProgress && level !== "master" && (
        <div className="w-full">
          <div className="flex justify-between text-xs text-[#6e6e73] dark:text-[#a1a1a6] mb-1">
            <span>{points} pts</span>
            <span>{nextThreshold} pts</span>
          </div>
          <div className="w-full h-2 bg-[#f5f5f7] dark:bg-[#38383a] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progressPct, 100)}%`, backgroundColor: colors.accent }}
            />
          </div>
          {pointsToNext !== undefined && pointsToNext > 0 && (
            <p className="text-xs text-[#86868b] mt-1">{pointsToNext} pts to next level</p>
          )}
        </div>
      )}
    </div>
  );
}
