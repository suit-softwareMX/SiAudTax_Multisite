# AUDITAXES — entorno local

Este repositorio contiene el sitio público, la API de contenido y el editor administrativo de AUDITAXES. Todo funciona de forma local y los tres componentes comparten los mismos archivos JSON.

## Componentes

| Carpeta | Función | URL local |
| --- | --- | --- |
| `Auditaxes - Sitio` | Sitios Global, México y El Salvador, incluidas sus páginas de publicaciones. | `4321`, `4322` y `4323` |
| `Auditaxes - API` | Autenticación, lectura y escritura del contenido JSON. | `http://localhost:4100` |
| `Auditaxes - Editor` | Panel administrativo para modificar el sitio asignado a cada cuenta. | `http://localhost:5173` |
| `../AuditaxesInferenceServer` | Cola local de traducción y revisión, con Ollama. | `http://localhost:4110` |

Documentación detallada:

- [Sitio](./Auditaxes%20-%20Sitio/README.md)
- [API](./Auditaxes%20-%20API/README.md)
- [Editor](./Auditaxes%20-%20Editor/README.md)

## Requisitos

- Node.js 22.13 o posterior.
- pnpm disponible en la terminal.
- Python 3.11+ y dependencias de `../AuditaxesInferenceServer` instaladas en `.venv`.
- Ollama y el modelo `qwen3:4b-instruct-2507-q4_K_M` para generar resultados reales.

Para instalar pnpm, si todavía no está disponible:

```powershell
npm install --global pnpm
```

La primera vez, instala las dependencias de cada componente desde esta carpeta:

```powershell
pnpm --dir "Auditaxes - Sitio" install
pnpm --dir "Auditaxes - API" install
pnpm --dir "Auditaxes - Editor" install
```

## Iniciar y detener todo

La forma recomendada es ejecutar desde esta carpeta:

```powershell
pnpm dev
```

En esta computadora, usa `iniciar-todo.cmd` para tomar el Node 24 incluido en Codex; el `node` global es 21 y no compila Vite. El lanzador compila el sitio e inicia cinco procesos locales. La inferencia vive exclusivamente en la workstation `192.168.0.107`:

| Proceso | Dirección |
| --- | --- |
| Sitio Global | `http://localhost:4321` |
| Sitio México | `http://localhost:4322` |
| Sitio El Salvador | `http://localhost:4323` |
| API | `http://localhost:4100` |
| Editor | `http://localhost:5173` |

Para activar la IA, abre `iniciar-todo.cmd` desde la carpeta del sitio: el lanzador pide la clave de la workstation sin mostrarla, configura la URL `http://192.168.0.107:4110` en esa sesión e inicia los cinco servicios. No hace falta pegar comandos de PowerShell ni guardar la clave en un archivo. Si el proceso ya recibió `INFERENCE_API_KEY` de un gestor de secretos, no vuelve a pedirla.

La API usa `http://192.168.0.107:4110` por defecto; puedes cambiarlo con `INFERENCE_URL` si ejecutas la API por separado. No se inicia inferencia en este servidor. La URL y la clave solo se configuran en el backend, nunca en Vite ni en el navegador. Ollama de la workstation permanece en localhost y su API 11434 no se expone. No cierres la ventana del lanzador mientras uses el proyecto.

Para detener todos los servicios, presiona `Ctrl+C` en la terminal del lanzador. Si lo abriste con doble clic, confirma la interrupción cuando Windows lo solicite.

## Flujo de trabajo

1. Inicia todos los servicios.
2. Abre `http://localhost:5173`.
3. Inicia sesión con la cuenta Global, México o El Salvador.
4. Entra en **Contenido**, selecciona una sección y edítala.
5. Presiona **Guardar cambios**. La API crea un borrador y un respaldo; el sitio público sigue mostrando la versión aprobada.
6. Para traducir, entra en **Traducciones**, genera una propuesta, corrígela y apruébala. Esto añade el inglés al borrador, sin publicarlo.
7. En **Contenido**, envía la sección a revisión y pulsa **Aprobar y publicar**. El sitio público recupera el contenido aprobado al cargar o al recuperar el foco.

No es necesario volver a compilar después de guardar contenido. Sí debes reiniciar el lanzador si modificas código del sitio servido desde la compilación.

## Credenciales locales

| Alcance | Correo | Contraseña predeterminada |
| --- | --- | --- |
| Global | `global@auditaxes.com` | `Auditaxes2026` |
| México | `mexico@auditaxes.com` | `Auditaxes2026` |
| El Salvador | `salvador@auditaxes.com` | `Auditaxes2026` |

Cada cuenta sólo puede leer y modificar el sitio que tiene asignado. Estas credenciales son provisionales y exclusivamente locales; pueden cambiarse con variables de entorno de la API.

## Verificación

```powershell
pnpm test
pnpm build
```

`pnpm test` ejecuta las pruebas de la API. `pnpm build` compila el sitio y el editor.

## Solución rápida de problemas

- **La ventana se cierra al iniciar:** abre PowerShell en esta carpeta y ejecuta `pnpm dev` para conservar el mensaje de error.
- **El editor no permite iniciar sesión:** comprueba `http://localhost:4100/api/health` y que el puerto 4100 esté libre.
- **Un sitio no abre:** confirma que los puertos 4321, 4322 y 4323 no estén ocupados.
- **Los cambios no aparecen:** guarda la sección, vuelve a enfocar o recarga el sitio y confirma que la API continúe activa.
- **La IA queda en cola:** revisa `http://localhost:4110/healthz`; `ollama: false` indica que Ollama no está ejecutándose. Instala el modelo con `ollama pull qwen3:4b-instruct-2507-q4_K_M`.
- **Vite indica que falta `styleText`:** tu `node` es anterior a la versión requerida. Usa Node 22.13+ o el runtime Node 24 incluido en Codex.
- **Sesión vencida después de reiniciar:** es el comportamiento esperado; las sesiones viven en memoria. Inicia sesión otra vez.

## Seguridad

El entorno actual no está preparado para exponerse a Internet. Antes de desplegarlo públicamente se necesitan contraseñas seguras, almacenamiento persistente de usuarios, sesiones seguras, HTTPS y una política de orígenes adecuada.
