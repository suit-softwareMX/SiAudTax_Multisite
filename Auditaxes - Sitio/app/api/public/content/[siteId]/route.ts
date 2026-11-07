const API_ORIGIN = process.env.AUDITAXES_API_ORIGIN || "http://127.0.0.1:4100";
const VALID_SITES = new Set(["global", "mexico", "salvador"]);

export async function GET(_request: Request, context: { params: Promise<{ siteId: string }> | { siteId: string } }) {
  const { siteId } = await context.params;
  if (!VALID_SITES.has(siteId)) return Response.json({ error: "Sitio inválido" }, { status: 400 });

  try {
    const upstream = await fetch(`${API_ORIGIN}/api/public/content/${siteId}`, { cache: "no-store" });
    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") || "application/json", "cache-control": "no-store" },
    });
  } catch {
    return Response.json({ error: "La API de contenido no está disponible" }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
