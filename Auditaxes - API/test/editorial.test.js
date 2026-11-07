import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import os from "node:os";
import path from "node:path";
import { after, before, test } from "node:test";
import { createApp, clearSessions } from "../src/app.js";
import { config } from "../src/config.js";

let root, server, base, provider;
const original = { ...config };

before(async () => {
  root = await mkdtemp(path.join(os.tmpdir(), "auditaxes-editorial-"));
  const contentRoot = path.join(root, "app", "content");
  await cp(config.contentRoot, contentRoot, { recursive: true });
  Object.assign(config, {
    contentRoot, backupRoot: path.join(root, "backups"),
    publicationImagesRoot: path.join(root, "uploads"),
    editorialStatePath: path.join(root, "editorial.json"), publishedContentPath: path.join(root, "published.json"),
  });
  server = createApp().listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (provider) await new Promise(resolve => provider.close(resolve));
  clearSessions();
  await new Promise(resolve => server.close(resolve));
  Object.assign(config, original);
  await rm(root, { recursive: true, force: true });
});

async function login(site) {
  const response = await fetch(`${base}/api/auth/login`, { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: `${site}@auditaxes.com`, password: "Auditaxes2026" }) });
  return { authorization: `Bearer ${(await response.json()).token}`, "content-type": "application/json" };
}

test("publica cambios del artículo y sirve imágenes nuevas y antiguas desde el disco", async () => {
  const headers = await login("global");
  const publicUrl = `${base}/api/public/content/global`;
  const privateUrl = `${base}/api/content/current/publications`;
  assert.equal((await fetch(publicUrl)).status, 200);
  const png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l2cAAAAASUVORK5CYII=";
  const filename = "global-1793921304598-portada.png";
  const directory = path.join(root, "public", "images", "news");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), Buffer.from(png, "base64"));

  // Simula una publicación guardada por el editor anterior después de crear la copia pública.
  const globalPath = path.join(config.contentRoot, "global.json");
  const globalContent = JSON.parse(await readFile(globalPath, "utf8"));
  globalContent.sections.news.items.find(item => item.id === "electronic-invoicing").image.src = `/images/news/${filename}`;
  await writeFile(globalPath, JSON.stringify(globalContent));

  const { publications } = await (await fetch(privateUrl, { headers })).json();
  const original = publications.find(item => item.id === "electronic-invoicing");
  const live = await (await fetch(publicUrl)).json();
  assert.equal(original.image.src, `/api/public/publication-images/${filename}`);
  assert.equal(live.content.sections.news.items.find(item => item.id === original.id).image.src, original.image.src);
  const draft = {
    ...original,
    detail: { ...original.detail, summary: "Resumen actualizado", contentHtml: '<h2>Contenido actualizado</h2><a href="jav&#x61;script:alert(1)">Enlace</a>' },
  };
  const articleUrl = `${privateUrl}/${draft.id}`;
  const save = item => fetch(articleUrl, { method: "PUT", headers, body: JSON.stringify(item) });
  assert.equal((await save(draft)).status, 200);
  const published = await (await fetch(publicUrl)).json();
  const item = published.content.sections.news.items.find(item => item.id === draft.id);
  assert.equal(item.image.src, `/api/public/publication-images/${filename}`);
  assert.equal(published.publicationDetails[draft.id].summary, draft.detail.summary);
  assert.equal(published.publicationDetails[draft.id].contentHtml, "<h2>Contenido actualizado</h2><a>Enlace</a>");

  const uploaded = await fetch(`${base}/api/content/current/publication-images`, {
    method: "POST", headers, body: JSON.stringify({ name: "portada.png", type: "image/png", data: png }),
  });
  assert.equal(uploaded.status, 201);
  const { src } = await uploaded.json();
  const uploadedName = path.basename(src);
  assert.deepEqual(await readFile(path.join(config.publicationImagesRoot, uploadedName)), Buffer.from(png, "base64"));
  await assert.rejects(readFile(path.join(directory, uploadedName)), { code: "ENOENT" });
  for (const imageUrl of [item.image.src, src]) {
    const image = await fetch(base + imageUrl);
    assert.equal(image.status, 200);
    assert.equal(image.headers.get("content-type"), "image/png");
    assert.deepEqual(Buffer.from(await image.arrayBuffer()), Buffer.from(png, "base64"));
  }
  const missing = await fetch(`${base}/api/public/publication-images/global-123-ausente.png`);
  assert.equal(missing.status, 404);
  assert.equal(missing.headers.get("cache-control"), "no-store");

  assert.equal((await fetch(articleUrl, { method: "DELETE", headers })).status, 200);
  const afterDelete = await (await fetch(publicUrl)).json();
  assert.equal(afterDelete.content.sections.news.items.some(item => item.id === draft.id), false);
  assert.equal(Object.hasOwn(afterDelete.publicationDetails, draft.id), false);
});

test("crear una publicación local o copiar una de Global conserva el aislamiento editorial", async () => {
  const global = await login("global");
  const mexico = await login("mexico");
  const salvador = await login("salvador");
  const current = `${base}/api/content/current`;
  const getPublic = async site => (await fetch(`${base}/api/public/content/${site}`)).json();
  const getList = async headers => (await (await fetch(`${current}/publications`, { headers })).json()).publications;
  const save = (headers, item) => fetch(`${current}/publications/${item.id}`, {
    method: "PUT", headers, body: JSON.stringify(item),
  });
  const baseline = await getPublic("global");
  const globalNews = structuredClone(baseline.content.sections.news);
  const sourceId = "economic-substance-law";
  globalNews.items.find(item => item.id === sourceId).title.es = "Solo en borrador";
  const draft = await fetch(`${current}/sections/news`, {
    method: "PUT", headers: global, body: JSON.stringify({ section: globalNews }),
  });
  assert.equal(draft.status, 200);

  const inherited = (await getList(salvador)).find(item => item.id === sourceId);
  const original = baseline.content.sections.news.items.find(item => item.id === sourceId);
  assert.equal(inherited.inherited, true);
  assert.equal(inherited.title.es, original.title.es);

  const newItem = {
    ...original, id: "qa-publicacion-nueva",
    detail: { ...baseline.publicationDetails[sourceId], contentHtml: "<p>Cuerpo de prueba.</p>" },
  };
  assert.equal((await save(mexico, newItem)).status, 200);
  assert.deepEqual((await getPublic("mexico")).content.sections.news.items.map(item => item.id), [newItem.id]);

  assert.equal((await save(salvador, { ...inherited, title: { ...inherited.title, es: "Copia local" } })).status, 200);
  const local = await getPublic("salvador");
  assert.deepEqual(local.content.sections.news.items.map(item => item.id), [sourceId]);
  assert.deepEqual(local.publicationDetails[sourceId].sections, inherited.detail.sections);

  assert.equal((await save(global, { ...newItem, id: "qa-publicacion-global" })).status, 200);
  const globalAfter = await getPublic("global");
  assert.equal(globalAfter.content.sections.news.items.find(item => item.id === sourceId).title.es, original.title.es);
});

test("el orden y la eliminación se reflejan en el sitio sin publicar secciones en borrador", async () => {
  const headers = await login("salvador");
  const currentUrl = `${base}/api/content/current`;
  const publicUrl = `${base}/api/public/content/salvador`;
  const id = "section-test";
  const create = await fetch(`${currentUrl}/sections`, {
    method: "POST", headers, body: JSON.stringify({ sectionId: id, section: { type: "custom", enabled: true } }),
  });
  assert.equal(create.status, 201);
  const { content } = await (await fetch(currentUrl, { headers })).json();
  const sectionOrder = [...content.sectionOrder].reverse();
  const reorder = await fetch(`${currentUrl}/sections-order`, {
    method: "PUT", headers, body: JSON.stringify({ sectionOrder }),
  });
  assert.equal(reorder.status, 200);
  const beforeApproval = (await (await fetch(publicUrl)).json()).content;
  assert.deepEqual(beforeApproval.sectionOrder, sectionOrder.filter(sectionId => sectionId !== id));
  assert.equal(Object.hasOwn(beforeApproval.sections, id), false);
  for (const status of ["review", "approved"]) {
    const response = await fetch(`${currentUrl}/sections/${id}/status`, { method: "PUT", headers, body: JSON.stringify({ status }) });
    assert.equal(response.status, 200);
  }
  assert.equal((await (await fetch(publicUrl)).json()).content.sections[id].type, "custom");
  assert.equal((await fetch(`${currentUrl}/sections/${id}`, { method: "DELETE", headers })).status, 200);
  const afterDelete = (await (await fetch(publicUrl)).json()).content;
  assert.equal(Object.hasOwn(afterDelete.sections, id), false);
  assert.equal(afterDelete.sectionOrder.includes(id), false);
});

test("borrador, revisión, aprobación y traducción mantienen aislados los sitios", async () => {
  const mx = await login("mexico");
  const sv = await login("salvador");
  const publicBefore = (await (await fetch(`${base}/api/public/content/mexico`)).json()).content.sections.hero.title.es;
  const current = await (await fetch(`${base}/api/content/current`, { headers: mx })).json();
  const section = structuredClone(current.content.sections.hero);
  section.title.es = "Texto nuevo de México";
  const save = await fetch(`${base}/api/content/current/sections/hero`, { method: "PUT", headers: mx, body: JSON.stringify({ section }) });
  assert.equal((await save.json()).metadata.status, "draft");
  assert.equal((await (await fetch(`${base}/api/public/content/mexico`)).json()).content.sections.hero.title.es, publicBefore);
  const review = await fetch(`${base}/api/content/current/sections/hero/status`, { method: "PUT", headers: mx, body: JSON.stringify({ status: "review" }) });
  assert.equal((await review.json()).metadata.status, "review");
  const approved = await fetch(`${base}/api/content/current/sections/hero/status`, { method: "PUT", headers: mx, body: JSON.stringify({ status: "approved" }) });
  assert.equal((await approved.json()).metadata.status, "approved");
  assert.equal((await (await fetch(`${base}/api/public/content/mexico`)).json()).content.sections.hero.title.es, "Texto nuevo de México");
  assert.notEqual((await (await fetch(`${base}/api/public/content/salvador`)).json()).content.sections.hero.title.es, "Texto nuevo de México");

  const source = await (await fetch(`${base}/api/content/current/sections/hero/translations/en`, { headers: mx })).json();
  const fields = Object.fromEntries(Object.keys(source.fields).map(id => [id, "English reviewed text"]));
  const proposal = await fetch(`${base}/api/content/current/sections/hero/translations/en`, { method: "PUT", headers: mx,
    body: JSON.stringify({ fields, sourceHash: source.sourceHash, status: "review" }) });
  assert.equal(proposal.status, 410);
  assert.notEqual((await (await fetch(`${base}/api/content/current/sections/hero/translations/en`, { headers: sv })).json()).fields[Object.keys(fields)[0]], "Texto nuevo de México");
  const edited = structuredClone((await (await fetch(`${base}/api/content/current`, { headers: mx })).json()).content.sections.hero);
  edited.title.en = "Edited English draft";
  const englishSave = await fetch(`${base}/api/content/current/sections/hero`, { method: "PUT", headers: mx, body: JSON.stringify({ section: edited }) });
  assert.equal((await englishSave.json()).metadata.translations.en.status, "translation_pending");
});

test("resultado de IA es privado y no publica", async () => {
  let received = {};
  provider = createServer(async (request, response) => {
    assert.equal(request.headers.authorization, "Bearer local-test-key");
    response.setHeader("content-type", "application/json");
    if (request.method === "POST") {
      let body = "";
      for await (const chunk of request) body += chunk;
      received = JSON.parse(body).input.fields;
      response.end(JSON.stringify({ id: "job-1", status: "queued" }));
    } else response.end(JSON.stringify({ id: "job-1", status: "succeeded", result: { fields: Object.fromEntries(Object.keys(received).map(id => [id, "English proposal"])) } }));
  }).listen(0, "127.0.0.1");
  await new Promise(resolve => provider.once("listening", resolve));
  config.inferenceUrl = `http://127.0.0.1:${provider.address().port}`;
  config.inferenceKey = "local-test-key";
  const mx = await login("mexico");
  const sv = await login("salvador");
  const publicBefore = (await (await fetch(`${base}/api/public/content/mexico`)).json()).content.sections.hero;
  const created = await fetch(`${base}/api/content/current/sections/hero/ai-jobs/translate`, { method: "POST", headers: mx });
  assert.equal(created.status, 202);
  assert.equal((await fetch(`${base}/api/content/current/sections/hero/ai-jobs/translate`, { headers: sv })).status, 404);
  const result = await (await fetch(`${base}/api/content/current/sections/hero/ai-jobs/translate`, { headers: mx })).json();
  assert.equal(result.status, "succeeded");
  assert.equal(result.stale, false);
  assert.deepEqual((await (await fetch(`${base}/api/public/content/mexico`)).json()).content.sections.hero, publicBefore);
});

test("IA por campo acepta texto sin guardar y aísla trabajos por sitio", async () => {
  if (provider) await new Promise(resolve => provider.close(resolve));
  let submitted;
  provider = createServer(async (request, response) => {
    response.setHeader("content-type", "application/json");
    if (request.method === "POST") {
      let body = "";
      for await (const chunk of request) body += chunk;
      submitted = JSON.parse(body);
      response.end(JSON.stringify({ id: "field-job-1", status: "queued" }));
    } else response.end(JSON.stringify({ id: "field-job-1", task: submitted.task, status: "succeeded", result: { fields: { field: "Financial audit" } } }));
  }).listen(0, "127.0.0.1");
  await new Promise(resolve => provider.once("listening", resolve));
  config.inferenceUrl = `http://127.0.0.1:${provider.address().port}`;
  const mx = await login("mexico");
  const sv = await login("salvador");
  const path = ["title", "es"];
  const publicBefore = (await (await fetch(`${base}/api/public/content/mexico`)).json()).content.sections.hero.title;
  const created = await fetch(`${base}/api/content/current/sections/hero/field-ai-jobs`, { method: "POST", headers: mx,
    body: JSON.stringify({ path, text: "Auditoría financiera aún sin guardar", task: "translate", sourceLocale: "es" }) });
  assert.equal(created.status, 202);
  assert.equal(submitted.input.target_locale, "en");
  assert.equal(submitted.input.fields.field, "Auditoría financiera aún sin guardar");
  assert.equal((await fetch(`${base}/api/content/current/sections/hero/field-ai-jobs/field-job-1`, { headers: sv })).status, 404);
  const result = await (await fetch(`${base}/api/content/current/sections/hero/field-ai-jobs/field-job-1`, { headers: mx })).json();
  assert.deepEqual(result.path, path);
  assert.equal(result.result.fields.field, "Financial audit");
  assert.deepEqual((await (await fetch(`${base}/api/public/content/mexico`)).json()).content.sections.hero.title, publicBefore);
  const invalid = await fetch(`${base}/api/content/current/sections/hero/field-ai-jobs`, { method: "POST", headers: mx,
    body: JSON.stringify({ path: ["links", 0, "href", "es"], text: "https://example.com", task: "translate", sourceLocale: "es" }) });
  assert.equal(invalid.status, 400);
});

test("traducción bilingüe en cola requiere ortografía confirmada y no publica", async () => {
  if (provider) await new Promise(resolve => provider.close(resolve));
  let sequence = 0;
  const submitted = new Map();
  provider = createServer(async (request, response) => {
    response.setHeader("content-type", "application/json");
    if (request.url === "/healthz") return response.end(JSON.stringify({ models: { translate: { active: "small", using_fallback: true } } }));
    if (request.method === "POST") {
      let body = ""; for await (const chunk of request) body += chunk;
      const job = JSON.parse(body); const id = `bulk-${++sequence}`;
      submitted.set(id, job); return response.end(JSON.stringify({ id, status: "queued" }));
    }
    const id = request.url.split("/").at(-1);
    const job = submitted.get(id);
    response.end(JSON.stringify({ id, status: "succeeded", model: "small", result: job.task === "review" ? { issues: [] } :
      { fields: Object.fromEntries(Object.entries(job.input.fields).map(([key, value]) => [key, job.task === "proofread" ? value : `Translated ${value}`])) } }));
  }).listen(0, "127.0.0.1");
  await new Promise(resolve => provider.once("listening", resolve));
  config.inferenceUrl = `http://127.0.0.1:${provider.address().port}`;
  const mx = await login("mexico"); const sv = await login("salvador"); const global = await login("global");
  const section = structuredClone((await (await fetch(`${base}/api/content/current`, { headers: mx })).json()).content.sections.hero);
  section.title.es = "Nuevo título para prueba";
  await fetch(`${base}/api/content/current/sections/hero`, { method: "PUT", headers: mx, body: JSON.stringify({ section }) });
  const view = await (await fetch(`${base}/api/content/current/sections/hero/translations`, { headers: mx })).json();
  assert.equal(view.sourceLocale, "es"); assert.equal(view.targetLocale, "en"); assert.ok(view.missingFields.length);
  const created = await (await fetch(`${base}/api/content/current/sections/hero/translation-jobs`, { method: "POST", headers: mx, body: JSON.stringify({ sourceHash: view.sourceHash }) })).json();
  assert.deepEqual(Object.keys(submitted.get(created.id).input.fields).sort(), view.missingFields.sort());
  assert.equal((await fetch(`${base}/api/content/current/sections/hero/translation-jobs/${created.id}`, { headers: sv })).status, 404);
  const done = await (await fetch(`${base}/api/content/current/sections/hero/translation-jobs/${created.id}`, { headers: mx })).json();
  assert.equal(done.model, "small"); assert.equal(done.stale, false);
  const fields = { ...view.translatedFields, ...done.result.fields };
  const denied = await fetch(`${base}/api/content/current/sections/hero/translations`, { method: "PUT", headers: mx,
    body: JSON.stringify({ fields, sourceHash: view.sourceHash, status: "review" }) });
  assert.equal(denied.status, 409);
  const proofread = await (await fetch(`${base}/api/content/current/sections/hero/translation-jobs`, { method: "POST", headers: mx,
    body: JSON.stringify({ task: "proofread", fields: done.result.fields, sourceHash: view.sourceHash }) })).json();
  await fetch(`${base}/api/content/current/sections/hero/translation-jobs/${proofread.id}`, { headers: mx });
  const decisions = Object.fromEntries(Object.keys(done.result.fields).map(id => [id, "keep"]));
  const saved = await fetch(`${base}/api/content/current/sections/hero/translations`, { method: "PUT", headers: mx,
    body: JSON.stringify({ fields, sourceHash: view.sourceHash, status: "review", proofreadJobId: proofread.id, decisions }) });
  assert.equal(saved.status, 200);
  assert.equal((await (await fetch(`${base}/api/content/current/sections/hero/translations`, { headers: mx })).json()).missingFields.length, 0);
  assert.equal((await fetch(`${base}/api/content/current/sections/hero/translation-jobs`, { method: "POST", headers: mx,
    body: JSON.stringify({ sourceHash: view.sourceHash }) })).status, 409);
  assert.notEqual((await (await fetch(`${base}/api/public/content/mexico`)).json()).content.sections.hero.title.en, fields[JSON.stringify(["title", "en"])]);
  const accepted = await fetch(`${base}/api/content/current/sections/hero/translations`, { method: "PUT", headers: mx,
    body: JSON.stringify({ fields, sourceHash: view.sourceHash, status: "approved" }) });
  assert.equal(accepted.status, 200);
  assert.notEqual((await (await fetch(`${base}/api/public/content/mexico`)).json()).content.sections.hero.title.en, fields[JSON.stringify(["title", "en"])]);
  await fetch(`${base}/api/content/current/sections/hero/status`, { method: "PUT", headers: mx, body: JSON.stringify({ status: "review" }) });
  await fetch(`${base}/api/content/current/sections/hero/status`, { method: "PUT", headers: mx, body: JSON.stringify({ status: "approved" }) });
  assert.equal((await (await fetch(`${base}/api/public/content/mexico`)).json()).content.sections.hero.title.en, fields[JSON.stringify(["title", "en"])]);
  section.title.es = "Otra versión de México";
  await fetch(`${base}/api/content/current/sections/hero`, { method: "PUT", headers: mx, body: JSON.stringify({ section }) });
  const stale = await (await fetch(`${base}/api/content/current/sections/hero/translations`, { headers: mx })).json();
  assert.equal(stale.metadata.translations.en.status, "stale");
  assert.deepEqual(stale.missingFields, [JSON.stringify(["title", "en"])]);
  assert.equal((await (await fetch(`${base}/api/content/current/sections/hero/translation-jobs/${created.id}`, { headers: mx })).json()).stale, true);
  const globalView = await (await fetch(`${base}/api/content/current/sections/hero/translations`, { headers: global })).json();
  assert.equal(globalView.sourceLocale, "en"); assert.equal(globalView.targetLocale, "es");
  const globalSection = structuredClone(globalView.section);
  globalSection.title.en = "New global headline";
  await fetch(`${base}/api/content/current/sections/hero`, { method: "PUT", headers: global, body: JSON.stringify({ section: globalSection }) });
  const globalChanged = await (await fetch(`${base}/api/content/current/sections/hero/translations`, { headers: global })).json();
  const reverse = await (await fetch(`${base}/api/content/current/sections/hero/translation-jobs`, { method: "POST", headers: global,
    body: JSON.stringify({ sourceHash: globalChanged.sourceHash }) })).json();
  assert.equal(submitted.get(reverse.id).input.source_locale, "en");
  assert.equal(submitted.get(reverse.id).input.target_locale, "es");

  const beforeSwitch = (await (await fetch(`${base}/api/content/current`, { headers: mx })).json()).content.sections.hero;
  const reversed = await fetch(`${base}/api/content/current/sections/hero`, { method: "PUT", headers: mx,
    body: JSON.stringify({ section: beforeSwitch, sourceLocale: "en" }) });
  assert.equal((await reversed.json()).metadata.sourceLocale, "en");
  const reverseView = await (await fetch(`${base}/api/content/current/sections/hero/translations`, { headers: mx })).json();
  assert.equal(reverseView.sourceLocale, "en");
  assert.equal(reverseView.targetLocale, "es");
  assert.equal(reverseView.needsReview, true);
  assert.equal(reverseView.missingFields.length, 0);
  assert.equal(reverseView.section.title.es, "Otra versión de México");
  assert.equal(reverseView.section.title.en, beforeSwitch.title.en);
  assert.equal((await (await fetch(`${base}/api/content/current/sections/hero/translation-jobs/${created.id}`, { headers: mx })).json()).stale, true);
  await fetch(`${base}/api/content/current/sections/hero/status`, { method: "PUT", headers: mx, body: JSON.stringify({ status: "review" }) });
  assert.equal((await fetch(`${base}/api/content/current/sections/hero/status`, { method: "PUT", headers: mx, body: JSON.stringify({ status: "approved" }) })).status, 409);
  const noProofread = await fetch(`${base}/api/content/current/sections/hero/translations`, { method: "PUT", headers: mx,
    body: JSON.stringify({ fields: reverseView.translatedFields, sourceHash: reverseView.sourceHash, sourceLocale: "en", targetLocale: "es", status: "review" }) });
  assert.equal(noProofread.status, 409);
  const allChecked = await (await fetch(`${base}/api/content/current/sections/hero/translation-jobs`, { method: "POST", headers: mx,
    body: JSON.stringify({ task: "proofread", fields: reverseView.translatedFields, sourceHash: reverseView.sourceHash, sourceLocale: "en", targetLocale: "es" }) })).json();
  const reviewed = await fetch(`${base}/api/content/current/sections/hero/translations`, { method: "PUT", headers: mx,
    body: JSON.stringify({ fields: reverseView.translatedFields, sourceHash: reverseView.sourceHash, sourceLocale: "en", targetLocale: "es", status: "review",
      proofreadJobId: allChecked.id, decisions: Object.fromEntries(Object.keys(reverseView.fields).map(id => [id, "keep"])) }) });
  assert.equal(reviewed.status, 200);
  const acceptedReverse = await fetch(`${base}/api/content/current/sections/hero/translations`, { method: "PUT", headers: mx,
    body: JSON.stringify({ fields: reverseView.translatedFields, sourceHash: reverseView.sourceHash, sourceLocale: "en", targetLocale: "es", status: "approved" }) });
  assert.equal(acceptedReverse.status, 200);
  await fetch(`${base}/api/content/current/sections/hero/status`, { method: "PUT", headers: mx, body: JSON.stringify({ status: "review" }) });
  assert.equal((await fetch(`${base}/api/content/current/sections/hero/status`, { method: "PUT", headers: mx, body: JSON.stringify({ status: "approved" }) })).status, 200);
});

test("Global y El Salvador pueden elegir el idioma original por sección", async () => {
  for (const site of ["global", "salvador"]) {
    const headers = await login(site);
    const before = await (await fetch(`${base}/api/content/current`, { headers })).json();
    const section = structuredClone(before.content.sections.hero);
    const sourceLocale = before.editorial.hero.sourceLocale === "es" ? "en" : "es";
    const invalid = await fetch(`${base}/api/content/current/sections/hero`, { method: "PUT", headers,
      body: JSON.stringify({ section, sourceLocale: "fr" }) });
    assert.equal(invalid.status, 400);
    const saved = await fetch(`${base}/api/content/current/sections/hero`, { method: "PUT", headers,
      body: JSON.stringify({ section, sourceLocale }) });
    assert.equal((await saved.json()).metadata.sourceLocale, sourceLocale);
    const translation = await (await fetch(`${base}/api/content/current/sections/hero/translations`, { headers })).json();
    assert.equal(translation.sourceLocale, sourceLocale);
    assert.equal(translation.targetLocale, sourceLocale === "es" ? "en" : "es");
    assert.deepEqual(translation.section.title, section.title);
  }
});
