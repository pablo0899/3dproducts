// Worker de herramienta.prismatix.mx: sirve pintar.html y sus scripts solo con sesión.
// La herramienta habla de impresión, boquillas y slicers, que el sitio público no menciona,
// así que no debe quedar abierta ni indexada. La contraseña es el secreto CLAVE del Worker.
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

    if (url.pathname === '/') url.pathname = '/pintar.html';
    const respuesta = await env.ASSETS.fetch(new Request(url, request));
    const final = new Response(respuesta.body, respuesta);
    final.headers.set('X-Robots-Tag', 'noindex, nofollow');
    final.headers.set('Cache-Control', 'no-store');
    return final;
  },
};

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
  <p>Herramientas del taller</p>
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
