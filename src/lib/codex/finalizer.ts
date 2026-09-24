import type { UiSheetData } from "../sheetMapper";
import {
  canonicalizeCodexStyleId,
  defaultCodexStyleForGenre,
  type CodexStyleId,
} from "../codexStyles";

export type CodexPageSize = "A4" | "US-Letter";

/** Integration-brief snapshot. Extra `sourceKey` scopes revisions per character. */
export type CodexSnapshot = {
  snapshotId: string;
  revision: number;
  sourceKey: string;
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

export const SNAPSHOT_STORE_KEY = "worldvision_codex_snapshots";
const MAX_PORTRAIT_CHARS = 350_000;

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

export function pinPortrait(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("data:") && url.length > MAX_PORTRAIT_CHARS) return null;
  return url;
}

export async function hashSheet(sheet: UiSheetData): Promise<string> {
  const payload = JSON.stringify(normalizeSheet(sheet));
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function readAll(): CodexSnapshot[] {
  try {
    const raw = localStorage.getItem(SNAPSHOT_STORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((row) => row && typeof row === "object" && row.snapshotId && row.character) as CodexSnapshot[];
  } catch {
    return [];
  }
}

function writeAll(rows: CodexSnapshot[]) {
  try {
    localStorage.setItem(SNAPSHOT_STORE_KEY, JSON.stringify(rows));
  } catch {
    const stripped = rows.map((row) => ({
      ...row,
      assets: { ...row.assets, portrait: { url: row.assets.portrait.url?.startsWith("data:") ? null : row.assets.portrait.url, fallback: "sigil" as const } },
    }));
    localStorage.setItem(SNAPSHOT_STORE_KEY, JSON.stringify(stripped));
  }
}

export function listSnapshots(sourceKey?: string): CodexSnapshot[] {
  const rows = readAll().sort((a, b) => a.revision - b.revision);
  if (!sourceKey) return rows;
  return rows.filter((row) => (row.sourceKey || "current") === sourceKey);
}

export function getSnapshot(id: string): CodexSnapshot | null {
  return readAll().find((row) => row.snapshotId === id) ?? null;
}

export async function draftSnapshot(opts: {
  sheet: UiSheetData;
  portraitUrl: string | null;
  styleId?: string | null;
  pageSize?: CodexPageSize;
  sourceKey?: string;
}): Promise<CodexSnapshot> {
  const character = normalizeSheet(opts.sheet);
  const sourceKey = opts.sourceKey || "current";
  const prior = listSnapshots(sourceKey);
  const style = canonicalizeCodexStyleId(opts.styleId) ?? defaultCodexStyleForGenre(character.sheet_style);
  return {
    snapshotId: "draft",
    revision: prior.reduce((max, row) => Math.max(max, row.revision), 0) + 1,
    sourceKey,
    createdAt: new Date().toISOString(),
    contentHash: await hashSheet(character),
    styleId: style,
    pageSize: opts.pageSize === "US-Letter" ? "US-Letter" : "A4",
    character,
    assets: {
      portrait: { url: pinPortrait(opts.portraitUrl), fallback: "sigil" },
      crest: { url: null, fallback: "sigil" },
      itemVignettes: {},
    },
  };
}

export async function mintSnapshot(opts: {
  sheet: UiSheetData;
  portraitUrl: string | null;
  styleId?: string | null;
  pageSize?: CodexPageSize;
  sourceKey?: string;
}): Promise<CodexSnapshot> {
  const draft = await draftSnapshot(opts);
  const existing = readAll();
  const snapshot: CodexSnapshot = { ...draft, snapshotId: crypto.randomUUID() };
  writeAll([...existing, snapshot]);
  return snapshot;
}
