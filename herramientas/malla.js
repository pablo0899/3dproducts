// Geometría para pintar.html: preparar la malla del GLB, limpiar las zonas de color y escribir
// el 3MF con la pintura en el formato de ElegooSlicer / OrcaSlicer (paint_color).
// Script clásico y sin dependencias del navegador, para poder probarlo en Node.
//
// Una malla es { pos: Float64Array (x,y,z por vértice, en mm), tri: Uint32Array (3 índices por
// triángulo), color: Uint8Array (r,g,b por triángulo, tomado de la textura) }.

// Pone Z hacia arriba (el GLB viene con Y hacia arriba) y escala a una altura en mm
function levantarYEscalar(malla, alturaMm, yArriba) {
  const p = malla.pos;
  if (yArriba) {
    for (let i = 0; i < p.length; i += 3) {
      const y = p[i + 1], z = p[i + 2];
      p[i + 1] = -z;   // el frente del GLB (+Z) queda hacia −Y, como en el slicer
      p[i + 2] = y;
    }
  }
  let minZ = Infinity, maxZ = -Infinity;
  for (let i = 2; i < p.length; i += 3) { minZ = Math.min(minZ, p[i]); maxZ = Math.max(maxZ, p[i]); }
  const e = alturaMm / (maxZ - minZ || 1);
  for (let i = 0; i < p.length; i += 3) {
    p[i] *= e; p[i + 1] *= e; p[i + 2] = (p[i + 2] - minZ) * e;
  }
  return malla;
}

// ---------- Vecinos, áreas y normales ----------

// vecinos[t*3+k] = triángulo del otro lado de la arista k (-1 si no hay)
function vecinos(malla) {
  const n = malla.tri.length / 3;
  const salida = new Int32Array(n * 3).fill(-1);
  const aristas = new Map();
  for (let t = 0; t < n; t++) {
    for (let k = 0; k < 3; k++) {
      const a = malla.tri[t * 3 + k], b = malla.tri[t * 3 + ((k + 1) % 3)];
      const clave = a < b ? a * 4294967296 + b : b * 4294967296 + a;
      const otro = aristas.get(clave);
      if (otro === undefined) aristas.set(clave, t * 3 + k);
      else if (otro >= 0) {
        salida[t * 3 + k] = Math.floor(otro / 3);
        salida[otro] = t;
        aristas.set(clave, -1);
      }
    }
  }
  return salida;
}

function areasYNormales(malla) {
  const n = malla.tri.length / 3;
  const areas = new Float64Array(n);
  const normales = new Float32Array(n * 3);
  const centros = new Float32Array(n * 3);
  const p = malla.pos, t = malla.tri;
  for (let i = 0; i < n; i++) {
    const a = t[i * 3] * 3, b = t[i * 3 + 1] * 3, c = t[i * 3 + 2] * 3;
    const ux = p[b] - p[a], uy = p[b + 1] - p[a + 1], uz = p[b + 2] - p[a + 2];
    const vx = p[c] - p[a], vy = p[c + 1] - p[a + 1], vz = p[c + 2] - p[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const largo = Math.hypot(nx, ny, nz) || 1;
    areas[i] = largo / 2;
    normales[i * 3] = nx / largo; normales[i * 3 + 1] = ny / largo; normales[i * 3 + 2] = nz / largo;
    centros[i * 3] = (p[a] + p[b] + p[c]) / 3;
    centros[i * 3 + 1] = (p[a + 1] + p[b + 1] + p[c + 1]) / 3;
    centros[i * 3 + 2] = (p[a + 2] + p[b + 2] + p[c + 2]) / 3;
  }
  return { areas, normales, centros };
}

// ---------- Limpieza de zonas ----------
// etiquetas: Int8Array, una ranura (0–3) por triángulo, o -1 si no se sabe

// Un triángulo rodeado por otro color en al menos 2 de sus 3 lados adopta ese color
function suavizar(etiquetas, vec, pasadas) {
  for (let p = 0; p < pasadas; p++) {
    const copia = etiquetas.slice();
    let cambios = 0;
    for (let t = 0; t < etiquetas.length; t++) {
      const a = vec[t * 3], b = vec[t * 3 + 1], c = vec[t * 3 + 2];
      const ea = a >= 0 ? copia[a] : -1, eb = b >= 0 ? copia[b] : -1, ec = c >= 0 ? copia[c] : -1;
      let nueva = -1;
      if (ea >= 0 && (ea === eb || ea === ec)) nueva = ea;
      else if (eb >= 0 && eb === ec) nueva = eb;
      if (nueva >= 0 && nueva !== copia[t]) { etiquetas[t] = nueva; cambios++; }
    }
    if (!cambios) break;
  }
}

// Manchas de menos de `minArea` mm² se funden con el color vecino que más las rodea
// (cada mancha cuesta cambios de filamento y purga)
function quitarIslas(etiquetas, vec, areas, minArea) {
  if (minArea <= 0) return 0;
  let fundidas = 0;
  for (let vuelta = 0; vuelta < 4; vuelta++) {
    const zona = new Int32Array(etiquetas.length).fill(-1);
    let cambios = 0;
    for (let s = 0; s < etiquetas.length; s++) {
      if (zona[s] >= 0) continue;
      const pila = [s], miembros = [];
      zona[s] = s;
      let area = 0;
      const borde = new Map();
      while (pila.length) {
        const t = pila.pop();
        miembros.push(t);
        area += areas[t];
        for (let k = 0; k < 3; k++) {
          const o = vec[t * 3 + k];
          if (o < 0) continue;
          if (etiquetas[o] === etiquetas[s]) {
            if (zona[o] < 0) { zona[o] = s; pila.push(o); }
          } else borde.set(etiquetas[o], (borde.get(etiquetas[o]) || 0) + 1);
        }
      }
      if (area < minArea && borde.size) {
        let mejor = -1, max = 0;
        for (const [e, n] of borde) if (n > max) { max = n; mejor = e; }
        for (const t of miembros) etiquetas[t] = mejor;
        cambios++;
      }
    }
    fundidas += cambios;
    if (!cambios) break;
  }
  return fundidas;
}

// Detalle mínimo imprimible: una zona de color más angosta que `ancho` mm (una raya, un punto, una
// punta) no se puede trazar con la boquilla. Se hace una "apertura" sobre la superficie: se encoge
// cada zona `ancho/2` desde su borde y se vuelve a crecer lo mismo; lo que no sobrevive se pinta
// con el color vecino. Las distancias se miden entre centros de triángulos vecinos.
function abrirZonas(etiquetas, vec, centros, ancho) {
  const n = etiquetas.length;
  const r = ancho / 2;
  if (r <= 0) return 0;
  const paso = (a, b) => Math.hypot(centros[a * 3] - centros[b * 3], centros[a * 3 + 1] - centros[b * 3 + 1], centros[a * 3 + 2] - centros[b * 3 + 2]);

  // Dijkstra acotado a `r`, solo dentro de la misma zona de color
  const dist = new Float32Array(n);
  const monticulo = new MontículoMin(n);
  const propagar = (fuentes, radio) => {
    dist.fill(Infinity);
    for (const t of fuentes) { dist[t] = 0; monticulo.poner(t, 0); }
    while (monticulo.tamaño) {
      const t = monticulo.sacar();
      const d = dist[t];
      for (let k = 0; k < 3; k++) {
        const o = vec[t * 3 + k];
        if (o < 0 || etiquetas[o] !== etiquetas[t]) continue;
        const nd = d + paso(t, o);
        if (nd < dist[o] && nd <= radio) { dist[o] = nd; monticulo.poner(o, nd); }
      }
    }
  };
  // Tamaño típico de un paso entre triángulos: al volver a crecer hace falta ese margen para
  // recuperar la orilla completa (las distancias van a saltos, no son continuas)
  const muestra = [];
  for (let t = 0; t < n && muestra.length < 2000; t += Math.max(1, Math.floor(n / 2000))) if (vec[t * 3] >= 0) muestra.push(paso(t, vec[t * 3]));
  muestra.sort((a, b) => a - b);
  const h = muestra[muestra.length >> 1] || 0;

  // 1. Encoger: distancia al borde de su zona; el "núcleo" es lo que está a más de r
  const borde = [];
  for (let t = 0; t < n; t++) {
    for (let k = 0; k < 3; k++) {
      const o = vec[t * 3 + k];
      if (o >= 0 && etiquetas[o] !== etiquetas[t]) { borde.push(t); break; }
    }
  }
  propagar(borde, r);
  const nucleo = [];
  for (let t = 0; t < n; t++) if (dist[t] === Infinity) nucleo.push(t);

  // 2. Crecer: lo que queda a menos de r del núcleo se conserva
  propagar(nucleo, r + 2 * h);
  const original = etiquetas.slice();
  let quitados = 0;
  for (let t = 0; t < n; t++) if (dist[t] === Infinity) { etiquetas[t] = -1; quitados++; }
  if (!quitados) return 0;

  // 3. Lo quitado toma el color de un vecino distinto al que tenía (si no, regresaría por la orilla)
  const cola = [];
  for (let t = 0; t < n; t++) if (etiquetas[t] >= 0) cola.push(t);
  for (let i = 0; i < cola.length; i++) {
    const t = cola[i];
    for (let k = 0; k < 3; k++) {
      const o = vec[t * 3 + k];
      if (o >= 0 && etiquetas[o] < 0 && etiquetas[t] !== original[o]) { etiquetas[o] = etiquetas[t]; cola.push(o); }
    }
  }
  // Lo que solo toca su propio color (una pieza entera de un solo color, por ejemplo) se queda como estaba
  for (let t = 0; t < n; t++) if (etiquetas[t] < 0) etiquetas[t] = original[t];
  return quitados;
}

class MontículoMin {
  constructor(capacidad) { this.ids = new Int32Array(capacidad + 1); this.val = new Float32Array(capacidad + 1); this.tamaño = 0; }
  poner(id, v) {
    if (this.tamaño + 1 >= this.ids.length) {   // con entradas repetidas puede crecer de más
      const ids = new Int32Array(this.ids.length * 2); ids.set(this.ids); this.ids = ids;
      const val = new Float32Array(this.val.length * 2); val.set(this.val); this.val = val;
    }
    let i = ++this.tamaño;
    while (i > 1 && this.val[i >> 1] > v) { this.ids[i] = this.ids[i >> 1]; this.val[i] = this.val[i >> 1]; i >>= 1; }
    this.ids[i] = id; this.val[i] = v;
  }
  sacar() {
    const tope = this.ids[1];
    const id = this.ids[this.tamaño], v = this.val[this.tamaño--];
    let i = 1;
    while (i * 2 <= this.tamaño) {
      let h = i * 2;
      if (h < this.tamaño && this.val[h + 1] < this.val[h]) h++;
      if (this.val[h] >= v) break;
      this.ids[i] = this.ids[h]; this.val[i] = this.val[h]; i = h;
    }
    this.ids[i] = id; this.val[i] = v;
    return tope;
  }
}

function contarZonas(etiquetas, vec) {
  const visto = new Uint8Array(etiquetas.length);
  let zonas = 0;
  for (let s = 0; s < etiquetas.length; s++) {
    if (visto[s]) continue;
    zonas++;
    const pila = [s];
    visto[s] = 1;
    while (pila.length) {
      const t = pila.pop();
      for (let k = 0; k < 3; k++) {
        const o = vec[t * 3 + k];
        if (o >= 0 && !visto[o] && etiquetas[o] === etiquetas[s]) { visto[o] = 1; pila.push(o); }
      }
    }
  }
  return zonas;
}

// ---------- Escritura ----------

// Código de pintura de ElegooSlicer/OrcaSlicer para un triángulo entero (sin subdivisión interna)
// pintado con el filamento n (1–16). Verificado: ElegooSlicer conserva 4, 8, 0C y 1C al reabrir.
function codigoPintura(n) {
  if (n === 1) return '4';
  if (n === 2) return '8';
  // 2 bits "sin dividir", 2 bits "11" (estado ≥ 3) y 4 bits con n − 3; se escribe al revés por nibble
  const bits = [0, 0, 1, 1, (n - 3) & 1, ((n - 3) >> 1) & 1, ((n - 3) >> 2) & 1, ((n - 3) >> 3) & 1];
  const nib = (i) => bits[i] | (bits[i + 1] << 1) | (bits[i + 2] << 2) | (bits[i + 3] << 3);
  return (nib(4).toString(16) + nib(0).toString(16)).toUpperCase();
}

// Devuelve el texto del 3dmodel.model en bloques (con millones de triángulos no cabe en una sola
// cadena cómodamente); el ZIP lo arma quien llama (con fflate)
function modelo3MF(malla, etiquetas, nombre, centro = [128, 128]) {
  const p = malla.pos;
  let minX = Infinity, minY = Infinity, minZ = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i < p.length; i += 3) {
    minX = Math.min(minX, p[i]); maxX = Math.max(maxX, p[i]);
    minY = Math.min(minY, p[i + 1]); maxY = Math.max(maxY, p[i + 1]);
    minZ = Math.min(minZ, p[i + 2]);
  }
  // Centrado en la cama y apoyado en z = 0
  const dx = centro[0] - (minX + maxX) / 2, dy = centro[1] - (minY + maxY) / 2, dz = -minZ;
  const num = (v) => String(+v.toFixed(4));
  const bloques = [];
  let partes = [];
  const cerrarBloque = () => { bloques.push(partes.join('')); partes = []; };
  partes.push(
    '<?xml version="1.0" encoding="UTF-8"?>\n',
    '<model unit="millimeter" xml:lang="es-MX" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">\n',
    ' <metadata name="Application">Prismatix pintar.html</metadata>\n',
    ` <resources>\n  <object id="1" name="${nombre.replace(/[<>&"]/g, '')}" type="model">\n   <mesh>\n    <vertices>\n`,
  );
  for (let i = 0; i < p.length; i += 3) {
    partes.push(`<vertex x="${num(p[i])}" y="${num(p[i + 1])}" z="${num(p[i + 2])}"/>\n`);
    if (partes.length >= 50000) cerrarBloque();
  }
  partes.push('    </vertices>\n    <triangles>\n');
  const codigos = [1, 2, 3, 4].map(codigoPintura);
  const t = malla.tri;
  for (let i = 0; i < t.length / 3; i++) {
    partes.push(`<triangle v1="${t[i * 3]}" v2="${t[i * 3 + 1]}" v3="${t[i * 3 + 2]}" paint_color="${codigos[etiquetas[i]]}"/>\n`);
    if (partes.length >= 50000) cerrarBloque();
  }
  partes.push(`    </triangles>\n   </mesh>\n  </object>\n </resources>\n <build>\n  <item objectid="1" transform="1 0 0 0 1 0 0 0 1 ${num(dx)} ${num(dy)} ${num(dz)}"/>\n </build>\n</model>\n`);
  cerrarBloque();
  return bloques;
}

// Une los bloques de texto en un solo Uint8Array para meterlo al ZIP
function bloquesABytes(bloques) {
  const cod = new TextEncoder();
  const partes = bloques.map((b) => cod.encode(b));
  const salida = new Uint8Array(partes.reduce((s, p) => s + p.length, 0));
  let o = 0;
  for (const p of partes) { salida.set(p, o); o += p.length; }
  return salida;
}

const TIPOS_3MF = '<?xml version="1.0" encoding="UTF-8"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>';
const RELS_3MF = '<?xml version="1.0" encoding="UTF-8"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>';

if (typeof module !== 'undefined') {
  module.exports = { levantarYEscalar, vecinos, areasYNormales, suavizar, quitarIslas, abrirZonas, contarZonas, codigoPintura, modelo3MF, bloquesABytes, TIPOS_3MF, RELS_3MF };
}
