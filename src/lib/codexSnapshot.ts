import type { UiSheetData } from "./sheetMapper";
import {
  canonicalizeCodexStyleId,
  defaultCodexStyleForGenre,
  type CodexStyleId,
} from "./codexStyles";

export type CodexPageSize = "A4" | "US-Letter";

export type CodexSnapshot = {
  snapshotId: string;
  revision: number;
  createdAt: string;
  contentHash: string;
  styleId: CodexStyleId;
  pageSize: CodexPageSize;
  character: UiSheetData;
  assets: {
    portrait: { url: string | null; fallback: "sigil" };
    crest: { url: null; fallback: "sigil" };
    itemVignettes: Record<string, { url: null; fallback: "sigil" }>;
  };
};

const STORE_KEY = "worldvision_codex_snapshots";

export function codexReady(sheet: UiSheetData): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!sheet.name?.trim()) missing.push("name");
  if (!sheet.overview?.classRole?.trim()) missing.push("class");
  return { ok: missing.length === 0, missing };
}

function normalizeText(value: unknown): unknown {
  if (typeof value === "string") return value.replace(/\r\n/g, "\n").trim();
  if (Array.isArray(value)) return value.map(normalizeText);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      out[key] = normalizeText((value as Record<string, unknown>)[key]);
    }
    return out;
  }
  return value;
}

export function normalizeSheet(sheet: UiSheetData): UiSheetData {
  return normalizeText(sheet) as UiSheetData;
}

export async function hashSheet(sheet: UiSheetData): Promise<string> {
  const payload = JSON.stringify(normalizeSheet(sheet));
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function readAll(): CodexSnapshot[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as CodexSnapshot[] : [];
  } catch {
    return [];
  }
}

function writeAll(rows: CodexSnapshot[]) {
  localStorage.setItem(STORE_KEY, JSON.stringify(rows));
}

export function listSnapshots(): CodexSnapshot[] {
  return readAll().sort((a, b) => a.revision - b.revision);
}

export function getSnapshot(id: string): CodexSnapshot | null {
  return readAll().find((row) => row.snapshotId === id) ?? null;
}

export async function mintSnapshot(opts: {
  sheet: UiSheetData;
  portraitUrl: string | null;
  styleId?: string | null;
  pageSize?: CodexPageSize;
}): Promise<CodexSnapshot> {
  const character = normalizeSheet(opts.sheet);
  const contentHash = await hashSheet(character);
  const existing = readAll();
  const revision = existing.reduce((max, row) => Math.max(max, row.revision), 0) + 1;
  const style = canonicalizeCodexStyleId(opts.styleId) ?? defaultCodexStyleForGenre(character.sheet_style);
  const snapshot: CodexSnapshot = {
    snapshotId: crypto.randomUUID(),
    revision,
    createdAt: new Date().toISOString(),
    contentHash,
    styleId: style,
    pageSize: opts.pageSize === "US-Letter" ? "US-Letter" : "A4",
    character,
    assets: {
      portrait: { url: opts.portraitUrl, fallback: "sigil" },
      crest: { url: null, fallback: "sigil" },
      itemVignettes: {},
    },
  };
  writeAll([...existing, snapshot]);
  return snapshot;
}
