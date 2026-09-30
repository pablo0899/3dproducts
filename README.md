# Tangible Estudio

Sitio estático hecho con [Astro](https://astro.build) y [`<model-viewer>`](https://modelviewer.dev).
Cada producto es **un archivo Markdown + una carpeta con fotos y su modelo 3D**. No hay base de datos ni panel de administración que mantener.

## Comandos

```bash
npm install        # solo la primera vez
npm run dev        # servidor local en http://localhost:4321
npm run build      # genera el sitio final en dist/
npm run preview    # revisa el build antes de publicar
```

## Estructura

```
public/productos/<producto>/   ← fotos (.jpg/.webp) y modelo 3D (.glb)
src/content/productos/*.md     ← un archivo por producto (datos + descripción)
src/config.ts                  ← nombre del sitio, WhatsApp, Instagram, email, moneda
src/styles/global.css          ← colores, tipografía, bordes
src/components/                ← Tarjeta de producto, galería de fotos, visor 3D
src/pages/                     ← portada (catálogo) y página de detalle de producto
```

## Agregar un producto (3 pasos)

1. Crea la carpeta `public/productos/llavero-gato/` y copia dentro:
   - las fotos (`foto-1.jpg`, `foto-2.jpg`…) — cuadradas, ~1200 px, en `.jpg` o `.webp`
   - el modelo 3D `modelo.glb` (opcional)
2. Crea `src/content/productos/llavero-gato.md`:

   ```markdown
   ---
   nombre: Llavero gato
   resumen: Llavero de gato en PLA, ligero y resistente.
   categoria: Accesorios
   precio: 60                 # opcional; sin precio muestra "Precio a consultar"
   fotos:
     - /productos/llavero-gato/foto-1.jpg
     - /productos/llavero-gato/foto-2.jpg
   modelo: /productos/llavero-gato/modelo.glb   # opcional
   material: PLA
   dimensiones: 5 × 4 × 0.5 cm
   colores: [Negro, Blanco]
   disponible: true           # false = aparece como "Agotado"
   destacado: false           # true = aparece primero en el catálogo
   ---

   Aquí va la descripción larga, en Markdown (listas, **negritas**, etc.).
   ```

3. Revisa con `npm run dev` y publica.

El nombre del archivo `.md` es la URL: `llavero-gato.md` → `/productos/llavero-gato/`.
Las categorías de los filtros se crean solas a partir del campo `categoria`.
Si te falta un campo obligatorio, `npm run build` te dirá exactamente cuál.

## Modelos 3D: de STL a GLB

El visor usa **GLB** (formato web, liviano y con color). Tus STL/3MF se convierten gratis:

- **Blender**: *File → Import → STL*, asigna un material/color, *File → Export → glTF 2.0* → formato **GLB**.
- **En línea**: [convert3d.org](https://convert3d.org/stl-to-glb) o similares.

Consejos para que cargue rápido en celular:
- Mantén el `.glb` por debajo de ~5 MB (en Blender: modificador *Decimate* para reducir polígonos).
- Exporta en metros o ajusta la escala: el visor centra y encuadra el modelo automáticamente.
- El modelo solo se descarga cuando el visitante toca “Ver en 3D”.
- En celulares compatibles aparece el botón de **Realidad Aumentada** para ver la pieza sobre la mesa.

## Publicar

El sitio está en **Cloudflare Workers** (plan gratuito, con assets estáticos): https://3dproducts.idipl0899.workers.dev

Cada `git push` a `main` lo compila y lo publica automáticamente en uno o dos minutos. La configuración está en:

- `wrangler.jsonc`: nombre del Worker, carpeta `dist` y URLs públicas activadas
- `.node-version`: Node 22
- `public/_headers`: caché de los archivos

Al conectar un dominio propio (Worker → Settings → Domains & Routes → Custom domain), cambia `site` en `astro.config.mjs`.
