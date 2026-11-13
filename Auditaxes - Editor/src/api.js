const API_URL = import.meta.env.VITE_API_URL || "/api";
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
  if (response.status === 204) return null;
  const body = await response.json().catch(() => null);
  if (!response.ok || body === null) {
    throw new Error(body?.error || `La API no respondió correctamente (HTTP ${response.status}). Intenta de nuevo.`);
  }
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

export function startDraftAiJob(sectionId, fields, sourceLocale) {
  return request(`/content/current/sections/${encodeURIComponent(sectionId)}/draft-ai-jobs`, {
    method: "POST", body: JSON.stringify({ task: "proofread", fields, sourceLocale }),
  });
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

export function getPublications() { return request("/content/current/publications"); }

export function getEmails() { return request("/emails/current"); }
export function createEmail(userName, alternateEmail) {
  return request("/emails/current", { method: "POST", body: JSON.stringify({ userName, alternateEmail }) });
}
export function requestEmailPasswordRecovery(id) {
  return request(`/emails/current/${encodeURIComponent(id)}/password-recovery`, { method: "POST" });
}
export function deactivateEmail(id) {
  return request(`/emails/current/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function savePublication(publication) {
  return request(`/content/current/publications/${encodeURIComponent(publication.id)}`, { method: "PUT", body: JSON.stringify(publication) });
}

export function deletePublication(publicationId) {
  return request(`/content/current/publications/${encodeURIComponent(publicationId)}`, { method: "DELETE" });
}

export async function uploadPublicationImage(file) {
  if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
    throw new Error("Usa una imagen JPG, PNG, WEBP o GIF");
  }
  if (!file.size || file.size > 5 * 1024 * 1024) {
    throw new Error("Selecciona una imagen de hasta 5 MB");
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
    reader.onload = async () => {
      try {
        const data = String(reader.result).split(",")[1];
        resolve(await request("/content/current/publication-images", { method: "POST", body: JSON.stringify({ name: file.name, type: file.type, data }) }));
      } catch (error) { reject(error); }
    };
    reader.readAsDataURL(file);
  });
}
