# Contenido editable de AUDITAXES

Todo el contenido visible de las tres páginas se lee de los JSON de esta carpeta. En desarrollo, guarde el archivo y recargue el navegador. Para producción es necesario volver a compilar y publicar el sitio.

## Archivos

| Archivo | Qué se edita |
| --- | --- |
| `site.json` | Sitios, dominios, puertos de desarrollo e idiomas disponibles. |
| `global.json` | Metadatos, navegación y secciones del sitio global. |
| `countries/mexico.json` | Metadatos, navegación y secciones de México. |
| `countries/salvador.json` | Metadatos, navegación y secciones de El Salvador. |
| `network.json` | Imagen del mapa, países, nombres traducidos, coordenadas, estado y destino. |
| `shared.json` | Etiquetas generales, idiomas, mensajes del mapa y pie de página. |

## Convenciones

- `sections` contiene una clave por sección visible. Cambie `enabled` a `false` para ocultar una sección y su enlace de navegación.
- Los textos que cambian según idioma se guardan como `{ "es": "...", "en": "...", "pt": "...", "fr": "..." }`.
- Cada elemento de `items`, `steps`, `stats` y `people` tiene un `id` estable. Para cambiar el orden, mueva el objeto completo dentro de la lista.
- Las imágenes usan rutas públicas, por ejemplo `/images/office.jpg`, y deben existir en `public/`.
- `contact` y `footer` son propios de cada sitio. Actualice ambos si cambia un dato de contacto que aparece en las dos secciones.
- `schemaVersion` identifica el contrato actual (`2`).

Para agregar un país, cree su JSON con este formato, regístrelo en `index.ts` y agregue la entrada correspondiente en `site.json` y `network.json`.

