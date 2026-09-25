import crypto from "node:crypto";
import cors from "cors";
import express from "express";
import { config, publicUser, users } from "./config.js";
import { createSection, deleteSection, describeSections, getPageContent, getSharedContent, getSiteConfiguration, updateSection, updateSectionOrder } from "./content-store.js";

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
  const localOrigins = new Set([config.editorOrigin, "http://localhost:4321", "http://localhost:4322", "http://localhost:4323"]);
  app.use(cors({ origin: (origin, done) => done(null, !origin || localOrigins.has(origin)), methods: ["GET", "POST", "PUT", "DELETE"], allowedHeaders: ["Content-Type", "Authorization"] }));
  app.use(express.json({ limit: "500kb" }));

  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok", service: "auditaxes-api", contentRoot: config.contentRoot });
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
      response.json({ site, sourceLocale: site.defaultLocale, content });
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
      const result = await updateSection(request.auth.user.siteId, request.params.sectionId, request.body?.section);
      response.json({ siteId: request.auth.user.siteId, sectionId: request.params.sectionId, ...result });
    } catch (error) { next(error); }
  });

  app.post("/api/content/current/sections", authenticate, async (request, response, next) => {
    try {
      response.status(201).json(await createSection(request.auth.user.siteId, request.body?.sectionId, request.body?.section));
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
        getPageContent(request.params.siteId),
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
