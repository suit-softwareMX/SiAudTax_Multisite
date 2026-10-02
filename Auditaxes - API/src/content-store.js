import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";
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
  await getPublishedPageContent(siteId);
  content.sectionOrder = sectionOrder;
  await saveDocument(siteId, content);
  return { sectionOrder, savedAt: new Date().toISOString() };
}

export async function deleteSection(siteId, sectionId) {
  const content = await getPageContent(siteId);
  const section = content.sections[sectionId];
  if (!section) throw Object.assign(new Error("Sección no encontrada"), { status: 404 });
  if (section.type !== "custom") throw Object.assign(new Error("Las secciones estructurales no pueden eliminarse"), { status: 400 });
  await getPublishedPageContent(siteId);
  delete content.sections[sectionId];
  content.sectionOrder = (content.sectionOrder || Object.keys(content.sections)).filter(id => id !== sectionId);
  await saveDocument(siteId, content);
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

export function describeSections(content) {
  return Object.entries(content.sections).map(([id, section], position) => ({
    id,
    position,
    enabled: section.enabled !== false,
    fields: Object.keys(section),
  }));
}
