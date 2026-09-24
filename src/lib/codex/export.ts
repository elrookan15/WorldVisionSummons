import { rasterizeCodexSheet } from "../codexRaster";
import type { CodexSnapshot } from "./finalizer";

export function codexFileStem(snapshot: CodexSnapshot): string {
  const name = (snapshot.character.name || "codex").replace(/[^\w.-]+/g, "-").replace(/^-|-$/g, "") || "codex";
  return `${name}-codex-r${snapshot.revision}`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportSnapshotJson(snapshot: CodexSnapshot) {
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
  downloadBlob(blob, `${codexFileStem(snapshot)}.json`);
}

export async function exportSnapshotPng(node: HTMLElement, snapshot: CodexSnapshot) {
  const blob = await rasterizeCodexSheet(node, snapshot.pageSize);
  downloadBlob(blob, `${codexFileStem(snapshot)}.png`);
}

/** Print dialog. The browser names the PDF; we set document.title to the archival stem. */
export function exportSnapshotPdf() {
  const previous = document.title;
  window.addEventListener("afterprint", () => {
    document.title = previous;
  }, { once: true });
  window.print();
}

export function armPdfTitle(snapshot: CodexSnapshot) {
  document.title = codexFileStem(snapshot);
}
