/**
 * Client-side whitespace trim (Renderer V2). gpt-image-1 returns the artwork
 * surrounded by background padding, so scaling the whole raster to a target size
 * is inaccurate. This finds the tight bounding box of the actual artwork using a
 * canvas and crops to it — so the caller can then place it at an EXACT physical
 * size. Runs in the browser (no sharp / no server round-trip).
 */
export type Trimmed = {
  bytes: Uint8Array;
  widthPx: number;
  heightPx: number;
  trimmed: boolean;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * @param src         image source (data URL / object URL)
 * @param threshold   0-255 colour distance from background to count as content
 * @param paddingFrac fraction of the trimmed size to re-add as a small margin
 */
export async function trimWhitespace(
  src: string,
  { threshold = 28, paddingFrac = 0.02 }: { threshold?: number; paddingFrac?: number } = {},
): Promise<Trimmed> {
  const img = await loadImage(src);
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    const bytes = new Uint8Array(await (await fetch(src)).arrayBuffer());
    return { bytes, widthPx: w, heightPx: h, trimmed: false };
  }
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, w, h);

  // Background = average of the four corners.
  const corners = [
    0, // top-left
    (w - 1) * 4, // top-right
    (h - 1) * w * 4, // bottom-left
    ((h - 1) * w + (w - 1)) * 4, // bottom-right
  ];
  let br = 0, bg = 0, bb = 0;
  for (const c of corners) {
    br += data[c];
    bg += data[c + 1];
    bb += data[c + 2];
  }
  br /= 4; bg /= 4; bb /= 4;

  const isContent = (i: number) => {
    const a = data[i + 3];
    if (a < 16) return false; // transparent = background
    const dr = data[i] - br;
    const dg = data[i + 1] - bg;
    const db = data[i + 2] - bb;
    return Math.abs(dr) + Math.abs(dg) + Math.abs(db) > threshold;
  };

  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (isContent((y * w + x) * 4)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // Nothing detected (blank / all-background) → return the original.
  if (maxX < minX || maxY < minY) {
    const bytes = new Uint8Array(await (await fetch(src)).arrayBuffer());
    return { bytes, widthPx: w, heightPx: h, trimmed: false };
  }

  const pad = Math.round(Math.max(maxX - minX, maxY - minY) * paddingFrac);
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY + pad);

  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  const out = document.createElement("canvas");
  out.width = cw;
  out.height = ch;
  const octx = out.getContext("2d");
  if (!octx) {
    const bytes = new Uint8Array(await (await fetch(src)).arrayBuffer());
    return { bytes, widthPx: w, heightPx: h, trimmed: false };
  }
  octx.drawImage(canvas, minX, minY, cw, ch, 0, 0, cw, ch);
  const blob: Blob = await new Promise((res, rej) =>
    out.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), "image/png"),
  );
  const bytes = new Uint8Array(await blob.arrayBuffer());
  return { bytes, widthPx: cw, heightPx: ch, trimmed: true };
}
