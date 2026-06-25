import React from "react";
import { View, Text, StyleSheet } from "react-native";

const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  entry: { bg: "#f5f5f7", text: "#6e6e73" },
  bronze: { bg: "#fef3c7", text: "#92400e" },
  silver: { bg: "#f3f4f6", text: "#4b5563" },
  gold: { bg: "#fef9c3", text: "#854d0e" },
  platinum: { bg: "#f1f5f9", text: "#475569" },
  diamond: { bg: "#ecfeff", text: "#155e75" },
  master: { bg: "#fef2f2", text: "#dc2626" },
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
  darkMode?: boolean;
}

export default function MemberBadge({
  level,
  points,
  showProgress = false,
  progressPct = 0,
  pointsToNext,
  nextThreshold,
  darkMode = false,
}: MemberBadgeProps) {
  const colors = LEVEL_COLORS[level] || LEVEL_COLORS.entry;
  const emoji = LEVEL_EMOJIS[level] || LEVEL_EMOJIS.entry;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.badge, { backgroundColor: colors.bg }]}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={[styles.level, { color: colors.text }]}>
          {level.charAt(0).toUpperCase() + level.slice(1)}
        </Text>
        {points !== undefined && (
          <Text style={[styles.points, { color: colors.text }]}>
            ({points} pts)
          </Text>
        )}
      </View>
      {showProgress && level !== "master" && (
        <View style={styles.progressWrapper}>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressLabel, { color: darkMode ? "#a1a1a6" : "#6e6e73" }]}>
              {points} pts
            </Text>
            <Text style={[styles.progressLabel, { color: darkMode ? "#a1a1a6" : "#6e6e73" }]}>
              {nextThreshold} pts
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: darkMode ? "#38383a" : "#f5f5f7" }]}>
            <View
              style={[styles.progressFill, { width: `${Math.min(progressPct, 100)}%` }]}
            />
          </View>
          {pointsToNext !== undefined && pointsToNext > 0 && (
            <Text style={[styles.progressHint, { color: darkMode ? "#86868b" : "#86868b" }]}>
              {pointsToNext} pts to next level
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 980,
    alignSelf: "flex-start",
  },
  emoji: { fontSize: 16 },
  level: { fontSize: 14, fontWeight: "600" },
  points: { fontSize: 12, opacity: 0.75 },
  progressWrapper: { marginTop: 4 },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  progressLabel: { fontSize: 12 },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#0071e3",
    borderRadius: 4,
  },
  progressHint: { fontSize: 12, marginTop: 4 },
});
