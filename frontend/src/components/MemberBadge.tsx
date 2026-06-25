"use client";

const LEVEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  entry: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-300" },
  bronze: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-300" },
  silver: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-400" },
  gold: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-300" },
  platinum: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-300" },
  diamond: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-300" },
  master: { bg: "bg-red-50", text: "text-red-600", border: "border-red-300" },
};

const LEVEL_EMOJIS: Record<string, string> = {
  entry: "⭐",
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
  platinum: "💎",
  diamond: "💠",
  master: "👑",
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
  const emoji = LEVEL_EMOJIS[level] || LEVEL_EMOJIS.entry;

  return (
    <div className="flex flex-col gap-2">
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium ${colors.bg} ${colors.text} ${colors.border}`}>
        <span>{emoji}</span>
        <span className="capitalize">{level}</span>
        {points !== undefined && (
          <span className="text-xs opacity-75">({points} pts)</span>
        )}
      </div>
      {showProgress && level !== "master" && (
        <div className="w-full">
          <div className="flex justify-between text-xs text-[#6e6e73] mb-1">
            <span>{points} pts</span>
            <span>{nextThreshold} pts</span>
          </div>
          <div className="w-full h-2 bg-[#f5f5f7] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0071e3] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progressPct, 100)}%` }}
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
