import { canonicalJson, type CodexSnapshotV1 } from "../schema/codexSnapshotV1";
import type { CodexRenderModel } from "../composition/types";
import { OUTPUT_PROFILES, type OutputProfile } from "./outputProfiles";

const A4_WIDTH_PT = 210 * 72 / 25.4;
const A4_HEIGHT_PT = 297 * 72 / 25.4;

export function exportCodexJson(snapshot: CodexSnapshotV1): string {
  return canonicalJson(snapshot);
}

export function codexExportBasename(snapshot: CodexSnapshotV1): string {
  const slug = (snapshot.identity.name ?? "unnamed")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "unnamed";
  const day = /^\d{4}-\d{2}-\d{2}/.test(snapshot.finalizedAt) ? snapshot.finalizedAt.slice(0, 10) : "undated";
  return `worldvision-${slug}-codex-r${snapshot.revision}-${day}`;
}

function pdfEscape(value: string): string {
  return value
    .replace(/…/g, "...")
    .replace(/[^\x20-\x7e\n]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function mmPt(mm: number): number {
  return Math.round((mm * 72) / 25.4 * 100) / 100;
}

export function buildCodexPdf(model: CodexRenderModel, profile: OutputProfile = OUTPUT_PROFILES.a4): Uint8Array {
  const scale = Math.min(profile.pdfWidthPt / A4_WIDTH_PT, profile.pdfHeightPt / A4_HEIGHT_PT);
  const ox = Math.round(((profile.pdfWidthPt - A4_WIDTH_PT * scale) / 2) * 100) / 100;
  const oy = Math.round(((profile.pdfHeightPt - A4_HEIGHT_PT * scale) / 2) * 100) / 100;
  const commands: string[] = [
    "q",
    "0.949 0.906 0.812 rg",
    `0 0 ${profile.pdfWidthPt} ${profile.pdfHeightPt} re f`,
    "Q",
    "q",
    `${scale} 0 0 ${scale} ${ox} ${oy} cm`,
    "0.431 0.141 0.188 RG",
    "1.2 w",
    `${mmPt(8)} ${mmPt(297 - 289)} ${mmPt(194)} ${mmPt(281)} re S`,
  ];
  for (const run of model.texts) {
    const lines = run.text.split("\n");
    const size = run.fontPt;
    lines.forEach((row, index) => {
      const baseline = Math.round((A4_HEIGHT_PT - mmPt(run.y) - size - index * size * 1.2) * 100) / 100;
      commands.push("BT", `/F1 ${size} Tf`, "0.110 0.078 0.055 rg", `1 0 0 1 ${mmPt(run.x)} ${baseline} Tm`, `(${pdfEscape(row)}) Tj`, "ET");
    });
  }
  commands.push("Q");
  const stream = commands.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Count 1 /Kids [3 0 R] >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${profile.pdfWidthPt} ${profile.pdfHeightPt}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>`,
    `<< /Length ${new TextEncoder().encode(stream).length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  return assemblePdf(objects);
}

function assemblePdf(objects: string[]): Uint8Array {
  const encoder = new TextEncoder();
  let body = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(encoder.encode(body).length);
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const startxref = encoder.encode(body).length;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i += 1) {
    xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  body += xref;
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF`;
  return encoder.encode(body);
}

const HEX_GLYPH: Record<string, number[]> = {
  "0": [0b01110, 0b10001, 0b10011, 0b10101, 0b11001, 0b10001, 0b01110],
  "1": [0b00100, 0b01100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
  "2": [0b01110, 0b10001, 0b00001, 0b00010, 0b00100, 0b01000, 0b11111],
  "3": [0b11110, 0b00001, 0b00001, 0b01110, 0b00001, 0b00001, 0b11110],
  "4": [0b00010, 0b00110, 0b01010, 0b10010, 0b11111, 0b00010, 0b00010],
  "5": [0b11111, 0b10000, 0b11110, 0b00001, 0b00001, 0b10001, 0b01110],
  "6": [0b00110, 0b01000, 0b10000, 0b11110, 0b10001, 0b10001, 0b01110],
  "7": [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b01000, 0b01000],
  "8": [0b01110, 0b10001, 0b10001, 0b01110, 0b10001, 0b10001, 0b01110],
  "9": [0b01110, 0b10001, 0b10001, 0b01111, 0b00001, 0b00010, 0b01100],
  a: [0b01110, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  b: [0b11110, 0b10001, 0b10001, 0b11110, 0b10001, 0b10001, 0b11110],
  c: [0b01110, 0b10001, 0b10000, 0b10000, 0b10000, 0b10001, 0b01110],
  d: [0b11110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b11110],
  e: [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b11111],
  f: [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b10000],
};

function crc32(buf: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    c ^= buf[i];
    for (let k = 0; k < 8; k += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  out.set(new TextEncoder().encode(type), 4);
  out.set(data, 8);
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}

function adler32(data: Uint8Array): number {
  let a = 1;
  let b = 0;
  for (let i = 0; i < data.length; i += 1) {
    a = (a + data[i]) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

function zlibStore(data: Uint8Array): Uint8Array {
  const chunks: Uint8Array[] = [];
  let offset = 0;
  while (offset < data.length) {
    const len = Math.min(65535, data.length - offset);
    const last = offset + len >= data.length;
    const block = new Uint8Array(5 + len);
    block[0] = last ? 1 : 0;
    block[1] = len & 0xff;
    block[2] = (len >> 8) & 0xff;
    const nlen = (~len) & 0xffff;
    block[3] = nlen & 0xff;
    block[4] = (nlen >> 8) & 0xff;
    block.set(data.subarray(offset, offset + len), 5);
    chunks.push(block);
    offset += len;
  }
  const payload = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const out = new Uint8Array(2 + payload + 4);
  out[0] = 0x78;
  out[1] = 0x01;
  let cursor = 2;
  for (const chunk of chunks) {
    out.set(chunk, cursor);
    cursor += chunk.length;
  }
  const checksum = adler32(data);
  const view = new DataView(out.buffer);
  view.setUint32(out.length - 4, checksum);
  return out;
}

function setRgb(pixels: Uint8Array, width: number, x: number, y: number, height: number, rgb: [number, number, number]): void {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const index = (y * width + x) * 3;
  pixels[index] = rgb[0];
  pixels[index + 1] = rgb[1];
  pixels[index + 2] = rgb[2];
}

function fillRect(
  pixels: Uint8Array,
  width: number,
  height: number,
  x: number,
  y: number,
  w: number,
  h: number,
  rgb: [number, number, number],
): void {
  const x0 = Math.max(0, x);
  const y0 = Math.max(0, y);
  const x1 = Math.min(width, x + w);
  const y1 = Math.min(height, y + h);
  for (let yy = y0; yy < y1; yy += 1) {
    for (let xx = x0; xx < x1; xx += 1) setRgb(pixels, width, xx, yy, height, rgb);
  }
}

function drawHex(pixels: Uint8Array, width: number, height: number, text: string, x: number, y: number, scale: number): void {
  let cursor = x;
  for (const ch of text.toLowerCase()) {
    const glyph = HEX_GLYPH[ch];
    if (!glyph) {
      cursor += 4 * scale;
      continue;
    }
    glyph.forEach((row, gy) => {
      for (let gx = 0; gx < 5; gx += 1) {
        if (((row >> (4 - gx)) & 1) === 0) continue;
        fillRect(pixels, width, height, cursor + gx * scale, y + gy * scale, scale, scale, [107, 51, 36]);
      }
    });
    cursor += 6 * scale;
  }
}

export interface PngRasterSize {
  width: number;
  height: number;
}

export function buildCodexPng(
  model: CodexRenderModel,
  profile: OutputProfile = OUTPUT_PROFILES.a4,
  raster?: PngRasterSize,
): Uint8Array {
  const width = raster?.width ?? profile.pngWidth;
  const height = raster?.height ?? profile.pngHeight;
  const pixels = new Uint8Array(width * height * 3);
  for (let i = 0; i < pixels.length; i += 3) {
    pixels[i] = 242;
    pixels[i + 1] = 231;
    pixels[i + 2] = 207;
  }
  const sx = width / 210;
  const sy = height / 297;
  const oxblood: [number, number, number] = [107, 51, 36];
  const bronze: [number, number, number] = [179, 123, 61];
  for (const region of Object.values(model.regions)) {
    const x = Math.round(region.x * sx);
    const y = Math.round(region.y * sy);
    const w = Math.max(1, Math.round(region.w * sx));
    const h = Math.max(1, Math.round(region.h * sy));
    fillRect(pixels, width, height, x, y, w, 1, bronze);
    fillRect(pixels, width, height, x, y + h - 1, w, 1, bronze);
    fillRect(pixels, width, height, x, y, 1, h, bronze);
    fillRect(pixels, width, height, x + w - 1, y, 1, h, bronze);
  }
  fillRect(pixels, width, height, Math.round(8 * sx), Math.round(8 * sy), Math.max(1, Math.round(194 * sx)), 2, oxblood);
  const hash = model.snapshotHash.slice(0, 12);
  drawHex(pixels, width, height, hash, Math.round(14 * sx), Math.round(276 * sy), Math.max(1, Math.floor(sx / 3)));

  const raw = new Uint8Array(height * (1 + width * 3));
  for (let y = 0; y < height; y += 1) {
    const row = y * (1 + width * 3);
    raw[row] = 0;
    raw.set(pixels.subarray(y * width * 3, (y + 1) * width * 3), row + 1);
  }
  const ihdr = new Uint8Array(13);
  const view = new DataView(ihdr.buffer);
  view.setUint32(0, width);
  view.setUint32(4, height);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const parts = [signature, pngChunk("IHDR", ihdr), pngChunk("IDAT", zlibStore(raw)), pngChunk("IEND", new Uint8Array())];
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const png = new Uint8Array(total);
  let cursor = 0;
  for (const part of parts) {
    png.set(part, cursor);
    cursor += part.length;
  }
  return png;
}
