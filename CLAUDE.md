# Contexto del proyecto: Prismatix (catálogo de productos)

Sitio web para mostrar un catálogo de productos. Cada producto tiene fotos y, opcionalmente, un modelo que el visitante puede girar en 360°, acercar y ver en realidad aumentada. Tiene que ser **fácil de mantener** (sin base de datos ni panel de administración) y verse bien **primero en celular**.

## Marca

- **Nombre:** "Prismatix" (antes "Prismatika"). **Descriptor:** "Estudio creativo · Xalapa". **Eslogan:** "Ideas que se vuelven reales." **Cierre:** "Más que objetos, son historias en forma de arte." Todo se define en `src/config.ts` (`SITIO`).
- **Esencia:** "Creemos que la imaginación también se puede tocar." Es un estudio creativo que transforma ideas en objetos únicos, personalizados y llenos de significado. Los seis valores (`ESENCIA` en `src/config.ts`) son Creatividad sin límites, Personalización real, Objetos de autor, Exploración y colección, Conexión emocional, y Xalapa y el mundo.
- **Personalidad:** el Mago + el Aventurero. Creativa, soñadora, curiosa, audaz, sofisticada, cálida, ecléctica, mística, cercana, coleccionista de historias.
- **Tono de voz:** inspirador, cercano, poético, auténtico y seguro; juguetón sin perder lo sofisticado. Se habla de tú. Frases de referencia: "Objetos que guardan lo que amas.", "Xalapa también se colecciona."
- **Giro:** objetos personalizados y de colección. Las líneas (`CATEGORIAS`) son Mascotas, Figuras personalizadas, Fandom deportivo, Souvenirs, Juegos de mesa y Para creadores (ícono `microfono`). El `categoria` de cada producto debe coincidir con uno de esos nombres.
- **Qué no somos:** la lámina de identidad traía una sección "Experiencia de marca" que mencionaba partes de coches. **Es incorrecta y se ignora.** No se ofrecen autopartes ni nada automotriz.
- **Regla principal:** los textos públicos **nunca** dicen que los productos son impresos en 3D. Evitar "impresión", "impreso", "capa por capa", "filamento", "PLA", "PETG" y "3D" visible (usar "360°"). Esto aplica a los títulos, las descripciones, los materiales y los alt de las imágenes. La lámina dice "arte, tecnología y diseño"; en el sitio se usa "arte y diseño".
- **Materiales:** se describen por el beneficio o el acabado ("Acabado mate pintado a mano", "Plástico de alta resistencia", "Acabado sedoso").
- **Pedidos personalizados:** "¿Tienes una idea, un recuerdo o un personaje que quieras tener en tus manos? Cuéntanos y lo hacemos real."
- Los nombres de archivos y componentes internos (`Visor3D`, `modelo.glb`) pueden decir 3D porque el visitante no los ve.

## Contacto y llamados a la acción

- **Prioridad de contacto (decisión del usuario, 2026-10-18; reemplaza la del 2026-10-17):** 1) WhatsApp, 2) Instagram, 3) Facebook y 4) el correo al final. Está en un solo lugar: `canales(asunto, mensaje)` en `src/utils.ts`. El primero es el botón principal en todas las secciones; los demás van como secundarios o en texto. Instagram abre el DM (`ig.me/m/<usuario>`) y Facebook la página. Como no aceptan mensaje prellenado, al hacer clic se copia el mensaje al portapapeles (`data-copiar`) y un aviso dice "Pégalo en el chat". El script y el aviso están en `Base.astro`; el formulario los usa con el evento `copiar-mensaje`.
- **Correo oficial:** `hola@prismatix.mx` (`SITIO.email`). Es la última opción. Cloudflare Email Routing lo reenvía a `prismatixalapa@gmail.com`, y Gmail responde como `hola@` con "Enviar como" (SMTP de Gmail con una contraseña de aplicación).
- **Redes:** Instagram `@prismatix.mx` (`SITIO.instagram`) y Facebook (`SITIO.facebook`, `facebook.com/profile.php?id=61595064758804`). No se pudo comprobar `m.me/<id>` sin sesión; si se confirma que abre Messenger, conviene usarlo como URL del chat. Si una URL queda vacía, su enlace no se muestra.
- **WhatsApp:** `SITIO.whatsapp` es `5212281012396` y `SITIO.whatsappVisible` ("228 101 2396"; antes 221 344 1015, cambió el 2026-11-26) es como se muestra; en el pie va en grande con su ícono. Abre `wa.me` con el mensaje prellenado. Si se vacía, sus botones desaparecen y Instagram pasa a ser el principal.
- **Página de producto:** botón principal "Lo quiero · Escríbenos por WhatsApp" + Instagram y Facebook como secundarios. **No se ofrece el correo** ahí (el usuario lo pidió), salvo que sea el único canal.
- **Nombre de la acción:** el usuario **no quiere "Agenda tu idea"**. Se usa **"Cuéntanos tu idea"** en los botones y **"Dale forma a tu idea"** como título de la sección. Otros textos de la familia: "Lo quiero · Escríbenos", "¿Lo quieres con tu toque? Personalízalo →".
- **Patrón** (inspirado en una página de referencia que repite "agendar cita" en cada sección): un solo destino para todos los llamados, la sección `#tu-idea` (`TuIdea.astro`). Aparece en:
  1. La cabecera: botón "Cuéntanos tu idea" desde 768 px. En teléfonos el botón va en una barra fija abajo (`.barra-accion` en `Base.astro`, al alcance del pulgar) y arriba solo queda el enlace "Colección". La barra se esconde cuando se ven `#tu-idea` o el pie, y la página de producto no la lleva (`<Base barra={false}>`).
  2. La portada: "Cuéntanos tu idea" (principal) + "Ver la colección" (secundario).
  3. Después de Esencia, como enlace de texto.
  4. Después del catálogo: `Llamado.astro` ("¿No está lo que buscas? Lo creamos para ti.").
  5. En cada producto: "Lo quiero · Escríbenos por Instagram" (copia un mensaje con el producto y su URL), "Escríbenos por Facebook", "¿Prefieres el correo?", "Personalízalo" y un `Llamado` al final.
  6. El pie: `@prismatix.mx` en grande, botón "Escríbenos por Instagram", Facebook y el correo en pequeño.
- **`TuIdea.astro`:** tres pasos (Cuéntanos tu idea → Te enviamos una propuesta → La hacemos real) y un formulario con nombre, línea (de `CATEGORIAS` + "Otra idea"), idea, fecha y teléfono opcional. **No hay backend:** al enviar, el JS arma el mensaje; con "Enviar por Instagram/Facebook" lo copia y abre el chat, y con "Prefiero enviarlo por correo" arma un `mailto:` (`wa.me` si hay WhatsApp). Los inputs usan 16 px para evitar el zoom automático del iPhone.
- **`Llamado.astro`:** banda terciopelo con título en cursiva, botón "Escríbenos por Instagram" y "O por Facebook o correo". Props: `titulo`, `texto`, `asunto` (del correo) y `mensaje` (lo que se copia o prellena).
- **Utilidades:** `enlaceCorreo(asunto, cuerpo)` en `src/utils.ts`.

## Identidad visual: "Electric Velvet × Sunset Artifact"

La fuente es la lámina "Mapa de marca Prismatix" (imagen `identidad.jpg` del usuario, no está en el repositorio).

- **Paleta** (variables en `src/styles/global.css`):
  - Plum Night `#3A243B`: color insignia, fondo oscuro y texto principal
  - Deep Plum `#552B61`: profundidad, íconos
  - Berry Magenta `#D83A6B`: acento (degradados, brillos). Para texto y botones se usa `--berry-texto` `#C22F5D` (5.27:1 sobre ivory) y `--berry-hover` `#A8264F`, porque el original da 4.29:1
  - Terracotta Warm `#C25E3B`: segundo color insignia. Para texto (precios, énfasis en cursiva) se usa `--terracota-texto` `#AE4F2F` (5.13:1), porque el original da 4.10:1
  - Burnt Orange `#E07A5F`
  - Soft Rose `#F4B6C2`
  - Ivory Dust `#FDFBF7`: fondo general y texto sobre oscuro
  - Electric Pink `#FF2E93`: es el "wild card" y **solo** se usa para colecciones especiales, lanzamientos y colaboraciones. Hoy no se usa.
- **Estructura visual:** editorial. El fondo general es ivory con tarjetas blancas. La portada y el pie son bloques oscuros "terciopelo" (`.seccion-oscura`, `--fondo-terciopelo`: ciruela con resplandores berry y naranja). Ya no hay neón ni rejilla. Solo tema claro.
- **Tipografía** (Google Fonts en `Base.astro`):
  - Playfair Display (serif): titulares y frases en cursiva
  - Montserrat (sans): textos, apoyo y el wordmark del logo
  - Rótulos (`.titulo-seccion`, `.etiqueta`): mayúsculas pequeñas con espaciado de letras. Botones y navegación van en frase normal ("Cuéntanos tu idea"). Ningún texto mide menos de 11 px (la `.etiqueta` mide 12 px)
- **Isotipo oficial:** una cinta satinada en forma de triángulo (tipo Möbius) en morado, berry y naranja. El original es `isotipo.jpeg` del usuario (1254 px, sobre fondo negro, no está en el repositorio). Los archivos derivados están en `public/marca/`:
  - `isotipo.webp` / `isotipo.png`: 640 px con fondo transparente
  - `isotipo-96.webp`: para el logo y el pie
  - `favicon.png` (64 px) y `apple-touch-icon.png` (180 px, sobre Plum Night)
  - `og.jpg`: imagen para compartir en redes (1200×630); es el `og:image` por defecto
  - Se generan con `python scripts/isotipo.py <isotipo.jpeg> public/marca` (PIL + numpy + scipy): recorta la cinta, vuelve transparente el negro conectado con el fondo (exterior y hueco central) y rellena las manchas oscuras internas para que las sombras moradas no queden con huecos. Si llega una versión vectorial o PNG transparente oficial, conviene reemplazar estos archivos con ella.
- **Logotipo** (`Logo.astro`): isotipo (34 px, 28 px en móvil) + wordmark "PRISMΛTIX" en **sans (Montserrat)** con espaciado: "PRISM" en grosor regular (400) y "TIX" en delgado (200). La "A" es una **lambda mayúscula (Λ)** dibujada en SVG, con la pierna izquierda regular y la derecha delgada, en degradado berry → naranja → rosa. La prop `claro` sirve para fondos oscuros.
- **Elementos gráficos:**
  - Destello de 4 puntas (`Destello.astro`)
  - Portada (`.prisma`): el isotipo grande flotando con haces de luz (CSS) y un destello. En escritorio va a la derecha (380 px); en móvil va completo arriba del texto (128 px), sin destello.
  - `--degradado-prisma` y `--degradado-atardecer`
- **Iconografía** (`Icono.astro`): trazo fino de 1.5 px, simple y orgánico. Íconos de líneas: `mascota`, `figura`, `estadio`, `souvenir` (catedral/edificios) y `dado`. Íconos de esencia: `destello`, `sol`, `diamante`, `montana`, `corazon` y `destellos`. Redes: `instagram` y `facebook`.
- **Estilo fotográfico (para las fotos reales):** luz cálida y dramática, colores ricos y contrastes, composiciones limpias y editoriales, productos en contexto y una atmósfera mágica y real.
- **Móvil primero (requisito explícito del usuario):** cada cambio visual se revisa a 390 y 360 px de ancho.
  - En móvil, el isotipo de la portada va arriba del texto (nunca detrás, porque tapa la lectura).
  - Los filtros de líneas (pastillas) y la franja de líneas de la portada se deslizan de lado; la esencia y la colección se muestran en 2 columnas.
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
src/config.ts                  SITIO (nombre, descriptor, eslogan, cierre, contacto, moneda), CATEGORIAS (líneas con ícono) y ESENCIA (valores con ícono y una línea de texto)
src/content.config.ts          Esquema Zod de la colección `productos`
src/content/productos/*.md     Un producto por archivo; el nombre del archivo es el id/URL
public/productos/<id>/         Fotos y modelo.glb de cada producto (se sirven tal cual)
src/utils.ts                   formatearPrecio(), enlaceWhatsapp(), enlaceCorreo()
src/styles/global.css          Paleta y tokens (:root), degradados, .seccion-oscura, .contenedor, .boton, .etiqueta, .titulo-seccion, .titular/.entrada, .texto-degradado
src/layouts/Base.astro         <head> (favicon/og desde public/marca) + Google Fonts, cabecera sticky ivory con Logo, pie oscuro con isotipo (sin repetir el logo), cierre de marca y contacto (#contacto), y la barra de acción inferior en teléfonos
public/marca/                  Isotipo transparente (webp/png), favicon, apple-touch-icon y og.jpg
src/components/
  Logo.astro                   Isotipo + wordmark PRISMATIX con la "A" en degradado (prop claro)
  Destello.astro               Estrella de 4 puntas en degradado (acento en la portada de escritorio)
  Icono.astro                  Íconos de línea fina (líneas de producto y esencia)
  TarjetaProducto.astro        Tarjeta editorial del catálogo: imagen 4:5 con marco, texto sobre el fondo (badge "360°", "Agotado"). Con varias fotos las va pasando con fundido cada 3.5 s mientras se ve (desfasada entre tarjetas, puntitos abajo, nada con prefers-reduced-motion)
  TarjetaIdea.astro            Tarjeta fija al final del catálogo: "Tu idea, en tus manos" (pieza a tu medida) → #tu-idea
  Llamado.astro                Banda de llamado a la acción → /#tu-idea + correo
  TuIdea.astro                 Sección #tu-idea: pasos + formulario que arma el correo/WhatsApp
  Compartir.astro              "Compártelo" en el producto: WhatsApp (wa.me/?text=), Facebook (sharer.php) e Instagram. Instagram no tiene enlace para compartir: en táctil abre navigator.share y si no copia el enlace y avisa (evento `avisar` de Base.astro)
  Galeria.astro                Carrusel con scroll-snap y miniaturas. Avanza solo cada 4.5 s (puntos con barra de progreso y botón de pausa); se detiene al tocarla, con el cursor encima, fuera de pantalla o con prefers-reduced-motion. Flechas solo con mouse
  Visor3D.astro                <model-viewer>; carga el modelo con IntersectionObserver. El visor es cuadrado como la galería; ojo: model-viewer trae height: 150px por defecto, así que necesita height: 100%
src/pages/index.astro          Portada oscura (eslogan + isotipo + 2 botones + franja con las líneas que tienen productos), Esencia en 2 columnas, "La colección" con pastillas que filtran la rejilla (JS en el cliente; también lee ?linea=<nombre>), Llamado y TuIdea
src/pages/productos/[id].astro Detalle: ruta Colección / línea (enlaza a /?linea=…#catalogo), pestañas Fotos / Vista 360°, ficha en filas, "Lo quiero · Escríbenos por WhatsApp" + Instagram/Facebook y Llamado
src/pages/404.astro            Página "Esto no existe… todavía." (la usa not_found_handling del Worker)
herramientas/                  Uso interno. No es parte del sitio; se publica aparte en https://herramienta.prismatix.mx con contraseña
  worker.js, wrangler.jsonc    Worker "prismatix-herramienta": página /entrar con la marca (solo contraseña = secreto CLAVE), cookie de sesión firmada con HMAC por 30 días, /salir, noindex. Sirve los archivos de esta carpeta y la API: /api/inventario, /api/ideas y /api/pedidos (GET/PUT de un JSON completo en el KV INVENTARIO; 409 si otro dispositivo guardó antes), /api/imagen/<id> (fotos de las ideas) y /api/vista-previa (nombre y foto de la página de un modelo)
  taller.css                   Estilos comunes: tokens de la marca, cabecera oscura, pestañas Filamentos | Ideas | Pedidos | Cotizar (se deslizan de lado si no caben), filtros, botones y la hoja que sale de abajo
  inventario.html              Pestaña Filamentos: resumen (carretes, kg, colores, por comprar), búsqueda, filtros por tipo, vista Lista (por tipo, con − / + por carrete) y vista Colores (muro de carretes por tono), hoja para agregar/editar/eliminar, últimos movimientos y descarga en CSV para Excel
  inventario-inicial.js        Inventario de partida tomado de inventario_prismatix.xlsx (2026-11-16); solo se usa mientras el KV está vacío
  ideas.html                   Pestaña Ideas: biblioteca de modelos para probar después. Se pega un link y se llena con el nombre y la foto del sitio; si el sitio bloquea, el nombre sale del link y la foto es una captura (elegir archivo o Ctrl+V). Estados Por probar / Impresa / Descartada, categorías (varias por idea; de partida Temporada + las líneas de producto; se crean desde la idea con "+ Nueva" y se renombran o eliminan en "Editar categorías"), nota, búsqueda y filtros por estado y por categoría
  pedidos.html                 Pestaña Pedidos: seguimiento de pedidos de clientes. Cada pedido lleva folio (consecutivo, se asigna al aplicar la acción para que dos dispositivos no choquen), cliente, cómo contactarlo (Celular, Instagram o Correo: campos `via` y `contacto`; los pedidos viejos con `celular` se leen como Celular), productos (cantidad × precio; sugiere nombre y precio del catálogo y de pedidos anteriores), fecha del pedido y de entrega, estado (Por empezar / En proceso / Listo / Entregado / Cancelado), pagos (el primero es el anticipo; fecha, monto y forma de pago; botón "Liquidar") y nota. Calcula total, pagado y resta. Resumen: activos, por cobrar, para esta semana y atrasados. Filtros por estado, "Por cobrar" y "Atrasados"; búsqueda por cliente, producto, folio o celular. Botón para escribirle con el resumen del pedido según el medio: WhatsApp prellenado (wa.me, lada 52), Instagram (ig.me/m/<usuario>; el mensaje se copia porque no acepta texto) o correo (mailto con asunto y cuerpo) y descarga en CSV. El catálogo para sugerir precios está en la constante CATALOGO
  cotizador.html               Pestaña Cotizar (viene de un artifact del usuario): calcula el precio al cliente por capas (material, luz y desgaste, tiempo, insumos, envío, comisión de cobro, ganancia y urgencia), cada una con interruptor para no cobrarla, y copia la cotización para WhatsApp. El texto copiado lo lee el cliente, así que no menciona impresión 3D ni filamentos. No usa el KV: los precios se guardan en localStorage (`prismatix-cotizador-v1`) de cada navegador

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
| `oculto` | bool | por defecto `false`; `true` = no aparece en el sitio (ni tarjeta ni página) |
| `temporada` | string | opcional; `navidad` = solo aparece durante la temporada |
| `regalo` | bool | por defecto `false`; en temporada lleva "Regalo ideal" y va primero |

El cuerpo en Markdown es la descripción larga que se muestra en la página del producto.

## Decisiones y convenciones

- **Mobile-first**: los estilos base son para celular y se amplían con `min-width` (420 / 768 / 900 / 1100 px). Las áreas táctiles miden al menos 40–48 px.
- **Rendimiento**: el script de model-viewer solo se incluye en las páginas que renderizan `Visor3D`. El `.glb` se descarga cuando el visor se vuelve visible, es decir, al abrir la pestaña 360° (`data-src` → `src`).
- `touch-action="pan-y"` en el visor, para que el scroll vertical siga funcionando en móvil.
- **Formato 3D**: GLB, no STL. El STL se convierte con Blender u otra herramienta (ver `README.md`).
- Los estilos van con scope dentro de cada `.astro`. Los tokens globales solo se definen en `global.css`.
- **Catálogo actual (2026-11-26):** "Tu mascota en miniatura", "Llaveros GTA VI · Vice City" (línea Souvenirs; $80 sencillo, $85 con texto grabado atrás; 8 diseños, colores a elegir, entrega 24–72 h) y "Funda de micrófono con tu logo" ($220 con dos colores; a partir del tercero, +$10 por color; línea Para creadores: funda de mano de 13.4 × 6.3 cm para micrófonos inalámbricos mini (hueco de 33 × 13 × 38 mm), con placa de logo en estrella, flor, corazón o cuadrado; no incluye el micrófono), los tres con fotos reales, + `TarjetaIdea`. Los demás productos de ejemplo (SVG de relleno y GLB de script) siguen en el repo con `oculto: true` y se reactivan cuando haya piezas reales de su línea.
- **Temporada navideña (2026-11-26 → 2027-01-06, pedido del usuario):** capa encima del diseño normal que se prende y apaga sola. `TEMPORADA` en `src/config.ts` tiene las fechas (`desde`, `hasta`) y los textos. Un script `is:inline` en el `<head>` de `Base.astro` compara la fecha local del visitante y pone `data-temporada="navidad"` en `<html>`; `/?temporada=navidad` la fuerza y `/?temporada=no` la apaga, para revisar. En `global.css`: `.solo-navidad` solo se ve en temporada, `.sin-navidad` se esconde en temporada, y el terciopelo cambia el resplandor naranja por dorado (`--oro` `#e9b949`, solo decorativo). Qué cambia: barra arriba de la cabecera ("Temporada de regalos · Personalízalo…"; **el usuario no quiere prometer entregas antes de Navidad**, así que ningún texto menciona fechas de entrega), portada ("Regalos que nadie más va a tener.", botones "Ver regalos" + "Cuéntanos tu idea", copos de nieve (máscara SVG de 6 brazos) e isotipo con brillo dorado), catálogo "Regalos con historia", etiqueta dorada "🎁 Regalo ideal" y orden primero para los productos con `regalo: true`, botón "Lo quiero para regalo · WhatsApp" en el producto, en `#tu-idea` "Dale forma al regalo perfecto" con la casilla "Es para regalo", y `ArbolElfos.astro`: escena SVG suelta (sin tarjeta, a pedido del usuario). Tamaños, para que no tape contenido (el usuario pidió cuidar el espacio en móvil): en escritorio y tableta (desde 768 px) va completa en la esquina inferior izquierda, con ancho `clamp(96px, margen junto al contenido de 1200 px, 210px)` (el usuario no quiere el botón en escritorio; en pantallas de menos de ~1400 px roza la orilla del contenido); en teléfonos con la barra de acción va mini (38 px, solo el recorte del árbol) dentro de la barra, a la izquierda del botón (`Base.astro` le da `padding-left: 62px` a `.barra-accion` en temporada) y se esconde con ella; en la página de producto en teléfono (sin barra) es un botón redondo de 44 px en la esquina con el número de piezas, que abre el árbol mini de 66 px (empieza plegado; `prismatix-arbol-abierto` recuerda si lo abrió). Tocar ese botón no cuenta como clic. **Todo avanza por sesión, no por página** (el usuario quiere que se anime a explorar los productos): la entrada (el elfo sube la estrella y se prenden las luces) se ve solo la primera vez (`prismatix-arbol-entrada`; un script inline pone `.ae-sin-entrada` para que no parpadee), y cada clic en un elemento interactivo del sitio (enlaces, botones, tarjetas, pestañas, campos; selector `INTERACTIVOS`; los clics en fondos o textos sueltos no cuentan, a pedido del usuario) suma algo al árbol, alternando: el elfo de la escalera cuelga un adorno en el pino (15 lugares: esferas, destellos dorados y moños) y el del piso camina con un regalo hasta la pila (10 lugares; al llenarse reemplaza al más viejo). Con el pino lleno, todos los clics son regalos. La cuenta de clics (`prismatix-arbol-clics` en `sessionStorage`) se guarda antes de animar, así que un clic en un enlace también cuenta y la siguiente página ya lo muestra puesto. Cada elfo tiene su fila (máx. 3 en espera; los sobrantes aparecen directo). Con reduced-motion todo aparece sin animación. Al volver con Atrás o el gesto del trackpad, el navegador restaura la página desde el bfcache (copia vieja, y Safari reinicia las animaciones CSS, así que la entrada se repetía en Mac): un `pageshow` con `persisted` pone `.ae-sin-entrada` y redibuja el árbol desde `sessionStorage` (`sincronizar()`). Ojo: para saber si la escena está visible se usa `getClientRects()`, porque `offsetParent` siempre es null en un elemento `position: fixed`. Se probó y se quitó un filtro "¿Cuánto quieres gastar?" (el usuario no lo quiso). Los productos con `temporada: navidad` solo se ven en temporada y dejan de generarse si se compila después de `hasta` (`esVisible()` en `src/utils.ts`). El próximo año solo se cambian las fechas.
- **Líneas visibles:** el filtro "Explora por línea" y el selector del formulario solo muestran las líneas con productos visibles; con una sola línea, el filtro no aparece. Debajo del catálogo, el `Llamado` dice "Muy pronto, nuevas colecciones."
- **Fotos:** formato 4:5 (galería, tarjetas y visor 360°), WebP de 1200×1500. Las fotos del iPhone llegan en HEIC y se convierten con PIL + `pillow-heif` (recorte a 4:5 ajustando el corte de arriba para no cortar orejas).
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
  - **Contraseña:** es el secreto `CLAVE`. Se cambia con `npx wrangler secret put CLAVE -c herramientas/wrangler.jsonc` o en el panel (Worker → Settings → Variables and Secrets). Se entra en `/entrar`, que solo pide contraseña; no hay usuario. La sesión dura 30 días en ese navegador, y cambiar `CLAVE` cierra todas las sesiones abiertas.
  - **Datos:** todo vive en el KV `INVENTARIO` (se llama así porque nació con el inventario): llave `inventario` (JSON con `filamentos` y `movimientos`), llave `ideas` (JSON con `ideas` y `categorias`; cada idea guarda los `id` de sus categorías), llave `pedidos` (JSON con `pedidos`; cada uno con `items` y `pagos`) y una llave `img:<id>` por foto de idea (WebP de 900 px que reduce la página; el tipo va en la metadata). En `wrangler.jsonc` va sin `id` para que wrangler lo cree en el primer despliegue. Cada cambio en la página es una acción chica (sumar/restar, guardar, borrar) que se guarda al momento en el navegador y se manda al Worker unos 0.7 s después; si responde 409, se toma la versión del Worker y se vuelven a aplicar las acciones pendientes. Sin conexión, los cambios esperan en el navegador. Abierta desde el disco, funciona solo con localStorage.
  - **Vista previa de links:** `/api/vista-previa` pide la página con un User-Agent honesto (`PrismatixTaller/1.0`) y lee `og:title` y `og:image`; la página le quita al nombre la cola del sitio ("… - Modelo de impresión 3D gratuito - MakerWorld"). Al guardar, el Worker descarga una copia de la foto al KV. Si el sitio responde 403 o con la verificación de Cloudflare ("Just a moment…"), contesta `bloqueado` y la página toma el nombre del link y pide una captura. **No se intenta saltar esos bloqueos** (ni fingir ser un navegador). En las pruebas del 2026-11-16 respondió MakerWorld (con el nombre en español) y bloquearon Printables y Cults; Thingiverse a veces sí y a veces no.
  - **Prueba local:** `npx wrangler dev -c herramientas/wrangler.jsonc --var CLAVE:prueba` (usa un KV local; se vacía con `npx wrangler kv key delete inventario --binding INVENTARIO --local -c herramientas/wrangler.jsonc`). `window.inventario` expone el estado para pruebas automáticas.

## Dominio

- **Dominio:** `prismatix.mx`, comprado en **Akky** (2026-10-16) sin extras. No se contrató el "DNS Personalizado", las alertas SMS ni la seguridad avanzada. `prismatix.com` ya está registrado por otra persona.
- **DNS:** la zona está en Cloudflare (plan Free). En Akky solo se cambiaron los nameservers a `eugene.ns.cloudflare.com` y `saanvi.ns.cloudflare.com`.
- **Conexión con el Worker:** `routes` en `wrangler.jsonc` declara `prismatix.mx` y `www.prismatix.mx` con `custom_domain: true`. Cloudflare crea los registros DNS y el certificado al desplegar. No se configuran a mano en el panel.
- `site` en `astro.config.mjs` es `https://prismatix.mx`.
- La renovación de Akky es anual (~$689 MXN con IVA).
- **Correo:** Email Routing (MX `route1-3.mx.cloudflare.net`) reenvía `hola@prismatix.mx` a Gmail. El SPF debe quedar `v=spf1 include:_spf.mx.cloudflare.net include:_spf.google.com ~all` para poder enviar desde Gmail.

## Taller: de la foto del cliente a la impresora

Es la parte interna del negocio. La regla de no mencionar la impresión 3D aplica al sitio público, no aquí: la herramienta está detrás de contraseña y sin indexar.

### Equipo

- **Impresora:** Elegoo Centauri Carbon 2 Combo con el CANVAS (hasta **4 filamentos** por pieza) y la **boquilla de 0.4 mm** de fábrica.
- **Slicer:** ElegooSlicer 1.5, basado en OrcaSlicer, instalado en `C:\Program Files\ElegooSlicer`. Los perfiles del usuario están en `%APPDATA%\ElegooSlicer\user\default`.
- **Filamentos:** casi todos ELEGOO. El inventario real está en https://herramienta.prismatix.mx; el de partida salió de `C:\Users\idipl\OneDrive\Documentos\inventario_prismatix.xlsx` (23 filamentos, 25 carretes). Los hex son **estimados**, porque ELEGOO no publica códigos de color. El ABS Rosa no se combina con PLA en una misma pieza (temperaturas distintas).

### Flujo de trabajo

1. El cliente manda la foto de su mascota.
2. El usuario genera el modelo en **Tripo** (tripo3d.ai) y lo descarga en **GLB**, que es el formato que trae la textura (los colores). El STL y el 3MF de Tripo salen en blanco.
3. Se pinta y se rebana en ElegooSlicer.

### Herramienta anterior: GLB de Tripo → 3MF pintado (retirada)

Hasta el 2026-11-16 el subdominio servía `pintar.html` (con `color.js` y `malla.js`): convertía el GLB a color de Tripo en un `.3mf` pintado por triángulo (`paint_color`, códigos `4`, `8`, `0C` y `1C` para los filamentos 1–4) para ElegooSlicer. El usuario la sustituyó por el inventario. El código y su documentación completa siguen en el historial de git: `git show 6c8456d:herramientas/pintar.html` y `git show 6c8456d:CLAUDE.md` (sección "Taller").

## Historial de decisiones

- **Estructura inicial:** Astro + model-viewer, con los productos en Markdown y los recursos en `public/`.
- **Visor 360°:** el visor quedaba más chico que las fotos porque el `:host` de model-viewer fija 300×150 px. Se corrigió con un contenedor cuadrado y `height: 100%`.
- **Rebranding 1:** se quitó toda mención a impresión 3D. Nombres usados: "Ni Sabías" (provisional) y luego "Tangible Estudio".
- **Rebranding 2 (2026-10-07):** se adoptó la identidad **Prismatika** (Design Studio · Xalapa) a partir de la lámina del usuario: paleta neón sobre ciruela, Krona One + Montserrat, isotipo de prisma, iconografía neón y las cinco líneas de producto. El usuario decidió mantener la regla de no mencionar la impresión 3D.
- **Rebranding 3 (2026-10-07):** la identidad pasa a **Prismatix**, "Estudio creativo · Xalapa", con la lámina "Electric Velvet × Sunset Artifact". El sitio cambió de neón oscuro a editorial ivory + terciopelo ciruela, con Playfair Display + Montserrat, el logo con la "A" en degradado, el destello, la sección Esencia y los íconos de línea fina. Se ignoró la sección "Experiencia de marca" porque mencionaba partes de coches.
- **Isotipo (2026-10-08):** se integró el isotipo oficial (cinta triangular) en el logo, la portada, el pie, el favicon y la imagen para compartir. Sustituye al prisma CSS y al favicon de destello.
- **Contacto (2026-10-08):** se agregó el correo `prismatixalapa@gmail.com`, se ocultaron WhatsApp e Instagram hasta tener datos reales y se repitió el llamado "Cuéntanos tu idea" en toda la página, con la sección y el formulario `#tu-idea`.
- **Herramienta del taller (2026-10-16):** se construyó en este orden:
  1. Una paleta "foto → filamentos".
  2. Proyectar fotos del cliente sobre modelos en blanco, alineando a mano.
  3. Convertir el GLB a color de Tripo.

  Las dos primeras se descartaron con material real: la foto suele ser un retrato de frente, el modelo es el cuerpo completo y su forma no coincide con el perro real. A propuesta del usuario quedó solo la ruta del GLB, con contraseña en un subdominio. Detalles en "Taller".
- **Pulido visual (2026-10-17):** con la misma marca (logo, fuentes y paleta) se hizo más editorial. Las mayúsculas espaciadas quedan solo en botones, navegación, el descriptor, el rótulo "Esencia" y la categoría del producto; los demás rótulos (formulario, filtros, valores) van en frase normal. Única animación de entrada: la portada al cargar. `[hidden]` lleva `display: none !important` en global.css para que el filtro oculte tarjetas aunque tengan `display` propio.
- **WhatsApp y catálogo real (2026-10-18):** WhatsApp 221 344 1015 pasa a ser el canal principal (antes Instagram). El catálogo muestra solo "Tu mascota en miniatura" con fotos reales + `TarjetaIdea`; el resto queda con `oculto: true`. Logo en Montserrat con la Λ.
- **Revisión con la skill `apple-design` (2026-11-16):** basada en las guías de diseño de Apple (HIG). Se oscurecieron el berry y el terracota usados como texto para pasar 4.5:1, los rótulos chicos subieron a 11–12 px, los botones pasaron de mayúsculas espaciadas a frase normal, la acción principal en teléfonos bajó a una barra fija inferior, se quitó el logo repetido del pie y el isotipo de `TarjetaIdea` dejó de flotar (la única animación continua es la de la portada). Se mantuvieron a propósito la paleta, las fuentes y el tema solo claro, porque vienen de la lámina de marca.
- **Inventario de filamentos (2026-11-16):** a pedido del usuario, la herramienta del subdominio pasó de "GLB → 3MF pintado" a un inventario de filamentos y colores, con los datos en Cloudflare KV para verlo igual en el celular y la compu. El inventario de partida es su Excel.
- **Biblioteca de ideas (2026-11-16):** pestaña Ideas para guardar links de modelos (MakerWorld, Printables, Thingiverse…) con foto y nombre. El usuario eligió "solo pegar link" (sin botón de marcadores ni servicios externos de vistas previas) y usarla desde el celular y la compu.
- **Pedidos (2026-11-17):** pestaña Pedidos para el seguimiento de pedidos (cliente, celular, productos, cantidades, anticipo y lo que resta), en el mismo Worker y KV que el resto del taller. Los datos de clientes quedan detrás de la contraseña.
- **Otros nombres considerados:** Justo Eso, Me Faltaba, Chunche, Ocurrencia, Mira Nomás.

## Pendientes

- Revisar la disponibilidad del @ en Instagram y TikTok.
- Opcional: redirigir `www.prismatix.mx` → `prismatix.mx` (Redirect Rule).
- Si existe el isotipo en vector o PNG transparente de alta resolución, reemplazar los archivos de `public/marca/`. Si existe el wordmark oficial, reemplazar el tipográfico de `Logo.astro`.
- Reemplazar los productos de ejemplo por los reales, con fotos en el estilo fotográfico de la marca y modelos .glb.
- Opcional: renombrar el Worker y el repositorio a "prismatix" (`name` en `wrangler.jsonc` y la URL de workers.dev cambiarían).
- Opcional: cambiar el correo de los commits (hoy es el de trabajo) y decidir si el repositorio pasa a privado. El código de la herramienta del taller también es visible en GitHub, aunque la página tiene contraseña.
- Taller: afinar los hex de los filamentos en el inventario con fotos de los carretes reales.
- Taller, opcional: que el `git push` también despliegue la herramienta. Habría que cambiar el comando de deploy del build de Cloudflare a `npx wrangler deploy && npx wrangler deploy -c herramientas/wrangler.jsonc`. Hoy se despliega a mano.
