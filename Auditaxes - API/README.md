# AUDITAXES — API local

La API conecta el editor con los archivos JSON del sitio. Autentica al administrador, limita cada cuenta a su sitio asignado y crea un respaldo antes de cada escritura.

## Ejecutar la API

Desde esta carpeta:

```powershell
pnpm install
pnpm dev
```

La API queda disponible en `http://localhost:4100`. Para ejecutarla sin el observador de cambios usa `pnpm start`. También puedes iniciar todo el sistema con `pnpm dev` desde la carpeta raíz.

Comprueba el servicio en `http://localhost:4100/api/health`.

## Configuración

La API funciona con valores locales predeterminados. `.env.example` sirve como referencia:

| Variable | Valor predeterminado | Función |
| --- | --- | --- |
| `PORT` | `4100` | Puerto de la API. |
| `EDITOR_ORIGIN` | `http://localhost:5173` | Origen autorizado para el editor. |
| `CONTENT_ROOT` | `../Auditaxes - Sitio/app/content` | Directorio de los JSON. |
| `GLOBAL_ADMIN_PASSWORD` | `Auditaxes2026` | Contraseña Global. |
| `MEXICO_ADMIN_PASSWORD` | `Auditaxes2026` | Contraseña México. |
| `SALVADOR_ADMIN_PASSWORD` | `Auditaxes2026` | Contraseña El Salvador. |

Ejemplo temporal en PowerShell:

```powershell
$env:GLOBAL_ADMIN_PASSWORD = "una-contraseña-segura"
pnpm dev
```

## Cuentas y permisos

| Cuenta | Sitio autorizado |
| --- | --- |
| `global@auditaxes.com` | `global` |
| `mexico@auditaxes.com` | `mexico` |
| `salvador@auditaxes.com` | `salvador` |

Al iniciar sesión se genera un token aleatorio. Las rutas privadas esperan:

```http
Authorization: Bearer <token>
```

Las sesiones se almacenan en memoria y se pierden al reiniciar la API.

## Endpoints

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Público | Estado y ruta de contenido. |
| `POST` | `/api/auth/login` | Público | Valida correo y contraseña. |
| `GET` | `/api/auth/me` | Privado | Recupera el usuario. |
| `DELETE` | `/api/auth/session` | Privado | Cierra la sesión. |
| `GET` | `/api/sites/current` | Privado | Configuración del sitio asignado. |
| `GET` | `/api/content/current` | Privado | Documento completo asignado. |
| `GET` | `/api/content/current/sections` | Privado | Resumen de secciones. |
| `GET` | `/api/content/current/sections/:id` | Privado | Recupera una sección. |
| `PUT` | `/api/content/current/sections/:id` | Privado | Guarda una sección. |
| `POST` | `/api/content/current/sections` | Privado | Crea una sección personalizada. |
| `DELETE` | `/api/content/current/sections/:id` | Privado | Elimina una sección personalizada. |
| `PUT` | `/api/content/current/sections-order` | Privado | Guarda el orden completo. |
| `GET` | `/api/content/shared` | Privado | Contenido común y red. |
| `GET` | `/api/public/content/:siteId` | Público | Contenido actualizado para el sitio. |

Los `siteId` válidos son `global`, `mexico` y `salvador`.

## Archivos y respaldos

La API lee y escribe directamente:

- Global: `../Auditaxes - Sitio/app/content/global.json`
- México: `../Auditaxes - Sitio/app/content/countries/mexico.json`
- El Salvador: `../Auditaxes - Sitio/app/content/countries/salvador.json`

Antes de cualquier escritura copia la versión anterior en `backups/<siteId>/<fecha-y-hora>.json`.

Para restaurar una copia, detén los servicios y reemplaza manualmente el JSON del sitio por el respaldo elegido, conservando el nombre original. Las secciones estructurales no se pueden eliminar; sólo aquellas cuyo `type` sea `custom`.

## Pruebas

```powershell
pnpm test
```

Las pruebas usan contenido temporal y no deben modificar los JSON reales.

## Limitaciones

- Usuarios y contraseñas definidos en configuración, no en una base de datos.
- Sesiones no persistentes y sin caducidad automática.
- Sin recuperación de contraseña ni segundo factor.
- CORS limitado al editor configurado y a los tres puertos locales.
- Diseñada para desarrollo local, no para publicación directa en Internet.
