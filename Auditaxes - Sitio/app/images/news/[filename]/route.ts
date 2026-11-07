const API_ORIGIN = process.env.AUDITAXES_API_ORIGIN || "http://127.0.0.1:4100";
const SAFE_IMAGE = /^[a-z0-9][a-z0-9._-]{2,180}\.(?:jpe?g|png|webp|gif)$/i;

export async function GET(_request: Request, context: { params: Promise<{ filename: string }> | { filename: string } }) {
  const { filename } = await context.params;
  if (!SAFE_IMAGE.test(filename)) return Response.json({ error: "Imagen inválida" }, { status: 400 });

  try {
    const upstream = await fetch(`${API_ORIGIN}/api/publication-images/${encodeURIComponent(filename)}`, { cache: "no-store" });
    if (!upstream.ok) return Response.json({ error: "Imagen no encontrada" }, { status: upstream.status });
    return new Response(upstream.body, {
      status: 200,
      headers: {
        "content-type": upstream.headers.get("content-type") || "application/octet-stream",
        "cache-control": "public, max-age=300",
      },
    });
  } catch {
    return Response.json({ error: "La API de imágenes no está disponible" }, { status: 503 });
  }
}
