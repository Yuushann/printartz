import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { PAPER_SIZES, type PaperSizeId } from "@printartz/shared";

/** 1 mm in PDF points (1pt = 1/72 inch, 1 inch = 25.4 mm). */
export const MM_TO_PT = 72 / 25.4;
export const mm = (v: number) => v * MM_TO_PT;

export interface RenderOptions {
  imageBytes: Uint8Array | ArrayBuffer;
  paperSizeId: PaperSizeId;
  /** Page margin in millimetres. */
  marginMm?: number;
  /** Draw a dashed cut border around the artwork. */
  cutBorder?: boolean;
  /** Draw a 100 mm calibration ruler so the user can verify "print at 100%". */
  ruler?: boolean;
  /**
   * If set, scale the artwork so its WIDTH equals this many millimetres
   * (approximate object sizing — the raster still includes some padding).
   * If omitted, the artwork is fit within the page margins.
   */
  objectWidthMm?: number;
}

/**
 * Produce a print-accurate PDF: the page is EXACTLY the chosen paper size in
 * millimetres, so printing at 100% / "actual size" yields true physical
 * dimensions. The AI raster is placed onto that exact page.
 */
export async function renderPrintPdf(opts: RenderOptions): Promise<Uint8Array> {
  const {
    imageBytes,
    paperSizeId,
    marginMm = 12,
    cutBorder = true,
    ruler = true,
    objectWidthMm,
  } = opts;

  const paper = PAPER_SIZES[paperSizeId];
  const pageW = mm(paper.widthMm);
  const pageH = mm(paper.heightMm);

  const doc = await PDFDocument.create();
  doc.setTitle(`PrintArtZ — ${paper.label}`);
  doc.setProducer("PrintArtZ");
  const page = doc.addPage([pageW, pageH]);

  const bytes = imageBytes instanceof ArrayBuffer ? new Uint8Array(imageBytes) : imageBytes;
  const png = await doc.embedPng(bytes);

  const margin = mm(marginMm);
  const rulerSpace = ruler ? mm(16) : 0;
  const availW = pageW - 2 * margin;
  const availH = pageH - 2 * margin - rulerSpace;

  // Determine draw size.
  let drawW: number;
  let drawH: number;
  if (objectWidthMm && objectWidthMm > 0) {
    drawW = mm(objectWidthMm);
    drawH = (png.height / png.width) * drawW;
  } else {
    const scale = Math.min(availW / png.width, availH / png.height);
    drawW = png.width * scale;
    drawH = png.height * scale;
  }
  const x = (pageW - drawW) / 2;
  const y = margin + rulerSpace + Math.max(0, (availH - drawH) / 2);

  page.drawImage(png, { x, y, width: drawW, height: drawH });

  if (cutBorder) {
    const pad = mm(2);
    page.drawRectangle({
      x: x - pad,
      y: y - pad,
      width: drawW + 2 * pad,
      height: drawH + 2 * pad,
      borderColor: rgb(0.65, 0.65, 0.65),
      borderWidth: 0.5,
      borderDashArray: [3, 3],
    });
  }

  if (ruler) {
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const len = mm(100);
    const rx = (pageW - len) / 2;
    const ry = mm(9);
    page.drawLine({ start: { x: rx, y: ry }, end: { x: rx + len, y: ry }, thickness: 1, color: rgb(0, 0, 0) });
    for (let i = 0; i <= 100; i += 10) {
      const tx = rx + mm(i);
      page.drawLine({
        start: { x: tx, y: ry },
        end: { x: tx, y: ry + (i % 50 === 0 ? mm(2.5) : mm(1.5)) },
        thickness: 0.5,
        color: rgb(0, 0, 0),
      });
    }
    page.drawText(
      "100 mm calibration — if this measures 100 mm on paper, everything is to scale. Print at 100% / Actual size (no 'fit to page').",
      { x: rx, y: ry - mm(3.5), size: 6, font, color: rgb(0.4, 0.4, 0.4) },
    );
  }

  return doc.save();
}

export interface CutoutSheetOptions {
  /** A single, pre-trimmed object image (PNG). */
  imageBytes: Uint8Array | ArrayBuffer;
  paperSizeId: PaperSizeId;
  /** How many copies to place across the sheet(s). */
  count: number;
  /** Exact width of EACH object in millimetres. */
  objectWidthMm: number;
  marginMm?: number;
  /** Gap between objects in millimetres. */
  gapMm?: number;
  cutBorder?: boolean;
  ruler?: boolean;
}

/**
 * Renderer V3 — "generate then compose". Tiles `count` copies of a single
 * trimmed object, each EXACTLY `objectWidthMm` wide, into a grid on real
 * paper-size pages (adding pages as needed), with per-object dashed cut borders
 * and a calibration ruler. Deterministic geometry → true physical sizes.
 */
export async function renderCutoutSheetPdf(opts: CutoutSheetOptions): Promise<Uint8Array> {
  const {
    imageBytes,
    paperSizeId,
    count,
    objectWidthMm,
    marginMm = 10,
    gapMm = 6,
    cutBorder = true,
    ruler = true,
  } = opts;

  const paper = PAPER_SIZES[paperSizeId];
  const pageW = mm(paper.widthMm);
  const pageH = mm(paper.heightMm);
  const margin = mm(marginMm);
  const gap = mm(gapMm);
  const rulerSpace = ruler ? mm(16) : 0;

  const doc = await PDFDocument.create();
  doc.setTitle(`PrintArtZ — ${paper.label} cutout sheet`);
  doc.setProducer("PrintArtZ");
  const bytes = imageBytes instanceof ArrayBuffer ? new Uint8Array(imageBytes) : imageBytes;
  const png = await doc.embedPng(bytes);
  const font = ruler ? await doc.embedFont(StandardFonts.Helvetica) : undefined;

  const availW = pageW - 2 * margin;
  const availH = pageH - 2 * margin - rulerSpace;

  // Object box (clamp so a single object never exceeds the printable area).
  let objW = Math.min(mm(objectWidthMm), availW);
  let objH = (png.height / png.width) * objW;
  if (objH > availH) {
    objH = availH;
    objW = (png.width / png.height) * objH;
  }

  const cols = Math.max(1, Math.floor((availW + gap) / (objW + gap)));
  const rowsPerPage = Math.max(1, Math.floor((availH + gap) / (objH + gap)));
  const perPage = cols * rowsPerPage;
  const total = Math.max(1, Math.floor(count));

  const drawRuler = (page: ReturnType<typeof doc.addPage>) => {
    if (!ruler || !font) return;
    const len = mm(100);
    const rx = (pageW - len) / 2;
    const ry = mm(9);
    page.drawLine({ start: { x: rx, y: ry }, end: { x: rx + len, y: ry }, thickness: 1, color: rgb(0, 0, 0) });
    for (let i = 0; i <= 100; i += 10) {
      const tx = rx + mm(i);
      page.drawLine({
        start: { x: tx, y: ry },
        end: { x: tx, y: ry + (i % 50 === 0 ? mm(2.5) : mm(1.5)) },
        thickness: 0.5,
        color: rgb(0, 0, 0),
      });
    }
    page.drawText(
      "100 mm calibration — print at 100% / Actual size (no 'fit to page').",
      { x: rx, y: ry - mm(3.5), size: 6, font, color: rgb(0.4, 0.4, 0.4) },
    );
  };

  let page = doc.addPage([pageW, pageH]);
  drawRuler(page);

  for (let i = 0; i < total; i++) {
    const onPage = i % perPage;
    if (i > 0 && onPage === 0) {
      page = doc.addPage([pageW, pageH]);
      drawRuler(page);
    }
    const col = onPage % cols;
    const row = Math.floor(onPage / cols);
    const x = margin + col * (objW + gap);
    // pdf-lib origin is bottom-left; lay rows from the top down.
    const yTop = pageH - margin - row * (objH + gap);
    const y = yTop - objH;

    page.drawImage(png, { x, y, width: objW, height: objH });
    if (cutBorder) {
      const pad = mm(1.5);
      page.drawRectangle({
        x: x - pad,
        y: y - pad,
        width: objW + 2 * pad,
        height: objH + 2 * pad,
        borderColor: rgb(0.65, 0.65, 0.65),
        borderWidth: 0.5,
        borderDashArray: [3, 3],
      });
    }
  }

  return doc.save();
}
