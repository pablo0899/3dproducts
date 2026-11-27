"""Extrae las figuras de un 3MF de Bambu Studio para la pestaña "Nombres" del taller.

Uso: python scripts/figuras.py herramientas/figuras "<proyecto.3mf>" ["<otro.3mf>" ...]

Acepta dos tipos de 3MF: proyectos de Bambu Studio con varias figuras (las etiquetas de Dave W) y el
adorno que descarga el sitio del suéter (Weltika), donde el nombre viene pegado al relieve.

Cada objeto del proyecto es una figura con tres tipos de parte:
  - la base (un color),
  - los adornos en relieve (otro color),
  - una parte de texto de Bambu ("Name"): solo se usa para saber dónde y de qué tamaño va el nombre.

Por figura escribe <id>.bin.gz (base y adornos: Float32 posiciones + Uint32 triángulos, ya en mm, centrada
en X/Y y apoyada en Z=0) y <id>.png (vista de arriba para elegirla). Todo lo demás va en figuras.json.

Los modelos de Dave W ("22 customisable Christmas gift tags", MakerWorld) tienen licencia; la carpeta de
salida está en .gitignore y no se sube al repositorio público. Se publica solo en la herramienta (con
contraseña) al desplegarla desde esta PC.
"""
import gzip
import json
import math
import re
import sys
import zipfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

# Nombres en español y orden en que aparecen en la herramienta
NOMBRES = {
    'Standard gift tag': 'Etiqueta clásica', 'Round gift tag': 'Etiqueta redonda', 'Christmas Tree': 'Árbol',
    'Star': 'Estrella', 'Gingerbread Man': 'Hombre de jengibre', 'Gingerbread House': 'Casita de jengibre',
    'Snowman': 'Muñeco de nieve', 'Reindeer': 'Reno', 'Bear': 'Osito', 'Stocking': 'Bota navideña',
    'Santas sack': 'Costal de Santa', 'Santa Hat': 'Gorro de Santa', 'Bell': 'Campana', 'Xmas Pud': 'Pudín navideño',
    'Snow Globe': 'Esfera de nieve', 'Christmas Candle': 'Vela', 'Christmas Angel': 'Ángel', 'Mittten': 'Guante',
    'Candy Cane': 'Bastón de caramelo', 'Rocking Horse': 'Caballito', 'Sleigh': 'Trineo', 'Train': 'Tren',
}
RES = 0.1        # mm por pixel para medir el espacio libre del nombre
MARGEN = 1.6     # mm libres entre el nombre y la orilla de la base
HOLGURA = 0.9    # mm libres entre el nombre y los adornos
REJILLA = 0.1    # mm: los vértices más cercanos que esto se juntan (la boquilla de 0.4 mm no lo nota)


def slug(t):
    return re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')


def matriz(t):
    """Transform de 3MF (12 números, vector fila) → (A 3x3, b)."""
    v = [float(x) for x in t.split()]
    return np.array(v[:9]).reshape(3, 3), np.array(v[9:12])


def mallas(texto):
    """{objectid: (verts Nx3, tris Mx3)} de un archivo .model."""
    salida = {}
    for m in re.finditer(r'<object id="(\d+)"[^>]*>\s*<mesh>(.*?)</mesh>', texto, re.S):
        cuerpo = m.group(2)
        vs = np.array(re.findall(r'<vertex x="([^"]+)" y="([^"]+)" z="([^"]+)"', cuerpo), dtype=np.float64)
        ts = np.array(re.findall(r'<triangle v1="(\d+)" v2="(\d+)" v3="(\d+)"', cuerpo), dtype=np.int64)
        salida[m.group(1)] = (vs, ts)
    return salida


def juntar(partes):
    vs, ts, n = [], [], 0
    for v, t in partes:
        vs.append(v)
        ts.append(t + n)
        n += len(v)
    return np.concatenate(vs), np.concatenate(ts)


def simplificar(v, t, g=REJILLA):
    """Junta los vértices que caen en la misma celda de g mm y quita los triángulos que se aplanan.
    Las mallas vienen de un STEP con curvas muy finas (hasta 470 mil triángulos por figura); así bajan
    a ~1/3 sin cambio visible, y el 3MF de una placa completa no pesa cientos de MB."""
    k = np.round(v / g).astype(np.int64)
    _, inv = np.unique(k, axis=0, return_inverse=True)
    inv = inv.ravel()
    n = inv.max() + 1
    nv = np.zeros((n, 3))
    np.add.at(nv, inv, v)
    nv /= np.bincount(inv, minlength=n)[:, None]
    t2 = inv[t]
    t2 = t2[(t2[:, 0] != t2[:, 1]) & (t2[:, 1] != t2[:, 2]) & (t2[:, 0] != t2[:, 2])]
    _, idx = np.unique(np.sort(t2, axis=1), axis=0, return_index=True)
    t2 = t2[np.sort(idx)]
    usados = np.unique(t2)
    mapa = -np.ones(n, np.int64)
    mapa[usados] = np.arange(len(usados))
    return nv[usados], mapa[t2]


def mascara(v, t, x0, y0, w, h):
    img = Image.new('L', (w, h), 0)
    d = ImageDraw.Draw(img)
    px = (v[:, 0] - x0) / RES
    py = (v[:, 1] - y0) / RES
    for a, b, c in t:
        d.polygon([(px[a], py[a]), (px[b], py[b]), (px[c], py[c])], fill=255)
    return img


GALLETA = ((186, 125, 74), (255, 248, 238))   # colores de la miniatura y la vista previa


def leer_bambu(z):
    """Proyecto de Bambu Studio con varias figuras (las etiquetas de Dave W): base, adornos y una parte
    de texto de Bambu que marca dónde va el nombre."""
    modelo = z.read('3D/3dmodel.model').decode('utf-8')
    ajustes = z.read('Metadata/model_settings.config').decode('utf-8')
    items = {m.group(1): matriz(m.group(2))[0] for m in re.finditer(r'<item objectid="(\d+)"[^>]*transform="([^"]+)"', modelo)}
    config = {oid: cuerpo for oid, cuerpo in re.findall(r'<object id="(\d+)">(.*?)</object>', ajustes, re.S)}
    cache = {}
    for oid, comps in re.findall(r'<object id="(\d+)"[^>]*>\s*<components>(.*?)</components>', modelo, re.S):
        cfg = config[oid]
        nombre_en = re.sub(r'\s+v\d.*$', '', re.search(r'key="name" value="([^"]*)"', cfg).group(1)).strip()
        ext_obj = re.search(r'key="extruder" value="(\d+)"', cfg).group(1)
        partes = {}
        for pid, sub, cuerpo in re.findall(r'<part id="(\d+)" subtype="(\w+)"[^>]*>(.*?)</part>', cfg, re.S):
            e = re.search(r'key="extruder" value="(\d+)"', cuerpo)
            partes[pid] = (sub, e.group(1) if e else ext_obj, 'text_info' in cuerpo)
        rot = items[oid]  # el giro con que el autor acomodó la figura en la cama
        base, adornos, texto, tipo_texto = [], [], None, 'relieve'
        for ruta, sid, tr in re.findall(r'p:path="([^"]+)" objectid="(\d+)"[^>]*transform="([^"]+)"', comps):
            if ruta not in cache:
                cache[ruta] = mallas(z.read(ruta.lstrip('/')).decode('utf-8'))
            v, t = cache[ruta][sid]
            A, b = matriz(tr)
            v = (v @ A + b) @ rot
            sub, ext, es_texto = partes[sid]
            if es_texto:
                texto = v
                tipo_texto = 'grabado' if sub == 'negative_part' else 'relieve'
            elif sub == 'normal_part' and ext == ext_obj:
                base.append((v, t))
            elif sub == 'normal_part':
                adornos.append((v, t))
        yield {
            'original': nombre_en, 'nombre': NOMBRES.get(nombre_en, nombre_en), 'base': juntar(base), 'adornos': juntar(adornos),
            'texto': texto, 'tipo': tipo_texto, 'colores': GALLETA,
            'origen': 'Dave W · 22 customisable Christmas gift tags (MakerWorld). Uso comercial con licencia.',
        }


def piezas_sueltas(v, t):
    """Separa una malla en sus piezas (triángulos conectados por vértices)."""
    padre = np.arange(len(v))

    def raiz(a):
        while padre[a] != a:
            padre[a] = padre[padre[a]]
            a = padre[a]
        return a
    for a, b, c in t:
        ra = raiz(a)
        padre[raiz(b)] = ra
        padre[raiz(c)] = ra
    r = np.array([raiz(i) for i in range(len(v))])
    grupos = {}
    for k, (a, _, _) in enumerate(t):
        grupos.setdefault(r[a], []).append(k)
    return [np.array(g) for g in grupos.values()]


def leer_weltika(z, archivo):
    """Adorno del sitio del suéter (un objeto: "Base" y "Relieve y nombre"). El nombre viene pegado al
    relieve: son las piezas sueltas del centro (las letras); se quitan y su lugar es la zona del nombre."""
    leeme = z.read('Metadata/LEEME.txt').decode('utf-8')
    hex_ = re.findall(r'#([0-9a-fA-F]{6})', leeme)
    colores = tuple(tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) for h in hex_[:2]) if len(hex_) >= 2 else GALLETA
    ancho = re.search(r'(\d+)\s*mm', Path(archivo).name)
    bv, bt = mallas(z.read('3D/Objects/object_1.model').decode('utf-8'))['1']
    rv, rt = mallas(z.read('3D/Objects/object_2.model').decode('utf-8'))['2']
    medida = bv[:, 0].max() - bv[:, 0].min()
    letras, resto = [], []
    for g in piezas_sueltas(rv, rt):
        p = rv[np.unique(rt[g])]
        cx, cy = (p[:, 0].min() + p[:, 0].max()) / 2, (p[:, 1].min() + p[:, 1].max()) / 2
        tam = max(p[:, 0].max() - p[:, 0].min(), p[:, 1].max() - p[:, 1].min())
        # Letras: piezas chicas en la franja central del cuerpo (ni en las mangas ni en las cenefas)
        if abs(cx) < medida * 0.2 and -0.16 * medida < cy < 0.02 * medida and tam < 0.18 * medida:
            letras.append(g)
        else:
            resto.append(g)
    texto = rv[np.unique(rt[np.concatenate(letras)])]
    print(f'  suéter: {len(letras)} piezas de letras quitadas del relieve')
    origen = 'Weltika (sueter-navidad.pages.dev). Sin licencia publicada: pedir permiso antes de vender.'
    medida_txt = ancho.group(1) + ' mm' if ancho else ''
    # Versión lisa (pedido del usuario): conserva lo que es igual en todos los tejidos del sitio (orilla,
    # cuello, cenefas, resorte, franjas y puños de las mangas con su fila de corazones) y quita solo los
    # motivos que cambian con el tejido, para ponerle el diseño a mano en el slicer.
    # El sitio dibuja en un lienzo de 100 unidades de ancho y lo pasa a mm con (x-50)·k, (48-y)·k, k = ancho/100.
    # Lugares de los motivos que cambian (geometry.js del sitio, makeModel y sleeves):
    def manga(u, v):
        return (82 + .905 * u + .426 * v, 52 - .426 * u + .905 * v)
    motivos = [((37, 38), 7.5), ((63, 38), 7.5), ((50, 37), 5)]                     # pecho: renos/corazones/huellas y el centro
    motivos += [((x, 74), 5.5) for x in (34, 44.7, 55.4, 66.1)]                     # fila de abajo
    motivos += [((30.25 + 10.7 * i + 3.75, 76), 6) for i in range(4)]               # fila de abajo del tejido Cachorro
    motivos += [(manga(0, -2), 7), (manga(-5.1, 16.5), 4.5), (manga(1.7, 16.5), 4.5)]   # mangas (derecha)
    motivos += [((100 - x, y), r) for (x, y), r in motivos if x > 70]               # y su reflejo (izquierda)
    k = (int(ancho.group(1)) if ancho else medida) / 100   # las coordenadas del archivo son las del sitio ya escaladas
    centros = np.array([[(x - 50) * k, (48 - y) * k] for (x, y), _ in motivos])
    radios = np.array([r * k for _, r in motivos])
    # Las bolitas de las dos cenefas del pecho son fijas aunque queden cerca de un motivo
    t_ = np.linspace(0, 1, 300)[:, None]
    cenefas = np.concatenate([(1 - t_) ** 2 * np.array(a) + 2 * (1 - t_) * t_ * np.array(c) + t_ ** 2 * np.array(b)
                              for a, c, b in (((20, 39), (50, 51), (80, 39)), ((29, 65), (50, 67), (71, 65)))])
    cenefas = np.column_stack([(cenefas[:, 0] - 50) * k, (48 - cenefas[:, 1]) * k])
    fijas, quitadas = [], 0
    for g in resto:
        q = rv[np.unique(rt[g])]
        c = np.array([(q[:, 0].min() + q[:, 0].max()) / 2, (q[:, 1].min() + q[:, 1].max()) / 2])
        en_cenefa = np.hypot(*(cenefas - c).T).min() < 2.2 * k
        if not en_cenefa and (np.hypot(*(centros - c).T) < radios).any():
            quitadas += 1
        else:
            fijas.append(g)
    print(f'  suéter liso: {quitadas} piezas de motivos quitadas, {len(fijas)} fijas')
    yield {
        'original': 'Sweater plain ' + medida_txt, 'nombre': 'Suéter liso',
        'base': (bv, bt), 'adornos': (rv, rt[np.concatenate(fijas)]), 'texto': texto, 'tipo': 'relieve',
        'colores': colores, 'origen': origen,
    }
    yield {
        'original': 'Sweater ' + (ancho.group(1) + ' mm' if ancho else ''), 'nombre': 'Suéter navideño',
        'base': (bv, bt), 'adornos': (rv, rt[np.concatenate(resto)]), 'texto': texto, 'tipo': 'relieve', 'colores': colores,
        'origen': 'Weltika (sueter-navidad.pages.dev). Sin licencia publicada: pedir permiso antes de vender.',
    }


def main(destino, *origenes):
    destino = Path(destino)
    destino.mkdir(parents=True, exist_ok=True)
    figuras = []
    for origen in origenes:
        z = zipfile.ZipFile(origen)
        nombres = z.namelist()
        es_weltika = 'Metadata/LEEME.txt' in nombres and 'WELTIKA' in z.read('Metadata/LEEME.txt').decode('utf-8', 'ignore').upper()
        for fig in (leer_weltika(z, origen) if es_weltika else leer_bambu(z)):
            figuras.append(procesar(fig, destino))
    orden = list(NOMBRES)
    # Primero los suéteres (el navideño y luego el liso), después las etiquetas en el orden de NOMBRES
    figuras.sort(key=lambda f: orden.index(f['original']) if f['original'] in orden else (-1 if 'plain' in f['original'] else -2))
    (destino / 'figuras.json').write_text(json.dumps({'figuras': figuras}, ensure_ascii=False, indent=1), encoding='utf-8')


def procesar(fig, destino):
    nombre_en = fig['original']
    bv, bt = fig['base']
    av, at = fig['adornos']
    texto, tipo_texto = fig['texto'], fig['tipo']
    # Centrar en X/Y y apoyar en la cama
    lo, hi = bv.min(0), bv.max(0)
    centro = np.array([(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, lo[2]])
    bv, av, texto = bv - centro, av - centro, texto - centro
    bv, bt = simplificar(bv, bt)
    alto_base = float(np.percentile(bv[:, 2], 99.5))
    if len(at):
        av, at = simplificar(av, at)
        alto_total = float(av[:, 2].max())
    else:   # figura lisa: solo base y nombre; el nombre sube lo mismo que el relieve del original
        alto_total = alto_base + fig['relieve']

    # Zona del nombre: el eje del texto sale de su malla (la parte "Name" de Bambu)
    tc = texto[:, :2]
    mejor = None
    for g in range(0, 180, 1):  # el ángulo con la caja más chica es el del texto
        a = math.radians(g)
        u = tc @ np.array([math.cos(a), math.sin(a)])
        w = tc @ np.array([-math.sin(a), math.cos(a)])
        area = (u.max() - u.min()) * (w.max() - w.min())
        if mejor is None or area < mejor[0] - 1e-6:
            mejor = (area, g, u, w)
    _, ang, u, w = mejor
    if u.max() - u.min() < w.max() - w.min():  # el lado largo es el ancho del texto
        ang = (ang + 90) % 180
        a = math.radians(ang)
        u = tc @ np.array([math.cos(a), math.sin(a)])
        w = tc @ np.array([-math.sin(a), math.cos(a)])
    if ang > 90:
        ang -= 180  # que se lea de izquierda a derecha o de abajo hacia arriba
    a = math.radians(ang)
    eu, ev = np.array([math.cos(a), math.sin(a)]), np.array([-math.sin(a), math.cos(a)])
    u, w = tc @ eu, tc @ ev
    cu, cv = (u.max() + u.min()) / 2, (w.max() + w.min()) / 2
    cx, cy = cu * eu + cv * ev
    alto_nombre = float(w.max() - w.min())

    # Espacio libre a lo largo del renglón: base (sin la orilla) menos adornos (con holgura)
    lo, hi = bv.min(0) - 2, bv.max(0) + 2
    W, H = int((hi[0] - lo[0]) / RES) + 1, int((hi[1] - lo[1]) / RES) + 1
    mb = mascara(bv, bt, lo[0], lo[1], W, H).filter(ImageFilter.MinFilter(2 * round(MARGEN / RES) + 1))
    ma = mascara(av, at, lo[0], lo[1], W, H).filter(ImageFilter.MaxFilter(2 * round(HOLGURA / RES) + 1))
    if tipo_texto == 'grabado':
        # El nombre se graba en una franja de adorno (gorro de Santa): el espacio libre es esa franja
        mf = mascara(av, at, lo[0], lo[1], W, H).filter(ImageFilter.MinFilter(2 * round(MARGEN / RES) + 1))
        libre = np.array(mf) > 0
    else:
        libre = (np.array(mb) > 0) & ~(np.array(ma) > 0)

    def libre_en(p):
        i, j = int((p[1] - lo[1]) / RES), int((p[0] - lo[0]) / RES)
        return 0 <= i < H and 0 <= j < W and libre[i, j]

    def alcance(signo, alto):
        paso, d = RES, 0.0
        while d < 200:
            for f in np.linspace(-alto / 2, alto / 2, 9):
                if not libre_en(np.array([cx, cy]) + eu * (d * signo) + ev * f):
                    return d
            d += paso
        return d
    ancho_max = 2 * min(alcance(1, alto_nombre * 0.8), alcance(-1, alto_nombre * 0.8))

    fid = slug(nombre_en)
    ficha = {
        'id': fid,
        'nombre': fig['nombre'],
        'original': nombre_en,
        'tamano': [round(float(bv[:, 0].max() - bv[:, 0].min()), 1), round(float(bv[:, 1].max() - bv[:, 1].min()), 1)],
        'altoBase': round(alto_base, 3),
        'altoTotal': round(alto_total, 3),
        'nombreZona': {
            'x': round(float(cx), 3), 'y': round(float(cy), 3), 'angulo': round(ang, 2),
            'alto': round(alto_nombre, 2), 'anchoMax': round(float(ancho_max), 2), 'tipo': tipo_texto,
        },
        'base': [len(bv), len(bt)],
        'adornos': [len(av), len(at)],
        'colores': ['#%02x%02x%02x' % c for c in fig['colores']],
        'origen': fig['origen'],
    }

    datos = b''.join([
        bv.astype('<f4').tobytes(), bt.astype('<u4').tobytes(),
        av.astype('<f4').tobytes(), at.astype('<u4').tobytes(),
    ])
    (destino / f'{fid}.bin.gz').write_bytes(gzip.compress(datos, 9))

    # Vista de arriba para el selector
    lado = 240
    esc = (lado - 16) / max(hi[0] - lo[0], hi[1] - lo[1])
    img = Image.new('RGBA', (lado, lado), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    ox = lado / 2 - (lo[0] + hi[0]) / 2 * esc
    oy = lado / 2 + (lo[1] + hi[1]) / 2 * esc
    for v, t, color in ((bv, bt, tuple(fig['colores'][0]) + (255,)), (av, at, tuple(fig['colores'][1]) + (255,))):
        px, py = v[:, 0] * esc + ox, oy - v[:, 1] * esc
        orden = np.argsort(v[t].mean(1)[:, 2])
        for k in orden:
            a_, b_, c_ = t[k]
            d.polygon([(px[a_], py[a_]), (px[b_], py[b_]), (px[c_], py[c_])], fill=color)
    img.save(destino / f'{fid}.png', optimize=True)
    print(f'{fid:22} {ficha["tamano"]} base {len(bt):6} adornos {len(at):6} nombre {ficha["nombreZona"]}')
    return ficha


if __name__ == '__main__':
    main(sys.argv[1], *sys.argv[2:])
