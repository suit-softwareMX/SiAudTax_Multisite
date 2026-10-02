import assert from "node:assert/strict";
import { cp, mkdtemp, rm } from "node:fs/promises";
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
  await cp(config.contentRoot, path.join(root, "content"), { recursive: true });
  Object.assign(config, {
    contentRoot: path.join(root, "content"), backupRoot: path.join(root, "backups"),
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
