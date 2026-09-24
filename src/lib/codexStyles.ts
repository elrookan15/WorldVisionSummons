import { canonicalizeSheetStyle } from "./themeMap";
import { CODEX_STYLE_IDS, CODEX_STYLES } from "./codex/styles";

export { CODEX_STYLE_IDS, CODEX_STYLES };
export type { CodexStyleId, CodexStyleSpec } from "./codex/styles/types";
import type { CodexStyleId, CodexStyleSpec } from "./codex/styles/types";

const GENRE_DEFAULTS: Record<string, CodexStyleId> = {
  "Gothic Dark Fantasy": "illuminated-parchment",
  "Victorian Gothic": "victorian-gothic",
  "High Fantasy": "high-fantasy",
  "Cosmic Horror": "celestial-chart",
  "Samurai Era": "samurai-emakimono",
  Steampunk: "steampunk-folio",
  Cyberpunk: "cyberpunk-dossier",
  "Eldritch Arcane": "eldritch-arcane",
  "Post-Apocalyptic": "wasteland-record",
  "8-Bit Retro RPG": "retro-8bit",
};

const SNAPSHOT_KEY = "worldvision_codex_plate_snapshot";

export type PlateSnapshot = {
  plateStyleId: CodexStyleId;
  sheetName: string;
  sheetStyle: string;
  recordedAt: string;
};

const STYLE_ALIASES: Record<string, CodexStyleId> = {
  "celestial-star-chart": "celestial-chart",
  "iron-ronin-dossier": "ronin-dossier",
  "viking-carved-oak": "viking-oak",
  "royal-heraldic-decree": "royal-decree",
  "alchemist-field-notes": "alchemist-notes",
  "cyberpunk-neon-dossier": "cyberpunk-dossier",
  "steampunk-brass-folio": "steampunk-folio",
  "post-apocalyptic-record": "wasteland-record",
  "high-fantasy-epic": "high-fantasy",
  "victorian-gothic-mourning": "victorian-gothic",
};

export function canonicalizeCodexStyleId(value: string | null | undefined): CodexStyleId | null {
  if (!value) return null;
  if ((CODEX_STYLE_IDS as readonly string[]).includes(value)) return value as CodexStyleId;
  return STYLE_ALIASES[value] ?? null;
}

export function isCodexStyleId(value: string): value is CodexStyleId {
  return canonicalizeCodexStyleId(value) !== null;
}

export function codexStyleById(id: string | null | undefined): CodexStyleSpec {
  const canonical = canonicalizeCodexStyleId(id);
  const found = CODEX_STYLES.find((style) => style.id === canonical);
  return found ?? CODEX_STYLES[0];
}

export function defaultCodexStyleForGenre(sheetStyle: string | null | undefined): CodexStyleId {
  const canonical = canonicalizeSheetStyle(sheetStyle);
  return GENRE_DEFAULTS[canonical] ?? "illuminated-parchment";
}

export function resolvePlateStyle(opts: {
  sheetName: string;
  sheetStyle: string;
  explicit?: string | null;
}): CodexStyleId {
  const explicit = canonicalizeCodexStyleId(opts.explicit);
  if (explicit) return explicit;
  const saved = readPlateSnapshot();
  if (
    saved &&
    saved.sheetName === opts.sheetName &&
    saved.sheetStyle === opts.sheetStyle &&
    isCodexStyleId(saved.plateStyleId)
  ) {
    return canonicalizeCodexStyleId(saved.plateStyleId) ?? defaultCodexStyleForGenre(opts.sheetStyle);
  }
  return defaultCodexStyleForGenre(opts.sheetStyle);
}

export function readPlateSnapshot(): PlateSnapshot | null {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PlateSnapshot>;
    if (!parsed || !isCodexStyleId(String(parsed.plateStyleId || ""))) return null;
    return {
      plateStyleId: parsed.plateStyleId,
      sheetName: String(parsed.sheetName || ""),
      sheetStyle: String(parsed.sheetStyle || ""),
      recordedAt: String(parsed.recordedAt || ""),
    };
  } catch {
    return null;
  }
}

export function writePlateSnapshot(snapshot: PlateSnapshot): void {
  localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
}
