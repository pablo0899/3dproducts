// ─────────────────────────────────────────────────────────────
//  Datos generales del sitio. Edita este archivo para cambiar
//  el nombre, los contactos y los textos principales.
//  Regla de marca: los textos públicos nunca mencionan cómo se
//  fabrican los productos (nada de impresión 3D).
// ─────────────────────────────────────────────────────────────
export const SITIO = {
  nombre: 'Prismatix',
  descriptor: 'Estudio creativo · Xalapa',
  eslogan: 'Ideas que se vuelven reales.',
  subtitulo: 'Creemos que la imaginación también se puede tocar. Transformamos ideas en objetos únicos, personalizados y llenos de significado.',
  cierre: 'Más que objetos, son historias en forma de arte.',
  descripcion: 'Prismatix, estudio creativo en Xalapa: tu mascota en miniatura, pintada a mano, y piezas únicas a partir de tu idea. Ideas que se vuelven reales.',
  email: 'hola@prismatix.mx',
  // Número de WhatsApp con código de país, sin + ni espacios (ej. 5212281234567).
  // Es el canal principal: va primero en todos los contactos. Vacío = no se muestra.
  whatsapp: '5212213441015',
  // Cómo se ve el número en la página.
  whatsappVisible: '221 344 1015',
  // URLs de las redes sociales; vacío = no se muestran.
  instagram: 'https://www.instagram.com/prismatix.mx/',
  facebook: 'https://www.facebook.com/profile.php?id=61595064758804',
  moneda: 'MXN',
};

// Líneas de producto. El `nombre` debe coincidir exactamente con el
// campo `categoria` de los productos.
export const CATEGORIAS = [
  { nombre: 'Mascotas', icono: 'mascota' },
  { nombre: 'Figuras personalizadas', icono: 'figura' },
  { nombre: 'Fandom deportivo', icono: 'estadio' },
  { nombre: 'Souvenirs xalapeños', icono: 'souvenir' },
  { nombre: 'Juegos de mesa', icono: 'dado' },
] as const;

// Esencia de marca (lámina de identidad).
export const ESENCIA = [
  { titulo: 'Creatividad sin límites', icono: 'destello', texto: 'Si lo puedes imaginar, encontramos la forma de hacerlo.' },
  { titulo: 'Personalización real', icono: 'sol', texto: 'Tus colores, tu nombre, tu historia. Cada pieza es solo tuya.' },
  { titulo: 'Objetos de autor', icono: 'diamante', texto: 'Diseñados con cuidado y terminados pieza por pieza.' },
  { titulo: 'Exploración y colección', icono: 'montana', texto: 'Piezas para buscar, coleccionar y presumir en tu repisa.' },
  { titulo: 'Conexión emocional', icono: 'corazon', texto: 'Objetos que guardan lo que amas.' },
  { titulo: 'Xalapa y el mundo', icono: 'destellos', texto: 'Xalapa también se colecciona, y viaja contigo a donde vayas.' },
] as const;
