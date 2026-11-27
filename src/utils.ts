import { SITIO, TEMPORADA } from './config';
import type { CollectionEntry } from 'astro:content';

// Un producto se publica si no está oculto. Los de temporada se dejan de generar cuando
// se compila después de que terminó (mientras tanto, el modo de temporada los esconde en el navegador).
export function esVisible(p: CollectionEntry<'productos'>) {
  if (p.data.oculto) return false;
  const hoy = new Date().toISOString().slice(0, 10);
  return !(p.data.temporada === TEMPORADA.id && hoy > TEMPORADA.hasta);
}

export function formatearPrecio(precio?: number) {
  if (precio === undefined) return 'Precio a consultar';
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: SITIO.moneda }).format(precio);
}

export function enlaceWhatsapp(mensaje: string) {
  return `https://wa.me/${SITIO.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

export function enlaceCorreo(asunto: string, cuerpo = '') {
  return `mailto:${SITIO.email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
}

// Usuario de Instagram sacado de la URL del perfil (ej. "prismatix.mx")
export const usuarioInstagram = SITIO.instagram.match(/instagram\.com\/([^/?#]+)/)?.[1] ?? '';

export interface Canal {
  id: 'instagram' | 'facebook' | 'whatsapp' | 'correo';
  nombre: string;
  url: string;
  // Instagram y Facebook no aceptan un mensaje prellenado: se copia al portapapeles al hacer clic
  copiar?: string;
}

// Medios de contacto en orden de prioridad: WhatsApp (si hay número), Instagram, Facebook y al final el correo.
// El primero es el botón principal en todas las secciones; los vacíos no aparecen.
export function canales(asunto: string, mensaje = ''): Canal[] {
  const lista: Canal[] = [];
  if (SITIO.whatsapp) lista.push({ id: 'whatsapp', nombre: 'WhatsApp', url: enlaceWhatsapp(mensaje) });
  if (SITIO.instagram) {
    const url = usuarioInstagram ? `https://ig.me/m/${usuarioInstagram}` : SITIO.instagram;
    lista.push({ id: 'instagram', nombre: 'Instagram', url, copiar: mensaje || undefined });
  }
  if (SITIO.facebook) lista.push({ id: 'facebook', nombre: 'Facebook', url: SITIO.facebook, copiar: mensaje || undefined });
  lista.push({ id: 'correo', nombre: 'correo', url: enlaceCorreo(asunto, mensaje) });
  return lista;
}

// Atributos de un enlace a un canal: abre en otra pestaña (salvo el correo) y marca el texto a copiar
export function atributosCanal(c: Canal) {
  return {
    href: c.url,
    ...(c.id !== 'correo' && { target: '_blank', rel: 'noopener' }),
    ...(c.copiar && { 'data-copiar': c.copiar, 'data-canal': c.nombre }),
  };
}
