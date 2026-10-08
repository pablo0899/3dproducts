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
  descripcion: 'Prismatix, estudio creativo en Xalapa: figuras personalizadas, coleccionables, souvenirs xalapeños y piezas para juegos. Ideas que se vuelven reales.',
  email: 'prismatixalapa@gmail.com',
  // Número de WhatsApp con código de país, sin + ni espacios (ej. 5212281234567).
  // Mientras esté vacío, los botones de WhatsApp no aparecen y todo va al correo.
  whatsapp: '',
  // URL del perfil de Instagram; vacío = no se muestra.
  instagram: '',
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
  { titulo: 'Creatividad sin límites', icono: 'destello' },
  { titulo: 'Personalización real', icono: 'sol' },
  { titulo: 'Objetos de autor', icono: 'diamante' },
  { titulo: 'Exploración y colección', icono: 'montana' },
  { titulo: 'Conexión emocional', icono: 'corazon' },
  { titulo: 'Xalapa y el mundo', icono: 'destellos' },
] as const;
