// API Configuration
// Change this to your backend URL
// For local dev: http://localhost:8000
// For Android emulator: http://10.0.2.2:8000
// For physical device: http://YOUR_IP:8000
export const API_BASE = "http://192.168.0.26:8000";

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
