# Contexto del proyecto: Tangible Estudio (catálogo de productos)

Sitio web para mostrar un catálogo de productos. Cada producto tiene fotos y, opcionalmente, un modelo que el visitante puede girar en 360°, acercar y ver en realidad aumentada. Tiene que ser **fácil de mantener** (sin base de datos ni panel de administración) y verse bien **primero en celular**.

## Marca

- **Nombre:** "Tangible Estudio". **Eslogan:** "Cosas que no sabías que necesitabas." Ambos se definen en `src/config.ts`.
- **Posicionamiento:** objetos ingeniosos que resuelven pequeños problemas del día a día. No es un servicio de fabricación.
- **Regla principal:** los textos públicos **nunca** dicen que los productos son impresos en 3D. Evitar "impresión", "impreso", "capa por capa", "filamento", "PLA", "PETG" y "3D" visible (usar "360°"). Esto aplica a los títulos, las descripciones, los materiales y los alt de las imágenes.
- **Materiales:** se describen por el beneficio o el acabado ("Bioplástico mate", "Plástico de alta resistencia", "Acabado sedoso").
- **Tono:** cercano, con humor ligero y en segunda persona (tú). El resumen de cada producto nombra el problema que resuelve; no describe el objeto.
- **Pedidos personalizados:** se presentan como "cuéntanos tu problema y lo inventamos".
- Los nombres de archivos y componentes internos (`Visor3D`, `modelo.glb`) pueden decir 3D porque el visitante no los ve.

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
src/config.ts                  SITIO: nombre, eslogan, whatsapp, instagram, email, moneda
src/content.config.ts          Esquema Zod de la colección `productos`
src/content/productos/*.md     Un producto por archivo; el nombre del archivo es el id/URL
public/productos/<id>/         Fotos y modelo.glb de cada producto (se sirven tal cual)
src/utils.ts                   formatearPrecio(), enlaceWhatsapp()
src/styles/global.css          Tokens de diseño (:root), tema oscuro, .contenedor, .boton, .etiqueta
src/layouts/Base.astro         <head>, cabecera sticky, pie con contacto (#contacto)
src/components/
  TarjetaProducto.astro        Tarjeta del catálogo (badge "360°", "Agotado")
  Galeria.astro                Carrusel con scroll-snap y miniaturas
  Visor3D.astro                <model-viewer>; carga el modelo con IntersectionObserver. El visor es cuadrado como la galería; ojo: model-viewer trae height: 150px por defecto, así que necesita height: 100%
src/pages/index.astro          Portada y rejilla del catálogo con filtros por categoría (JS en el cliente)
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
- Los productos de ejemplo usan fotos SVG de relleno y GLB generados por script. Hay que reemplazarlos por los reales.
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

- **Dominio elegido:** `tangibleestudio.mx`. También conviene registrar `tangibleestudio.com` para protegerlo. Hay que evitar `tangiblestudio.mx` (sin la "e"). Al 2026-09-30 ninguno tenía DNS, pero falta confirmar la disponibilidad en el registrador.
- Cloudflare Registrar no vende `.mx`. Pasos:
  1. Comprar el dominio en Akky, Neubox o GoDaddy.
  2. En Cloudflare, agregar el dominio con el plan Free.
  3. Cambiar los nameservers en el registrador por los de Cloudflare.
  4. En el Worker, ir a Settings → Domains & Routes → Custom domain y agregar `tangibleestudio.mx` y `www`.
- Después de conectarlo, actualizar `site` en `astro.config.mjs`.

## Historial de decisiones

- **Estructura inicial:** Astro + model-viewer, con los productos en Markdown y los recursos en `public/`.
- **Visor 360°:** el visor quedaba más chico que las fotos porque el `:host` de model-viewer fija 300×150 px. Se corrigió con un contenedor cuadrado y `height: 100%`.
- **Rebranding:** se quitó toda mención a impresión 3D. El nombre provisional fue "Ni Sabías" y el definitivo es **"Tangible Estudio"**.
- **Otros nombres considerados:** Justo Eso, Me Faltaba, Chunche, Ocurrencia, Mira Nomás.

## Pendientes

- Comprar y conectar `tangibleestudio.mx` (ver "Dominio").
- Revisar que el @ de Instagram y TikTok esté libre, y diseñar el logo, la paleta y la tipografía de Tangible Estudio. El ícono actual (un destello naranja) es provisional.
- Poner los datos reales en `src/config.ts`: WhatsApp (hoy `5215500000000`), Instagram y email.
- Reemplazar los productos de ejemplo (fotos SVG y GLB generados) por los reales.
- Opcional: cambiar el correo de los commits (hoy es el de trabajo) y decidir si el repositorio pasa a privado.
