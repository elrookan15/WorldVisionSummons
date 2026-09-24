import type { UiSheetData } from "./sheetMapper";

/** Visible ink only. Blank fields are omitted — the page never invents filler copy. */
export function ink(value: unknown): string {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "";
    return String(value);
  }
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function isPresent(value: unknown): boolean {
  return ink(value).length > 0;
}

export type CodexCallout = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  vignette: "weapon" | "focus" | "armor" | "tools" | "consumable" | "relic" | "ability";
};

export type DnaLine = { label: string; text: string };

export type CodexPageModel = {
  name: string;
  subtitle: string;
  style: string;
  initials: string;
  roleLines: DnaLine[];
  physicalLines: DnaLine[];
  loreParagraphs: string[];
  dna: DnaLine[];
  callouts: CodexCallout[];
  abilities: CodexCallout[];
  weakness: string;
  magic: string;
  skills: Array<{ name: string; value: number }>;
  relationships: DnaLine[];
  attributes: Array<{ key: string; label: string; value: number }>;
  combat: DnaLine[];
  quote: string;
  quoteAttribution: string;
};

const DNA_FIELDS: Array<[keyof UiSheetData["signatureAttributes"], string]> = [
  ["reputation", "Reputation"],
  ["vice", "Vice"],
  ["virtue", "Virtue"],
  ["fear", "Fear"],
  ["obsession", "Obsession"],
  ["tell", "Tell"],
  ["loyalty", "Loyalty"],
  ["blindSpot", "Blind Spot"],
  ["survivalInstinct", "Survival"],
  ["legacyFear", "Legacy Fear"],
];

function splitCallout(raw: string): { title: string; body: string } {
  const text = ink(raw);
  const broken = text.split(/\s+[—–]\s+|\s+-\s+/);
  if (broken.length > 1 && broken[0].length <= 48) {
    return { title: broken[0], body: broken.slice(1).join(" — ") };
  }
  if (text.length > 56) {
    const cut = text.lastIndexOf(" ", 48);
    const at = cut > 16 ? cut : 48;
    return { title: text.slice(0, at), body: text };
  }
  return { title: text, body: "" };
}

function pushLine(bucket: DnaLine[], label: string, value: unknown) {
  const text = ink(value);
  if (text) bucket.push({ label, text });
}

export function sheetInitials(name: string): string {
  const parts = ink(name).split(" ").filter(Boolean);
  if (!parts.length) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function buildCodexPageModel(sheet: UiSheetData): CodexPageModel {
  const roleLines: DnaLine[] = [];
  pushLine(roleLines, "Race", sheet.overview?.race);
  pushLine(roleLines, "Class", sheet.overview?.classRole);
  pushLine(roleLines, "Level", sheet.overview?.level);
  pushLine(roleLines, "Alignment", sheet.overview?.alignment);
  pushLine(roleLines, "Origin", sheet.overview?.origin);
  pushLine(roleLines, "Faction", sheet.overview?.faction);
  pushLine(roleLines, "Age", sheet.overview?.age);
  pushLine(roleLines, "Gender", sheet.overview?.gender);

  const physicalLines: DnaLine[] = [];
  pushLine(physicalLines, "Height", sheet.physical?.height);
  pushLine(physicalLines, "Weight", sheet.physical?.weight);
  pushLine(physicalLines, "Build", sheet.physical?.build);
  pushLine(physicalLines, "Eyes", sheet.physical?.eyes);
  pushLine(physicalLines, "Hair", sheet.physical?.hair);
  pushLine(physicalLines, "Skin", sheet.physical?.skin);
  pushLine(physicalLines, "Marks", sheet.physical?.marks);
  pushLine(physicalLines, "Scars", sheet.physical?.scars);
  pushLine(physicalLines, "Attire", sheet.physical?.clothing);
  pushLine(physicalLines, "Voice", sheet.physical?.voice);
  pushLine(physicalLines, "Posture", sheet.physical?.posture);

  const loreParagraphs = [
    sheet.lore?.backstory,
    sheet.lore?.childhood,
    sheet.lore?.formative,
    sheet.lore?.motivations,
    sheet.lore?.secrets,
    sheet.lore?.world,
  ].map(ink).filter(Boolean);

  const dna: DnaLine[] = [];
  for (const [key, label] of DNA_FIELDS) {
    pushLine(dna, label, sheet.signatureAttributes?.[key]);
  }

  const equipmentSlots: Array<[string, string, CodexCallout["vignette"], string | undefined]> = [
    ["primary", "Primary Weapon", "weapon", sheet.equipment?.primaryWeapon],
    ["focus", "Secondary Focus", "focus", sheet.equipment?.secondaryFocus],
    ["armor", "Armor", "armor", sheet.equipment?.armor],
    ["tools", "Utility", "tools", sheet.equipment?.utilityTools],
    ["consumables", "Consumables", "consumable", sheet.equipment?.consumables],
    ["relics", "Relics", "relic", sheet.equipment?.relics],
    ["weapons", "Weapons", "weapon", sheet.equipment?.weapons],
    ["currency", "Currency", "tools", sheet.equipment?.currency],
  ];

  const seen = new Set<string>();
  const callouts: CodexCallout[] = [];
  for (const [id, kicker, vignette, raw] of equipmentSlots) {
    const text = ink(raw);
    if (!text || seen.has(text.toLowerCase())) continue;
    seen.add(text.toLowerCase());
    const parts = splitCallout(text);
    callouts.push({ id, kicker, title: parts.title, body: parts.body, vignette });
  }

  const itemBlob = ink(sheet.equipment?.items);
  if (itemBlob) {
    for (const piece of itemBlob.split(",").map(ink).filter(Boolean)) {
      if (seen.has(piece.toLowerCase())) continue;
      const already = callouts.some((c) => piece.toLowerCase().includes(c.title.toLowerCase()) || c.title.toLowerCase().includes(piece.toLowerCase()));
      if (already) continue;
      seen.add(piece.toLowerCase());
      const parts = splitCallout(piece);
      callouts.push({
        id: `item-${callouts.length}`,
        kicker: "Inventory",
        title: parts.title,
        body: parts.body,
        vignette: "tools",
      });
    }
  }

  const abilities: CodexCallout[] = [];
  for (const ability of sheet.abilities || []) {
    const name = ink(ability?.name);
    const desc = ink(ability?.desc);
    if (!name && !desc) continue;
    const meta = [ink(ability?.type), ink(ability?.cost), ink(ability?.cooldown)].filter(Boolean).join(" · ");
    abilities.push({
      id: `ability-${abilities.length}`,
      kicker: meta || "Ability",
      title: name || "Unnamed rite",
      body: desc,
      vignette: "ability",
    });
  }

  const relationships: DnaLine[] = [];
  pushLine(relationships, "Allies", sheet.relationships?.allies);
  pushLine(relationships, "Rivals", sheet.relationships?.enemies);
  pushLine(relationships, "Mentors", sheet.relationships?.mentors);
  pushLine(relationships, "Kin", sheet.relationships?.family);

  const attributes = (sheet.stats || [])
    .filter((stat) => stat && isPresent(stat.label || stat.key) && Number.isFinite(stat.value))
    .map((stat) => ({
      key: ink(stat.key) || ink(stat.label).slice(0, 3).toUpperCase(),
      label: ink(stat.label) || ink(stat.key),
      value: stat.value,
    }));

  const combat: DnaLine[] = [];
  const derived = sheet.derivedStats;
  if (derived) {
    if (Number.isFinite(derived.hpMax) && derived.hpMax > 0) {
      const current = Number.isFinite(derived.hpCurrent) ? derived.hpCurrent : derived.hpMax;
      combat.push({ label: "Hit Points", text: `${current} / ${derived.hpMax}` });
    }
    if (Number.isFinite(derived.ac) && derived.ac > 0) combat.push({ label: "Armor Class", text: String(derived.ac) });
    pushLine(combat, "Initiative", derived.initiative);
    pushLine(combat, "Speed", derived.speed);
    if (isPresent(derived.resourceName) && (derived.resourceMax > 0 || derived.resourceCurrent > 0)) {
      combat.push({
        label: ink(derived.resourceName),
        text: `${derived.resourceCurrent} / ${derived.resourceMax}`,
      });
    }
    if (Number.isFinite(derived.level) && derived.level > 0 && !roleLines.some((l) => l.label === "Level")) {
      pushLine(roleLines, "Tier", String(derived.level));
    }
  }

  const skills = (sheet.skills || []).filter((skill) => isPresent(skill?.name) && Number.isFinite(skill.value));
  const quote = ink(sheet.personality?.speech);
  const quoteAttribution = ink(sheet.name);

  return {
    name: ink(sheet.name),
    subtitle: ink(sheet.title),
    style: ink(sheet.sheet_style),
    initials: sheetInitials(sheet.name),
    roleLines,
    physicalLines,
    loreParagraphs,
    dna,
    callouts: callouts.slice(0, 7),
    abilities: abilities.slice(0, 4),
    weakness: ink(sheet.weaknesses),
    magic: ink(sheet.magic),
    skills,
    relationships,
    attributes,
    combat,
    quote,
    quoteAttribution,
  };
}
