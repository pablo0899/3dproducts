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
astro.config.mjs               site = URL pública (usada en og:image y enlaces absolutos)
wrangler.jsonc                 Config del Worker de Cloudflare (assets estáticos desde dist/)
.node-version                  Node 22 para el build en Cloudflare
public/_headers                Caché: /_astro/* inmutable 1 año, /productos/* 1 día
src/config.ts                  SITIO (nombre, descriptor, eslogan, cierre, contacto, moneda), CATEGORIAS (líneas con ícono) y ESENCIA (valores con ícono)
src/content.config.ts          Esquema Zod de la colección `productos`
src/content/productos/*.md     Un producto por archivo; el nombre del archivo es el id/URL
public/productos/<id>/         Fotos y modelo.glb de cada producto (se sirven tal cual)
src/utils.ts                   formatearPrecio(), enlaceWhatsapp()
src/styles/global.css          Paleta y tokens (:root), degradados, .seccion-oscura, .contenedor, .boton, .etiqueta, .titulo-seccion, .texto-degradado
src/layouts/Base.astro         <head> (favicon/og desde public/marca) + Google Fonts, cabecera sticky ivory con Logo, pie oscuro con isotipo, cierre de marca y contacto (#contacto)
public/marca/                  Isotipo transparente (webp/png), favicon, apple-touch-icon y og.jpg
src/components/
  Logo.astro                   Isotipo + wordmark PRISMATIX con la "A" en degradado (prop claro)
  Destello.astro               Estrella de 4 puntas en degradado (acento en la portada de escritorio)
  Icono.astro                  Íconos de línea fina (líneas de producto y esencia)
  TarjetaProducto.astro        Tarjeta del catálogo (badge "360°", "Agotado")
  Galeria.astro                Carrusel con scroll-snap y miniaturas
  Visor3D.astro                <model-viewer>; carga el modelo con IntersectionObserver. El visor es cuadrado como la galería; ojo: model-viewer trae height: 150px por defecto, así que necesita height: 100%
src/pages/index.astro          Portada oscura (eslogan + isotipo con haces de luz), sección Esencia, tarjetas "Explora por línea" que filtran la rejilla (JS en el cliente) y mensaje si una línea está vacía
src/pages/productos/[id].astro Detalle: pestañas Fotos / Vista 360°, ficha técnica y botón de WhatsApp
src/pages/404.astro            Página "Esto no existe… todavía." (la usa not_found_handling del Worker)
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
- No hay backend: los pedidos se hacen por WhatsApp (`wa.me`) con un mensaje prellenado.

## Comandos

```bash
npm run dev             # localhost:4321 y red local (--host): accesible desde el celular en la misma Wi-Fi
npm run build           # compila a dist/ y valida el esquema de productos
npm run preview         # sirve el build
```

## Despliegue

- **Repositorio:** https://github.com/pablo0899/3dproducts (rama `main`, público). La cuenta de GitHub del proyecto es **pablo0899**, no pablo-0899. En esta PC la cuenta activa de `gh` puede ser pablo-0899, así que el repositorio tiene un credential helper local (`git config --local`) que usa `gh auth token --user pablo0899`. Por eso `git push` funciona sin tener que cambiar de cuenta.
- **Hosting:** Cloudflare **Worker** con assets estáticos (no Pages), en el plan gratuito. Se eligió porque el tráfico es ilimitado y permite uso comercial. Vercel Hobby se descartó porque no permite uso comercial.
- **URL actual:** https://3dproducts.idipl0899.workers.dev
- **Flujo:** cada `git push` a `main` dispara el build en Cloudflare (`npm run build`) y publica `dist/` con `wrangler deploy`.
- `wrangler.jsonc` tiene `workers_dev: true` y `preview_urls: true`, porque en el panel venían deshabilitadas. El `name` debe seguir siendo `3dproducts`, que es el nombre del Worker en Cloudflare.
- Comprobar sin publicar: `npx wrangler deploy --dry-run` (después de `npm run build`).

## Dominio (plan)

- Con el cambio de nombre a Prismatix, el candidato ahora es **`prismatix.mx`** (más `prismatix.com` como protección), pero falta revisar la disponibilidad. Los planes anteriores (`tangibleestudio.mx`, `prismatika.mx`) ya no aplican.
- Cloudflare Registrar no vende `.mx`. Pasos:
  1. Comprar el dominio en Akky, Neubox o GoDaddy.
  2. En Cloudflare, agregar el dominio con el plan Free.
  3. Cambiar los nameservers en el registrador por los de Cloudflare.
  4. En el Worker, ir a Settings → Domains & Routes → Custom domain y agregar el dominio y `www`.
- Después de conectarlo, actualizar `site` en `astro.config.mjs`.

## Historial de decisiones

- **Estructura inicial:** Astro + model-viewer, con los productos en Markdown y los recursos en `public/`.
- **Visor 360°:** el visor quedaba más chico que las fotos porque el `:host` de model-viewer fija 300×150 px. Se corrigió con un contenedor cuadrado y `height: 100%`.
- **Rebranding 1:** se quitó toda mención a impresión 3D. Nombres usados: "Ni Sabías" (provisional) y luego "Tangible Estudio".
- **Rebranding 2 (2026-10-07):** se adoptó la identidad **Prismatika** (Design Studio · Xalapa) a partir de la lámina del usuario: paleta neón sobre ciruela, Krona One + Montserrat, isotipo de prisma, iconografía neón y las cinco líneas de producto. El usuario decidió mantener la regla de no mencionar la impresión 3D.
- **Rebranding 3 (2026-10-07):** la identidad pasa a **Prismatix**, "Estudio creativo · Xalapa", con la lámina "Electric Velvet × Sunset Artifact". El sitio cambió de neón oscuro a editorial ivory + terciopelo ciruela, con Playfair Display + Montserrat, el logo con la "A" en degradado, el destello, la sección Esencia y los íconos de línea fina. Se ignoró la sección "Experiencia de marca" porque mencionaba partes de coches.
- **Isotipo (2026-10-08):** se integró el isotipo oficial (cinta triangular) en el logo, la portada, el pie, el favicon y la imagen para compartir. Sustituye al prisma CSS y al favicon de destello.
- **Otros nombres considerados:** Justo Eso, Me Faltaba, Chunche, Ocurrencia, Mira Nomás.

## Pendientes

- Revisar la disponibilidad de `prismatix.mx` y `.com`, del @ en Instagram y TikTok, comprar el dominio y conectarlo (ver "Dominio").
- Si existe el isotipo en vector o PNG transparente de alta resolución, reemplazar los archivos de `public/marca/`. Si existe el wordmark oficial, reemplazar el tipográfico de `Logo.astro`.
- Poner los datos reales en `src/config.ts`: WhatsApp (hoy `5215500000000`), Instagram y email.
- Reemplazar los productos de ejemplo por los reales, con fotos en el estilo fotográfico de la marca y modelos .glb.
- Opcional: renombrar el Worker y el repositorio a "prismatix" (`name` en `wrangler.jsonc` y la URL de workers.dev cambiarían).
- Opcional: cambiar el correo de los commits (hoy es el de trabajo) y decidir si el repositorio pasa a privado.
