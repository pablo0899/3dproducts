// Worker de herramienta.prismatix.mx: sirve pintar.html y sus scripts solo con contraseña.
// La herramienta habla de impresión, boquillas y slicers, que el sitio público no menciona,
// así que no debe quedar abierta ni indexada. La contraseña es el secreto CLAVE del Worker.

export default {
  async fetch(request, env) {
    if (!env.CLAVE) {
      return new Response('Falta configurar la contraseña (secreto CLAVE del Worker).', { status: 503 });
    }
    if (!(await autorizado(request, env.CLAVE))) {
      return new Response('Se necesita contraseña.', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Prismatix", charset="UTF-8"', 'X-Robots-Tag': 'noindex' },
      });
    }
    const url = new URL(request.url);
    if (url.pathname === '/') url.pathname = '/pintar.html';
    const respuesta = await env.ASSETS.fetch(new Request(url, request));
    const final = new Response(respuesta.body, respuesta);
    final.headers.set('X-Robots-Tag', 'noindex, nofollow');
    final.headers.set('Cache-Control', 'no-store');
    return final;
  },
};

// Autenticación básica: el navegador pide usuario y contraseña; el usuario puede ser cualquiera
async function autorizado(request, clave) {
  const [tipo, datos] = (request.headers.get('Authorization') || '').split(' ');
  if (tipo !== 'Basic' || !datos) return false;
  let texto;
  try { texto = new TextDecoder().decode(Uint8Array.from(atob(datos), (c) => c.charCodeAt(0))); } catch { return false; }
  return iguales(texto.slice(texto.indexOf(':') + 1), clave);
}

// Comparación de tiempo constante (sobre los hash, para no revelar la longitud)
async function iguales(a, b) {
  const hash = async (s) => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));
  const [x, y] = await Promise.all([hash(a), hash(b)]);
  let dif = 0;
  for (let i = 0; i < x.length; i++) dif |= x[i] ^ y[i];
  return dif === 0;
}
