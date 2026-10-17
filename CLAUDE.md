# Contexto del proyecto: Prismatix (catálogo de productos)

Sitio web para mostrar un catálogo de productos. Cada producto tiene fotos y, opcionalmente, un modelo que el visitante puede girar en 360°, acercar y ver en realidad aumentada. Tiene que ser **fácil de mantener** (sin base de datos ni panel de administración) y verse bien **primero en celular**.

## Marca

- **Nombre:** "Prismatix" (antes "Prismatika"). **Descriptor:** "Estudio creativo · Xalapa". **Eslogan:** "Ideas que se vuelven reales." **Cierre:** "Más que objetos, son historias en forma de arte." Todo se define en `src/config.ts` (`SITIO`).
- **Esencia:** "Creemos que la imaginación también se puede tocar." Es un estudio creativo que transforma ideas en objetos únicos, personalizados y llenos de significado. Los seis valores (`ESENCIA` en `src/config.ts`) son Creatividad sin límites, Personalización real, Objetos de autor, Exploración y colección, Conexión emocional, y Xalapa y el mundo.
- **Personalidad:** el Mago + el Aventurero. Creativa, soñadora, curiosa, audaz, sofisticada, cálida, ecléctica, mística, cercana, coleccionista de historias.
- **Tono de voz:** inspirador, cercano, poético, auténtico y seguro; juguetón sin perder lo sofisticado. Se habla de tú. Frases de referencia: "Objetos que guardan lo que amas.", "Xalapa también se colecciona."
- **Giro:** objetos personalizados y de colección. Las líneas (`CATEGORIAS`) son Mascotas, Figuras personalizadas, Fandom deportivo, Souvenirs xalapeños y Juegos de mesa. El `categoria` de cada producto debe coincidir con uno de esos nombres.
- **Qué no somos:** la lámina de identidad traía una sección "Experiencia de marca" que mencionaba partes de coches. **Es incorrecta y se ignora.** No se ofrecen autopartes ni nada automotriz.
- **Regla principal:** los textos públicos **nunca** dicen que los productos son impresos en 3D. Evitar "impresión", "impreso", "capa por capa", "filamento", "PLA", "PETG" y "3D" visible (usar "360°"). Esto aplica a los títulos, las descripciones, los materiales y los alt de las imágenes. La lámina dice "arte, tecnología y diseño"; en el sitio se usa "arte y diseño".
- **Materiales:** se describen por el beneficio o el acabado ("Acabado mate pintado a mano", "Plástico de alta resistencia", "Acabado sedoso").
- **Pedidos personalizados:** "¿Tienes una idea, un recuerdo o un personaje que quieras tener en tus manos? Cuéntanos y lo hacemos real."
- Los nombres de archivos y componentes internos (`Visor3D`, `modelo.glb`) pueden decir 3D porque el visitante no los ve.

## Contacto y llamados a la acción

- **Correo oficial:** `hola@prismatix.mx` (`SITIO.email`). Es el canal principal. Cloudflare Email Routing lo reenvía a `prismatixalapa@gmail.com`, y Gmail responde como `hola@` con "Enviar como" (SMTP de Gmail con una contraseña de aplicación).
- **WhatsApp e Instagram:** `SITIO.whatsapp` y `SITIO.instagram` están **vacíos a propósito**. Mientras lo estén, sus botones no aparecen en ningún lado. Al poner el número (formato `521…`) o la URL, aparecen solos: en el pie, en el formulario ("Enviar por WhatsApp") y en cada producto.
- **Nombre de la acción:** el usuario **no quiere "Agenda tu idea"**. Se usa **"Cuéntanos tu idea"** en los botones y **"Dale forma a tu idea"** como título de la sección. Otros textos de la familia: "Lo quiero · Escríbenos", "¿Lo quieres con tu toque? Personalízalo →".
- **Patrón** (inspirado en una página de referencia que repite "agendar cita" en cada sección): un solo destino para todos los llamados, la sección `#tu-idea` (`TuIdea.astro`). Aparece en:
  1. La cabecera: botón fijo "Cuéntanos tu idea"; abajo de 360 px dice "Tu idea" y abajo de 480 px se oculta el enlace "Colección".
  2. La portada: "Cuéntanos tu idea" (principal) + "Ver la colección" (secundario).
  3. Después de Esencia, como enlace de texto.
  4. Después del catálogo: `Llamado.astro` ("¿No está lo que buscas? Lo creamos para ti.").
  5. En cada producto: "Lo quiero · Escríbenos" (mailto con el producto y su URL), "Personalízalo" y un `Llamado` al final.
  6. El pie: el correo en grande + botón.
- **`TuIdea.astro`:** tres pasos (Cuéntanos tu idea → Te enviamos una propuesta → La hacemos real) y un formulario con nombre, línea (de `CATEGORIAS` + "Otra idea"), idea, fecha y teléfono opcional. **No hay backend:** al enviar, el JS arma un `mailto:` (o un `wa.me` si hay WhatsApp) con el mensaje ya redactado. Los inputs usan 16 px para evitar el zoom automático del iPhone.
- **`Llamado.astro`:** banda terciopelo con título en cursiva, botón a `/#tu-idea` y el correo como atajo. Props: `titulo`, `texto`, `boton` y `asunto` (el asunto del mailto).
- **Utilidades:** `enlaceCorreo(asunto, cuerpo)` en `src/utils.ts`.

## Identidad visual: "Electric Velvet × Sunset Artifact"

La fuente es la lámina "Mapa de marca Prismatix" (imagen `identidad.jpg` del usuario, no está en el repositorio).

- **Paleta** (variables en `src/styles/global.css`):
  - Plum Night `#3A243B`: color insignia, fondo oscuro y texto principal
  - Deep Plum `#552B61`: profundidad, íconos
  - Berry Magenta `#D83A6B`: acento (botones, rótulos de categoría)
  - Terracotta Warm `#C25E3B`: segundo color insignia (precios, énfasis en cursiva)
  - Burnt Orange `#E07A5F`
  - Soft Rose `#F4B6C2`
  - Ivory Dust `#FDFBF7`: fondo general y texto sobre oscuro
  - Electric Pink `#FF2E93`: es el "wild card" y **solo** se usa para colecciones especiales, lanzamientos y colaboraciones. Hoy no se usa.
- **Estructura visual:** editorial. El fondo general es ivory con tarjetas blancas. La portada y el pie son bloques oscuros "terciopelo" (`.seccion-oscura`, `--fondo-terciopelo`: ciruela con resplandores berry y naranja). Ya no hay neón ni rejilla. Solo tema claro.
- **Tipografía** (Google Fonts en `Base.astro`):
  - Playfair Display (serif): titulares, wordmark, frases en cursiva
  - Montserrat (sans): textos y apoyo
  - Rótulos (`.titulo-seccion`, `.etiqueta`, nav, botones): mayúsculas pequeñas con mucho espaciado de letras
- **Isotipo oficial:** una cinta satinada en forma de triángulo (tipo Möbius) en morado, berry y naranja. El original es `isotipo.jpeg` del usuario (1254 px, sobre fondo negro, no está en el repositorio). Los archivos derivados están en `public/marca/`:
  - `isotipo.webp` / `isotipo.png`: 640 px con fondo transparente
  - `isotipo-96.webp`: para el logo y el pie
  - `favicon.png` (64 px) y `apple-touch-icon.png` (180 px, sobre Plum Night)
  - `og.jpg`: imagen para compartir en redes (1200×630); es el `og:image` por defecto
  - Se generan con `python scripts/isotipo.py <isotipo.jpeg> public/marca` (PIL + numpy + scipy): recorta la cinta, vuelve transparente el negro conectado con el fondo (exterior y hueco central) y rellena las manchas oscuras internas para que las sombras moradas no queden con huecos. Si llega una versión vectorial o PNG transparente oficial, conviene reemplazar estos archivos con ella.
- **Logotipo** (`Logo.astro`): isotipo (34 px, 28 px en móvil) + wordmark "PRISMATIX" en Playfair 400 con espaciado, con la **"A" en degradado** berry → naranja → rosa. La prop `claro` sirve para fondos oscuros.
- **Elementos gráficos:**
  - Destello de 4 puntas (`Destello.astro`)
  - Portada (`.prisma`): el isotipo grande flotando con haces de luz (CSS) y un destello. En escritorio va a la derecha (380 px); en móvil va completo arriba del texto (128 px), sin destello.
  - `--degradado-prisma` y `--degradado-atardecer`
- **Iconografía** (`Icono.astro`): trazo fino de 1.5 px, simple y orgánico. Íconos de líneas: `mascota`, `figura`, `estadio`, `souvenir` (catedral/edificios) y `dado`. Íconos de esencia: `destello`, `sol`, `diamante`, `montana`, `corazon` y `destellos`.
- **Estilo fotográfico (para las fotos reales):** luz cálida y dramática, colores ricos y contrastes, composiciones limpias y editoriales, productos en contexto y una atmósfera mágica y real.
- **Móvil primero (requisito explícito del usuario):** cada cambio visual se revisa a 390 y 360 px de ancho.
  - En móvil, el isotipo de la portada va arriba del texto (nunca detrás, porque tapa la lectura).
  - Las tarjetas de líneas se deslizan de lado y la esencia se muestra en 2 columnas.
  - Debajo de 340 px se oculta el enlace "Productos" del menú.

## Stack

- **Astro 7**: genera un sitio 100 % estático (`dist/`). Usa content collections con el loader `glob`.
- **@google/model-viewer**: web component `<model-viewer>` para el visor 3D (usa three.js y pesa ~1 MB).
- **TypeScript** en modo estricto y **CSS puro** con variables (no hay Tailwind ni framework de UI).
- **Node 22+**. Todo el código, los nombres y los textos están en **español**.

## Estructura

```
astro.config.mjs               site = https://prismatix.mx (usada en og:image y enlaces absolutos)
wrangler.jsonc                 Config del Worker de Cloudflare (assets estáticos desde dist/ y dominio propio en routes)
.node-version                  Node 22 para el build en Cloudflare
public/_headers                Caché: /_astro/* inmutable 1 año, /productos/* 1 día
src/config.ts                  SITIO (nombre, descriptor, eslogan, cierre, contacto, moneda), CATEGORIAS (líneas con ícono) y ESENCIA (valores con ícono)
src/content.config.ts          Esquema Zod de la colección `productos`
src/content/productos/*.md     Un producto por archivo; el nombre del archivo es el id/URL
public/productos/<id>/         Fotos y modelo.glb de cada producto (se sirven tal cual)
src/utils.ts                   formatearPrecio(), enlaceWhatsapp(), enlaceCorreo()
src/styles/global.css          Paleta y tokens (:root), degradados, .seccion-oscura, .contenedor, .boton, .etiqueta, .titulo-seccion, .texto-degradado
src/layouts/Base.astro         <head> (favicon/og desde public/marca) + Google Fonts, cabecera sticky ivory con Logo, pie oscuro con isotipo, cierre de marca y contacto (#contacto)
public/marca/                  Isotipo transparente (webp/png), favicon, apple-touch-icon y og.jpg
src/components/
  Logo.astro                   Isotipo + wordmark PRISMATIX con la "A" en degradado (prop claro)
  Destello.astro               Estrella de 4 puntas en degradado (acento en la portada de escritorio)
  Icono.astro                  Íconos de línea fina (líneas de producto y esencia)
  TarjetaProducto.astro        Tarjeta del catálogo (badge "360°", "Agotado")
  Llamado.astro                Banda de llamado a la acción → /#tu-idea + correo
  TuIdea.astro                 Sección #tu-idea: pasos + formulario que arma el correo/WhatsApp
  Galeria.astro                Carrusel con scroll-snap y miniaturas
  Visor3D.astro                <model-viewer>; carga el modelo con IntersectionObserver. El visor es cuadrado como la galería; ojo: model-viewer trae height: 150px por defecto, así que necesita height: 100%
src/pages/index.astro          Portada oscura (eslogan + isotipo + 2 botones), Esencia, "Explora por línea" que filtra la rejilla (JS en el cliente), Llamado y TuIdea
src/pages/productos/[id].astro Detalle: pestañas Fotos / Vista 360°, ficha técnica, "Lo quiero · Escríbenos" (mailto), WhatsApp si existe y Llamado
src/pages/404.astro            Página "Esto no existe… todavía." (la usa not_found_handling del Worker)
herramientas/                  Uso interno. No es parte del sitio; se publica aparte en https://herramienta.prismatix.mx con contraseña. También se abre directo desde el disco
  worker.js, wrangler.jsonc    Worker "prismatix-herramienta": autenticación básica (secreto CLAVE), noindex y sirve los archivos de esta carpeta
  pintar.html                  GLB a color de Tripo → .3mf pintado para ElegooSlicer. El color de cada triángulo sale de la textura, se agrupa (k-means), las familias de color van a un filamento, se quitan los detalles que la boquilla no traza y se exporta. Incluye la lista "Mis filamentos" (localStorage, exportable a JSON) y la vista con capas de impresión
  color.js                     Filamentos del usuario, Lab, ΔE2000, k-means y sugerencia por familias
  malla.js                     Vecinos, áreas, limpieza de zonas (suavizar, abrirZonas, quitarIslas) y escritura del 3MF con paint_color
```

## Esquema de producto (frontmatter)

| Campo | Tipo | Notas |
|---|---|---|
| `nombre` | string | obligatorio |
| `resumen` | string | obligatorio; se usa en la tarjeta y en la meta description |
| `categoria` | string | obligatorio; los filtros se generan a partir de este campo |
| `fotos` | string[] | obligatorio (al menos 1); rutas absolutas desde `public/`, ej. `/productos/x/foto-1.jpg` |
| `precio` | number | opcional; si falta se muestra "Precio a consultar" |
| `modelo` | string | opcional; `.glb` en `public/` o una URL. Si falta, no aparece la pestaña 360° |
| `material`, `dimensiones` | string | opcionales |
| `colores` | string[] | por defecto `[]` |
| `disponible` | bool | por defecto `true`; `false` = "Agotado — bajo pedido" |
| `destacado` | bool | por defecto `false`; los destacados van primero |
| `orden` | number | por defecto `100`; menor = aparece antes |

El cuerpo en Markdown es la descripción larga que se muestra en la página del producto.

## Decisiones y convenciones

- **Mobile-first**: los estilos base son para celular y se amplían con `min-width` (420 / 768 / 900 / 1100 px). Las áreas táctiles miden al menos 40–48 px.
- **Rendimiento**: el script de model-viewer solo se incluye en las páginas que renderizan `Visor3D`. El `.glb` se descarga cuando el visor se vuelve visible, es decir, al abrir la pestaña 360° (`data-src` → `src`).
- `touch-action="pan-y"` en el visor, para que el scroll vertical siga funcionando en móvil.
- **Formato 3D**: GLB, no STL. El STL se convierte con Blender u otra herramienta (ver `README.md`).
- Los estilos van con scope dentro de cada `.astro`. Los tokens globales solo se definen en `global.css`.
- Los productos de ejemplo (uno por línea) usan fotos SVG de relleno con la paleta y GLB generados por script (estadio y d20). Hay que reemplazarlos por los reales.
- En YAML, un `resumen` que contenga ": " debe ir entre comillas.
- Para revisar en móvil sin teléfono: Edge headless no baja de ~500 px de ancho, así que se usa una página temporal con un `<iframe>` de 390 px.
- No hay backend: los pedidos llegan por correo (`mailto:`) o por WhatsApp (`wa.me`, cuando haya número), con el mensaje prellenado.

## Comandos

```bash
npm run dev             # localhost:4321 y red local (--host): accesible desde el celular en la misma Wi-Fi
npm run build           # compila a dist/ y valida el esquema de productos
npm run preview         # sirve el build
```

## Despliegue

- **Repositorio:** https://github.com/pablo0899/3dproducts (rama `main`, público). La cuenta de GitHub del proyecto es **pablo0899**, no pablo-0899. En esta PC la cuenta activa de `gh` puede ser pablo-0899, así que el repositorio tiene un credential helper local (`git config --local`) que usa `gh auth token --user pablo0899`. Por eso `git push` funciona sin tener que cambiar de cuenta.
- **Hosting:** Cloudflare **Worker** con assets estáticos (no Pages), en el plan gratuito. Se eligió porque el tráfico es ilimitado y permite uso comercial. Vercel Hobby se descartó porque no permite uso comercial.
- **URL pública:** https://prismatix.mx (y `www`). La de workers.dev, https://3dproducts.idipl0899.workers.dev, sigue activa.
- **Flujo:** cada `git push` a `main` dispara el build en Cloudflare (`npm run build`) y publica `dist/` con `wrangler deploy`.
- `wrangler.jsonc` tiene `workers_dev: true` y `preview_urls: true`, porque en el panel venían deshabilitadas. El `name` debe seguir siendo `3dproducts`, que es el nombre del Worker en Cloudflare.
- Comprobar sin publicar: `npx wrangler deploy --dry-run` (después de `npm run build`).
- **Herramienta interna (`herramientas/`):** es un Worker aparte, `prismatix-herramienta`, en `herramienta.prismatix.mx`.
  - **Por qué va aparte:** si estuviera en el mismo Worker, cada visita al sitio pasaría por código y contaría contra el límite gratuito de solicitudes.
  - **Despliegue:** el `git push` no la despliega. Se despliega a mano desde la raíz con `npx wrangler deploy -c herramientas/wrangler.jsonc`, y eso requiere `npx wrangler login` en la PC.
  - **Contraseña:** es el secreto `CLAVE`. Se cambia con `npx wrangler secret put CLAVE -c herramientas/wrangler.jsonc` o en el panel (Worker → Settings → Variables and Secrets). El usuario de la ventana de acceso puede ser cualquiera.
  - **Prueba local:** `npx wrangler dev -c herramientas/wrangler.jsonc --var CLAVE:prueba`.

## Dominio

- **Dominio:** `prismatix.mx`, comprado en **Akky** (2026-10-16) sin extras. No se contrató el "DNS Personalizado", las alertas SMS ni la seguridad avanzada. `prismatix.com` ya está registrado por otra persona.
- **DNS:** la zona está en Cloudflare (plan Free). En Akky solo se cambiaron los nameservers a `eugene.ns.cloudflare.com` y `saanvi.ns.cloudflare.com`.
- **Conexión con el Worker:** `routes` en `wrangler.jsonc` declara `prismatix.mx` y `www.prismatix.mx` con `custom_domain: true`. Cloudflare crea los registros DNS y el certificado al desplegar. No se configuran a mano en el panel.
- `site` en `astro.config.mjs` es `https://prismatix.mx`.
- La renovación de Akky es anual (~$689 MXN con IVA).
- **Correo:** Email Routing (MX `route1-3.mx.cloudflare.net`) reenvía `hola@prismatix.mx` a Gmail. El SPF debe quedar `v=spf1 include:_spf.mx.cloudflare.net include:_spf.google.com ~all` para poder enviar desde Gmail.

## Historial de decisiones

- **Estructura inicial:** Astro + model-viewer, con los productos en Markdown y los recursos en `public/`.
- **Visor 360°:** el visor quedaba más chico que las fotos porque el `:host` de model-viewer fija 300×150 px. Se corrigió con un contenedor cuadrado y `height: 100%`.
- **Rebranding 1:** se quitó toda mención a impresión 3D. Nombres usados: "Ni Sabías" (provisional) y luego "Tangible Estudio".
- **Rebranding 2 (2026-10-07):** se adoptó la identidad **Prismatika** (Design Studio · Xalapa) a partir de la lámina del usuario: paleta neón sobre ciruela, Krona One + Montserrat, isotipo de prisma, iconografía neón y las cinco líneas de producto. El usuario decidió mantener la regla de no mencionar la impresión 3D.
- **Rebranding 3 (2026-10-07):** la identidad pasa a **Prismatix**, "Estudio creativo · Xalapa", con la lámina "Electric Velvet × Sunset Artifact". El sitio cambió de neón oscuro a editorial ivory + terciopelo ciruela, con Playfair Display + Montserrat, el logo con la "A" en degradado, el destello, la sección Esencia y los íconos de línea fina. Se ignoró la sección "Experiencia de marca" porque mencionaba partes de coches.
- **Isotipo (2026-10-08):** se integró el isotipo oficial (cinta triangular) en el logo, la portada, el pie, el favicon y la imagen para compartir. Sustituye al prisma CSS y al favicon de destello.
- **Contacto (2026-10-08):** se agregó el correo `prismatixalapa@gmail.com`, se ocultaron WhatsApp e Instagram hasta tener datos reales y se repitió el llamado "Cuéntanos tu idea" en toda la página, con la sección y el formulario `#tu-idea`.
- **Herramienta de pintura (2026-10-16):** el usuario pinta él mismo cada pieza según las fotos del cliente. Impresora: Elegoo Centauri Carbon 2 Combo (CANVAS, 4 filamentos) con ElegooSlicer, que está basado en Orca. La pintura va por triángulo en el atributo `paint_color`: `4`, `8`, `0C` y `1C` corresponden a los filamentos 1 a 4. Se verificó reabriendo el archivo con `elegoo-slicer.exe --export-3mf salida.3mf entrada.3mf`, que conserva la pintura. El rebanado por línea de comandos (`--slice`) falló con los perfiles del usuario y no se usa.
- **Modelos con IA (2026-10-16):** el usuario genera cada mascota con **Tripo** (tripo3d.ai) a partir de la foto del cliente. Proyectar la foto sobre un modelo en blanco no sirvió con material real: la foto suele ser un retrato de frente, el modelo es el cuerpo completo y su forma no coincide con el perro real. La solución es descargar de Tripo el **GLB con textura**. En ese GLB la textura sale más oscura que el animal (el blanco se ve gris y el leonado café), y el negro de la máscara puede salir más claro que el pelaje en sombra. Por eso: se estira la claridad, los grupos de color se juntan en familias (los neutros se separan por saturación C/L < 0.25 y se parten en oscuro/claro; los de color se agrupan por tono) y a cada familia le toca un filamento. Con el boxer de prueba (`boxer dog 3d model.glb`, 1.97 M triángulos) quedó Caramelo/Negro/Blanco sin ajustes manuales. ElegooSlicer abre un 3MF de 2 M triángulos en ~9 s.
- **Solo GLB (2026-10-16):** a propuesta del usuario se quitó la ruta de fotos. Ya no hay fotos ni alineación, ni modelos en blanco STL/3MF/OBJ, ni subdivisión, y se borró `paleta.html`. La herramienta solo convierte el GLB a color en 3MF imprimible. El flujo de trabajo es: el usuario manda el GLB, se revisan las vistas, se ajusta la tabla si hace falta y se entrega el 3MF.
- **Imprimible y realista (2026-10-16):** el usuario quiere mandar el GLB y recibir el 3MF con sus filamentos, sin detalles imposibles de imprimir. Se agregaron cinco cosas:
  - **Detalle mínimo** = boquilla × (1.5 / 2 / 3). Es una apertura geodésica (`abrirZonas` en `malla.js`) que funde las zonas más angostas que eso.
  - **Base de un solo color**, detectada como la tapa plana más grande cerca del piso. Al elegir su color no se cuenta la cara de abajo, que en la textura viene oscura.
  - **Rescate de colores chicos**, como la lengua.
  - **Vista realista** con líneas de capa (altura de capa = boquilla / 2).
  - **Compensar la luz de arriba** (apagado por defecto): ayudó con el chihuahua pero arruinó al boxer.
- **La sugerencia automática no siempre acierta.** El chihuahua (`chihuahua 3d model.glb`) sale como cuatro grises por la luz horneada, y hubo que decidir a ojo con la tabla de grupos y "Ver": pelaje Negro, blancos Blanco, lengua Rosa y base Blanco. Cuando el usuario mande un GLB, revisar las vistas antes de entregar.
- **Filamentos del usuario (2026-10-16):** son todos ELEGOO y están cargados como lista de fábrica en `color.js` (`FILAMENTOS_BASE`, clave `prismatix-filamentos-v2`):
  - PLA: Negro, Marrón, Beige, Mármol y Nogal.
  - PLA+: Blanco, Madera, Naranja, Amarillo, Verde y Azul.
  - PLA Mate: Rosa, Amarillo, Azul hielo y Morado.

  Los hex son estimados, porque ELEGOO no publica códigos de color. Se dejaron fuera el ABS Rosa, que no se mezcla con PLA, y un PLA Silk de 4 bobinas cuyos colores no están confirmados. Con esta lista, el boxer sale Marrón/Blanco/Negro y el chihuahua Negro/Blanco/Rosa mate.
- **Boquilla: 0.4 mm**, la de fábrica de la Centauri Carbon 2. Esto lo confirmó el usuario: el detalle mínimo de color es 0.8 mm y las capas de la vista son de 0.2 mm. El proyecto `ATOM COLOR.3mf` decía 0.2 mm, pero era un ajuste suelto de ese archivo. Los colores de filamento de ese proyecto eran los de fábrica, no los reales.
- **Otros nombres considerados:** Justo Eso, Me Faltaba, Chunche, Ocurrencia, Mira Nomás.

## Pendientes

- Revisar la disponibilidad del @ en Instagram y TikTok.
- Opcional: redirigir `www.prismatix.mx` → `prismatix.mx` (Redirect Rule).
- Si existe el isotipo en vector o PNG transparente de alta resolución, reemplazar los archivos de `public/marca/`. Si existe el wordmark oficial, reemplazar el tipográfico de `Logo.astro`.
- Poner el número de WhatsApp y la URL de Instagram en `src/config.ts` (hoy están vacíos, así que no se muestran).
- Reemplazar los productos de ejemplo por los reales, con fotos en el estilo fotográfico de la marca y modelos .glb.
- Opcional: renombrar el Worker y el repositorio a "prismatix" (`name` en `wrangler.jsonc` y la URL de workers.dev cambiarían).
- Opcional: cambiar el correo de los commits (hoy es el de trabajo) y decidir si el repositorio pasa a privado.
