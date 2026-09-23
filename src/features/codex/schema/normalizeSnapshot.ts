import { assignAnchors, PREFERRED_ANCHOR } from "../composition/routeCallouts";
import { selectAttributes, selectGear, selectTraits } from "../composition/selectContent";
import {
  FIXED_PORTRAIT_CROP,
  MAX_PORTRAIT_CHARS,
  type CodexSnapshotV1,
  type SnapshotBody,
  type WorkshopSheet,
  sealSnapshot,
  snapshotBody,
} from "./codexSnapshotV1";

export interface NormalizeOptions {
  finalizedAt: string;
  revision?: number;
  sourceSheetId?: string | null;
  portraitUrl?: string | null;
  locked?: boolean;
}

function clampText(value: string, max: number): string {
  const clean = value.replace(/\s+/g, " ").trim();
  const chars = [...clean];
  if (chars.length <= max) return clean;
  return chars.slice(0, max).join("");
}

function warn(warnings: string[], message: string): void {
  if (warnings.length >= 32) return;
  warnings.push(message.slice(0, 180));
}

function intIn(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function crestFrom(name: string): string {
  const letters = name
    .split(/\s+/)
    .map((part) => [...part].find((ch) => /\p{L}/u.test(ch)) ?? "")
    .join("")
    .toUpperCase();
  const crest = letters.slice(0, 2);
  return crest || "WS";
}

function portraitUrlOrNull(url: string | null | undefined, warnings: string[]): string | null {
  if (!url) return null;
  if (url.startsWith("data:") && url.length > MAX_PORTRAIT_CHARS) {
    warn(warnings, "Portrait omitted: inline image exceeds the plate storage limit");
    return null;
  }
  return url;
}

export function normalizeSnapshot(sheet: WorkshopSheet, options: NormalizeOptions): CodexSnapshotV1 {
  const warnings: string[] = [];
  const rawName = clampText(sheet.name || "", 80);
  const name = rawName || "Unnamed Summon";
  if (!rawName) warn(warnings, "Missing name; plate uses Unnamed Summon");

  const epithet = clampText(sheet.title || "", 80);
  const role = clampText(sheet.overview.classRole || "", 60) || "Adventurer";
  if (!sheet.overview.classRole.trim()) warn(warnings, "Missing role; plate uses Adventurer");
  const faction = clampText(sheet.overview.faction || sheet.overview.alignment || "", 40);
  const title = clampText(faction ? `${role} of ${faction}` : role, 80);
  const motto = clampText(sheet.personality.speech || "", 160);
  const sheetStyle = clampText(sheet.sheet_style || "", 80) || "Gothic Dark Fantasy";

  const marks = [sheet.physical.marks, sheet.physical.scars, sheet.physical.build, `${sheet.physical.height} / ${sheet.physical.weight}`]
    .map((entry) => clampText(entry || "", 48))
    .filter((entry) => entry.length > 0)
    .slice(0, 4);

  const traits = selectTraits(sheet.signatureAttributes).map((trait) => {
    const full = trait.value;
    const value = clampText(full, 160);
    if ([...full].length > 160) warn(warnings, `Truncated trait: ${trait.label}`);
    return { key: trait.key, label: trait.label, value };
  });

  const gearSelected = selectGear(sheet.equipment);
  for (const piece of gearSelected) {
    if (!piece.inscribed) warn(warnings, `Uninscribed gear slot: ${piece.label}`);
  }
  const anchored = assignAnchors(
    gearSelected.map((piece) => ({ id: piece.slot, preferred: PREFERRED_ANCHOR[piece.slot] })),
  );
  const gear = gearSelected.map((piece) => {
    const anchor = anchored.find((item) => item.id === piece.slot);
    if (!anchor) throw new Error(`Missing anchor for ${piece.slot}`);
    return {
      slot: piece.slot,
      label: piece.label,
      name: clampText(piece.name, 120),
      anchor: anchor.anchor,
    };
  });

  const hpMax = intIn(sheet.derivedStats.hpMax, 1, 9999, 1);
  let hpCurrent = intIn(sheet.derivedStats.hpCurrent, 0, 9999, hpMax);
  if (hpCurrent > hpMax) {
    hpCurrent = hpMax;
    warn(warnings, "Hit points clamped to the recorded maximum");
  }
  const resourceMax = intIn(sheet.derivedStats.resourceMax, 0, 9999, 0);
  let resourceCurrent = intIn(sheet.derivedStats.resourceCurrent, 0, 9999, 0);
  if (resourceCurrent > resourceMax) {
    resourceCurrent = resourceMax;
    warn(warnings, "Class resource clamped to the recorded maximum");
  }

  const attributes = selectAttributes(sheet.stats).map((stat) => {
    const value = intIn(stat.value, 1, 30, 10);
    if (!stat.filled) warn(warnings, `Missing attribute ${stat.key}; plate uses 10`);
    else if (value !== stat.value) warn(warnings, `Attribute ${stat.key} clamped into 1–30`);
    return { key: stat.key, label: clampText(stat.label, 24), value };
  });

  const backstoryFull = sheet.lore.backstory || "";
  const backstory = clampText(backstoryFull, 2000);
  if ([...backstoryFull.replace(/\s+/g, " ").trim()].length > 2000) {
    warn(warnings, "Truncated chronicle to the plate limit");
  }

  const body: SnapshotBody = {
    schemaVersion: 1,
    templateId: "illuminated-codex",
    revision: options.revision ?? 0,
    locked: options.locked ?? false,
    finalizedAt: options.finalizedAt,
    sourceSheetId: options.sourceSheetId ?? null,
    identity: {
      name,
      epithet,
      title,
      motto,
      role,
      crest: crestFrom(name),
      sheetStyle,
    },
    physicalMarks: marks,
    traits,
    gear,
    vitals: {
      hpCurrent,
      hpMax,
      ac: intIn(sheet.derivedStats.ac, 0, 99, 10),
      initiative: clampText(sheet.derivedStats.initiative || "+0", 16) || "+0",
      speed: clampText(sheet.derivedStats.speed || "30 ft", 16) || "30 ft",
      level: intIn(sheet.derivedStats.level, 1, 40, 1),
      resourceName: clampText(sheet.derivedStats.resourceName || "Focus", 32) || "Focus",
      resourceCurrent,
      resourceMax,
    },
    attributes,
    chronicle: {
      backstory,
      quote: motto,
    },
    portrait: {
      url: portraitUrlOrNull(options.portraitUrl, warnings),
      crop: { ...FIXED_PORTRAIT_CROP },
    },
    warnings,
  };

  return sealSnapshot(body);
}

export function lockCodexSnapshot(snapshot: CodexSnapshotV1, finalizedAt: string): CodexSnapshotV1 {
  if (snapshot.locked) throw new Error("Codex page is immutable once locked");
  const body = snapshotBody(snapshot);
  return sealSnapshot({
    ...body,
    locked: true,
    finalizedAt,
    revision: body.revision + 1,
  });
}
