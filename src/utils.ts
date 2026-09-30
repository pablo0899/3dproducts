import { SITIO } from './config';

export function formatearPrecio(precio?: number) {
  if (precio === undefined) return 'Precio a consultar';
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: SITIO.moneda }).format(precio);
}

export function enlaceWhatsapp(mensaje: string) {
  return `https://wa.me/${SITIO.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}
