import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const apiRoot = path.resolve(here, "..");

export const config = {
  port: Number(process.env.PORT || 4100),
  editorOrigin: process.env.EDITOR_ORIGIN || "http://localhost:5173",
  contentRoot: path.resolve(apiRoot, process.env.CONTENT_ROOT || "../Auditaxes - Sitio/app/content"),
  backupRoot: path.resolve(apiRoot, "backups"),
  editorialStatePath: path.resolve(apiRoot, "editorial-state.json"),
  publishedContentPath: path.resolve(apiRoot, "published-content.json"),
  inferenceUrl: process.env.INFERENCE_URL || "http://127.0.0.1:4110",
  inferenceKey: process.env.INFERENCE_API_KEY || "",
};

export const users = [
  {
    id: "admin-global",
    name: "Andrea Méndez",
    initials: "AM",
    role: "Administradora Global",
    email: "global@auditaxes.com",
    password: process.env.GLOBAL_ADMIN_PASSWORD || "Auditaxes2026",
    siteId: "global",
  },
  {
    id: "admin-mexico",
    name: "Carlos Rivera",
    initials: "CR",
    role: "Administrador México",
    email: "mexico@auditaxes.com",
    password: process.env.MEXICO_ADMIN_PASSWORD || "Auditaxes2026",
    siteId: "mexico",
  },
  {
    id: "admin-salvador",
    name: "Sofía Hernández",
    initials: "SH",
    role: "Administradora El Salvador",
    email: "salvador@auditaxes.com",
    password: process.env.SALVADOR_ADMIN_PASSWORD || "Auditaxes2026",
    siteId: "salvador",
  },
];

export function publicUser(user) {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}
