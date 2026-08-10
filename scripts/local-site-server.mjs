import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const site = process.argv[2];
const port = Number(process.argv[3]);
if (!['mexico', 'paraguay'].includes(site) || !Number.isInteger(port)) throw new Error('Uso: node scripts/local-site-server.mjs <mexico|paraguay> <puerto>');
const root = fileURLToPath(new URL('../sites/', import.meta.url));
const publicRoot = fileURLToPath(new URL('../public/', import.meta.url));
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml' };
const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? '/', `http://${request.headers.host}`).pathname);
  const isPublicAsset = pathname.startsWith('/images/');
  const selectedRoot = isPublicAsset ? publicRoot : root;
  const relative = isPublicAsset ? pathname.slice(1) : pathname === '/' ? `${site}/index.html` : pathname === '/local-sites.json' ? 'shared/local-sites.json' : pathname.startsWith('/shared/') ? pathname.slice(1) : `${site}${pathname}`;
  const file = normalize(join(selectedRoot, relative));
  if (!file.startsWith(selectedRoot)) { response.writeHead(403); response.end('Forbidden'); return; }
  try { const body = await readFile(file); response.writeHead(200, { 'Content-Type': mime[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' }); response.end(body); }
  catch { response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); response.end('Not found'); }
});
server.listen(port, '0.0.0.0', () => console.log(`AUDITAXES ${site}: http://localhost:${port}`));
