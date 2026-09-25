import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createApp, clearSessions } from "../src/app.js";

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
