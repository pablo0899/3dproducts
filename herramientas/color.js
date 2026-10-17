// Cálculos de color de pintar.html: tus filamentos, Lab, ΔE2000, k-means y la sugerencia por familias.
// Script clásico (no módulo) para que funcione abriendo el HTML directo desde el disco.

const CLAVE_FILAMENTOS = 'prismatix-filamentos-v2';

// Los filamentos del usuario (todos ELEGOO, compras de sep–oct 2026). ELEGOO no publica códigos de
// color: los hex son estimados de fotos de producto. Se dejaron fuera el ABS Rosa (no se combina
// con PLA en una misma pieza) y el PLA Silk de 4 bobinas (colores sin confirmar).
const FILAMENTOS_BASE = [
  { nombre: 'Negro', hex: '#1C1C1C', fijo: false },
  { nombre: 'Blanco (PLA+)', hex: '#F2F2EF', fijo: false },
  { nombre: 'Marrón', hex: '#8A5A3C', fijo: false },
  { nombre: 'Beige', hex: '#E6D2AE', fijo: false },
  { nombre: 'Madera (PLA+)', hex: '#A9845A', fijo: false },
  { nombre: 'Nogal', hex: '#5A3A28', fijo: false },
  { nombre: 'Mármol', hex: '#C9C7C2', fijo: false },
  { nombre: 'Rosa mate', hex: '#F2B2C0', fijo: false },
  { nombre: 'Amarillo mate', hex: '#F2D46B', fijo: false },
  { nombre: 'Azul hielo mate', hex: '#A9CFE0', fijo: false },
  { nombre: 'Morado mate', hex: '#9C83C2', fijo: false },
  { nombre: 'Naranja (PLA+)', hex: '#F07A1E', fijo: false },
  { nombre: 'Amarillo (PLA+)', hex: '#F7D117', fijo: false },
  { nombre: 'Verde (PLA+)', hex: '#2E9E4A', fijo: false },
  { nombre: 'Azul (PLA+)', hex: '#1F5FB0', fijo: false },
];

function leerFilamentos() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_FILAMENTOS));
    if (Array.isArray(guardado) && guardado.length) return guardado;
  } catch {}
  return FILAMENTOS_BASE.map((f) => ({ ...f }));
}

function guardarFilamentos(lista) {
  try { localStorage.setItem(CLAVE_FILAMENTOS, JSON.stringify(lista)); } catch {}
}

function hexARgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbAHex(r, g, b) {
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
}

function rgbALab([r, g, b]) {
  const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const R = lin(r), G = lin(g), B = lin(b);
  const x = (R * 0.4124564 + G * 0.3575761 + B * 0.1804375) / 0.95047;
  const y = R * 0.2126729 + G * 0.7151522 + B * 0.0721750;
  const z = (R * 0.0193339 + G * 0.1191920 + B * 0.9503041) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(x), fy = f(y), fz = f(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

function labARgb([L, a, b]) {
  const fy = (L + 16) / 116, fx = fy + a / 500, fz = fy - b / 200;
  const inv = (t) => (t > 0.206893 ? t * t * t : (t - 16 / 116) / 7.787);
  const x = inv(fx) * 0.95047, y = inv(fy), z = inv(fz) * 1.08883;
  const R = x * 3.2404542 - y * 1.5371385 - z * 0.4985314;
  const G = -x * 0.9692660 + y * 1.8760108 + z * 0.0415560;
  const B = x * 0.0556434 - y * 0.2040259 + z * 1.0572252;
  const srgb = (v) => 255 * Math.min(1, Math.max(0, v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055));
  return [srgb(R), srgb(G), srgb(B)];
}

// CIEDE2000: diferencia de color como la percibe el ojo (~1 = apenas se nota)
function deltaE([L1, a1, b1], [L2, a2, b2]) {
  const rad = Math.PI / 180;
  const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), Cm = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cm ** 7 / (Cm ** 7 + 25 ** 7)));
  const a1p = a1 * (1 + G), a2p = a2 * (1 + G);
  const C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2);
  const tono = (b, a) => { if (a === 0 && b === 0) return 0; const t = Math.atan2(b, a) / rad; return t < 0 ? t + 360 : t; };
  const h1p = tono(b1, a1p), h2p = tono(b2, a2p);
  const dLp = L2 - L1, dCp = C2p - C1p;
  let dhp = 0;
  if (C1p * C2p !== 0) { dhp = h2p - h1p; if (dhp > 180) dhp -= 360; else if (dhp < -180) dhp += 360; }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp / 2) * rad);
  const Lm = (L1 + L2) / 2, Cmp = (C1p + C2p) / 2;
  let hm = h1p + h2p;
  if (C1p * C2p !== 0) { if (Math.abs(h1p - h2p) > 180) hm += hm < 360 ? 360 : -360; hm /= 2; }
  const T = 1 - 0.17 * Math.cos((hm - 30) * rad) + 0.24 * Math.cos(2 * hm * rad)
    + 0.32 * Math.cos((3 * hm + 6) * rad) - 0.20 * Math.cos((4 * hm - 63) * rad);
  const dTheta = 30 * Math.exp(-(((hm - 275) / 25) ** 2));
  const RC = 2 * Math.sqrt(Cmp ** 7 / (Cmp ** 7 + 25 ** 7));
  const SL = 1 + (0.015 * (Lm - 50) ** 2) / Math.sqrt(20 + (Lm - 50) ** 2);
  const SC = 1 + 0.045 * Cmp, SH = 1 + 0.015 * Cmp * T;
  const RT = -Math.sin(2 * dTheta * rad) * RC;
  return Math.sqrt((dLp / SL) ** 2 + (dCp / SC) ** 2 + (dHp / SH) ** 2 + RT * (dCp / SC) * (dHp / SH));
}

// k-means en Lab. puntos: [{ rgb, lab }]. Devuelve grupos ordenados por peso.
function kmeans(puntos, k, minPeso = 0.005) {
  let semilla = 7;
  const azar = () => ((semilla = (semilla * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;

  // k-means++: centros iniciales separados entre sí
  const centros = [puntos[Math.floor(azar() * puntos.length)].lab.slice()];
  const dist = new Float64Array(puntos.length);
  while (centros.length < k) {
    let total = 0;
    puntos.forEach((p, i) => { dist[i] = Math.min(...centros.map((c) => d2(p.lab, c))); total += dist[i]; });
    if (total === 0) break;
    let r = azar() * total, i = 0;
    while (r > dist[i] && i < puntos.length - 1) { r -= dist[i]; i++; }
    centros.push(puntos[i].lab.slice());
  }

  const grupo = new Int32Array(puntos.length);
  for (let vuelta = 0; vuelta < 25; vuelta++) {
    let cambios = 0;
    puntos.forEach((p, i) => {
      let mejor = 0, md = Infinity;
      centros.forEach((c, j) => { const d = d2(p.lab, c); if (d < md) { md = d; mejor = j; } });
      if (grupo[i] !== mejor) { grupo[i] = mejor; cambios++; }
    });
    const sumas = centros.map(() => [0, 0, 0, 0]);
    puntos.forEach((p, i) => { const s = sumas[grupo[i]]; s[0] += p.lab[0]; s[1] += p.lab[1]; s[2] += p.lab[2]; s[3]++; });
    sumas.forEach((s, j) => { if (s[3]) centros[j] = [s[0] / s[3], s[1] / s[3], s[2] / s[3]]; });
    if (vuelta > 0 && cambios === 0) break;
  }

  // El color que se muestra es el promedio RGB del grupo
  const acum = centros.map(() => [0, 0, 0, 0]);
  puntos.forEach((p, i) => { const a = acum[grupo[i]]; a[0] += p.rgb[0]; a[1] += p.rgb[1]; a[2] += p.rgb[2]; a[3]++; });
  return acum
    .filter((a) => a[3] / puntos.length >= minPeso)
    .map((a) => {
      const rgb = [a[0] / a[3], a[1] / a[3], a[2] / a[3]];
      return { hex: rgbAHex(...rgb), lab: rgbALab(rgb), peso: a[3] / puntos.length, ignorado: false, manual: false };
    })
    .sort((a, b) => b.peso - a.peso);
}

// ---------- Familias de color (modelos con textura) ----------
// Una textura de IA trae luz y sombra horneadas: el mismo pelaje sale en varios tonos y el negro
// puede salir más claro que un café en sombra. Lo que sí se conserva es la saturación (qué tan
// "de color" es respecto a lo claro que es) y el tono. Se agrupa por eso y se elige un filamento
// por familia: lo neutro oscuro al filamento neutro más oscuro, lo neutro claro al más claro, y
// cada familia de color al filamento más parecido a su parte bien iluminada.

function saturacion(lab) { return Math.hypot(lab[1], lab[2]) / Math.max(lab[0], 1); }
function tono(lab) { return (Math.atan2(lab[2], lab[1]) * 180) / Math.PI; }
function difTono(a, b) { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; }
const NEUTRO = 0.25;

// grupos: [{ lab, labComparar?, peso }]. Devuelve { ranuras: índices del inventario, asignacion: ranura por grupo }
function sugerirPorFamilias(grupos, inventario, maxRanuras) {
  const labG = grupos.map((g) => g.labComparar || g.lab);
  const familias = [];
  const neutros = [];
  grupos.forEach((g, i) => {
    if (saturacion(g.lab) < NEUTRO) { neutros.push(i); return; }
    const f = familias.find((f) => f.tipo === 'color' && f.miembros.some((j) => difTono(tono(grupos[j].lab), tono(g.lab)) < 35));
    if (f) f.miembros.push(i); else familias.push({ tipo: 'color', miembros: [i] });
  });
  // Neutros: se parten en oscuro / claro donde está el salto de claridad más grande
  neutros.sort((a, b) => grupos[a].lab[0] - grupos[b].lab[0]);
  let corte = -1, salto = 20;
  for (let k = 1; k < neutros.length; k++) {
    const d = grupos[neutros[k]].lab[0] - grupos[neutros[k - 1]].lab[0];
    if (d > salto) { salto = d; corte = k; }
  }
  if (corte > 0) {
    familias.push({ tipo: 'oscuro', miembros: neutros.slice(0, corte) }, { tipo: 'claro', miembros: neutros.slice(corte) });
  } else if (neutros.length) familias.push({ tipo: 'neutro', miembros: neutros });

  const labF = inventario.map((f) => rgbALab(hexARgb(f.hex)));
  const filNeutros = labF.map((l, j) => j).filter((j) => saturacion(labF[j]) < NEUTRO);
  const filColor = labF.map((l, j) => j).filter((j) => saturacion(labF[j]) >= NEUTRO);
  const cercano = (lab, opciones) => {
    let mejor = opciones[0], min = Infinity;
    for (const j of opciones) { const d = deltaE(lab, labF[j]); if (d < min) { min = d; mejor = j; } }
    return mejor;
  };
  // La parte bien iluminada de una familia: el tono en el percentil 75 de claridad, por área
  const representante = (miembros) => {
    const orden = [...miembros].sort((a, b) => grupos[a].lab[0] - grupos[b].lab[0]);
    const total = orden.reduce((s, i) => s + grupos[i].peso, 0);
    let acum = 0;
    for (const i of orden) { acum += grupos[i].peso; if (acum >= total * 0.75) return labG[i]; }
    return labG[orden[orden.length - 1]];
  };
  const todos = labF.map((l, j) => j);
  for (const f of familias) {
    f.peso = f.miembros.reduce((s, i) => s + grupos[i].peso, 0);
    const extremo = (signo) => filNeutros.reduce((m, j) => (m < 0 || signo * (labF[j][0] - labF[m][0]) > 0 ? j : m), -1);
    if (f.tipo === 'oscuro' && filNeutros.length) f.filamento = extremo(-1);
    else if (f.tipo === 'claro' && filNeutros.length) f.filamento = extremo(1);
    else if (f.tipo === 'color') f.filamento = cercano(representante(f.miembros), filColor.length ? filColor : todos);
    else f.filamento = cercano(representante(f.miembros), filNeutros.length ? filNeutros : todos);
  }

  // Ranuras: un filamento por familia (las más grandes primero) y luego los marcados como "siempre"
  familias.sort((a, b) => b.peso - a.peso);
  const ranuras = [];
  for (const f of familias) if (!ranuras.includes(f.filamento)) ranuras.push(f.filamento);
  const fijos = inventario.map((f, j) => (f.fijo ? j : -1)).filter((j) => j >= 0 && !ranuras.includes(j));
  // Los fijos tienen prioridad sobre las familias más chicas
  while (ranuras.length + fijos.length > maxRanuras && ranuras.length > Math.max(1, maxRanuras - fijos.length)) ranuras.pop();
  for (const j of fijos) if (ranuras.length < maxRanuras) ranuras.push(j);

  const asignacion = new Array(grupos.length);
  for (const f of familias) {
    for (const i of f.miembros) {
      const s = ranuras.indexOf(f.filamento);
      asignacion[i] = s >= 0 ? s : ranuras.indexOf(cercano(labG[i], ranuras));
    }
  }
  return { ranuras, asignacion };
}
