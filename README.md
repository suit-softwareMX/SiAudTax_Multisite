# AUDITAXES — Propuestas de diseño

Proyecto independiente con tres direcciones visuales para AUDITAXES. Cada propuesta incluye las vistas Global, México y El Salvador, además del mapa interactivo de la red.

## Ejecutar localmente

En Windows, haz doble clic en `iniciar-proyecto.cmd`. Este iniciador configura automáticamente el entorno incluido con Codex y levanta el sitio en `http://localhost:3000`.

Si ya tienes Node.js y pnpm instalados globalmente, también puedes usar:

```bash
pnpm install
pnpm dev
```

Abrir `http://localhost:3000`.

## Navegación directa

- Propuesta 1: `/?propuesta=1&sitio=global`
- Propuesta 2: `/?propuesta=2&sitio=mexico`
- Propuesta 3: `/?propuesta=3&sitio=salvador`

El selector fijo de la esquina superior izquierda cambia la propuesta sin perder la página activa. La navegación del encabezado permite alternar entre Global, México y El Salvador.

## Estructura

- `app/page.tsx`: estado de propuesta y sitio.
- `app/components.tsx`: secciones, navegación y mapa interactivo.
- `app/data.ts`: textos, servicios, socios y ubicaciones.
- `app/globals.css`: sistema visual compartido y variantes de las tres propuestas.
- `public/images`: imágenes locales del proyecto.

Este directorio es autónomo y no importa código ni recursos mediante rutas del proyecto anterior.
