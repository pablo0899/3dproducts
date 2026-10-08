import os
import sys
from PIL import Image, ImageChops, ImageFilter

origen, destino = sys.argv[1], sys.argv[2]
os.makedirs(destino, exist_ok=True)

img = Image.open(origen).convert('RGB')
r, g, b = img.split()
brillo = ImageChops.lighter(ImageChops.lighter(r, g), b)  # max(r, g, b)

# Recorte: caja de lo que no es fondo negro, con margen y cuadrada
caja = brillo.point(lambda v: 255 if v > 28 else 0).getbbox()
x0, y0, x1, y1 = caja
lado = int(max(x1 - x0, y1 - y0) * 1.08)
cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
recorte = (cx - lado // 2, cy - lado // 2, cx - lado // 2 + lado, cy - lado // 2 + lado)
img = img.crop(recorte)
brillo = brillo.crop(recorte)

# Alfa: rampa suave entre negro (transparente) y la cinta (opaca)
def rampa(v, a=14, z=52):
    if v <= a:
        return 0
    if v >= z:
        return 255
    t = (v - a) / (z - a)
    return int(255 * t * t * (3 - 2 * t))

import numpy as np
from scipy import ndimage

b = np.asarray(brillo, dtype=np.float32)
suave = np.asarray(brillo.point(rampa), dtype=np.float32)
# Fondo = zonas oscuras grandes (el exterior y el hueco central del triángulo).
# Las manchas oscuras pequeñas dentro de la cinta se rellenan como opacas.
oscuro = b <= 40
etiquetas, n = ndimage.label(oscuro)
tamanos = ndimage.sum(oscuro, etiquetas, range(1, n + 1))
fondo = np.isin(etiquetas, [i + 1 for i, t in enumerate(tamanos) if t > b.size * 0.004])
fondo = ndimage.binary_erosion(fondo, iterations=1)
alfa_np = np.where(fondo, suave, 255)
# Borde: suaviza la transición y recorta 1 px del halo oscuro
alfa_np = ndimage.grey_erosion(alfa_np, size=(3, 3))
alfa = Image.fromarray(alfa_np.astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))
rgba = img.copy()
rgba.putalpha(alfa)

def guardar(tam, nombre, fondo=None, relleno=1.0):
    lienzo_tam = tam
    pieza = rgba.resize((int(tam * relleno),) * 2, Image.LANCZOS)
    if fondo:
        lienzo = Image.new('RGBA', (lienzo_tam, lienzo_tam), fondo)
    else:
        lienzo = Image.new('RGBA', (lienzo_tam, lienzo_tam), (0, 0, 0, 0))
    off = (lienzo_tam - pieza.width) // 2
    lienzo.alpha_composite(pieza, (off, off))
    ruta = os.path.join(destino, nombre)
    if nombre.endswith('.webp'):
        lienzo.save(ruta, 'WEBP', quality=90, method=6)
    else:
        lienzo.save(ruta, optimize=True)
    print(nombre, os.path.getsize(ruta), 'bytes')

guardar(640, 'isotipo.webp')
guardar(640, 'isotipo.png')
guardar(96, 'isotipo-96.webp')
guardar(64, 'favicon.png')
guardar(180, 'apple-touch-icon.png', fondo=(58, 36, 59, 255), relleno=0.78)

# Imagen para compartir en redes (1200×630) sobre ciruela
og = Image.new('RGBA', (1200, 630), (58, 36, 59, 255))
pieza = rgba.resize((420, 420), Image.LANCZOS)
og.alpha_composite(pieza, ((1200 - 420) // 2, (630 - 420) // 2))
og.convert('RGB').save(os.path.join(destino, 'og.jpg'), quality=88)
print('og.jpg', os.path.getsize(os.path.join(destino, 'og.jpg')), 'bytes')
