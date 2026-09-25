# AUDITAXES — Sitio público

Aplicación que sirve tres versiones de AUDITAXES desde una compilación: Global, México y El Salvador. Cada mercado tiene una página principal y otra dedicada a todas sus publicaciones.

## Direcciones locales

| Sitio | Inicio | Publicaciones |
| --- | --- | --- |
| Global | `http://localhost:4321` | `http://localhost:4321/global/publicaciones` |
| México | `http://localhost:4322` | `http://localhost:4322/mexico/publicaciones` |
| El Salvador | `http://localhost:4323` | `http://localhost:4323/el-salvador/publicaciones` |

También existen las rutas principales `/global`, `/mexico` y `/el-salvador`. La ruta `/` identifica el mercado por el puerto.

## Iniciar

Desde la carpeta raíz, `pnpm dev` compila este proyecto e inicia los tres puertos junto con la API y el editor. Es la opción recomendada.

Para iniciar sólo el sitio, instala y compila desde esta carpeta:

```powershell
pnpm install
pnpm build
```

Después abre tres terminales aquí y ejecuta un comando en cada una:

```powershell
pnpm exec vinext start --hostname 0.0.0.0 --port 4321
pnpm exec vinext start --hostname 0.0.0.0 --port 4322
pnpm exec vinext start --hostname 0.0.0.0 --port 4323
```

`pnpm dev` dentro de esta carpeta sirve para desarrollar en un solo puerto; no sustituye al lanzador de tres mercados.

## Contenido

El contenido inicial se incorpora desde:

- `app/content/global.json`: Global y publicaciones.
- `app/content/countries/mexico.json`: México.
- `app/content/countries/salvador.json`: El Salvador.
- `app/content/site.json`: mercados, idiomas y puertos.
- `app/content/shared.json`: contenido común.
- `app/content/network.json`: países y red.

Cuando la API está disponible, el navegador consulta `/api/public/content/:siteId` al cargar y cuando recupera el foco. Así aparecen los cambios del editor sin recompilar. Si la API falla, se muestra el contenido incluido en la última compilación.

Cada documento tiene un objeto `sections` y una lista `sectionOrder`, que determina el orden visual. El editor puede modificar campos, usar `enabled`, crear secciones `custom` y reordenarlas.

Las imágenes están en `public/images`; las de publicaciones, en `public/images/news`. Consulta `app/content/README.md` para más detalles de los JSON.

## Publicaciones

La sección **Novedades** de cada inicio muestra las primeras tres publicaciones. **Ver todas las publicaciones** abre la página del mercado con la colección completa. Las tarjetas todavía no abren el detalle de un artículo.

## Estructura principal

- `app/global/page.tsx` y `app/global/publicaciones/page.tsx`
- `app/mexico/page.tsx` y `app/mexico/publicaciones/page.tsx`
- `app/el-salvador/page.tsx` y `app/el-salvador/publicaciones/page.tsx`
- `app/site-shell.tsx`: selección del mercado y carga pública.
- `app/components.tsx`: componentes y secciones.
- `app/globals.css`: estilos compartidos.
- `public/images`: recursos gráficos.

## Desarrollo y verificación

```powershell
pnpm dev
pnpm lint
pnpm build
```

Después de cambiar componentes, estilos, rutas o imágenes, vuelve a compilar si usas los procesos `vinext start`. Los cambios editoriales guardados en JSON no necesitan recompilación mientras la API esté activa.

## Flujo con el editor

1. El administrador inicia sesión en `http://localhost:5173`.
2. La API limita la cuenta al JSON de su mercado.
3. **Guardar cambios** actualiza la sección y crea un respaldo.
4. **Vista previa** abre el puerto correcto.
5. El sitio obtiene la versión actualizada desde la API.

El sistema actual está diseñado para desarrollo local. Antes de publicarlo se debe definir el despliegue, la persistencia, la autenticación y la traducción automática.
