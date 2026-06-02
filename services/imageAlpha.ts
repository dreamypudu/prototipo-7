// Detección de silueta por canal alfa para imágenes locales (PNG sin fondo).
// Permite que el hover solo reaccione sobre los píxeles opacos del dibujo, no sobre
// el rectángulo transparente que lo rodea. Requiere imágenes del mismo origen (locales);
// con imágenes cross-origin el canvas se contamina y getImageData lanza, en cuyo caso
// se cae a un fallback "opaco" (comportamiento rectangular, sin romper nada).

interface AlphaEntry {
  data: Uint8ClampedArray;
  w: number;
  h: number;
}

const cache = new Map<string, AlphaEntry | 'pending' | 'failed'>();
const MAX_DIM = 256; // resolución de muestreo: suficiente para hit-testing, memoria mínima.

/** Precarga y cachea el mapa de alfa de una imagen (downscaled). Idempotente por src. */
export const primeImageAlpha = (src: string): void => {
  if (!src || cache.has(src)) return;
  cache.set(src, 'pending');
  const img = new Image();
  img.onload = () => {
    const natW = img.naturalWidth || 1;
    const natH = img.naturalHeight || 1;
    const scale = Math.min(1, MAX_DIM / Math.max(natW, natH));
    const w = Math.max(1, Math.round(natW * scale));
    const h = Math.max(1, Math.round(natH * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      cache.set(src, 'failed');
      return;
    }
    ctx.drawImage(img, 0, 0, w, h);
    try {
      const data = ctx.getImageData(0, 0, w, h).data;
      cache.set(src, { data, w, h });
    } catch {
      // Canvas contaminado (cross-origin) u otro error: fallback rectangular.
      cache.set(src, 'failed');
    }
  };
  img.onerror = () => cache.set(src, 'failed');
  img.src = src;
};

/**
 * Indica si el punto (clientX, clientY) cae sobre un pixel opaco del dibujo renderizado
 * con object-contain dentro de `img`. Si el alfa aún no está listo o falló, cae al
 * rectángulo de contenido (sin letterbox) como aproximación segura.
 */
export const isClientPointOpaque = (
  img: HTMLImageElement | null,
  src: string,
  clientX: number,
  clientY: number,
  threshold = 16
): boolean => {
  if (!img) return true;
  const rect = img.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return true;

  const natW = img.naturalWidth || 1;
  const natH = img.naturalHeight || 1;
  // object-contain: la imagen se escala para caber dentro del box, centrada (con letterbox).
  const scale = Math.min(rect.width / natW, rect.height / natH);
  const dispW = natW * scale;
  const dispH = natH * scale;
  const offsetX = (rect.width - dispW) / 2;
  const offsetY = (rect.height - dispH) / 2;

  const localX = clientX - rect.left - offsetX;
  const localY = clientY - rect.top - offsetY;
  // Fuera del contenido real de la imagen (zona de letterbox) = transparente.
  if (localX < 0 || localY < 0 || localX >= dispW || localY >= dispH) return false;

  const entry = cache.get(src);
  if (!entry || entry === 'pending' || entry === 'failed') {
    // Alfa no disponible: fallback al rectángulo de contenido (mejor que el box completo).
    return true;
  }

  const u = localX / dispW;
  const v = localY / dispH;
  const x = Math.min(entry.w - 1, Math.max(0, Math.floor(u * entry.w)));
  const y = Math.min(entry.h - 1, Math.max(0, Math.floor(v * entry.h)));
  const alpha = entry.data[(y * entry.w + x) * 4 + 3];
  return alpha >= threshold;
};
