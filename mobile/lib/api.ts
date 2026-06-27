// API Configuration
// Set EXPO_PUBLIC_API_BASE in .env or app config
// Default: http://localhost:8000 (works for iOS simulator)
// Android emulator: http://10.0.2.2:8000
// Physical device: http://YOUR_LAN_IP:8000
export const API_BASE = process.env.EXPO_PUBLIC_API_BASE || "http://localhost:8000";

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_BASE}${path}`;
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string>),
  };

  return fetch(url, { ...options, headers });
}
