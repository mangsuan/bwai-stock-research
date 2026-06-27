"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";

interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user, updateProfile } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Sync theme from user profile or localStorage
  useEffect(() => {
    if (user?.theme && (user.theme === "light" || user.theme === "dark")) {
      setTheme(user.theme);
      document.documentElement.classList.toggle("dark", user.theme === "dark");
    } else {
      const saved = localStorage.getItem("bwai_theme");
      if (saved === "dark" || saved === "light") {
        setTheme(saved);
        document.documentElement.classList.toggle("dark", saved === "dark");
      }
    }
  }, [user]);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("bwai_theme", next);
    if (user) {
      updateProfile({ theme: next }).catch(() => {});
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
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
