const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export function getStoredToken() {
  return localStorage.getItem("access_token");
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem("access_token", token);
  } else {
    localStorage.removeItem("access_token");
  }
}

export async function apiRequest(path, options = {}) {
  const token = options.token || getStoredToken();

  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204 || response.status === 205) {
    return null;
  }

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error(data?.detail || data?.message || "Không thể kết nối tới máy chủ.");
  }

  return data;
}