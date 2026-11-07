import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";
import sanitizeHtml from "sanitize-html";
import { config } from "./config.js";

const pageFiles = Object.freeze({
  global: "global.json",
  mexico: path.join("countries", "mexico.json"),
  salvador: path.join("countries", "salvador.json"),
});

async function readState(filename) {
  try { return JSON.parse(await readFile(filename, "utf8")); }
  catch (error) { if (error.code !== "ENOENT") throw error; return {}; }
}

async function writeState(filename, value) {
  await writeFile(filename, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function metadataFor(state, siteId, sectionId) {
  state[siteId] ||= {};
  state[siteId][sectionId] ||= {
    status: "approved", sourceLocale: siteId === "global" ? "en" : "es",
    updatedBy: null, updatedAt: null, approvedBy: null, approvedAt: null,
    translations: { [siteId === "global" ? "es" : "en"]: { status: "translation_pending" } },
  };
  state[siteId][sectionId].translations ||= {};
  state[siteId][sectionId].sourceLocale ||= siteId === "global" ? "en" : "es";
  return state[siteId][sectionId];
}

export function translatableFields(section, sourceLocale = "es", targetLocale = "en") {
  const fields = {};
  function leaves(value, target) {
    if (typeof value === "string") { if (value.trim()) fields[JSON.stringify(target)] = value; }
    else if (Array.isArray(value)) value.forEach((item, index) => leaves(item, [...target, index]));
    else if (value && typeof value === "object") Object.entries(value).forEach(([key, item]) => leaves(item, [...target, key]));
  }
  function visit(value, path = []) {
    if (Array.isArray(value)) return value.forEach((item, index) => visit(item, [...path, index]));
    if (!value || typeof value !== "object") return;
    if (sourceLocale in value && targetLocale in value) return leaves(value[sourceLocale], [...path, targetLocale]);
    Object.entries(value).forEach(([key, item]) => visit(item, [...path, key]));
  }
  visit(section);
  return fields;
}

export function fieldsHash(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function targetFields(section, sourceLocale = "es", targetLocale = "en") {
  return Object.fromEntries(Object.keys(translatableFields(section, sourceLocale, targetLocale)).map(id => [id, JSON.parse(id).reduce((value, key) => value?.[key], section) || ""]));
}

export function localePair(siteId, metadata) {
  const source = metadata?.sourceLocale || (siteId === "global" ? "en" : "es");
  return [source, source === "es" ? "en" : "es"];
}

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

export async function getPublishedPageContent(siteId) {
  pagePath(siteId);
  const published = await readState(config.publishedContentPath);
  if (!published[siteId]) {
    published[siteId] = await getPageContent(siteId);
    await writeState(config.publishedContentPath, published);
  }
  return published[siteId];
}

export async function getPublicPageContent(siteId) {
  const [content, state, details] = await Promise.all([
    getPublishedPageContent(siteId), readState(config.editorialStatePath), readJson(publicationDetailsFile),
  ]);
  const news = await publicNews(siteId, content, state);
  const publicationSite = news?.items === undefined ? "global" : siteId;
  const items = news?.items ?? (await publicNews("global", await getPublishedPageContent("global"), state))?.items ?? [];
  if (news) content.sections.news = { ...news, items: items.map(publicationImageUrl) };
  const publicationDetails = Object.fromEntries(items.map(({ id }) => [id, publicationDetail(details, publicationSite, id)]));
  return { content, publicationDetails };
}

async function publicNews(siteId, published, state) {
  const news = published.sections.news;
  // The dedicated publications editor saves directly. Section drafts still need approval.
  if (["draft", "review"].includes(state[siteId]?.news?.status)) return news;
  const current = (await getPageContent(siteId)).sections.news;
  return news && current ? { ...news, items: current.items } : news ?? current;
}

export async function getEditorialContent(siteId) {
  const content = await getPageContent(siteId);
  const state = await readState(config.editorialStatePath);
  const metadata = Object.fromEntries(Object.keys(content.sections).map(id => [id, metadataFor(state, siteId, id)]));
  return metadata;
}

export async function updateEditorialStatus(siteId, sectionId, status, actor) {
  if (!["draft", "review", "approved"].includes(status)) throw Object.assign(new Error("Estado inválido"), { status: 400 });
  const content = await getPageContent(siteId);
  if (!content.sections[sectionId]) throw Object.assign(new Error("Sección no encontrada"), { status: 404 });
  const state = await readState(config.editorialStatePath);
  const metadata = metadataFor(state, siteId, sectionId);
  if (status === "approved" && metadata.status !== "review") throw Object.assign(new Error("Envía primero a revisión"), { status: 409 });
  if (status === "approved" && metadata.sourceSwitchPending) throw Object.assign(new Error("Aprueba primero la traducción del nuevo idioma original"), { status: 409 });
  metadata.status = status;
  metadata.updatedAt = new Date().toISOString();
  metadata.updatedBy = actor;
  if (status === "approved") {
    const published = await readState(config.publishedContentPath);
    published[siteId] ||= await getPublishedPageContent(siteId);
    published[siteId].sections[sectionId] = content.sections[sectionId];
    published[siteId].sectionOrder = content.sectionOrder.filter(id => id in published[siteId].sections);
    metadata.approvedAt = metadata.updatedAt;
    metadata.approvedBy = actor;
    await writeState(config.publishedContentPath, published);
  } else { metadata.approvedAt = null; metadata.approvedBy = null; }
  await writeState(config.editorialStatePath, state);
  return metadata;
}

async function saveDocument(siteId, content) {
  const { absolutePath } = pagePath(siteId);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDirectory = path.join(config.backupRoot, siteId);
  await mkdir(backupDirectory, { recursive: true });
  await copyFile(absolutePath, path.join(backupDirectory, `${timestamp}.json`));
  await writeFile(absolutePath, `${JSON.stringify(content, null, 2)}\n`, "utf8");
}

export async function updateSection(siteId, sectionId, section, actor = null, requestedLocale = null) {
  if (!section || typeof section !== "object" || Array.isArray(section)) {
    throw Object.assign(new Error("La sección debe ser un objeto JSON"), { status: 400 });
  }
  if (requestedLocale !== null && !["es", "en"].includes(requestedLocale)) {
    throw Object.assign(new Error("El idioma original debe ser español o inglés"), { status: 400 });
  }
  const content = await getPageContent(siteId);
  if (!(sectionId in content.sections)) {
    throw Object.assign(new Error("Sección no encontrada"), { status: 404 });
  }

  await getPublishedPageContent(siteId);
  const state = await readState(config.editorialStatePath);
  const metadata = metadataFor(state, siteId, sectionId);
  const [oldSource] = localePair(siteId, metadata);
  const [sourceLocale, targetLocale] = localePair(siteId, { sourceLocale: requestedLocale || oldSource });
  const switched = sourceLocale !== oldSource;
  const oldHash = fieldsHash(translatableFields(content.sections[sectionId], sourceLocale, targetLocale));
  const oldTargetHash = fieldsHash(targetFields(content.sections[sectionId], sourceLocale, targetLocale));
  if (switched) metadata.sourceSwitchPending = Object.keys(translatableFields(content.sections[sectionId], oldSource, oldSource === "es" ? "en" : "es")).length > 0 || Object.keys(translatableFields(section, sourceLocale, targetLocale)).length > 0;
  content.sections[sectionId] = section;
  await saveDocument(siteId, content);
  metadata.sourceLocale = sourceLocale;
  metadata.status = "draft";
  metadata.updatedAt = new Date().toISOString();
  metadata.updatedBy = actor;
  metadata.approvedAt = null;
  metadata.approvedBy = null;
  const sourceChanged = oldHash !== fieldsHash(translatableFields(section, sourceLocale, targetLocale));
  if (switched || sourceChanged || oldTargetHash !== fieldsHash(targetFields(section, sourceLocale, targetLocale))) {
    metadata.translations[targetLocale] ||= {};
    metadata.translations[targetLocale].outdated = !switched && sourceChanged;
    metadata.translations[targetLocale].needsReview = switched || oldTargetHash !== fieldsHash(targetFields(section, sourceLocale, targetLocale));
    metadata.translations[targetLocale].status = !switched && sourceChanged && metadata.translations[targetLocale].sourceHash ? "stale" : "translation_pending";
    if (switched) metadata.translations[targetLocale].sourceFields = translatableFields(section, sourceLocale, targetLocale);
  }
  await writeState(config.editorialStatePath, state);
  return { section, metadata, savedAt: metadata.updatedAt };
}

export async function createSection(siteId, sectionId, section, sourceLocale = null) {
  if (!/^[a-z][a-z0-9-]{2,48}$/.test(sectionId)) throw Object.assign(new Error("Identificador de sección inválido"), { status: 400 });
  if (sourceLocale !== null && !["es", "en"].includes(sourceLocale)) throw Object.assign(new Error("Idioma original inválido"), { status: 400 });
  const content = await getPageContent(siteId);
  if (sectionId in content.sections) throw Object.assign(new Error("Ya existe una sección con ese identificador"), { status: 409 });
  await getPublishedPageContent(siteId);
  content.sections[sectionId] = section;
  content.sectionOrder = [...(content.sectionOrder || Object.keys(content.sections).filter(id => id !== sectionId)), sectionId];
  await saveDocument(siteId, content);
  const state = await readState(config.editorialStatePath);
  const metadata = metadataFor(state, siteId, sectionId);
  if (sourceLocale) metadata.sourceLocale = sourceLocale;
  metadata.status = "draft";
  await writeState(config.editorialStatePath, state);
  return { sectionId, section, sectionOrder: content.sectionOrder, metadata, savedAt: new Date().toISOString() };
}

export async function updateSectionOrder(siteId, sectionOrder) {
  const content = await getPageContent(siteId);
  const existing = Object.keys(content.sections);
  if (!Array.isArray(sectionOrder) || sectionOrder.length !== existing.length || new Set(sectionOrder).size !== existing.length || sectionOrder.some(id => !existing.includes(id))) {
    throw Object.assign(new Error("El orden debe incluir cada sección exactamente una vez"), { status: 400 });
  }
  const published = await getPublishedPageContent(siteId);
  content.sectionOrder = sectionOrder;
  await saveDocument(siteId, content);
  published.sectionOrder = sectionOrder.filter(id => id in published.sections);
  await writeState(config.publishedContentPath, { ...await readState(config.publishedContentPath), [siteId]: published });
  return { sectionOrder, savedAt: new Date().toISOString() };
}

export async function deleteSection(siteId, sectionId) {
  const content = await getPageContent(siteId);
  const section = content.sections[sectionId];
  if (!section) throw Object.assign(new Error("Sección no encontrada"), { status: 404 });
  if (section.type !== "custom") throw Object.assign(new Error("Las secciones estructurales no pueden eliminarse"), { status: 400 });
  const published = await getPublishedPageContent(siteId);
  delete content.sections[sectionId];
  content.sectionOrder = (content.sectionOrder || Object.keys(content.sections)).filter(id => id !== sectionId);
  await saveDocument(siteId, content);
  delete published.sections[sectionId];
  published.sectionOrder = published.sectionOrder.filter(id => id !== sectionId);
  await writeState(config.publishedContentPath, { ...await readState(config.publishedContentPath), [siteId]: published });
  const state = await readState(config.editorialStatePath);
  if (state[siteId]) delete state[siteId][sectionId];
  await writeState(config.editorialStatePath, state);
  return { sectionId, sectionOrder: content.sectionOrder, savedAt: new Date().toISOString() };
}

export async function getTranslation(siteId, sectionId) {
  const content = await getPageContent(siteId);
  const section = content.sections[sectionId];
  if (!section) throw Object.assign(new Error("Sección no encontrada"), { status: 404 });
  const metadata = (await getEditorialContent(siteId))[sectionId];
  const [sourceLocale, targetLocale] = localePair(siteId, metadata);
  const fields = translatableFields(section, sourceLocale, targetLocale);
  const sourceHash = fieldsHash(fields);
  const proposal = metadata.translations?.[targetLocale];
  const current = Object.fromEntries(Object.keys(fields).map(id => [id, JSON.parse(id).reduce((value, key) => value?.[key], section) || ""]));
  const translatedFields = proposal?.sourceHash === sourceHash && ["review", "approved"].includes(proposal.status) && proposal.fields ? proposal.fields : current;
  const missingFields = Object.keys(fields).filter(id => !translatedFields[id]?.trim() || proposal?.outdated && (!proposal.sourceFields || proposal.sourceFields[id] !== fields[id]));
  return { fields, sourceHash, translatedFields, missingFields, needsReview: Boolean(proposal?.needsReview), sourceLocale, targetLocale, section, metadata };
}

export async function updateTranslation(siteId, sectionId, fields, sourceHash, status, actor) {
  if (!["review", "approved"].includes(status)) throw Object.assign(new Error("Estado de traducción inválido"), { status: 400 });
  const current = await getTranslation(siteId, sectionId);
  if (sourceHash !== current.sourceHash) throw Object.assign(new Error("El original cambió; vuelve a cargar la sección"), { status: 409 });
  const ids = Object.keys(current.fields);
  if (!fields || typeof fields !== "object" || Array.isArray(fields) || !ids.length || Object.keys(fields).length !== ids.length ||
      ids.some(id => typeof fields[id] !== "string" || !fields[id].trim() || fields[id].length > 4000)) {
    throw Object.assign(new Error("Campos de traducción inválidos"), { status: 400 });
  }
  const targetLocale = current.targetLocale;
  const state = await readState(config.editorialStatePath);
  const metadata = metadataFor(state, siteId, sectionId);
  if (status === "approved") {
    if (metadata.translations[targetLocale]?.status !== "review" || metadata.translations[targetLocale].sourceHash !== sourceHash ||
        ids.some(id => metadata.translations[targetLocale].fields?.[id] !== fields[id])) {
      throw Object.assign(new Error("Aprueba la misma propuesta guardada para revisión"), { status: 409 });
    }
    const section = structuredClone((await getPageContent(siteId)).sections[sectionId]);
    for (const [id, text] of Object.entries(fields)) {
      const path = JSON.parse(id);
      let cursor = section;
      for (const key of path.slice(0, -1)) { cursor[key] ??= {}; cursor = cursor[key]; }
      cursor[path.at(-1)] = text;
    }
    await updateSection(siteId, sectionId, section, actor);
  }
  const freshState = status === "approved" ? await readState(config.editorialStatePath) : state;
  const fresh = metadataFor(freshState, siteId, sectionId);
  fresh.translations[targetLocale] = { status, fields, sourceFields: current.fields, sourceHash, sourceLocale: current.sourceLocale, targetLocale, updatedBy: actor, updatedAt: new Date().toISOString(), model: fresh.translations[targetLocale]?.model || null, needsReview: false };
  if (status === "approved") fresh.sourceSwitchPending = false;
  await writeState(config.editorialStatePath, freshState);
  return fresh;
}

export async function recordAiJob(siteId, sectionId, task, id, hash) {
  const state = await readState(config.editorialStatePath);
  const metadata = metadataFor(state, siteId, sectionId);
  metadata.aiJobs ||= {};
  metadata.aiJobs[task] = { id, hash };
  await writeState(config.editorialStatePath, state);
}

export async function getAiJobRef(siteId, sectionId, task) {
  const content = await getPageContent(siteId);
  if (!content.sections[sectionId]) throw Object.assign(new Error("Sección no encontrada"), { status: 404 });
  const state = await readState(config.editorialStatePath);
  return metadataFor(state, siteId, sectionId).aiJobs?.[task] || null;
}

export async function recordTranslationJob(siteId, sectionId, job) {
  const state = await readState(config.editorialStatePath);
  const metadata = metadataFor(state, siteId, sectionId);
  metadata.translationJobs ||= {};
  metadata.translationJobs[job.id] = job;
  for (const id of Object.keys(metadata.translationJobs).slice(0, -20)) delete metadata.translationJobs[id];
  if (job.task === "translate") {
    metadata.translations[job.targetLocale] ||= {};
    metadata.translations[job.targetLocale].status = "queued";
  }
  await writeState(config.editorialStatePath, state);
}

export async function getTranslationJobRef(siteId, sectionId, id) {
  const state = await readState(config.editorialStatePath);
  return state[siteId]?.[sectionId]?.translationJobs?.[id] || null;
}

export async function updateTranslationJob(siteId, sectionId, id, status, model, result) {
  const state = await readState(config.editorialStatePath);
  const metadata = metadataFor(state, siteId, sectionId);
  const ref = metadata.translationJobs?.[id];
  if (!ref || ref.status === status && ref.model === model) return;
  Object.assign(ref, { status, model, updatedAt: new Date().toISOString() });
  if (ref.task === "translate") {
    const translation = metadata.translations[ref.targetLocale] ||= {};
    if (translation.status === "queued" || translation.status === "running") {
      translation.status = status === "succeeded" ? "translation_pending" : status;
      if (status === "succeeded") Object.assign(translation, { suggestedFields: result.fields, sourceHash: ref.sourceHash, sourceLocale: ref.sourceLocale, targetLocale: ref.targetLocale, model, updatedBy: ref.user, updatedAt: ref.updatedAt });
    }
  }
  await writeState(config.editorialStatePath, state);
}

export async function recordFieldAiJob(siteId, sectionId, id, path, task, textHash) {
  const state = await readState(config.editorialStatePath);
  const metadata = metadataFor(state, siteId, sectionId);
  metadata.aiFieldJobs ||= {};
  metadata.aiFieldJobs[id] = { path, task, textHash };
  const old = Object.keys(metadata.aiFieldJobs).slice(0, -30);
  for (const key of old) delete metadata.aiFieldJobs[key];
  await writeState(config.editorialStatePath, state);
}

export async function getFieldAiJobRef(siteId, sectionId, id) {
  const state = await readState(config.editorialStatePath);
  return state[siteId]?.[sectionId]?.aiFieldJobs?.[id] || null;
}

export async function getSharedContent() {
  const [shared, network] = await Promise.all([
    readJson("shared.json"),
    readJson("network.json"),
  ]);
  return { shared, network };
}

const publicationDetailsFile = "news-details.json";
function sanitizePublicationHtml(html) {
  return sanitizeHtml(html, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "font", "u"],
    allowedAttributes: { a: ["href"], font: ["face", "size"], "*": ["align", "style"] },
    allowedStyles: {
      "*": {
        "text-align": [/^(left|center|right|justify)$/],
        "font-family": [/^[\w ,'"-]+$/],
        "font-size": [/^([\d.]+(px|pt|em|rem|%)|small|medium|large)$/],
      },
    },
  });
}

function publicationDetail(details, siteId, id) {
  const detail = details[`${siteId}/${id}`] ?? details[id];
  return detail?.contentHtml ? { ...detail, contentHtml: sanitizePublicationHtml(detail.contentHtml) } : detail ?? null;
}

const uploadedImage = /^(global|mexico|salvador)-\d+-[a-z0-9-]+\.(jpg|png|webp|gif)$/;
export const publicationImagePath = "/api/public/publication-images";

export function legacyPublicationImageDirectory() {
  return path.resolve(config.contentRoot, "../../public/images/news");
}

export function isPublicationImageName(filename) {
  return uploadedImage.test(filename);
}

function publicationImageUrl(item) {
  const src = item.image?.src;
  const legacyPrefix = "/images/news/";
  if (typeof src !== "string" || !src.startsWith(legacyPrefix)) return item;
  const filename = src.slice(legacyPrefix.length);
  return isPublicationImageName(filename)
    ? { ...item, image: { ...item.image, src: `${publicationImagePath}/${filename}` } }
    : item;
}

async function publishNewsItems(siteId, published, news, items) {
  published.sections.news = { ...(published.sections.news ?? news), items };
  await writeState(config.publishedContentPath, { ...await readState(config.publishedContentPath), [siteId]: published });
}

export async function getPublications(siteId) {
  const content = await getPageContent(siteId);
  const details = await readJson(publicationDetailsFile);
  const ownItems = content.sections.news?.items;
  const inherited = siteId !== "global" && ownItems === undefined;
  const items = inherited ? (await getPageContent("global")).sections.news?.items || [] : ownItems || [];
  const detailSite = inherited ? "global" : siteId;
  return items.map(item => ({
    ...publicationImageUrl(item),
    detail: publicationDetail(details, detailSite, item.id),
    ...(inherited ? { inherited: true } : {}),
  }));
}

export async function savePublication(siteId, publication, actor = null) {
  if (!publication || typeof publication !== "object" || Array.isArray(publication)) throw Object.assign(new Error("Publicación inválida"), { status: 400 });
  const id = String(publication.id || "");
  const detail = publication.detail || {};
  if (!/^[a-z][a-z0-9-]{2,80}$/.test(id) || !["news", "article"].includes(detail.kind) || !/^\d{4}-\d{2}-\d{2}$/.test(detail.date || "") ||
      typeof publication.title?.es !== "string" || !publication.title.es.trim() || typeof detail.summary !== "string" || !detail.summary.trim() ||
      typeof publication.image?.src !== "string" || !publication.image.src.trim()) {
    throw Object.assign(new Error("Completa título, fecha, tipo, resumen, imagen y contenido"), { status: 400 });
  }
  const content = await getPageContent(siteId);
  content.sections.news ||= { enabled: true, eyebrow: { es: "NOVEDADES", en: "NEWS", pt: "NOVIDADES", fr: "ACTUALITÉS" }, title: { es: "Últimas publicaciones.", en: "Latest publications.", pt: "Últimas publicações.", fr: "Dernières publications." }, actionLabel: { es: "Ver todas las publicaciones", en: "View all publications", pt: "Ver todas as publicações", fr: "Voir toutes les publications" }, items: [] };
  if (!content.sections.news.items) content.sections.news.items = siteId === "global" ? [] : structuredClone((await getPageContent("global")).sections.news?.items || []);
  const originalId = String(publication.originalId || id);
  const index = content.sections.news.items.findIndex(current => current.id === originalId);
  const details = await readJson(publicationDetailsFile);
  const previousDetail = index >= 0 ? publicationDetail(details, publication.originalId ? "global" : siteId, originalId) : null;
  const legacyBody = detail.contentHtml === undefined && Array.isArray(previousDetail?.sections)
    && !previousDetail.contentHtml && previousDetail.summary === detail.summary;
  const contentHtml = typeof detail.contentHtml === "string" ? sanitizePublicationHtml(detail.contentHtml) : "";
  if (!legacyBody && !contentHtml.trim()) {
    throw Object.assign(new Error("Completa el contenido de la publicación"), { status: 400 });
  }
  const published = await getPublishedPageContent(siteId);
  const item = publicationImageUrl({ id, category: publication.category, title: publication.title, image: publication.image });
  if (index >= 0) content.sections.news.items[index] = item; else content.sections.news.items.unshift(item);
  await saveDocument(siteId, content);
  const key = `${siteId}/${id}`;
  details[key] = {
    date: detail.date, kind: detail.kind, sourceUrl: detail.sourceUrl || "", summary: detail.summary,
    ...(legacyBody ? { sections: previousDetail.sections } : { contentHtml }),
  };
  await writeFile(path.resolve(config.contentRoot, publicationDetailsFile), `${JSON.stringify(details, null, 2)}\n`, "utf8");
  await publishNewsItems(siteId, published, content.sections.news, content.sections.news.items);
  return { ...item, detail: details[key], updatedBy: actor, savedAt: new Date().toISOString() };
}

export async function deletePublication(siteId, publicationId) {
  const content = await getPageContent(siteId);
  const items = content.sections.news?.items || [];
  const index = items.findIndex(item => item.id === publicationId);
  if (index < 0) throw Object.assign(new Error("Publicación no encontrada"), { status: 404 });
  const published = await getPublishedPageContent(siteId);
  items.splice(index, 1);
  await saveDocument(siteId, content);
  const details = await readJson(publicationDetailsFile);
  delete details[`${siteId}/${publicationId}`];
  await writeFile(path.resolve(config.contentRoot, publicationDetailsFile), `${JSON.stringify(details, null, 2)}\n`, "utf8");
  await publishNewsItems(siteId, published, content.sections.news, (published.sections.news?.items ?? []).filter(item => item.id !== publicationId));
  return { deleted: true, publicationId };
}

export async function savePublicationImage(siteId, name, mimeType, base64) {
  const extensions = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };
  const extension = Object.hasOwn(extensions, mimeType) ? extensions[mimeType] : null;
  if (!extension || typeof base64 !== "string") throw Object.assign(new Error("Usa una imagen JPG, PNG, WEBP o GIF"), { status: 400 });
  const buffer = Buffer.from(base64, "base64");
  if (!buffer.length || buffer.length > 5 * 1024 * 1024) throw Object.assign(new Error("La imagen debe pesar menos de 5 MB"), { status: 413 });
  const signature = buffer.subarray(0, 12);
  const validSignature = {
    jpg: signature.subarray(0, 3).toString("hex") === "ffd8ff",
    png: signature.subarray(0, 8).toString("hex") === "89504e470d0a1a0a",
    webp: signature.toString("ascii", 0, 4) === "RIFF" && signature.toString("ascii", 8, 12) === "WEBP",
    gif: ["GIF87a", "GIF89a"].includes(signature.toString("ascii", 0, 6)),
  };
  if (!validSignature[extension]) throw Object.assign(new Error("El archivo no coincide con el formato de imagen seleccionado"), { status: 400 });
  const stem = String(name || "publicacion").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 45) || "publicacion";
  const filename = `${siteId}-${Date.now()}-${crypto.randomUUID()}-${stem}.${extension}`;
  const directory = config.publicationImagesRoot;
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), buffer);
  return { src: `${publicationImagePath}/${filename}` };
}

export function describeSections(content) {
  return Object.entries(content.sections).map(([id, section], position) => ({
    id,
    position,
    enabled: section.enabled !== false,
    fields: Object.keys(section),
  }));
}
