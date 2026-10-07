// ─────────────────────────────────────────────────────────────
//  Datos generales del sitio. Edita este archivo para cambiar
//  el nombre, los contactos y los textos principales.
//  Regla de marca: los textos públicos nunca mencionan cómo se
//  fabrican los productos (nada de impresión 3D).
// ─────────────────────────────────────────────────────────────
export const SITIO = {
  nombre: 'Prismatika',
  descriptor: 'Design Studio · Xalapa',
  eslogan: 'Cosas que no sabías que necesitabas.',
  subtitulo: 'Figuras, souvenirs y objetos personalizados para tu mascota, tu equipo, tu mesa de juego y tu rincón favorito de Xalapa.',
  descripcion: 'Prismatika, Design Studio en Xalapa: figuras personalizadas, souvenirs xalapeños, fandom deportivo, mascotas y juegos de mesa.',
  // Número de WhatsApp con código de país, sin + ni espacios (ej. 5215512345678)
  whatsapp: '5215500000000',
  instagram: 'https://instagram.com/tu_usuario',
  email: 'hola@example.com',
  moneda: 'MXN',
};

// Líneas de producto (iconografía de marca). El `nombre` debe coincidir
// exactamente con el campo `categoria` de los productos.
export const CATEGORIAS = [
  { nombre: 'Mascotas', icono: 'mascota', color: 'magenta' },
  { nombre: 'Figuras personalizadas', icono: 'figura', color: 'magenta' },
  { nombre: 'Fandom deportivo', icono: 'estadio', color: 'naranja' },
  { nombre: 'Souvenirs xalapeños', icono: 'souvenir', color: 'naranja' },
  { nombre: 'Juegos de mesa', icono: 'dado', color: 'magenta' },
] as const;
