import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createApp, clearSessions } from "../src/app.js";
import { closeDatabase } from "../src/email-store.js";

let server;
let baseUrl;

before(async () => {
  server = createApp().listen(0);
  await new Promise(resolve => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  clearSessions();
  await new Promise(resolve => server.close(resolve));
  await closeDatabase();
});

test("la base de datos responde y los correos usan baja lógica por país", async () => {
  const session = await login("mexico@auditaxes.com");
  const headers = { authorization: `Bearer ${session.token}`, "content-type": "application/json" };
  const health = await fetch(`${baseUrl}/api/database/health`, { headers });
  assert.equal(health.status, 200);
  assert.equal((await health.json()).databaseName, "Auditaxes");

  const marker = Date.now();
  const createdResponse = await fetch(`${baseUrl}/api/emails/current`, {
    method: "POST", headers, body: JSON.stringify({ userName: `Prueba Integración ${marker}`, alternateEmail: `qa-${marker}@example.com` }),
  });
  assert.equal(createdResponse.status, 201);
  const created = (await createdResponse.json()).email;
  assert.match(created.emailAddress, /@mexico\.auditaxes\.com$/);

  const salvador = await login("salvador@auditaxes.com");
  const foreignList = await fetch(`${baseUrl}/api/emails/current`, { headers: { authorization: `Bearer ${salvador.token}` } });
  assert.ok(!(await foreignList.json()).emails.some(item => item.id === created.id));

  const recovery = await fetch(`${baseUrl}/api/emails/current/${created.id}/password-recovery`, { method: "POST", headers });
  assert.equal(recovery.status, 201);
  assert.ok((await recovery.json()).recovery.requestId);

  const removed = await fetch(`${baseUrl}/api/emails/current/${created.id}`, { method: "DELETE", headers });
  assert.equal(removed.status, 204);
  const activeList = await fetch(`${baseUrl}/api/emails/current`, { headers });
  assert.ok(!(await activeList.json()).emails.some(item => item.id === created.id));
});

async function login(email) {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password: "Auditaxes2026" }),
  });
  assert.equal(response.status, 200);
  return response.json();
}

test("rechaza contenido sin sesión", async () => {
  const response = await fetch(`${baseUrl}/api/content/current`);
  assert.equal(response.status, 401);
});

test("México sólo recupera el contenido de México", async () => {
  const session = await login("mexico@auditaxes.com");
  assert.equal(session.user.siteId, "mexico");
  const response = await fetch(`${baseUrl}/api/content/current`, { headers: { authorization: `Bearer ${session.token}` } });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.site.id, "mexico");
  assert.equal(body.sourceLocale, "es");
  assert.ok(body.content.sections.hero);
  assert.ok(body.content.sections.team);
});

test("Global recupera sus secciones y el idioma inglés", async () => {
  const session = await login("global@auditaxes.com");
  const response = await fetch(`${baseUrl}/api/content/current/sections`, { headers: { authorization: `Bearer ${session.token}` } });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.siteId, "global");
  assert.equal(body.sourceLocale, "en");
  assert.ok(body.sections.some(section => section.id === "consortium"));
});

test("El Salvador no puede solicitar secciones de otro sitio", async () => {
  const session = await login("salvador@auditaxes.com");
  const response = await fetch(`${baseUrl}/api/content/current/sections/hero`, { headers: { authorization: `Bearer ${session.token}` } });
  const body = await response.json();
  assert.equal(body.siteId, "salvador");
  assert.ok(body.section.title);
});
