# AUDITAXES — Propuestas de diseño

Proyecto independiente con tres direcciones visuales para AUDITAXES. Cada propuesta incluye las vistas Global, México y El Salvador, además del mapa interactivo de la red.

## Ejecutar localmente

En Windows, haz doble clic en `iniciar-proyecto.cmd`. Este archivo llama a `iniciar.bat`, que comprueba Node.js y pnpm, instala las dependencias si faltan, compila el proyecto e inicia las tres páginas:

- Global: `http://localhost:4321`
- México: `http://localhost:4322`
- El Salvador: `http://localhost:4323`

Si ya tienes Node.js y pnpm instalados globalmente, también puedes usar:

```bash
pnpm install
pnpm dev
```

Con `pnpm dev`, abrir `http://localhost:3000`.

## Navegación directa

- Propuesta 1: `/?propuesta=1&sitio=global`
- Propuesta 2: `/?propuesta=2&sitio=mexico`
- Propuesta 3: `/?propuesta=3&sitio=salvador`

El selector fijo de la esquina superior izquierda cambia la propuesta sin perder la página activa. La navegación del encabezado permite alternar entre Global, México y El Salvador.

## Estructura

- `app/page.tsx`: selección del sitio y el idioma según URL, dominio o puerto.
- `app/components.tsx`: plantillas visuales, navegación y mapa interactivo.
- `app/content/global.json`: contenido y recursos de la página global.
- `app/content/countries`: contenido completo de cada país.
- `app/content/shared.json`: navegación, contacto y secciones compartidas.
- `app/content/network.json`: países, disponibilidad y coordenadas del mapa.
- `app/content/site.json`: idiomas, dominios y puertos configurados.
- `app/content/index.ts`: registro y acceso tipado al contenido JSON.
- `app/globals.css`: sistema visual compartido y variantes de las tres propuestas.
- `public/images`: imágenes locales del proyecto.

Consulta `app/content/README.md` para agregar países o modificar contenido. Esta capa podrá sustituirse posteriormente por una base de datos sin cambiar las plantillas visuales.

Este directorio es autónomo y no importa código ni recursos mediante rutas del proyecto anterior.
