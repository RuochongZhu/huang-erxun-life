import { drawPersonalityCard, PORTRAIT_URL, QR_URL } from './personality-card.mjs';

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const timeout = setTimeout(() => { image.onload = image.onerror = null; reject(new Error('图片载入超时，请重试')); }, 15000);
    image.onload = () => { clearTimeout(timeout); resolve(image); };
    image.onerror = () => { clearTimeout(timeout); reject(new Error('卡片图片暂时未能载入，请重试')); };
    image.src = src;
  });
}

export async function createCardBlob(data) {
  const [portrait, qr] = await Promise.all([
    loadImage(data.art?.src || PORTRAIT_URL).catch(() => loadImage(PORTRAIT_URL)), loadImage(QR_URL),
  ]);
  const canvas = document.createElement('canvas');
  drawPersonalityCard(canvas, data, { portrait, qr });
  return new Promise((resolve, reject) => canvas.toBlob(blob => {
    // Release the large pixel buffer after encoding; only the PNG is retained.
    canvas.width = canvas.height = 1;
    blob ? resolve(blob) : reject(new Error('图片生成失败，请重试'));
  }, 'image/png'));
}

export function canShareCard(file, api = navigator) {
  try { return !!file && typeof api.share === 'function' && typeof api.canShare === 'function' && api.canShare({ files: [file] }); }
  catch { return false; }
}

// Call directly from the click handler, after preparing the file. No image loading
// or await may precede share(), or mobile transient user activation may be lost.
export function shareCard(file, api = navigator) {
  if (!canShareCard(file, api)) return Promise.resolve('unsupported');
  try {
    // Safari turns a standalone title into a second native share item.
    // The card already contains its title; send only the single PNG file.
    return Promise.resolve(api.share({ files: [file] }))
      .then(() => 'shared', error => error?.name === 'AbortError' ? 'cancelled' : 'failed');
  } catch (error) {
    return Promise.resolve(error?.name === 'AbortError' ? 'cancelled' : 'failed');
  }
}

export function canCopyCard(blob, api = navigator, Item = globalThis.ClipboardItem) {
  try {
    return blob?.type === 'image/png' && typeof api.clipboard?.write === 'function'
      && typeof Item === 'function' && (typeof Item.supports !== 'function' || Item.supports('image/png'));
  } catch { return false; }
}

// Use the already encoded image during the click gesture. One item, one PNG
// representation: no HTML preview, file URL, or second clipboard write.
export function copyCard(blob, api = navigator, Item = globalThis.ClipboardItem) {
  if (!canCopyCard(blob, api, Item)) return Promise.resolve('unsupported');
  try {
    return Promise.resolve(api.clipboard.write([new Item({ 'image/png': blob })]))
      .then(() => 'copied', () => 'failed');
  } catch { return Promise.resolve('failed'); }
}
