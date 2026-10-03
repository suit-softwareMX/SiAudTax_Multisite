# AUDITAXES — Editor administrativo

Panel local para editar el contenido de AUDITAXES. La cuenta utilizada determina si se carga el sitio Global, México o El Salvador; el administrador no puede cambiar a otro mercado desde la interfaz.

## Iniciar

La API debe estar activa en `http://localhost:4100`. Para que **Vista previa** funcione, también debe estar activo el sitio correspondiente.

La opción recomendada es ejecutar `pnpm dev` desde la carpeta raíz. Para iniciar sólo el editor desde esta carpeta:

```powershell
pnpm install
pnpm dev
```

Abre `http://localhost:5173`.

## Credenciales provisionales

| Administrador | Correo | Contraseña | Contenido asignado |
| --- | --- | --- | --- |
| Global | `global@auditaxes.com` | `Auditaxes2026` | Global |
| México | `mexico@auditaxes.com` | `Auditaxes2026` | México |
| El Salvador | `salvador@auditaxes.com` | `Auditaxes2026` | El Salvador |

La validación ocurre en la API. El token se conserva en `sessionStorage`; al reiniciar la API la sesión deja de ser válida.

## Uso del editor

1. Inicia sesión con la cuenta del mercado que deseas administrar.
2. En **Resumen**, presiona **Administrar contenido** o abre **Contenido**.
3. Selecciona una sección en la columna izquierda.
4. Modifica sus textos, enlaces, imágenes, cifras o interruptores.
5. Presiona **Guardar cambios** para escribir esa sección en el JSON.
6. Usa **Vista previa** para abrir el sitio asignado.
7. Cierra la sesión desde el icono de salida cuando termines.

### Idiomas

El formulario edita el idioma fuente: inglés para Global y español para México y El Salvador. Los campos de los demás idiomas permanecen en el JSON para el futuro flujo de traducción.

### Colecciones

Las listas, personas e indicadores aparecen como colecciones numeradas. El icono de papelera retira un elemento del borrador; después debes presionar **Guardar cambios** para aplicarlo al archivo.

### Crear una sección

1. Presiona **Nueva sección**.
2. Escribe el nombre y presiona **Crear**.
3. Agrega bloques de **Subtítulo**, **Texto** o **Viñetas**.
4. Completa el contenido y guárdalo.

Las secciones personalizadas se pueden eliminar con **Eliminar sección**. Las secciones estructurales están protegidas.

### Cambiar el orden

Arrastra una sección y suéltala en la posición deseada. El orden se guarda inmediatamente mediante la API y se aplica al sitio público.

### Vista previa

- Global: `/site-preview/global`
- México: `/site-preview/mexico`
- El Salvador: `/site-preview/el-salvador`

El enlace abre la vista previa en el mismo origen que el editor, también por el túnel de pruebas. Necesita el sitio Global activo en el puerto 4321 y la API en el 4100. El sitio consulta de nuevo la API al cargar y al recuperar el foco. Después de guardar, vuelve a la pestaña de vista previa o recárgala.

## Estado de los módulos

- **Resumen:** disponible.
- **Contenido:** disponible con lectura y escritura real.
- **Traducciones:** reservado; todavía no está conectado a la IA.
- **Configuración:** reservado.

## Configuración y compilación

La dirección de la API se controla con:

```env
VITE_API_URL=http://localhost:4100/api
```

Es el valor predeterminado. Usa `.env.example` como referencia y reinicia el editor si lo cambias.

```powershell
pnpm build
pnpm preview
```

La compilación se genera en `dist`.

## Problemas frecuentes

- **No inicia sesión:** verifica `http://localhost:4100/api/health` y las credenciales.
- **No aparecen secciones:** comprueba que la API tenga acceso a `Auditaxes - Sitio/app/content`.
- **No se guardó:** mantén el formulario abierto, reactiva la API e inténtalo otra vez.
- **La vista previa no abre:** inicia el sitio del mercado o usa el lanzador general.

Este editor y sus credenciales son exclusivamente para desarrollo local.
