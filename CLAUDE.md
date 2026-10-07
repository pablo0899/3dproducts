# Contexto del proyecto: Prismatika (catálogo de productos)

Sitio web para mostrar un catálogo de productos. Cada producto tiene fotos y, opcionalmente, un modelo que el visitante puede girar en 360°, acercar y ver en realidad aumentada. Tiene que ser **fácil de mantener** (sin base de datos ni panel de administración) y verse bien **primero en celular**.

## Marca

- **Nombre:** "Prismatika". **Descriptor:** "Design Studio · Xalapa". **Eslogan:** "Cosas que no sabías que necesitabas." Los tres se definen en `src/config.ts` (`SITIO`).
- **Giro:** objetos personalizados y de colección. Las líneas de producto (`CATEGORIAS` en `src/config.ts`) son Mascotas, Figuras personalizadas, Fandom deportivo, Souvenirs xalapeños y Juegos de mesa. El `categoria` de cada producto debe coincidir con uno de esos nombres.
- **Regla principal:** los textos públicos **nunca** dicen que los productos son impresos en 3D, aunque la lámina de identidad original diga "3D Print & Design Studio" (se decidió usar solo "Design Studio"). Evitar "impresión", "impreso", "capa por capa", "filamento", "PLA", "PETG" y "3D" visible (usar "360°"). Esto aplica a los títulos, las descripciones, los materiales y los alt de las imágenes.
- **Materiales:** se describen por el beneficio o el acabado ("Acabado mate pintado a mano", "Plástico de alta resistencia", "Acabado sedoso").
- **Tono:** cercano, con humor ligero y en segunda persona (tú). El resumen de cada producto dice qué emoción o problema resuelve; no describe el objeto.
- **Pedidos personalizados:** "¿Tienes una idea? La diseñamos contigo."
- Los nombres de archivos y componentes internos (`Visor3D`, `modelo.glb`) pueden decir 3D porque el visitante no los ve.

## Identidad visual

La fuente es una lámina de identidad (imagen `identidad.jpg` del usuario, no está en el repositorio).

- **Paleta** (variables en `src/styles/global.css`):
  - Plum Night `#2A242B`
  - Magenta Glow `#FF2E93`: acento, botones, brillo neón
  - Terracotta `#C25E38`
  - Burnt Orange `#E07A5F`: precios e íconos cálidos
  - Soft Rose `#F4B6C2`
  - Ivory `#FDFBF7`: texto
- **Tema:** siempre oscuro (`color-scheme: dark`), fondo `#1d181e` con una rejilla tenue y destellos magenta y naranja. No hay modo claro.
- **Tipografía** (Google Fonts, cargadas en `Base.astro`):
  - Krona One: solo el wordmark "PRISMATIKA" (PRISM en magenta con glow, ATIKA con degradado)
  - Montserrat: todo lo demás. Los títulos van en mayúsculas 800 y los títulos de sección en `.titulo-seccion` (mayúsculas con espaciado).
- **Isotipo** (`Isotipo.astro` y `public/favicon.svg`): prisma facetado en tonos rosa, naranja y ciruela, con un anillo magenta en órbita. Es una recreación en SVG de la lámina; cuando exista el archivo vectorial oficial, hay que reemplazarlo.
- **Iconografía** (`Icono.astro`): íconos de línea con brillo neón (`mascota`, `figura`, `estadio`, `souvenir`, `dado`), en magenta o burnt orange según la línea.
- **Efectos:** `--brillo-magenta` y `--brillo-naranja` (box-shadow neón) y `--degradado-marca` (magenta → rosa → marfil) para los textos destacados.
- **Móvil primero (requisito explícito del usuario):** cada cambio visual se revisa a 390 px de ancho. En móvil, las tarjetas de líneas se deslizan de lado, el isotipo grande de la portada se oculta y la rejilla usa 1–2 columnas.

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
src/config.ts                  SITIO (nombre, descriptor, eslogan, contacto, moneda) y CATEGORIAS (líneas con ícono y color)
src/content.config.ts          Esquema Zod de la colección `productos`
src/content/productos/*.md     Un producto por archivo; el nombre del archivo es el id/URL
public/productos/<id>/         Fotos y modelo.glb de cada producto (se sirven tal cual)
src/utils.ts                   formatearPrecio(), enlaceWhatsapp()
src/styles/global.css          Paleta y tokens (:root), fondo con rejilla, .contenedor, .boton, .etiqueta, .titulo-seccion, .texto-degradado
src/layouts/Base.astro         <head> + Google Fonts, cabecera sticky con Logo, pie con contacto (#contacto)
src/components/
  Logo.astro                   Isotipo + wordmark PRISM/ATIKA
  Isotipo.astro                Prisma con anillo (SVG)
  Icono.astro                  Íconos neón de las líneas de producto
  TarjetaProducto.astro        Tarjeta del catálogo (badge "360°", "Agotado")
  Galeria.astro                Carrusel con scroll-snap y miniaturas
  Visor3D.astro                <model-viewer>; carga el modelo con IntersectionObserver. El visor es cuadrado como la galería; ojo: model-viewer trae height: 150px por defecto, así que necesita height: 100%
src/pages/index.astro          Portada (eslogan + isotipo), tarjetas "Explora por línea" que filtran la rejilla (JS en el cliente) y mensaje si una línea está vacía
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

- Con el cambio de nombre, el plan anterior (`tangibleestudio.mx`) ya no aplica. El candidato ahora es **`prismatika.mx`** (más `prismatika.com` como protección), pero falta revisar la disponibilidad.
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
- **Otros nombres considerados:** Justo Eso, Me Faltaba, Chunche, Ocurrencia, Mira Nomás.

## Pendientes

- Revisar la disponibilidad de `prismatika.mx` y `.com`, del @ en Instagram y TikTok, comprar el dominio y conectarlo (ver "Dominio").
- Sustituir el isotipo SVG recreado por el logo vectorial oficial cuando exista.
- Poner los datos reales en `src/config.ts`: WhatsApp (hoy `5215500000000`), Instagram y email.
- Reemplazar los productos de ejemplo por los reales, con fotos y modelos .glb.
- Opcional: renombrar el Worker y el repositorio a "prismatika" (`name` en `wrangler.jsonc` y la URL de workers.dev cambiarían).
- Opcional: cambiar el correo de los commits (hoy es el de trabajo) y decidir si el repositorio pasa a privado.
