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

export function saveSection(sectionId, section, sourceLocale) {
  return request(`/content/current/sections/${encodeURIComponent(sectionId)}`, {
    method: "PUT",
    body: JSON.stringify({ section, sourceLocale }),
  });
}

export function updateSectionStatus(sectionId, status) {
  return request(`/content/current/sections/${encodeURIComponent(sectionId)}/status`, { method: "PUT", body: JSON.stringify({ status }) });
}

export function getTranslationSection(sectionId) {
  return request(`/content/current/sections/${encodeURIComponent(sectionId)}/translations`);
}

export function saveTranslation(sectionId, fields, sourceHash, status, proofreadJobId, decisions, sourceLocale, targetLocale) {
  return request(`/content/current/sections/${encodeURIComponent(sectionId)}/translations`, {
    method: "PUT", body: JSON.stringify({ fields, sourceHash, status, proofreadJobId, decisions, sourceLocale, targetLocale }),
  });
}

export function startTranslationJob(sectionId, task = "translate", fields, sourceHash, sourceLocale, targetLocale) {
  return request(`/content/current/sections/${encodeURIComponent(sectionId)}/translation-jobs`, {
    method: "POST", body: JSON.stringify({ task, fields, sourceHash, sourceLocale, targetLocale }),
  });
}

export function getTranslationJob(sectionId, jobId) {
  return request(`/content/current/sections/${encodeURIComponent(sectionId)}/translation-jobs/${encodeURIComponent(jobId)}`);
}

export function getInferenceHealth() { return request("/inference/health"); }

export function startAiJob(sectionId, task) {
  return request(`/content/current/sections/${encodeURIComponent(sectionId)}/ai-jobs/${task}`, { method: "POST" });
}

export function getAiJob(sectionId, task) {
  return request(`/content/current/sections/${encodeURIComponent(sectionId)}/ai-jobs/${task}`);
}

export function startFieldAiJob(sectionId, path, text, task, sourceLocale) {
  return request(`/content/current/sections/${encodeURIComponent(sectionId)}/field-ai-jobs`, {
    method: "POST", body: JSON.stringify({ path, text, task, sourceLocale }),
  });
}

export function getFieldAiJob(sectionId, jobId) {
  return request(`/content/current/sections/${encodeURIComponent(sectionId)}/field-ai-jobs/${encodeURIComponent(jobId)}`);
}

export function createSection(sectionId, section, sourceLocale) {
  return request("/content/current/sections", { method: "POST", body: JSON.stringify({ sectionId, section, sourceLocale }) });
}

export function saveSectionOrder(sectionOrder) {
  return request("/content/current/sections-order", { method: "PUT", body: JSON.stringify({ sectionOrder }) });
}

export function deleteSection(sectionId) {
  return request(`/content/current/sections/${encodeURIComponent(sectionId)}`, { method: "DELETE" });
}
