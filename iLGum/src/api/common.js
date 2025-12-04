import { auth } from "./auth";

export const API_BASE = "http://localhost:8080";
export const apiFetch = async (path, options = {}, allowRetry=true) => {
  const { accessToken } = auth.getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: options.credentials ?? "include",
    headers,
  });

  if ((res.status === 401 || res.status === 403) && allowRetry) {
    const refreshRes = await fetch(`${API_BASE}/token`, {
      method: "POST",
      credentials: "include",
      headers: { 'Content-Type': 'application/json' }
    });

    if (refreshRes.ok) {
      const payload = await refreshRes.json();
      auth.setTokens(payload);
      return apiFetch(path, options, false);
    }
    auth.clearToken();
    return res;
  }
  return res;
};

export const logoutFetch = async () => {
  const res = await apiFetch("/members/logout", { method: "POST" });
  return res;
};
