# AUDITAXES Multisite

Sitio web institucional de **AUDITAXES Global** y base del ecosistema multisitio para sus firmas locales.

El proyecto es completamente estático: no usa backend ni base de datos. La matriz global presenta la marca, servicios, perspectivas, contacto y un mapa interactivo de sedes. México y Paraguay incluyen demos locales; el resto de los países permanecen visibles como nodos inactivos hasta contar con su sitio.

## Tecnologías

- Astro 7 y TypeScript
- CSS nativo
- Contenido editable en JSON
- Generación estática para hosting CDN
- Español, inglés y portugués

## Estructura

```text
src/
├── components/       Componentes de la matriz global
├── data/
│   ├── catalogs/     Textos ES, EN y PT
│   ├── countries.json Configuración de países y nodos del mapa
│   └── site.json     Datos generales del sitio
├── pages/            Rutas estáticas de Astro
└── styles/           Estilos globales

sites/
├── mexico/           Demo del sitio local de México
├── paraguay/         Demo del sitio local de Paraguay
└── shared/           Plantilla, estilos y contenido local compartido

scripts/              Validación, mapa y servidor de demos locales
public/               Recursos públicos y mapa SVG
```

## Requisitos

- Node.js 22.12 o superior
- pnpm

## Desarrollo local

```bash
pnpm install
pnpm dev --host 0.0.0.0 --port 4321
```

La matriz estará disponible en <http://localhost:4321>.

En Windows también se puede ejecutar `iniciar.bat`, que levanta simultáneamente:

| Sitio | URL |
| --- | --- |
| Matriz global | <http://localhost:4321> |
| México | <http://localhost:4322> |
| Paraguay | <http://localhost:4323> |

## Comandos

| Comando | Uso |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Verificación y build estático en `dist/` |
| `pnpm preview` | Vista previa del build |
| `pnpm check` | Diagnóstico de Astro y TypeScript |
| `pnpm validate:content` | Valida idiomas, países, estados y enlaces locales |
| `pnpm generate:map` | Regenera `public/world-map.svg` desde Natural Earth |

## Editar contenido

- Matriz global: `src/data/catalogs/es.json`, `en.json` y `pt.json`.
- Países y nodos del mapa: `src/data/countries.json`.
- Sitios locales: `sites/shared/local-sites.json`.
- Datos generales: `src/data/site.json`.

Los tres catálogos deben conservar las mismas claves. Antes de subir cambios:

```bash
pnpm validate:content
pnpm build
```

## Estados y sitios locales

En `countries.json`, cada país define coordenadas, estado y enlace:

- `status: "active"` muestra una sede disponible.
- `status: "inactive"` conserva el nodo visible como próximo mercado.
- `href` enlaza al sitio local; debe ser `null` mientras no exista.

Actualmente solo México y Paraguay están activos y tienen demos. Los futuros sitios hijos pueden vivir en repositorios independientes; la matriz únicamente necesita actualizar su estado y URL final.

## Despliegue

`pnpm build` genera un sitio estático en `dist/`, compatible con Cloudflare Pages, Netlify, Vercel o cualquier servidor de archivos estáticos. El dominio canónico se configura en `astro.config.mjs`.

## Alcance actual

- Sin backend, autenticación ni panel administrativo.
- Formularios y datos de contacto son únicamente frontend.
- Los contenidos se mantienen directamente en JSON mediante control de versiones.
