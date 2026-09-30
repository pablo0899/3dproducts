import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Cada archivo .md en src/content/productos/ es un producto.
// Si falta un campo obligatorio, el sitio te avisará al compilar.
const productos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/productos' }),
  schema: z.object({
    nombre: z.string(),
    resumen: z.string(),
    categoria: z.string(),
    precio: z.number().optional(),
    // Rutas dentro de public/, ej. /productos/mi-producto/foto-1.jpg
    fotos: z.array(z.string()).min(1),
    // Archivo .glb/.gltf dentro de public/ o una URL completa
    modelo: z.string().optional(),
    material: z.string().optional(),
    dimensiones: z.string().optional(),
    colores: z.array(z.string()).default([]),
    disponible: z.boolean().default(true),
    destacado: z.boolean().default(false),
    orden: z.number().default(100),
  }),
});

export const collections = { productos };
