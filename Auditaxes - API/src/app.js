import crypto from "node:crypto";
import cors from "cors";
import express from "express";
import { config, publicUser, users } from "./config.js";
import { createSection, deleteSection, describeSections, fieldsHash, getAiJobRef, getEditorialContent, getFieldAiJobRef, getPageContent, getPublishedPageContent, getSharedContent, getSiteConfiguration, getTranslation, getTranslationJobRef, recordAiJob, recordFieldAiJob, recordTranslationJob, updateEditorialStatus, updateSection, updateSectionOrder, updateTranslation, updateTranslationJob } from "./content-store.js";
import { inferenceRequest } from "./inference.js";

const sessions = new Map();

function bearerToken(request) {
  const value = request.get("authorization") || "";
  return value.startsWith("Bearer ") ? value.slice(7) : null;
}

function authenticate(request, response, next) {
  const token = bearerToken(request);
  const session = token ? sessions.get(token) : null;
  if (!session) return response.status(401).json({ error: "Sesión inválida o vencida" });
  request.auth = session;
  next();
}

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  const localOrigins = new Set([config.editorOrigin, ...[5173, 4321, 4322, 4323].flatMap(port => [`http://localhost:${port}`, `http://127.0.0.1:${port}`])]);
  app.use(cors({ origin: (origin, done) => done(null, !origin || localOrigins.has(origin)), methods: ["GET", "POST", "PUT", "DELETE"], allowedHeaders: ["Content-Type", "Authorization"] }));
  app.use(express.json({ limit: "500kb" }));

  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok", service: "auditaxes-api", contentRoot: config.contentRoot });
  });

  app.get("/api/inference/health", authenticate, async (_request, response, next) => {
    try { response.json(await inferenceRequest("/healthz")); }
    catch (error) { next(error); }
  });

  app.post("/api/auth/login", (request, response) => {
    const email = String(request.body?.email || "").trim().toLowerCase();
    const password = String(request.body?.password || "");
    const user = users.find(item => item.email === email && item.password === password);
    if (!user) return response.status(401).json({ error: "El correo o la contraseña no son correctos" });

    const token = crypto.randomBytes(32).toString("base64url");
    const safeUser = publicUser(user);
    sessions.set(token, { token, user: safeUser, createdAt: new Date().toISOString() });
    response.json({ token, user: safeUser });
  });

  app.delete("/api/auth/session", authenticate, (request, response) => {
    sessions.delete(request.auth.token);
    response.status(204).end();
  });

  app.get("/api/auth/me", authenticate, (request, response) => {
    response.json({ user: request.auth.user });
  });

  app.get("/api/sites/current", authenticate, async (request, response, next) => {
    try {
      const site = await getSiteConfiguration(request.auth.user.siteId);
      response.json({ site });
    } catch (error) { next(error); }
  });

  app.get("/api/content/current", authenticate, async (request, response, next) => {
    try {
      const [site, content] = await Promise.all([
        getSiteConfiguration(request.auth.user.siteId),
        getPageContent(request.auth.user.siteId),
      ]);
      response.json({ site, sourceLocale: site.defaultLocale, content, editorial: await getEditorialContent(request.auth.user.siteId) });
    } catch (error) { next(error); }
  });

  app.get("/api/content/current/sections", authenticate, async (request, response, next) => {
    try {
      const [site, content] = await Promise.all([
        getSiteConfiguration(request.auth.user.siteId),
        getPageContent(request.auth.user.siteId),
      ]);
      response.json({ siteId: site.id, sourceLocale: site.defaultLocale, sections: describeSections(content) });
    } catch (error) { next(error); }
  });

  app.get("/api/content/current/sections/:sectionId", authenticate, async (request, response, next) => {
    try {
      const content = await getPageContent(request.auth.user.siteId);
      const section = content.sections[request.params.sectionId];
      if (!section) return response.status(404).json({ error: "Sección no encontrada" });
      response.json({ siteId: request.auth.user.siteId, sectionId: request.params.sectionId, section });
    } catch (error) { next(error); }
  });

  app.put("/api/content/current/sections/:sectionId", authenticate, async (request, response, next) => {
    try {
      const result = await updateSection(request.auth.user.siteId, request.params.sectionId, request.body?.section, request.auth.user.id, request.body?.sourceLocale ?? null);
      response.json({ siteId: request.auth.user.siteId, sectionId: request.params.sectionId, ...result });
    } catch (error) { next(error); }
  });

  app.put("/api/content/current/sections/:sectionId/status", authenticate, async (request, response, next) => {
    try { response.json({ metadata: await updateEditorialStatus(request.auth.user.siteId, request.params.sectionId, request.body?.status, request.auth.user.id) }); }
    catch (error) { next(error); }
  });

  app.get("/api/content/current/sections/:sectionId/translations/en", authenticate, async (request, response, next) => {
    try { response.json(await getTranslation(request.auth.user.siteId, request.params.sectionId)); }
    catch (error) { next(error); }
  });

  app.put("/api/content/current/sections/:sectionId/translations/en", authenticate, async (request, response, next) => {
    response.status(410).json({ error: "Usa la ruta bilingüe con revisión ortográfica obligatoria" });
  });

  app.get("/api/content/current/sections/:sectionId/translations", authenticate, async (request, response, next) => {
    try { response.json(await getTranslation(request.auth.user.siteId, request.params.sectionId)); }
    catch (error) { next(error); }
  });

  app.put("/api/content/current/sections/:sectionId/translations", authenticate, async (request, response, next) => {
    try {
      const { siteId } = request.auth.user;
      const { sectionId } = request.params;
      const current = await getTranslation(siteId, sectionId);
      if (request.body?.sourceLocale && request.body.sourceLocale !== current.sourceLocale ||
          request.body?.targetLocale && request.body.targetLocale !== current.targetLocale) {
        return response.status(409).json({ error: "Cambió el idioma original; vuelve a cargar la sección" });
      }
      if (request.body?.status === "review") {
        const changed = Object.keys(current.fields).filter(id => current.needsReview && request.body?.fields?.[id]?.trim() || request.body?.fields?.[id] !== current.translatedFields[id]);
        if (changed.length) {
          const ref = await getTranslationJobRef(siteId, sectionId, request.body?.proofreadJobId);
          if (!ref || ref.task !== "proofread" || ref.sourceHash !== current.sourceHash || ref.sourceLocale !== current.sourceLocale || ref.targetLocale !== current.targetLocale ||
              changed.some(id => !Object.hasOwn(ref.fields, id) || !["apply", "keep"].includes(request.body?.decisions?.[id]))) {
            return response.status(409).json({ error: "Confirma la revisión ortográfica de cada campo modificado" });
          }
          const job = await inferenceRequest(`/v1/jobs/${encodeURIComponent(ref.id)}`);
          if (job.status !== "succeeded" || changed.some(id => request.body.fields[id] !== (request.body.decisions[id] === "apply" ? job.result.fields[id] : ref.fields[id]))) {
            return response.status(409).json({ error: "La revisión ortográfica ya no corresponde al texto actual" });
          }
        }
      }
      response.json({ metadata: await updateTranslation(siteId, sectionId, request.body?.fields, request.body?.sourceHash, request.body?.status, request.auth.user.id) });
    } catch (error) { next(error); }
  });

  app.post("/api/content/current/sections/:sectionId/translation-jobs", authenticate, async (request, response, next) => {
    try {
      const { siteId } = request.auth.user;
      const { sectionId } = request.params;
      const current = await getTranslation(siteId, sectionId);
      const task = request.body?.task || "translate";
      if (!["translate", "proofread", "review"].includes(task)) return response.status(400).json({ error: "Tarea no disponible" });
      if (request.body?.sourceLocale && request.body.sourceLocale !== current.sourceLocale ||
          request.body?.targetLocale && request.body.targetLocale !== current.targetLocale) {
        return response.status(409).json({ error: "Cambió el idioma original; vuelve a cargar la sección" });
      }
      if (request.body?.sourceHash && request.body.sourceHash !== current.sourceHash) return response.status(409).json({ error: "El original cambió" });
      let fields;
      const input = { source_locale: current.sourceLocale, target_locale: current.targetLocale };
      if (task === "translate") {
        if (["queued", "running"].includes(current.metadata.translations?.[current.targetLocale]?.status)) {
          return response.status(409).json({ error: "La traducción de esta sección ya está en cola" });
        }
        fields = Object.fromEntries(current.missingFields.map(id => [id, current.fields[id]]));
        if (!Object.keys(fields).length) return response.status(409).json({ error: "No hay campos faltantes o desactualizados" });
      } else {
        const requested = request.body?.fields;
        if (!requested || typeof requested !== "object" || Array.isArray(requested) || !Object.keys(requested).length ||
            Object.entries(requested).some(([id, value]) => !Object.hasOwn(current.fields, id) || typeof value !== "string" || !value.trim() || value.length > 4000)) {
          return response.status(400).json({ error: "Campos inválidos" });
        }
        if (task === "review" && Object.keys(requested).length !== Object.keys(current.fields).length) {
          return response.status(400).json({ error: "La revisión requiere la sección completa" });
        }
        fields = requested;
      }
      if (task === "proofread") { input.source_locale = current.targetLocale; delete input.target_locale; input.fields = fields; }
      else if (task === "review") {
        input.fields = Object.fromEntries(Object.keys(fields).map(id => [id, current.fields[id]]));
        input.translated_fields = fields;
      } else input.fields = fields;
      if (Object.keys(input.fields).length > 60 || Object.values(input.fields).join("").length > 4000 ||
          Object.values(input.translated_fields || {}).join("").length > 4000) {
        return response.status(413).json({ error: "La sección excede el límite de 60 campos o 4000 caracteres por trabajo" });
      }
      const job = await inferenceRequest("/v1/jobs", { method: "POST", body: JSON.stringify({ task, input }) });
      await recordTranslationJob(siteId, sectionId, { id: job.id, task, sourceHash: current.sourceHash, sourceLocale: current.sourceLocale,
        targetLocale: current.targetLocale, fields, status: job.status, user: request.auth.user.id, createdAt: new Date().toISOString() });
      response.status(202).json(job);
    } catch (error) { next(error); }
  });

  app.get("/api/content/current/sections/:sectionId/translation-jobs/:jobId", authenticate, async (request, response, next) => {
    try {
      const { siteId } = request.auth.user;
      const { sectionId, jobId } = request.params;
      const ref = await getTranslationJobRef(siteId, sectionId, jobId);
      if (!ref) return response.status(404).json({ error: "Trabajo no encontrado" });
      const current = await getTranslation(siteId, sectionId);
      const job = await inferenceRequest(`/v1/jobs/${encodeURIComponent(jobId)}`);
      const stale = ref.sourceHash !== current.sourceHash || ref.sourceLocale !== current.sourceLocale || ref.targetLocale !== current.targetLocale;
      if (!stale) await updateTranslationJob(siteId, sectionId, jobId, job.status, job.model || null, job.result);
      response.json({ ...job, stale, sourceLocale: ref.sourceLocale, targetLocale: ref.targetLocale });
    } catch (error) { next(error); }
  });

  app.post("/api/content/current/sections/:sectionId/ai-jobs/:task", authenticate, async (request, response, next) => {
    try {
      const { siteId } = request.auth.user;
      const { sectionId, task } = request.params;
      if (!["translate", "review"].includes(task)) return response.status(400).json({ error: "Tarea no disponible" });
      const translation = await getTranslation(siteId, sectionId);
      if (!Object.keys(translation.fields).length) return response.status(400).json({ error: "La sección no tiene campos traducibles" });
      const input = { source_locale: translation.sourceLocale, target_locale: translation.targetLocale, fields: translation.fields };
      if (task === "review") {
        if (translation.metadata.translations[translation.targetLocale].status !== "review" || translation.metadata.translations[translation.targetLocale].sourceHash !== translation.sourceHash) {
          return response.status(409).json({ error: "Guarda primero una traducción vigente" });
        }
        input.translated_fields = translation.metadata.translations[translation.targetLocale].fields;
      }
      const job = await inferenceRequest("/v1/jobs", { method: "POST", body: JSON.stringify({ task, input }) });
      await recordAiJob(siteId, sectionId, task, job.id, fieldsHash(input));
      response.status(202).json(job);
    } catch (error) { next(error); }
  });

  app.get("/api/content/current/sections/:sectionId/ai-jobs/:task", authenticate, async (request, response, next) => {
    try {
      const { siteId } = request.auth.user;
      const { sectionId, task } = request.params;
      if (!["translate", "review"].includes(task)) return response.status(400).json({ error: "Tarea no disponible" });
      const ref = await getAiJobRef(siteId, sectionId, task);
      if (!ref) return response.status(404).json({ error: "No hay trabajo para esta sección" });
      const translation = await getTranslation(siteId, sectionId);
      const input = { source_locale: translation.sourceLocale, target_locale: translation.targetLocale, fields: translation.fields };
      if (task === "review") input.translated_fields = translation.metadata.translations[translation.targetLocale].fields;
      response.json({ ...await inferenceRequest(`/v1/jobs/${encodeURIComponent(ref.id)}`), stale: ref.hash !== fieldsHash(input) });
    } catch (error) { next(error); }
  });

  app.post("/api/content/current/sections/:sectionId/field-ai-jobs", authenticate, async (request, response, next) => {
    try {
      const { siteId } = request.auth.user;
      const { sectionId } = request.params;
      const { path, text, task, sourceLocale } = request.body || {};
      const section = (await getPageContent(siteId)).sections[sectionId];
      if (!section) return response.status(404).json({ error: "Sección no encontrada" });
      if (!Array.isArray(path) || path.length < 2 || path.length > 12 || !path.every(part => typeof part === "string" && part.length <= 80 || Number.isInteger(part) && part >= 0) || !["es", "en"].includes(path.at(-1))) {
        return response.status(400).json({ error: "Campo inválido" });
      }
      let parent = section;
      for (const part of path.slice(0, -1)) parent = parent?.[part];
      const fieldName = String(path.at(-2)).toLowerCase();
      if (!parent || typeof parent !== "object" || typeof parent[path.at(-1)] !== "string" ||
          !["es", "en"].some(locale => locale in parent) || /^(href|src|url|email|phone|id)$/.test(fieldName) ||
          typeof text !== "string" || !text.trim() || text.length > 4000 || !["translate", "proofread", "detect_language"].includes(task)) {
        return response.status(400).json({ error: "Texto o tarea no admitida" });
      }
      if (task !== "detect_language" && !["es", "en"].includes(sourceLocale)) return response.status(400).json({ error: "Elige el idioma del texto" });
      const input = { fields: { field: text } };
      if (task !== "detect_language") input.source_locale = sourceLocale;
      if (task === "translate") input.target_locale = sourceLocale === "es" ? "en" : "es";
      const job = await inferenceRequest("/v1/jobs", { method: "POST", body: JSON.stringify({ task, input }) });
      await recordFieldAiJob(siteId, sectionId, job.id, path, task, fieldsHash(text));
      response.status(202).json(job);
    } catch (error) { next(error); }
  });

  app.get("/api/content/current/sections/:sectionId/field-ai-jobs/:jobId", authenticate, async (request, response, next) => {
    try {
      const { siteId } = request.auth.user;
      const { sectionId, jobId } = request.params;
      const ref = await getFieldAiJobRef(siteId, sectionId, jobId);
      if (!ref) return response.status(404).json({ error: "Trabajo no encontrado" });
      response.json({ ...await inferenceRequest(`/v1/jobs/${encodeURIComponent(jobId)}`), path: ref.path, textHash: ref.textHash });
    } catch (error) { next(error); }
  });

  app.post("/api/content/current/sections", authenticate, async (request, response, next) => {
    try {
      response.status(201).json(await createSection(request.auth.user.siteId, request.body?.sectionId, request.body?.section, request.body?.sourceLocale ?? null));
    } catch (error) { next(error); }
  });

  app.put("/api/content/current/sections-order", authenticate, async (request, response, next) => {
    try { response.json(await updateSectionOrder(request.auth.user.siteId, request.body?.sectionOrder)); }
    catch (error) { next(error); }
  });

  app.delete("/api/content/current/sections/:sectionId", authenticate, async (request, response, next) => {
    try { response.json(await deleteSection(request.auth.user.siteId, request.params.sectionId)); }
    catch (error) { next(error); }
  });

  app.get("/api/public/content/:siteId", async (request, response, next) => {
    try {
      const [site, content] = await Promise.all([
        getSiteConfiguration(request.params.siteId),
        getPublishedPageContent(request.params.siteId),
      ]);
      response.set("Cache-Control", "no-store");
      response.json({ site, sourceLocale: site.defaultLocale, content });
    } catch (error) { next(error); }
  });

  app.get("/api/content/shared", authenticate, async (_request, response, next) => {
    try { response.json(await getSharedContent()); }
    catch (error) { next(error); }
  });

  app.use((_request, response) => response.status(404).json({ error: "Ruta no encontrada" }));
  app.use((error, _request, response, _next) => {
    console.error(error);
    response.status(error.status || 500).json({ error: error.status ? error.message : "Error interno del servidor" });
  });

  return app;
}

export function clearSessions() {
  sessions.clear();
}
