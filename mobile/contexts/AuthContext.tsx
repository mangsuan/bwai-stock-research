import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "@/lib/api";

interface User {
  id: number;
  username: string;
  email: string;
  display_name: string | null;
  theme: string;
  avatar_url: string | null;
  member_level: string;
  total_points: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: { display_name?: string; theme?: string }) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadToken();
  }, []);

  async function loadToken() {
    try {
      const savedToken = await AsyncStorage.getItem("bwai_token");
      if (savedToken) {
        setToken(savedToken);
        await fetchUser(savedToken);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchUser(t: string) {
    try {
      const res = await apiFetch("/auth/me", {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        setUser(await res.json());
      } else {
        await AsyncStorage.removeItem("bwai_token");
        setToken(null);
        setUser(null);
      }
    } catch {
      await AsyncStorage.removeItem("bwai_token");
      setToken(null);
      setUser(null);
    }
  }

  async function refreshUser() {
    if (token) {
      await fetchUser(token);
    }
  }

  async function updateProfile(data: { display_name?: string; theme?: string }) {
    if (!token) throw new Error("Not authenticated");
    const res = await apiFetch("/auth/profile", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Update failed");
    }
    const updated = await res.json();
    setUser(updated);
  }

  async function login(username: string, password: string) {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Login failed");
    }
    const data = await res.json();
    await AsyncStorage.setItem("bwai_token", data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  }

  async function register(username: string, email: string, password: string) {
    const res = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Registration failed");
    }
    const data = await res.json();
    await AsyncStorage.setItem("bwai_token", data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  }

  async function logout() {
    await AsyncStorage.removeItem("bwai_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, refreshUser, updateProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
