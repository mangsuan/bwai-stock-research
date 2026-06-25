import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";

export const LightColors = {
  background: "#ffffff",
  card: "#f5f5f7",
  cardBorder: "#d2d2d7",
  text: "#1d1d1f",
  textSecondary: "#6e6e73",
  textMuted: "#86868b",
  accent: "#0071e3",
  accentHover: "#0077ed",
  inputBg: "#fbfbfd",
  success: "#34c759",
  error: "#ff3b30",
  tabActive: "#0071e3",
  tabInactive: "#86868b",
  headerBg: "#ffffff",
  headerBorder: "#d2d2d7",
};

export const DarkColors = {
  background: "#1d1d1f",
  card: "#2d2d2f",
  cardBorder: "#38383a",
  text: "#f5f5f7",
  textSecondary: "#a1a1a6",
  textMuted: "#86868b",
  accent: "#0071e3",
  accentHover: "#409cff",
  inputBg: "#2d2d2f",
  success: "#30d158",
  error: "#ff453a",
  tabActive: "#0071e3",
  tabInactive: "#86868b",
  headerBg: "#1d1d1f",
  headerBorder: "#38383a",
};

interface ThemeContextType {
  theme: "light" | "dark";
  colors: typeof LightColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user, updateProfile } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (user?.theme) {
      setTheme(user.theme as "light" | "dark");
    } else {
      AsyncStorage.getItem("bwai_theme").then((saved) => {
        if (saved === "dark" || saved === "light") {
          setTheme(saved);
        }
      });
    }
  }, [user]);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    AsyncStorage.setItem("bwai_theme", next);
    if (user) {
      updateProfile({ theme: next }).catch(() => {});
    }
  }

  const colors = theme === "dark" ? DarkColors : LightColors;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
