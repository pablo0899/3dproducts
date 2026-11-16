// Worker de herramienta.prismatix.mx: el taller (inventario de filamentos e ideas), solo con sesión.
// Habla de filamentos e impresión, que el sitio público no menciona, así que no debe quedar
// abierto ni indexado. La contraseña es el secreto CLAVE del Worker.
//
// Datos: /api/inventario y /api/ideas guardan cada uno un JSON completo en el KV INVENTARIO, para
// verlo igual desde el celular y la compu. Si dos dispositivos guardan a la vez, gana el primero y
// el segundo recibe 409 con la versión nueva para volver a aplicar sus cambios encima.
// Las fotos de las ideas van en el mismo KV (/api/imagen/<id>) y /api/vista-previa lee el nombre
// y la foto de la página de un modelo cuando el sitio lo permite.
//
// Entrada: /entrar muestra un formulario con un solo campo (contraseña). Si es correcta se deja
// una cookie de sesión firmada con HMAC (usando CLAVE como llave) que dura 30 días. Al cambiar
// CLAVE en Cloudflare, todas las sesiones abiertas dejan de valer. /salir borra la cookie.

const COOKIE = 'prismatix_sesion';
const DURACION = 30 * 24 * 60 * 60;   // segundos

export default {
  async fetch(request, env) {
    if (!env.CLAVE) {
      return new Response('Falta configurar la contraseña (secreto CLAVE del Worker).', { status: 503 });
    }
    const url = new URL(request.url);

    if (url.pathname === '/entrar') {
      if (request.method === 'POST') {
        const datos = await request.formData();
        if (await iguales(String(datos.get('clave') || ''), env.CLAVE)) {
          const vence = Math.floor(Date.now() / 1000) + DURACION;
          return new Response(null, {
            status: 303,
            headers: {
              Location: '/',
              'Set-Cookie': `${COOKIE}=${vence}.${await firmar(String(vence), env.CLAVE)}; Max-Age=${DURACION}; Path=/; HttpOnly; Secure; SameSite=Lax`,
            },
          });
        }
        // Un respiro antes de responder: hace lentos los intentos a ciegas
        await new Promise((r) => setTimeout(r, 800));
        return paginaEntrar('Esa no es la contraseña.', 401);
      }
      return paginaEntrar('', 200);
    }

    if (url.pathname === '/salir') {
      return new Response(null, {
        status: 303,
        headers: { Location: '/entrar', 'Set-Cookie': `${COOKIE}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax` },
      });
    }

    if (!(await sesionValida(request, env.CLAVE))) {
      // Las páginas mandan a entrar; los scripts y demás archivos solo responden 401
      if (url.pathname === '/' || url.pathname.endsWith('.html')) {
        return new Response(null, { status: 303, headers: { Location: '/entrar', 'X-Robots-Tag': 'noindex' } });
      }
      return new Response('Se necesita iniciar sesión.', { status: 401, headers: { 'X-Robots-Tag': 'noindex' } });
    }

    if (url.pathname === '/api/inventario') return documento(request, env, 'inventario', 'filamentos');
    if (url.pathname === '/api/ideas') return documento(request, env, 'ideas', 'ideas');
    if (url.pathname === '/api/vista-previa') return vistaPrevia(request);
    const foto = url.pathname.match(/^\/api\/imagen\/([a-z0-9-]{4,40})$/);
    if (foto) return imagen(request, env, foto[1]);

    if (url.pathname === '/') url.pathname = '/inventario.html';
    const respuesta = await env.ASSETS.fetch(new Request(url, request));
    const final = new Response(respuesta.body, respuesta);
    final.headers.set('X-Robots-Tag', 'noindex, nofollow');
    final.headers.set('Cache-Control', 'no-store');
    return final;
  },
};

const json = (datos, status = 200) =>
  new Response(JSON.stringify(datos), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  });

// Un documento JSON completo por llave del KV: 'inventario' (filamentos) e 'ideas' (biblioteca de modelos).
// El KV se llama INVENTARIO porque nació con el inventario; las ideas y sus fotos viven en el mismo.
async function documento(request, env, llave, campo) {
  if (!env.INVENTARIO) return json({ error: 'sin-kv' }, 503);

  const guardado = await env.INVENTARIO.get(llave, 'json');
  if (request.method === 'GET') return json(guardado ?? { vacio: true });

  if (request.method === 'PUT') {
    let cuerpo;
    try {
      cuerpo = await request.json();
    } catch {
      return json({ error: 'json' }, 400);
    }
    const { base = null, datos } = cuerpo || {};
    if (!datos || !Array.isArray(datos[campo])) return json({ error: 'formato' }, 400);
    // Alguien guardó desde otro dispositivo después de que este cargó: se le manda lo nuevo
    if ((guardado?.actualizado ?? null) !== base) return json(guardado, 409);
    datos.actualizado = new Date().toISOString();
    const texto = JSON.stringify(datos);
    if (texto.length > 1_000_000) return json({ error: 'muy-grande' }, 413);
    await env.INVENTARIO.put(llave, texto);
    return json({ actualizado: datos.actualizado });
  }
  return json({ error: 'metodo' }, 405);
}

// Fotos de las ideas: se guardan en el KV como "img:<id>" (la página las reduce a ~900 px antes de subirlas).
// POST con la imagen en el cuerpo, o con JSON { desde: url } para que el Worker la descargue.
const MAX_IMAGEN = 3_000_000;
async function imagen(request, env, id) {
  if (!env.INVENTARIO) return json({ error: 'sin-kv' }, 503);
  const llave = 'img:' + id;
  if (request.method === 'GET') {
    const { value, metadata } = await env.INVENTARIO.getWithMetadata(llave, 'arrayBuffer');
    if (!value) return new Response('No existe', { status: 404 });
    return new Response(value, {
      headers: {
        'Content-Type': metadata?.tipo || 'image/webp',
        'Cache-Control': 'private, max-age=31536000, immutable',
        'X-Robots-Tag': 'noindex',
      },
    });
  }
  if (request.method === 'DELETE') {
    await env.INVENTARIO.delete(llave);
    return json({ ok: true });
  }
  if (request.method === 'POST') {
    let datos;
    let tipo;
    if ((request.headers.get('Content-Type') || '').startsWith('application/json')) {
      const { desde } = await request.json().catch(() => ({}));
      if (!/^https?:\/\//i.test(desde || '')) return json({ error: 'url' }, 400);
      const r = await fetch(desde, { headers: { 'User-Agent': AGENTE }, signal: AbortSignal.timeout(10000) }).catch(() => null);
      tipo = r?.headers.get('Content-Type') || '';
      if (!r?.ok || !tipo.startsWith('image/')) return json({ error: 'no-se-pudo' }, 502);
      datos = await r.arrayBuffer();
    } else {
      tipo = request.headers.get('Content-Type') || '';
      if (!tipo.startsWith('image/')) return json({ error: 'tipo' }, 415);
      datos = await request.arrayBuffer();
    }
    if (!datos.byteLength || datos.byteLength > MAX_IMAGEN) return json({ error: 'tamano' }, 413);
    await env.INVENTARIO.put(llave, datos, { metadata: { tipo: tipo.split(';')[0] } });
    return json({ ok: true });
  }
  return json({ error: 'metodo' }, 405);
}

// Lee el nombre y la foto de la página de un modelo (Open Graph). Se identifica tal cual es:
// sitios como MakerWorld, Printables o Cults bloquean a los servidores y aquí se responde
// "bloqueado"; entonces la página toma el nombre del link y pide una captura.
const AGENTE = 'PrismatixTaller/1.0 (+https://herramienta.prismatix.mx)';
async function vistaPrevia(request) {
  if (request.method !== 'POST') return json({ error: 'metodo' }, 405);
  const { url } = await request.json().catch(() => ({}));
  let destino;
  try {
    destino = new URL(url);
    if (!/^https?:$/.test(destino.protocol)) throw new Error('protocolo');
  } catch {
    return json({ error: 'url' }, 400);
  }
  const r = await fetch(destino, {
    headers: { 'User-Agent': AGENTE, Accept: 'text/html', 'Accept-Language': 'es-MX,es;q=0.9,en;q=0.5' },
    redirect: 'follow',
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);
  if (!r) return json({ bloqueado: true, motivo: 'sin-respuesta' });
  if (!r.ok || !(r.headers.get('Content-Type') || '').includes('html')) return json({ bloqueado: true, motivo: r.status });
  const html = (await r.text()).slice(0, 600_000);
  if (/<title>\s*Just a moment|cf-chl|challenge-platform/i.test(html)) return json({ bloqueado: true, motivo: 'verificacion' });

  const metas = {};
  for (const etiqueta of html.match(/<meta\b[^>]*>/gi) || []) {
    const nombre = (etiqueta.match(/\b(?:property|name)\s*=\s*["']([^"']+)["']/i) || [])[1];
    const valor = etiqueta.match(/\bcontent\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
    const contenido = valor ? (valor[1] ?? valor[2]) : '';
    const clave = nombre?.toLowerCase();
    if (clave && contenido && !(clave in metas)) metas[clave] = entidades(contenido.trim());
  }
  const etiquetaTitulo = html.match(/<title[^>]*>([^<]*)/i);
  const titulo = metas['og:title'] || metas['twitter:title'] || entidades(etiquetaTitulo ? etiquetaTitulo[1].trim() : '');
  let foto = metas['og:image'] || metas['og:image:url'] || metas['twitter:image'] || '';
  try {
    foto = foto ? new URL(foto, r.url).href : '';
  } catch {
    foto = '';
  }
  return json({ titulo, imagen: foto, sitio: metas['og:site_name'] || '' });
}

function entidades(texto) {
  return texto
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

async function sesionValida(request, clave) {
  const cookie = (request.headers.get('Cookie') || '').split(/;\s*/).find((c) => c.startsWith(COOKIE + '='));
  if (!cookie) return false;
  const [vence, firma] = cookie.slice(COOKIE.length + 1).split('.');
  if (!vence || !firma || +vence < Date.now() / 1000) return false;
  return iguales(firma, await firmar(vence, clave));
}

async function firmar(texto, clave) {
  const llave = await crypto.subtle.importKey('raw', new TextEncoder().encode(clave), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const firma = new Uint8Array(await crypto.subtle.sign('HMAC', llave, new TextEncoder().encode(texto)));
  return btoa(String.fromCharCode(...firma)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Comparación de tiempo constante (sobre los hash, para no revelar la longitud)
async function iguales(a, b) {
  const hash = async (s) => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));
  const [x, y] = await Promise.all([hash(a), hash(b)]);
  let dif = 0;
  for (let i = 0; i < x.length; i++) dif |= x[i] ^ y[i];
  return dif === 0;
}

function paginaEntrar(error, estado) {
  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Entrar · Prismatix</title>
<link rel="icon" href="https://prismatix.mx/marca/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&family=Playfair+Display&display=swap" rel="stylesheet">
<style>
  :root { --ciruela: #3A243B; --berry: #D83A6B; --marfil: #FDFBF7; --linea: #E6DCD8; --suave: #7A6A78; }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 16px;
    background: radial-gradient(circle at 20% 15%, rgba(216,58,107,.35), transparent 45%),
                radial-gradient(circle at 85% 90%, rgba(224,122,95,.3), transparent 45%), var(--ciruela);
    color: var(--ciruela); font: 15px/1.5 Montserrat, system-ui, sans-serif;
  }
  form {
    width: min(100%, 360px); background: var(--marfil); border-radius: 18px; padding: 32px 28px;
    box-shadow: 0 20px 60px rgba(0,0,0,.35); text-align: center;
  }
  img { width: 72px; height: 72px; }
  h1 { font-family: "Playfair Display", Georgia, serif; font-weight: 400; font-size: 26px; margin: 8px 0 4px; letter-spacing: .08em; }
  p { margin: 0 0 20px; color: var(--suave); font-size: 13px; }
  label { display: block; text-align: left; font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: var(--berry); margin-bottom: 6px; }
  input {
    width: 100%; font: inherit; font-size: 16px; padding: 12px 14px; border-radius: 10px;
    border: 1px solid var(--linea); background: #fff; color: inherit;
  }
  input:focus { outline: 2px solid var(--berry); outline-offset: 1px; border-color: transparent; }
  button {
    width: 100%; margin-top: 16px; font: inherit; font-weight: 600; letter-spacing: .12em; text-transform: uppercase;
    font-size: 13px; padding: 13px; border: 0; border-radius: 999px; cursor: pointer;
    background: var(--ciruela); color: var(--marfil);
  }
  button:hover { background: var(--berry); }
  .error { color: var(--berry); font-size: 13px; margin: 12px 0 0; min-height: 1.2em; }
</style>
</head>
<body>
<form method="post" action="/entrar">
  <img src="https://prismatix.mx/marca/isotipo-96.webp" alt="">
  <h1>PRISMATIX</h1>
  <p>Inventario del taller</p>
  <label for="clave">Contraseña</label>
  <input id="clave" name="clave" type="password" autocomplete="current-password" required autofocus>
  <button type="submit">Entrar</button>
  <p class="error" role="alert">${error}</p>
</form>
</body>
</html>`;
  return new Response(html, {
    status: estado,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex', 'Cache-Control': 'no-store' },
  });
}
