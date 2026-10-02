import { config } from "./config.js";

export async function inferenceRequest(path, options = {}) {
  if (!config.inferenceKey) throw Object.assign(new Error("Servicio de IA no configurado"), { status: 503 });
  let response;
  try {
    response = await fetch(`${config.inferenceUrl}${path}`, {
      ...options,
      headers: { authorization: `Bearer ${config.inferenceKey}`, ...(options.body ? { "content-type": "application/json" } : {}) },
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw Object.assign(new Error("Servicio de IA no disponible"), { status: 503 });
  }
  if (!response.ok) throw Object.assign(new Error(response.status === 429 ? "La cola de IA está llena" : "No se pudo consultar el servicio de IA"), { status: response.status === 429 ? 429 : 502 });
  return response.json();
}
