export function getApiUrl(path: string): string {
  return path;
}

export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("agritrust_token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
}

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
    ...(options.headers as Record<string, string> ?? {}),
  };
  return fetch(url, { ...options, headers });
}
