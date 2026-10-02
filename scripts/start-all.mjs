import { spawn, spawnSync } from "node:child_process";
import process from "node:process";
import path from "node:path";
const pathKey = process.platform === "win32" ? "Path" : "PATH";
const localEnv = { ...process.env, [pathKey]: `${path.dirname(process.execPath)}${path.delimiter}${process.env[pathKey] || ""}` };

const services = [
  { name: "GLOBAL", color: "\x1b[36m", directory: "Auditaxes - Sitio", command: "pnpm exec vinext start --hostname 127.0.0.1 --port 4321", url: "http://localhost:4321" },
  { name: "MEXICO", color: "\x1b[34m", directory: "Auditaxes - Sitio", command: "pnpm exec vinext start --hostname 127.0.0.1 --port 4322", url: "http://localhost:4322" },
  { name: "SALVADOR", color: "\x1b[35m", directory: "Auditaxes - Sitio", command: "pnpm exec vinext start --hostname 127.0.0.1 --port 4323", url: "http://localhost:4323" },
  { name: "API", color: "\x1b[33m", directory: "Auditaxes - API", command: "pnpm dev", url: "http://localhost:4100/api/health" },
  { name: "EDITOR", color: "\x1b[32m", directory: "Auditaxes - Editor", command: "pnpm dev", url: "http://localhost:5173" },
];

const reset = "\x1b[0m";
const children = new Set();
let stopping = false;

function writeLines(stream, prefix, output) {
  let pending = "";
  stream.setEncoding("utf8");
  stream.on("data", chunk => {
    pending += chunk;
    const lines = pending.split(/\r?\n/);
    pending = lines.pop() || "";
    for (const line of lines) {
      if (line.trim()) output.write(`${prefix} ${line}\n`);
    }
  });
  stream.on("end", () => {
    if (pending.trim()) output.write(`${prefix} ${pending}\n`);
  });
}

function launch(service) {
  const command = process.platform === "win32" ? "cmd.exe" : "pnpm";
  const args = process.platform === "win32"
    ? ["/d", "/s", "/c", service.command]
    : service.command.replace(/^pnpm\s+/, "").split(" ");
  const child = spawn(command, args, { cwd: path.resolve(process.cwd(), service.directory), env: localEnv, stdio: ["ignore", "pipe", "pipe"] });
  children.add(child);
  const prefix = `${service.color}[${service.name.padEnd(6)}]${reset}`;
  writeLines(child.stdout, prefix, process.stdout);
  writeLines(child.stderr, prefix, process.stderr);
  child.on("exit", code => {
    children.delete(child);
    if (!stopping && code !== 0) {
      console.error(`${prefix} terminó inesperadamente con código ${code}.`);
      stop(1);
    }
  });
}

function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  console.log("\nApagando servicios de AUDITAXES…");
  for (const child of children) {
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], { stdio: "ignore" });
    } else {
      child.kill("SIGTERM");
    }
  }
  setTimeout(() => process.exit(exitCode), 500);
}

console.log("\nAUDITAXES — entorno local\n");
console.log("Preparando la compilación compartida del sitio…\n");
const siteDirectory = path.resolve(process.cwd(), "Auditaxes - Sitio");
const build = process.platform === "win32"
  ? spawnSync("cmd.exe", ["/d", "/s", "/c", "pnpm build"], { cwd: siteDirectory, env: localEnv, stdio: "inherit" })
  : spawnSync("pnpm", ["build"], { cwd: siteDirectory, env: localEnv, stdio: "inherit" });
if (build.status !== 0) {
  console.error("\nNo fue posible compilar Auditaxes - Sitio.");
  process.exit(build.status || 1);
}
console.log("\nServicios disponibles:\n");
for (const service of services) {
  console.log(`${service.color}${service.name.padEnd(8)}${reset} ${service.url}`);
  launch(service);
}
console.log(`\n${services.length} servicios locales iniciando. IA remota: ${process.env.INFERENCE_API_KEY ? process.env.INFERENCE_URL || "http://192.168.0.103:4110" : "sin clave; funciones de IA deshabilitadas"}. Presiona Ctrl+C para apagarlos.\n`);

process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));
