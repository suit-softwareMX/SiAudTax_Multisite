import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { config } from "./config.js";

const pageFiles = Object.freeze({
  global: "global.json",
  mexico: path.join("countries", "mexico.json"),
  salvador: path.join("countries", "salvador.json"),
});

async function readJson(relativePath) {
  const absolutePath = path.resolve(config.contentRoot, relativePath);
  const relative = path.relative(config.contentRoot, absolutePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Ruta de contenido no permitida");
  }
  return JSON.parse(await readFile(absolutePath, "utf8"));
}

function pagePath(siteId) {
  const file = pageFiles[siteId];
  if (!file) throw Object.assign(new Error("Sitio no encontrado"), { status: 404 });
  return { file, absolutePath: path.resolve(config.contentRoot, file) };
}

export async function getSiteConfiguration(siteId) {
  const document = await readJson("site.json");
  const site = document.sites.find(item => item.id === siteId && item.enabled);
  if (!site) throw Object.assign(new Error("Sitio no encontrado"), { status: 404 });
  return site;
}

export async function getPageContent(siteId) {
  const { file } = pagePath(siteId);
  return readJson(file);
}

async function saveDocument(siteId, content) {
  const { absolutePath } = pagePath(siteId);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDirectory = path.join(config.backupRoot, siteId);
  await mkdir(backupDirectory, { recursive: true });
  await copyFile(absolutePath, path.join(backupDirectory, `${timestamp}.json`));
  await writeFile(absolutePath, `${JSON.stringify(content, null, 2)}\n`, "utf8");
}

export async function updateSection(siteId, sectionId, section) {
  if (!section || typeof section !== "object" || Array.isArray(section)) {
    throw Object.assign(new Error("La sección debe ser un objeto JSON"), { status: 400 });
  }
  const content = await getPageContent(siteId);
  if (!(sectionId in content.sections)) {
    throw Object.assign(new Error("Sección no encontrada"), { status: 404 });
  }

  content.sections[sectionId] = section;
  await saveDocument(siteId, content);
  return { section: content.sections[sectionId], savedAt: new Date().toISOString() };
}

export async function createSection(siteId, sectionId, section) {
  if (!/^[a-z][a-z0-9-]{2,48}$/.test(sectionId)) throw Object.assign(new Error("Identificador de sección inválido"), { status: 400 });
  const content = await getPageContent(siteId);
  if (sectionId in content.sections) throw Object.assign(new Error("Ya existe una sección con ese identificador"), { status: 409 });
  content.sections[sectionId] = section;
  content.sectionOrder = [...(content.sectionOrder || Object.keys(content.sections).filter(id => id !== sectionId)), sectionId];
  await saveDocument(siteId, content);
  return { sectionId, section, sectionOrder: content.sectionOrder, savedAt: new Date().toISOString() };
}

export async function updateSectionOrder(siteId, sectionOrder) {
  const content = await getPageContent(siteId);
  const existing = Object.keys(content.sections);
  if (!Array.isArray(sectionOrder) || sectionOrder.length !== existing.length || new Set(sectionOrder).size !== existing.length || sectionOrder.some(id => !existing.includes(id))) {
    throw Object.assign(new Error("El orden debe incluir cada sección exactamente una vez"), { status: 400 });
  }
  content.sectionOrder = sectionOrder;
  await saveDocument(siteId, content);
  return { sectionOrder, savedAt: new Date().toISOString() };
}

export async function deleteSection(siteId, sectionId) {
  const content = await getPageContent(siteId);
  const section = content.sections[sectionId];
  if (!section) throw Object.assign(new Error("Sección no encontrada"), { status: 404 });
  if (section.type !== "custom") throw Object.assign(new Error("Las secciones estructurales no pueden eliminarse"), { status: 400 });
  delete content.sections[sectionId];
  content.sectionOrder = (content.sectionOrder || Object.keys(content.sections)).filter(id => id !== sectionId);
  await saveDocument(siteId, content);
  return { sectionId, sectionOrder: content.sectionOrder, savedAt: new Date().toISOString() };
}

export async function getSharedContent() {
  const [shared, network] = await Promise.all([
    readJson("shared.json"),
    readJson("network.json"),
  ]);
  return { shared, network };
}

export function describeSections(content) {
  return Object.entries(content.sections).map(([id, section], position) => ({
    id,
    position,
    enabled: section.enabled !== false,
    fields: Object.keys(section),
  }));
}
