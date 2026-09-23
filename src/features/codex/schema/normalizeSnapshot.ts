import {
  ATTRIBUTE_KEYS,
  CODEX_SCHEMA_VERSION,
  CODEX_TEMPLATE_ID,
  CODEX_TEMPLATE_VERSION,
  MAX_PORTRAIT_CHARS,
  PSYCHOLOGY_CATEGORIES,
  SnapshotBodySchema,
  deepFreeze,
  hashableSnapshot,
  modifierFor,
  sha256Hex,
  type AttributeKey,
  type CodexSnapshotV1,
  type EquipmentTarget,
  type GenreTheme,
  type PsychologyCategory,
  type WorkshopSheet,
} from "./codexSnapshotV1";

const SEALED = Symbol("codexSealed");
const SECRET_PREFIX = /^(blob:|Bearer\s+|ya29\.|sk-)/i;
const NONE = /^(none|n\/a|uninscribed)$/i;

export interface NormalizeOptions {
  finalizedAt: string;
  snapshotId: string;
  characterId: string;
  revision?: number;
  portraitUrl?: string | null;
  portraitWidth?: number | null;
  portraitHeight?: number | null;
  portraitMimeType?: string | null;
  focalPoint?: { x: number; y: number } | null;
  cropRect?: { x: number; y: number; width: number; height: number } | null;
  creator?: string | null;
  presetId?: string | null;
}

export interface ReviewIssue {
  severity: "blocking" | "warning";
  section: "identity" | "class" | "attributes" | "portrait" | "psychology" | "crest";
  message: string;
}

const CATEGORY_LABEL: Record<PsychologyCategory, string> = {
  reputation: "Reputation",
  virtue: "Virtue",
  vice: "Vice",
  fear: "Fear",
  loyalty: "Loyalty",
  survival: "Survival",
  obsession: "Obsession",
  tell: "Tell",
  blindSpot: "Blind spot",
};

const WORKSHOP_TRAIT: Record<string, PsychologyCategory> = {
  reputation: "reputation",
  virtue: "virtue",
  vice: "vice",
  fear: "fear",
  loyalty: "loyalty",
  survivalInstinct: "survival",
  obsession: "obsession",
  tell: "tell",
  blindSpot: "blindSpot",
};

const GEAR_BLUEPRINT: Array<{
  id: string;
  key: keyof NonNullable<WorkshopSheet["equipment"]>;
  target: EquipmentTarget;
  priority: 1 | 2 | 3;
  description: string;
}> = [
  { id: "eq-primary", key: "primaryWeapon", target: "rightHand", priority: 1, description: "Primary weapon" },
  { id: "eq-armor", key: "armor", target: "torso", priority: 1, description: "Armor" },
  { id: "eq-relic", key: "relics", target: "head", priority: 1, description: "Relic" },
  { id: "eq-secondary", key: "secondaryFocus", target: "leftHand", priority: 2, description: "Secondary" },
  { id: "eq-utility", key: "utilityTools", target: "waist", priority: 2, description: "Utility" },
  { id: "eq-consumable", key: "consumables", target: "feet", priority: 3, description: "Consumable" },
];

export function cleanString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || SECRET_PREFIX.test(trimmed)) return null;
  return trimmed;
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, Math.round(numeric)));
}

function leadingInt(value: unknown, fallback: number): number {
  if (typeof value === "number") return Number.isFinite(value) ? Math.round(value) : fallback;
  if (typeof value !== "string") return fallback;
  const match = value.trim().match(/-?\d+/);
  if (!match) return fallback;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function unitInterval(value: number | null | undefined, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(1, Math.max(0, value));
}

function genreFor(style: string | null): GenreTheme {
  const text = (style ?? "").toLowerCase();
  if (text.includes("cyber")) return "cyberpunk";
  if (text.includes("steam")) return "steampunk";
  if (text.includes("samurai")) return "samurai";
  if (text.includes("victorian")) return "victorian";
  if (text.includes("eldritch")) return "eldritch";
  if (text.includes("cosmic")) return "cosmic";
  if (text.includes("gothic")) return "gothic";
  if (text.includes("8-bit") || text.includes("8bit") || text.includes("retro")) return "retro";
  if (text.includes("apocalyp") || text.includes("wasteland")) return "wasteland";
  if (text.includes("high fantasy") || text.includes("arcane")) return "highFantasy";
  return "default";
}

function scoreFor(sheet: WorkshopSheet, key: AttributeKey): { score: number; modifier: number } {
  const found = sheet.stats?.find((stat) => stat.key?.toLowerCase() === key);
  const score = clampInt(found?.value, 1, 30, 10);
  return { score, modifier: modifierFor(score) };
}

function psychologyFor(sheet: WorkshopSheet): CodexSnapshotV1["psychology"] {
  const source = sheet.signatureAttributes ?? {};
  const traits: CodexSnapshotV1["psychology"] = [];
  for (const category of PSYCHOLOGY_CATEGORIES) {
    const workshopKey = Object.entries(WORKSHOP_TRAIT).find(([, value]) => value === category)?.[0];
    if (!workshopKey) continue;
    const description = cleanString(source[workshopKey]);
    if (!description) continue;
    traits.push({
      id: `psy-${category}`,
      category,
      label: CATEGORY_LABEL[category],
      description,
    });
  }
  return traits;
}

function equipmentFor(sheet: WorkshopSheet): CodexSnapshotV1["equipment"] {
  const source = sheet.equipment ?? {};
  const items: CodexSnapshotV1["equipment"] = [];
  for (const slot of GEAR_BLUEPRINT) {
    const name = cleanString(source[slot.key]);
    if (!name || NONE.test(name)) continue;
    items.push({
      id: slot.id,
      name,
      target: slot.target,
      priority: slot.priority,
      description: slot.description,
    });
  }
  return items;
}

function portraitFor(options: NormalizeOptions): CodexSnapshotV1["portrait"] {
  const url = cleanString(options.portraitUrl);
  if (!url || url.length > MAX_PORTRAIT_CHARS) return null;
  const focalX = unitInterval(options.focalPoint?.x, 0.5);
  const focalY = unitInterval(options.focalPoint?.y, 0.5);
  return {
    assetId: `portrait-${sha256Hex(url).slice(0, 12)}`,
    renditionUrl: url,
    width: clampInt(options.portraitWidth, 0, 20000, 0),
    height: clampInt(options.portraitHeight, 0, 20000, 0),
    mimeType: cleanString(options.portraitMimeType) ?? "image/png",
    contentHash: sha256Hex(url),
    focalPoint: { x: focalX, y: focalY },
    cropRect: {
      x: unitInterval(options.cropRect?.x, 0),
      y: unitInterval(options.cropRect?.y, 0),
      width: unitInterval(options.cropRect?.width, 1),
      height: unitInterval(options.cropRect?.height, 1),
    },
  };
}

function relationsFor(sheet: WorkshopSheet): CodexSnapshotV1["relations"] {
  const bonds: Array<[string | undefined, string]> = [
    [sheet.relationships?.allies, "ally"],
    [sheet.relationships?.enemies, "enemy"],
    [sheet.relationships?.mentors, "mentor"],
    [sheet.relationships?.family, "family"],
  ];
  return bonds.flatMap(([value, bond]) => {
    const name = cleanString(value);
    return name ? [{ name, bond }] : [];
  });
}

export function sourceStatIssues(sheet: WorkshopSheet): ReviewIssue[] {
  return ATTRIBUTE_KEYS.flatMap((key) => {
    const found = sheet.stats?.find((stat) => stat.key?.toLowerCase() === key);
    if (found && Number.isFinite(found.value)) return [];
    return [{
      severity: "blocking" as const,
      section: "attributes" as const,
      message: `${key.toUpperCase()} is missing or invalid`,
    }];
  });
}

export function isSealedSnapshot(snapshot: CodexSnapshotV1): boolean {
  return Boolean((snapshot as object as Record<symbol, boolean>)[SEALED]);
}

export function sealImportedSnapshot<T extends CodexSnapshotV1>(value: T): T {
  if (value.revision > 0) return sealFlag(value);
  return deepFreeze(value);
}

function sealFlag<T extends object>(value: T): T {
  Object.defineProperty(value, SEALED, { value: true });
  return deepFreeze(value);
}

export function normalizeSnapshot(sheet: WorkshopSheet, options: NormalizeOptions): CodexSnapshotV1 {
  const maxHp = clampInt(sheet.derivedStats?.hpMax, 1, 9999, 1);
  const hp = Math.min(maxHp, clampInt(sheet.derivedStats?.hpCurrent, 0, 9999, maxHp));
  const resourceName = cleanString(sheet.derivedStats?.resourceName);
  const resourceMax = clampInt(sheet.derivedStats?.resourceMax, 0, 9999, 0);
  const resourceCurrent = Math.min(resourceMax, clampInt(sheet.derivedStats?.resourceCurrent, 0, 9999, 0));
  const marks = [cleanString(sheet.physical?.marks), cleanString(sheet.physical?.scars)].filter((mark): mark is string => Boolean(mark));
  const skills = (sheet.skills ?? []).flatMap((skill) => {
    const name = cleanString(skill.name);
    return name ? [{ name, type: "skill" }] : [];
  });
  const passives = (sheet.derivedStats?.passives ?? []).flatMap((passive) => {
    const name = cleanString(passive);
    return name ? [{ name, type: "passive" }] : [];
  });
  const classTitle = cleanString(sheet.overview?.classRole) ?? cleanString(sheet.title);
  const factionText = cleanString(sheet.overview?.faction);

  const draft = {
    schemaVersion: CODEX_SCHEMA_VERSION,
    snapshotId: options.snapshotId,
    characterId: options.characterId,
    revision: options.revision ?? 0,
    finalizedAt: options.finalizedAt,
    template: { id: CODEX_TEMPLATE_ID, version: CODEX_TEMPLATE_VERSION },
    identity: {
      name: cleanString(sheet.name),
      classTitle,
      faction: factionText && !NONE.test(factionText) ? factionText : null,
      motto: cleanString(sheet.personality?.speech),
    },
    portrait: portraitFor(options),
    physical: {
      silhouette: cleanString(sheet.physical?.build),
      marks,
      height: cleanString(sheet.physical?.height),
      weight: cleanString(sheet.physical?.weight),
    },
    psychology: psychologyFor(sheet),
    combat: {
      hp,
      maxHp,
      ac: clampInt(sheet.derivedStats?.ac, 0, 40, 10),
      initiative: clampInt(leadingInt(sheet.derivedStats?.initiative, 0), -10, 30, 0),
      speed: clampInt(leadingInt(sheet.derivedStats?.speed, 30), 0, 120, 30),
    },
    attributes: {
      str: scoreFor(sheet, "str"),
      dex: scoreFor(sheet, "dex"),
      con: scoreFor(sheet, "con"),
      int: scoreFor(sheet, "int"),
      wis: scoreFor(sheet, "wis"),
      cha: scoreFor(sheet, "cha"),
    },
    resources: resourceName ? [{ name: resourceName, current: resourceCurrent, max: resourceMax }] : [],
    proficiencies: [...skills, ...passives].slice(0, 24),
    equipment: equipmentFor(sheet),
    chronicle: {
      backstorySummary: cleanString(sheet.lore?.backstory) ?? "",
      notes: cleanString(sheet.lore?.motivations),
    },
    relations: relationsFor(sheet),
    visual: { genreTheme: genreFor(cleanString(sheet.sheet_style)) },
    provenance: {
      creator: cleanString(options.creator),
      presetId: cleanString(options.presetId),
      sourceHash: "0".repeat(64),
    },
  } satisfies CodexSnapshotV1;

  const sourceHash = hashableSnapshot(draft);
  const parsed = SnapshotBodySchema.parse({ ...draft, provenance: { ...draft.provenance, sourceHash } });
  return deepFreeze(parsed);
}

export function lockCodexSnapshot(proof: CodexSnapshotV1, finalizedAt: string): CodexSnapshotV1 {
  if (isSealedSnapshot(proof)) throw new Error("Codex snapshot is immutable");
  const next = {
    ...proof,
    revision: proof.revision + 1,
    finalizedAt,
    provenance: { ...proof.provenance, sourceHash: "0".repeat(64) },
  };
  const sourceHash = hashableSnapshot(next);
  const parsed = SnapshotBodySchema.parse({ ...next, provenance: { ...next.provenance, sourceHash } });
  return sealFlag(parsed);
}
