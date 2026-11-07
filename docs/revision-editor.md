# Revisión del editor y publicación por túnel

## Qué se publica

| Editor | Resultado público | Momento |
| --- | --- | --- |
| Contenido → Portada | Título, introducción, botón, URL, imagen y texto alternativo de cada sitio | Al aprobar la sección |
| Contenido → secciones de página | Textos y colecciones conectados a la página, visibilidad y secciones personalizadas | Al aprobar la sección |
| Contenido → mover o eliminar | Orden de secciones publicadas y eliminación de secciones personalizadas | Al guardar el orden o confirmar la eliminación |
| Contenido → Novedades | Encabezado y visibilidad del bloque. Los artículos se administran en Publicaciones | Al aprobar la sección |
| Publicaciones | Listado, filtros, fecha, título, resumen, cuerpo, enlace, portada y texto alternativo | Al guardar o eliminar |
| Traducciones | Texto aprobado en su idioma de destino | Al aprobar después la sección en Contenido |

En Contenido, el idioma original determina cuál versión se está editando. En Publicaciones, se pueden indicar títulos y textos alternativos para los otros idiomas. Una portada cambiada sin editar el cuerpo ni el resumen de un artículo anterior conserva las versiones traducidas que ya tenía.

El perfil institucional de El Salvador (firma, metodología, especialidades, industrias y equipo) usa datos estáticos y se indica como de solo lectura en el editor. Los campos de contacto global que el formulario actual no utiliza y el nombre interno de las fotografías de liderazgo también se indican como de solo lectura. Configuración, búsqueda, notificaciones y centro de ayuda están pendientes. La revisión de traducciones usa una propuesta de prueba ya preparada y no inicia trabajos de IA.

## Resultados locales

Pruebas en Chromium con el sitio compilado, el proxy del administrador, una sesión separada de visitante y datos temporales.

| Caso | Ruta e idioma | Comprobación |
| --- | --- | --- |
| Portada | `/global?lang=en`, `/mexico?lang=es`, `/el-salvador?lang=es` y las tres bajo `/site-preview` | Título, texto, enlace, imagen cargada y alt. El borrador y la revisión permanecieron privados. La versión aprobada apareció en su idioma sin recompilar |
| Secciones | Las tres portadas; El Salvador con pantalla de 390 px | Creación, aprobación, orden mediante teclado y eliminación. Visibilidad probada en Global y eliminación de un elemento de lista en México |
| Publicación | `/global/publicaciones?lang=en` y `/site-preview/global/publicaciones?lang=es` | Alta, edición y baja. Fecha, tipo, formato, enlace, imagen, resumen y título localizado. Imágenes nuevas y antiguas con HTTP 200. Rechazo de tipo incorrecto, archivo simulado y tamaño mayor a 5 MB |
| Publicación local y contacto | `/mexico` en el puerto `4322`, `/el-salvador` en `4323`, y sus rutas de publicaciones y de vista previa en español | El título de contacto aprobado llegó a la portada. La noticia con imagen apareció en su sitio y su vista previa, y quedó fuera del listado de Global |
| Cuenta y recuperación | Administrador local, tres cuentas | Sesión, sitio asignado, salida, confirmación al salir de un borrador y reintento tras un error HTTP 502 |
| Traducción | `/mexico?lang=en` | Una propuesta guardada se incorporó desde la interfaz y solo apareció al aprobar la sección |
| Persistencia | Portadas de los tres sitios y artículo de prueba | El texto y la imagen seguían visibles después de reiniciar API, sitio y editor |

## Comprobación pendiente en el túnel

| Dominio | Origen en el equipo del túnel | Ruta para comprobar |
| --- | --- | --- |
| `adminauditaxes.suitmx.com` | `http://127.0.0.1:5173` | `/` con Cloudflare Access y `/site-preview/global`, `/site-preview/mexico`, `/site-preview/el-salvador` |
| `auditaxes.suitmx.com` | `http://127.0.0.1:4321` | `/global` y `/global/publicaciones` |
| `mexico-auditaxes.suitmx.com` | `http://127.0.0.1:4322` | `/mexico` y `/mexico/publicaciones` |
| `elsalvador-auditaxes.suitmx.com` | `http://127.0.0.1:4323` | `/el-salvador` y `/el-salvador/publicaciones` |

1. Antes de actualizar, respalda los datos del servidor y conserva su contenido JSON, los estados editoriales y la carpeta `Auditaxes - Sitio/public/images/news`. Instala las dependencias de la API con `pnpm --dir "Auditaxes - API" install --frozen-lockfile` y relanza con `iniciar-todo.cmd`, que compila el sitio. Mantén la API en `127.0.0.1:4100`. Si hay reglas de caché de Cloudflare personalizadas, excluye `/api/*`.
2. Desde otro dispositivo, comprueba que HTTPS abre los cuatro dominios. Una ventana sin sesión debe recibir el acceso de Cloudflare al entrar al administrador. Las páginas públicas deben abrir en esa ventana sin iniciar sesión en el editor.
3. En cada sede, guarda un texto temporal autorizado y comprueba en el idioma editado que el visitante conserva el texto anterior hasta que apruebes la sección. Luego crea una publicación temporal con una imagen pequeña. Comprueba su título, resumen y portada tanto en la vista previa como en el dominio público al recargar.
4. En la pestaña Red, verifica que `/api/public/content/<sede>` y la imagen en `/api/public/publication-images/<archivo>` respondan `200` en el mismo dominio que se está viendo. Comprueba que la imagen devuelva un tipo `image/*` y que los cambios aparezcan al recargar sin depender de recompilar. Si falla, registra el dominio, ruta, idioma, estado HTTP y el resultado observado.
5. Restaura el texto original con el mismo flujo de aprobación y elimina las publicaciones temporales. Repite la lectura pública para confirmar la restauración.
