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
- SQL Server local y ODBC Driver 17 (la configuración local usa autenticación integrada de Windows).
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

Inicializa una vez la base de datos desde una terminal con acceso a SQL Server:

```powershell
sqlcmd -S localhost -E -i "Auditaxes - API/database/setup.sql"
```

La API usa la base `Auditaxes` y la tabla `dbo.EmailAccounts`. Para otro servidor define
`SQL_CONNECTION_STRING`; no es necesario guardar credenciales en el código. La sección **Correos**
genera la dirección a partir del nombre, la limita al país de la sesión y usa `IsActive` para las bajas.

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

En Windows, volver a ejecutar `iniciar-todo.cmd` cierra las instancias anteriores de Auditaxes en esos cinco puertos antes de iniciar los servicios. Si un puerto está ocupado por un programa ajeno, el lanzador indica el puerto y el PID para que puedas revisarlo.

Abre `iniciar-todo.cmd` desde la carpeta del sitio: el lanzador pide la clave de la workstation sin mostrarla, configura la URL `http://192.168.0.107:4110` en esa sesión e inicia los cinco servicios. Para probar solo el sitio local sin IA, pulsa Enter sin escribir clave; el editor funcionará y las acciones de IA quedarán deshabilitadas. No hace falta pegar comandos de PowerShell ni guardar la clave en un archivo. Si el proceso ya recibió `INFERENCE_API_KEY` de un gestor de secretos, no vuelve a pedirla.

La API usa `http://192.168.0.107:4110` por defecto; puedes cambiarlo con `INFERENCE_URL` si ejecutas la API por separado. No se inicia inferencia en este servidor. La URL y la clave solo se configuran en el backend, nunca en Vite ni en el navegador. Ollama de la workstation permanece en localhost y su API 11434 no se expone. No cierres la ventana del lanzador mientras uses el proyecto.

Para pruebas por el túnel, usa Cloudflare Access para `adminauditaxes.suitmx.com`, configura contraseñas propias y apunta ese dominio al editor en `127.0.0.1:5173`. Vite reenvía `/api` a la API local y `/site-preview`, `/_next` e imágenes estáticas al sitio Global en `127.0.0.1:4321`. Los dominios públicos tienen sus propios orígenes locales. Consulta la [revisión del editor y comprobación del túnel](docs/revision-editor.md) para ver las rutas, los resultados locales y los pasos que debe ejecutar el operador.

Al guardar en **Publicaciones**, el sitio y la vista previa recuperan los cambios al cargar o recuperar el foco. Las imágenes que subas se guardan fuera del repositorio en `../Auditaxes-data/publication-images`, desde la raíz del proyecto. Puedes indicar otra carpeta persistente con `PUBLICATION_IMAGES_ROOT`. La API también puede leer las subidas anteriores en `Auditaxes - Sitio/public/images/news`. Conserva ambas carpetas hasta trasladar las imágenes anteriores. Si tienes reglas de caché personalizadas en Cloudflare, excluye `/api/*`. El contenido de las secciones conserva su flujo de aprobación.

Para detener todos los servicios, presiona `Ctrl+C` en la terminal del lanzador. Si lo abriste con doble clic, confirma la interrupción cuando Windows lo solicite.

## Flujo de trabajo

1. Inicia todos los servicios.
2. Abre `http://localhost:5173`.
3. Inicia sesión con la cuenta Global, México o El Salvador.
4. Entra en **Contenido**, selecciona una sección y edítala. Para reemplazar una foto, pulsa **Cambiar imagen** y elige un archivo de hasta 5 MB.
5. Pulsa **Guardar borrador**. Puedes guardarlo directamente o revisar la ortografía. El sitio público muestra la versión aprobada hasta que publiques los cambios.
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
