import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const locales = ["es", "en", "pt"];

const load = async (path) => JSON.parse(await readFile(new URL(path, root), "utf8"));
const leafPaths = (value, prefix = "") => Object.entries(value).flatMap(([key, child]) => {
  const path = prefix ? `${prefix}.${key}` : key;
  return child && typeof child === "object" && !Array.isArray(child)
    ? leafPaths(child, path)
    : [path];
});

const catalogs = Object.fromEntries(await Promise.all(locales.map(async (locale) => [
  locale,
  await load(`src/data/catalogs/${locale}.json`),
])));
const expected = leafPaths(catalogs.es).sort();

for (const locale of locales.slice(1)) {
  const actual = leafPaths(catalogs[locale]).sort();
  const missing = expected.filter((key) => !actual.includes(key));
  const extra = actual.filter((key) => !expected.includes(key));
  if (missing.length || extra.length) {
    throw new Error(`${locale}: catalog mismatch\nMissing: ${missing.join(", ")}\nExtra: ${extra.join(", ")}`);
  }
}

const countries = await load("src/data/countries.json");
if (countries.length !== 13) throw new Error(`Expected 13 countries, found ${countries.length}`);
const expectedCountries = ["mexico", "guatemala", "el-salvador", "costa-rica", "panama", "belize", "colombia", "peru", "argentina", "dominican-republic", "venezuela", "united-kingdom", "paraguay"];
if (countries.map(({ id }) => id).sort().join(",") !== expectedCountries.sort().join(",")) {
  throw new Error("Country nodes do not match the approved network list");
}
if (countries.filter(({ status }) => status === "active").map(({ id }) => id).sort().join(",") !== "el-salvador,mexico") {
  throw new Error("Only Mexico and El Salvador may be active for this release");
}
if (countries.find(({ id }) => id === "mexico")?.href !== "https://mexico-auditaxes.suitmx.com/" || countries.find(({ id }) => id === "el-salvador")?.href !== "https://elsalvador-auditaxes.suitmx.com/") {
  throw new Error("Mexico and El Salvador must point to their local sites");
}
if (countries.some(({ id, href }) => !["mexico", "el-salvador"].includes(id) && href !== null)) {
  throw new Error("Only Mexico and El Salvador may have local site links");
}
if (countries.some(({ latitude, longitude }) => Math.abs(latitude) > 90 || Math.abs(longitude) > 180)) {
  throw new Error("Invalid map coordinates");
}

console.log("Content catalogs and 13 country nodes are valid; Mexico and El Salvador are active.");
