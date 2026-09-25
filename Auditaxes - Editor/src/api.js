const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4100/api";
const TOKEN_KEY = "auditaxes-editor-token";

async function request(path, options = {}) {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const body = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(body?.error || "No fue posible conectar con la API");
  return body;
}

export async function login(email, password) {
  const session = await request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  sessionStorage.setItem(TOKEN_KEY, session.token);
  return session.user;
}

export async function restoreSession() {
  if (!sessionStorage.getItem(TOKEN_KEY)) return null;
  try { return (await request("/auth/me")).user; }
  catch { sessionStorage.removeItem(TOKEN_KEY); return null; }
}

export async function logout() {
  try { await request("/auth/session", { method: "DELETE" }); }
  finally { sessionStorage.removeItem(TOKEN_KEY); }
}

export function getCurrentContent() {
  return request("/content/current");
}

export function saveSection(sectionId, section) {
  return request(`/content/current/sections/${encodeURIComponent(sectionId)}`, {
    method: "PUT",
    body: JSON.stringify({ section }),
  });
}

export function createSection(sectionId, section) {
  return request("/content/current/sections", { method: "POST", body: JSON.stringify({ sectionId, section }) });
}

export function saveSectionOrder(sectionOrder) {
  return request("/content/current/sections-order", { method: "PUT", body: JSON.stringify({ sectionOrder }) });
}

export function deleteSection(sectionId) {
  return request(`/content/current/sections/${encodeURIComponent(sectionId)}`, { method: "DELETE" });
}
