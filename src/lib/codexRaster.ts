import { toBlob } from "html-to-image";
import type { CodexPageSize } from "./codexSnapshot";

/** Print pixels at 300 DPI. A4 is 210×297 mm; US Letter is 8.5×11 in. */
export function codexPngPixels(pageSize: CodexPageSize): { width: number; height: number } {
  if (pageSize === "US-Letter") return { width: 2550, height: 3300 };
  return { width: 2480, height: 3508 };
}

/** Rasterize the live Codex plate. Preview, print, and this PNG share that DOM. */
export async function rasterizeCodexSheet(node: HTMLElement, pageSize: CodexPageSize): Promise<Blob> {
  const target = codexPngPixels(pageSize);
  const cssWidth = node.offsetWidth;
  if (cssWidth < 1) throw new Error("codex plate has no layout width");
  const blob = await toBlob(node, {
    pixelRatio: target.width / cssWidth,
    cacheBust: true,
    backgroundColor: getComputedStyle(node).backgroundColor || "#2a2118",
  });
  if (!blob) throw new Error("codex png export produced an empty image");
  return blob;
}
