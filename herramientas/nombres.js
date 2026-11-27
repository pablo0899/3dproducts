// Figuras con nombre: geometría del nombre y armado del 3MF para ElegooSlicer.
// No depende de la página: usa ClipperLib y earcut globales (cargados con <script>) y recibe la fuente
// ya leída con opentype.js, así que también se puede probar con Node.
//
// Unidades en mm. Cada figura viene de herramientas/figuras (scripts/figuras.py): base y adornos ya
// centrados en X/Y y apoyados en Z=0, y la "zona" donde iba el nombre en el proyecto original.

const ESCALA_CLIPPER = 1000;   // Clipper trabaja con enteros
const TAM_FUENTE = 100;        // el texto se arma a este tamaño y luego se escala a mm

// ── Texto → polígonos (contornos exteriores con sus huecos) ──
function aplanar(path) {
  const contornos = [];
  let actual = null;
  let x = 0, y = 0;
  const punto = (px, py) => { actual.push([px, -py]); x = px; y = py; };  // opentype tiene la Y hacia abajo
  for (const c of path.commands) {
    if (c.type === 'M') {
      if (actual && actual.length > 2) contornos.push(actual);
      actual = [];
      punto(c.x, c.y);
    } else if (c.type === 'L') {
      punto(c.x, c.y);
    } else if (c.type === 'Q') {
      const x0 = x, y0 = y;
      const n = Math.max(4, Math.ceil(Math.hypot(c.x - x0, c.y - y0) / 6));
      for (let i = 1; i <= n; i++) {
        const t = i / n, k = 1 - t;
        punto(k * k * x0 + 2 * k * t * c.x1 + t * t * c.x, k * k * y0 + 2 * k * t * c.y1 + t * t * c.y);
      }
    } else if (c.type === 'C') {
      const x0 = x, y0 = y;
      const n = Math.max(6, Math.ceil(Math.hypot(c.x - x0, c.y - y0) / 5));
      for (let i = 1; i <= n; i++) {
        const t = i / n, k = 1 - t;
        punto(k * k * k * x0 + 3 * k * k * t * c.x1 + 3 * k * t * t * c.x2 + t * t * t * c.x,
          k * k * k * y0 + 3 * k * k * t * c.y1 + 3 * k * t * t * c.y2 + t * t * t * c.y);
      }
    } else if (c.type === 'Z') {
      if (actual && actual.length > 2) contornos.push(actual);
      actual = null;
    }
  }
  if (actual && actual.length > 2) contornos.push(actual);
  return contornos;
}

// Une las letras (en las cursivas se enciman) y separa cada contorno exterior con sus huecos
function unir(contornos) {
  const C = globalThis.ClipperLib;
  const c = new C.Clipper();
  c.StrictlySimple = true;
  c.AddPaths(contornos.map((p) => p.map(([x, y]) => ({ X: Math.round(x * ESCALA_CLIPPER), Y: Math.round(y * ESCALA_CLIPPER) }))), C.PolyType.ptSubject, true);
  const arbol = new C.PolyTree();
  c.Execute(C.ClipType.ctUnion, arbol, C.PolyFillType.pftNonZero, C.PolyFillType.pftNonZero);
  const aFlot = (p) => p.map((v) => [v.X / ESCALA_CLIPPER, v.Y / ESCALA_CLIPPER]);
  const piezas = [];
  const recorrer = (nodo) => {
    for (const hijo of nodo.Childs()) {
      if (hijo.IsHole()) continue;
      piezas.push({ exterior: aFlot(hijo.Contour()), huecos: hijo.Childs().map((h) => aFlot(h.Contour())) });
      for (const h of hijo.Childs()) recorrer(h);   // islas dentro de huecos
    }
  };
  recorrer(arbol);
  return piezas;
}

const area = (p) => { let a = 0; for (let i = 0, j = p.length - 1; i < p.length; j = i++) a += (p[j][0] - p[i][0]) * (p[j][1] + p[i][1]); return a / 2; };
const caja = (piezas) => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const pz of piezas) for (const [x, y] of pz.exterior) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };
};

const cacheTexto = new Map();
function textoEnPiezas(fuente, texto) {
  const llave = fuente.names.fullName?.en + '|' + texto;
  if (!cacheTexto.has(llave)) cacheTexto.set(llave, unir(aplanar(fuente.getPath(texto, 0, 0, TAM_FUENTE))));
  return cacheTexto.get(llave);
}

// ── Acomodar el nombre en la zona de la figura ──
// La altura se toma de la palabra "Name" del proyecto original (misma altura de mayúscula en cualquier
// fuente); si el nombre no cabe a lo ancho, se reduce. Devuelve los polígonos ya en mm.
export function acomodarNombre(fuente, figura, texto, tamano = 1) {
  const z = figura.nombreZona;
  const piezas = textoEnPiezas(fuente, texto.trim());
  if (!piezas.length) return null;
  const ref = caja(textoEnPiezas(fuente, 'Name'));
  const cj = caja(piezas);
  const ideal = (z.alto / ref.h) * tamano;
  const escala = Math.min(ideal, z.anchoMax / cj.w);
  const cx = (cj.x0 + cj.x1) / 2, cy = (ref.y0 + ref.y1) / 2;   // centrado a lo ancho; renglón como "Name"
  const a = (z.angulo * Math.PI) / 180, co = Math.cos(a), si = Math.sin(a);
  const mover = (p) => p.map(([x, y]) => {
    const u = (x - cx) * escala, v = (y - cy) * escala;
    return [z.x + u * co - v * si, z.y + u * si + v * co];
  });
  return {
    piezas: piezas.map((pz) => ({ exterior: mover(pz.exterior), huecos: pz.huecos.map(mover) })),
    escala: escala / ideal,                         // 1 = tamaño completo; menos = se redujo para caber
    alto: (z.alto * escala) / (z.alto / ref.h),     // alto de mayúscula aproximado en mm
    ancho: cj.w * escala,
  };
}

// ── Polígonos → malla cerrada (tapa, fondo y paredes) ──
export function extruir(piezas, z0, z1) {
  const earcut = globalThis.earcut;
  const pos = [];
  const tri = [];
  for (const pz of piezas) {
    const ext = area(pz.exterior) < 0 ? [...pz.exterior].reverse() : pz.exterior;   // exterior antihorario
    const huecos = pz.huecos.map((h) => (area(h) > 0 ? [...h].reverse() : h));     // huecos horario
    const anillos = [ext, ...huecos];
    const plano = [];
    const inicioHuecos = [];
    for (const [i, r] of anillos.entries()) {
      if (i) inicioHuecos.push(plano.length / 2);
      for (const [x, y] of r) plano.push(x, y);
    }
    const base = pos.length / 3;
    const n = plano.length / 2;
    for (let i = 0; i < n; i++) pos.push(plano[2 * i], plano[2 * i + 1], z0);
    for (let i = 0; i < n; i++) pos.push(plano[2 * i], plano[2 * i + 1], z1);
    const t = earcut(plano, inicioHuecos);
    for (let i = 0; i < t.length; i += 3) {
      let [a, b, c] = [t[i], t[i + 1], t[i + 2]];
      const cruz = (plano[2 * b] - plano[2 * a]) * (plano[2 * c + 1] - plano[2 * a + 1]) - (plano[2 * b + 1] - plano[2 * a + 1]) * (plano[2 * c] - plano[2 * a]);
      if (cruz < 0) [b, c] = [c, b];
      tri.push(base + n + a, base + n + b, base + n + c);   // tapa hacia arriba
      tri.push(base + a, base + c, base + b);               // fondo hacia abajo
    }
    let k = 0;
    for (const r of anillos) {
      for (let i = 0; i < r.length; i++) {
        const a = k + i, b = k + ((i + 1) % r.length);
        tri.push(base + a, base + b, base + n + b, base + a, base + n + b, base + n + a);
      }
      k += r.length;
    }
  }
  return { pos: new Float32Array(pos), tri: new Uint32Array(tri) };
}

// Pieza del nombre lista para la figura: relieve sobre la base, o grabado si así venía el original
export function mallaNombre(fuente, figura, texto, tamano = 1) {
  const n = acomodarNombre(fuente, figura, texto, tamano);
  if (!n) return null;
  const grabado = figura.nombreZona.tipo === 'grabado';
  const relieve = figura.altoTotal - figura.altoBase;
  const malla = grabado
    ? extruir(n.piezas, figura.altoTotal - relieve, figura.altoTotal + 0.4)   // se resta: deja ver la base
    : extruir(n.piezas, figura.altoBase, figura.altoTotal);
  return { ...n, ...malla, grabado };
}

// ── Datos de una figura (.bin.gz con base y adornos) ──
export function leerFigura(figura, buffer) {
  let o = 0;
  const tomar = (Tipo, n) => { const a = new Tipo(buffer.slice(o, o + n * 4)); o += n * 4; return a; };
  const base = { pos: tomar(Float32Array, figura.base[0] * 3), tri: tomar(Uint32Array, figura.base[1] * 3) };
  const adornos = { pos: tomar(Float32Array, figura.adornos[0] * 3), tri: tomar(Uint32Array, figura.adornos[1] * 3) };
  return { base, adornos };
}

// ── Acomodo en la cama (Centauri Carbon 2: 256 × 256 mm) por renglones ──
export const CAMA = 256;
export function acomodarEnPlacas(piezas, separacion = 5, orilla = 6) {
  // Cada placa tiene renglones; una figura entra en el primer renglón (de cualquier placa) donde quepa
  const util = CAMA - 2 * orilla;
  const orden = piezas.map((p, i) => ({ ...p, i })).sort((a, b) => b.h - a.h);
  const placas = [];   // { renglones: [{ y, alto, x }], piezas: [] }
  for (const p of orden) {
    if (p.w > util || p.h > util) throw new Error('Una figura no cabe en la cama');
    let lugar = null;
    for (const pl of placas) {
      const r = pl.renglones.find((r) => r.x + p.w <= util && p.h <= r.alto);
      if (r) { lugar = { pl, r }; break; }
      const ultimo = pl.renglones[pl.renglones.length - 1];
      const y = ultimo.y + ultimo.alto + separacion;
      if (y + p.h <= util) {
        const r2 = { y, alto: p.h, x: 0 };
        pl.renglones.push(r2);
        lugar = { pl, r: r2 };
        break;
      }
    }
    if (!lugar) {
      const pl = { renglones: [{ y: 0, alto: p.h, x: 0 }], piezas: [] };
      placas.push(pl);
      lugar = { pl, r: pl.renglones[0] };
    }
    const { pl, r } = lugar;
    pl.piezas.push({ i: p.i, x: orilla + r.x + p.w / 2, y: CAMA - (orilla + r.y + p.h / 2) });
    r.x += p.w + separacion;
  }
  return placas.map((pl) => pl.piezas);
}

// ── 3MF (formato de Bambu/Orca, que lee ElegooSlicer) ──
const xml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);
const ENC = new TextEncoder();
const CAB = '<?xml version="1.0" encoding="UTF-8"?>\n';

// La malla va por bloques para no armar una sola cadena enorme
function mallaXml(id, nombre, m, trozos) {
  trozos.push(ENC.encode(`<object id="${id}" type="model" name="${xml(nombre)}"><mesh><vertices>`));
  const { pos, tri } = m;
  let s = '';
  for (let i = 0; i < pos.length; i += 3) {
    s += `<vertex x="${+pos[i].toFixed(3)}" y="${+pos[i + 1].toFixed(3)}" z="${+pos[i + 2].toFixed(3)}"/>`;
    if (s.length > 1 << 20) { trozos.push(ENC.encode(s)); s = ''; }
  }
  s += '</vertices><triangles>';
  for (let i = 0; i < tri.length; i += 3) {
    s += `<triangle v1="${tri[i]}" v2="${tri[i + 1]}" v3="${tri[i + 2]}"/>`;
    if (s.length > 1 << 20) { trozos.push(ENC.encode(s)); s = ''; }
  }
  trozos.push(ENC.encode(s + '</triangles></mesh></object>'));
}
function juntar(trozos) {
  const total = trozos.reduce((n, t) => n + t.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const t of trozos) { out.set(t, o); o += t.length; }
  return out;
}

// items: [{ titulo, figura (json), datos (leerFigura), nombre (mallaNombre), x, y }]
// Devuelve los archivos del 3MF (para fflate.zip)
export function archivos3MF(items, titulo = 'Figuras con nombre') {
  const archivos = {};
  const objetos = [];
  const config = [];
  const rels = [];
  let id = 1;
  items.forEach((it, k) => {
    const ruta = `3D/Objects/object_${k + 1}.model`;
    const trozos = [ENC.encode(CAB + '<model unit="millimeter" xml:lang="es-MX" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"><resources>')];
    // Las figuras lisas (suéter liso) no traen relieve: esa parte no se escribe, una malla vacía estorba al slicer
    const conAdornos = it.datos.adornos.tri.length > 0;
    const idBase = id++, idAdornos = conAdornos ? id++ : null, idNombre = it.nombre ? id++ : null;
    mallaXml(idBase, 'Base', it.datos.base, trozos);
    if (conAdornos) mallaXml(idAdornos, 'Glaseado', it.datos.adornos, trozos);
    if (idNombre) mallaXml(idNombre, 'Nombre', it.nombre, trozos);
    trozos.push(ENC.encode('</resources></model>'));
    archivos[ruta] = juntar(trozos);
    rels.push(`<Relationship Target="/${ruta}" Id="rel${k + 1}" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>`);

    const idObj = id++;
    const I = '1 0 0 0 1 0 0 0 1 0 0 0';
    const comp = (pid) => `<component p:path="/${ruta}" objectid="${pid}" transform="${I}"/>`;
    objetos.push({
      def: `<object id="${idObj}" type="model" name="${xml(it.titulo)}"><components>${comp(idBase)}${idAdornos ? comp(idAdornos) : ''}${idNombre ? comp(idNombre) : ''}</components></object>`,
      item: `<item objectid="${idObj}" transform="1 0 0 0 1 0 0 0 1 ${it.x.toFixed(3)} ${it.y.toFixed(3)} 0" printable="1"/>`,
    });
    const parte = (pid, nombre, ext, tipo = 'normal_part') =>
      `<part id="${pid}" subtype="${tipo}"><metadata key="name" value="${xml(nombre)}"/><metadata key="extruder" value="${ext}"/></part>`;
    config.push(`<object id="${idObj}"><metadata key="name" value="${xml(it.titulo)}"/><metadata key="extruder" value="1"/>` +
      parte(idBase, 'Base', 1) + (idAdornos ? parte(idAdornos, 'Glaseado', 2) : '') +
      (idNombre ? (it.nombre.grabado ? parte(idNombre, 'Nombre (grabado)', 1, 'negative_part') : parte(idNombre, 'Nombre', 2)) : '') +
      '</object>');
  });

  archivos['[Content_Types].xml'] = ENC.encode(CAB + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/><Default Extension="config" ContentType="application/xml"/><Default Extension="txt" ContentType="text/plain"/></Types>');
  archivos['_rels/.rels'] = ENC.encode(CAB + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>');
  archivos['3D/_rels/3dmodel.model.rels'] = ENC.encode(CAB + `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rels.join('')}</Relationships>`);
  // "Application" de Bambu: así ElegooSlicer (basado en Orca) lee las partes y su filamento de model_settings.config
  archivos['3D/3dmodel.model'] = ENC.encode(CAB + '<model unit="millimeter" xml:lang="es-MX" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02" xmlns:p="http://schemas.microsoft.com/3dmanufacturing/production/2015/06" requiredextensions="p">' +
    `<metadata name="Application">BambuStudio-02.04.00.00</metadata><metadata name="BambuStudio:3mfVersion">1</metadata><metadata name="Title">${xml(titulo)}</metadata>` +
    `<resources>${objetos.map((o) => o.def).join('')}</resources><build>${objetos.map((o) => o.item).join('')}</build></model>`);
  archivos['Metadata/model_settings.config'] = ENC.encode(CAB + `<config>${config.join('')}</config>`);
  archivos['Metadata/LEEME.txt'] = ENC.encode(`${titulo}\n\nFilamento 1: base (galleta).\nFilamento 2: glaseado y nombre.\nCama de 256 × 256 mm (Centauri Carbon 2). Revisa las asignaciones en "Objetos" antes de laminar.\n`);
  return archivos;
}
