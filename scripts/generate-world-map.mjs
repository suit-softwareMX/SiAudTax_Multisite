import { mkdir, writeFile } from "node:fs/promises";

const source = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";
const response = await fetch(source);
if (!response.ok) throw new Error(`Unable to fetch Natural Earth data: ${response.status}`);

const collection = await response.json();
const width = 1200;
const height = 600;
const project = ([longitude, latitude]) => [
  ((longitude + 180) / 360) * width,
  ((90 - latitude) / 180) * height,
];

const ringPath = (ring) => ring.map((point, index) => {
  const [x, y] = project(point);
  return `${index ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`;
}).join("") + "Z";

const geometryPath = ({ type, coordinates }) => {
  if (type === "Polygon") return coordinates.map(ringPath).join("");
  if (type === "MultiPolygon") return coordinates.flatMap((polygon) => polygon.map(ringPath)).join("");
  return "";
};

const paths = collection.features
  .map(({ geometry }) => geometryPath(geometry))
  .filter(Boolean)
  .map((path) => `<path d="${path}"/>`)
  .join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="World map"><g fill="#edf5fa" stroke="#9fcbdc" stroke-width="0.7" vector-effect="non-scaling-stroke">${paths}</g></svg>`;
await mkdir(new URL("../public/", import.meta.url), { recursive: true });
await writeFile(new URL("../public/world-map.svg", import.meta.url), svg);
console.log("Generated public/world-map.svg from Natural Earth public-domain data.");
