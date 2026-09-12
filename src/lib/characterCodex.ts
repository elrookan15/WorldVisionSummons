import { v4 as uuidv4 } from "uuid";
import { DossierSheet } from "../types/dossier";
import { normalizeSheet } from "./normalizeSheet";

export const CODEX_STORAGE_KEY = "worldvision_character_codex";
export const MAX_CODEX_ENTRIES = 32;
const MAX_PORTRAIT_CHARS = 350_000;

export interface CodexEntry {
  id: string;
  savedAt: string;
  updatedAt: string;
  name: string;
  title: string;
  classRole: string;
  sheetStyle: string;
  themeId: string;
  portraitUrl: string | null;
  sheetData: DossierSheet;
}

function safePortrait(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("data:") && url.length > MAX_PORTRAIT_CHARS) return null;
  return url;
}

function summarize(entry: Omit<CodexEntry, "sheetData"> & { sheetData: DossierSheet }): CodexEntry {
  const sheet = normalizeSheet(entry.sheetData);
  return {
    ...entry,
    name: sheet.name,
    title: sheet.title,
    classRole: sheet.overview.classRole,
    sheetStyle: sheet.sheet_style || entry.sheetStyle,
    portraitUrl: safePortrait(entry.portraitUrl),
    sheetData: sheet
  };
}

export function loadCodex(): CodexEntry[] {
  try {
    const raw = localStorage.getItem(CODEX_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((e) => e && typeof e === "object" && e.id && e.sheetData)
      .map((e) => summarize({
        id: String(e.id),
        savedAt: e.savedAt || new Date().toISOString(),
        updatedAt: e.updatedAt || e.savedAt || new Date().toISOString(),
        name: e.name || "Unnamed",
        title: e.title || "",
        classRole: e.classRole || "",
        sheetStyle: e.sheetStyle || "Gothic Dark Fantasy",
        themeId: e.themeId || "gothicDarkFantasy",
        portraitUrl: e.portraitUrl || null,
        sheetData: e.sheetData
      }));
  } catch {
    return [];
  }
}

export function persistCodex(entries: CodexEntry[]): { ok: boolean; droppedPortraits: boolean } {
  const trimmed = entries.slice(0, MAX_CODEX_ENTRIES);
  try {
    localStorage.setItem(CODEX_STORAGE_KEY, JSON.stringify(trimmed));
    return { ok: true, droppedPortraits: false };
  } catch {
    const withoutPortraits = trimmed.map((e) => ({ ...e, portraitUrl: e.portraitUrl?.startsWith("data:") ? null : e.portraitUrl }));
    try {
      localStorage.setItem(CODEX_STORAGE_KEY, JSON.stringify(withoutPortraits));
      return { ok: true, droppedPortraits: true };
    } catch {
      return { ok: false, droppedPortraits: true };
    }
  }
}

export function upsertCodexEntry(opts: {
  existingId?: string | null;
  sheetData: DossierSheet;
  themeId: string;
  portraitUrl?: string | null;
}): { entries: CodexEntry[]; entry: CodexEntry; droppedPortraits: boolean } {
  const now = new Date().toISOString();
  const current = loadCodex();
  const existing = opts.existingId ? current.find((e) => e.id === opts.existingId) : undefined;
  const entry = summarize({
    id: existing?.id || uuidv4(),
    savedAt: existing?.savedAt || now,
    updatedAt: now,
    name: opts.sheetData.name,
    title: opts.sheetData.title,
    classRole: opts.sheetData.overview.classRole,
    sheetStyle: opts.sheetData.sheet_style,
    themeId: opts.themeId,
    portraitUrl: opts.portraitUrl ?? existing?.portraitUrl ?? null,
    sheetData: opts.sheetData
  });

  const next = existing
    ? current.map((e) => (e.id === entry.id ? entry : e))
    : [entry, ...current].slice(0, MAX_CODEX_ENTRIES);

  const result = persistCodex(next);
  return { entries: result.ok ? loadCodex() : next, entry, droppedPortraits: result.droppedPortraits };
}

export function deleteCodexEntry(id: string): CodexEntry[] {
  const next = loadCodex().filter((e) => e.id !== id);
  persistCodex(next);
  return next;
}

export function duplicateCodexEntry(id: string): { entries: CodexEntry[]; entry: CodexEntry | null } {
  const current = loadCodex();
  const source = current.find((e) => e.id === id);
  if (!source) return { entries: current, entry: null };
  const now = new Date().toISOString();
  const copy = summarize({
    ...source,
    id: uuidv4(),
    savedAt: now,
    updatedAt: now,
    name: `${source.name} (Copy)`,
    sheetData: { ...source.sheetData, name: `${source.sheetData.name} (Copy)` }
  });
  const next = [copy, ...current].slice(0, MAX_CODEX_ENTRIES);
  persistCodex(next);
  return { entries: loadCodex(), entry: copy };
}
