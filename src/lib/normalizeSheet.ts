import { DossierSheet, DossierStat } from "../types/dossier";
import { cloneSheet, DEFAULT_GELBINOR } from "./defaultSheet";

const CORE_STATS: Array<{ key: string; label: string; desc: string }> = [
  { key: "STR", label: "Strength", desc: "Physical might" },
  { key: "DEX", label: "Dexterity", desc: "Agility & reflexes" },
  { key: "CON", label: "Constitution", desc: "Vigor & health" },
  { key: "INT", label: "Intelligence", desc: "Reason & lore" },
  { key: "WIS", label: "Wisdom", desc: "Perception & intuition" },
  { key: "CHA", label: "Charisma", desc: "Presence & resolve" }
];

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function asNumber(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeStats(raw: unknown, fallback: DossierStat[]): DossierStat[] {
  if (!Array.isArray(raw) || raw.length === 0) return fallback.map((s) => ({ ...s }));

  return CORE_STATS.map((meta, idx) => {
    const match = raw.find((s: any) => {
      const key = asString(s?.key || s?.label || s?.stat).toUpperCase();
      return key.includes(meta.key);
    }) || raw[idx];

    return {
      key: meta.key,
      label: asString(match?.label, meta.label),
      value: Math.max(1, Math.min(24, asNumber(match?.value, fallback[idx]?.value ?? 10))),
      desc: asString(match?.desc, meta.desc)
    };
  });
}

/**
 * Coerce a partial / legacy sheet (Sheets import, older localStorage) into the live dossier shape.
 * Missing nested fields fall back to Gelbinor defaults so the UI never reads undefined.
 */
export function normalizeSheet(raw: unknown): DossierSheet {
  const base = cloneSheet(DEFAULT_GELBINOR);
  const data = (raw && typeof raw === "object" ? raw : {}) as Record<string, any>;
  const overview = data.overview && typeof data.overview === "object" ? data.overview : {};
  const physical = data.physical && typeof data.physical === "object" ? data.physical : {};
  const lore = data.lore && typeof data.lore === "object" ? data.lore : {};
  const equipment = data.equipment && typeof data.equipment === "object" ? data.equipment : {};
  const signature = data.signatureAttributes && typeof data.signatureAttributes === "object"
    ? data.signatureAttributes
    : (data.traits && typeof data.traits === "object" ? data.traits : {});
  const derived = data.derivedStats && typeof data.derivedStats === "object" ? data.derivedStats : {};
  const personality = data.personality && typeof data.personality === "object" ? data.personality : {};
  const relationships = data.relationships && typeof data.relationships === "object" ? data.relationships : {};

  const hp = asNumber(derived.hpCurrent ?? overview.hp, base.derivedStats.hpCurrent);
  const hpMax = asNumber(derived.hpMax ?? overview.hp, base.derivedStats.hpMax);

  return {
    ...base,
    name: asString(data.name, base.name),
    title: asString(data.title, base.title),
    player: asString(data.player, base.player),
    sheet_style: asString(data.sheet_style, base.sheet_style),
    overview: {
      ...base.overview,
      race: asString(overview.race, base.overview.race),
      age: asString(overview.age, base.overview.age),
      gender: asString(overview.gender, base.overview.gender),
      alignment: asString(overview.alignment, base.overview.alignment),
      classRole: asString(overview.classRole, base.overview.classRole),
      level: asString(overview.level, base.overview.level),
      origin: asString(overview.origin, base.overview.origin),
      faction: asString(overview.faction, base.overview.faction)
    },
    physical: {
      ...base.physical,
      height: asString(physical.height, base.physical.height),
      weight: asString(physical.weight, base.physical.weight),
      build: asString(physical.build, base.physical.build),
      eyes: asString(physical.eyes, base.physical.eyes),
      hair: asString(physical.hair, base.physical.hair),
      skin: asString(physical.skin, base.physical.skin),
      marks: asString(physical.marks ?? physical.distinguishing_feature, base.physical.marks),
      scars: asString(physical.scars, base.physical.scars),
      clothing: asString(physical.clothing, base.physical.clothing),
      voice: asString(physical.voice, base.physical.voice),
      posture: asString(physical.posture, base.physical.posture)
    },
    lore: {
      ...base.lore,
      backstory: asString(lore.backstory ?? overview.bio, base.lore.backstory),
      childhood: asString(lore.childhood, base.lore.childhood),
      formative: asString(lore.formative, base.lore.formative),
      motivations: asString(lore.motivations, base.lore.motivations),
      secrets: asString(lore.secrets, base.lore.secrets),
      world: asString(lore.world, base.lore.world)
    },
    abilities: Array.isArray(data.abilities) && data.abilities.length > 0
      ? data.abilities.map((ab: any, i: number) => ({
          name: asString(ab?.name, base.abilities[i]?.name || `Ability ${i + 1}`),
          desc: asString(ab?.desc, base.abilities[i]?.desc || ""),
          cooldown: asString(ab?.cooldown, base.abilities[i]?.cooldown || "At will"),
          cost: asString(ab?.cost, base.abilities[i]?.cost || "Focus"),
          type: asString(ab?.type, base.abilities[i]?.type || "Primary")
        }))
      : base.abilities,
    weaknesses: asString(data.weaknesses, base.weaknesses),
    skills: Array.isArray(data.skills) && data.skills.length > 0
      ? data.skills.map((sk: any, i: number) => ({
          name: asString(sk?.name, `Skill ${i + 1}`),
          value: Math.max(0, Math.min(100, asNumber(sk?.value, 50)))
        }))
      : base.skills,
    magic: asString(data.magic, base.magic),
    equipment: {
      ...base.equipment,
      primaryWeapon: asString(equipment.primaryWeapon ?? equipment.weapons, base.equipment.primaryWeapon),
      secondaryFocus: asString(equipment.secondaryFocus, base.equipment.secondaryFocus),
      armor: asString(equipment.armor, base.equipment.armor),
      utilityTools: asString(equipment.utilityTools, base.equipment.utilityTools),
      consumables: asString(equipment.consumables, base.equipment.consumables),
      relics: asString(equipment.relics, base.equipment.relics),
      currency: asString(equipment.currency, base.equipment.currency),
      weapons: asString(equipment.weapons ?? equipment.primaryWeapon, base.equipment.weapons),
      items: asString(
        equipment.items || (Array.isArray(data.inventory) ? data.inventory.join(", ") : ""),
        base.equipment.items
      )
    },
    signatureAttributes: {
      ...base.signatureAttributes,
      reputation: asString(signature.reputation, base.signatureAttributes.reputation),
      vice: asString(signature.vice, base.signatureAttributes.vice),
      virtue: asString(signature.virtue, base.signatureAttributes.virtue),
      fear: asString(signature.fear, base.signatureAttributes.fear),
      obsession: asString(signature.obsession, base.signatureAttributes.obsession),
      tell: asString(signature.tell, base.signatureAttributes.tell),
      loyalty: asString(signature.loyalty, base.signatureAttributes.loyalty),
      blindSpot: asString(signature.blindSpot ?? signature.blind_spot, base.signatureAttributes.blindSpot),
      survivalInstinct: asString(signature.survivalInstinct ?? signature.survival_instinct, base.signatureAttributes.survivalInstinct),
      legacyFear: asString(signature.legacyFear ?? signature.legacy_fear, base.signatureAttributes.legacyFear)
    },
    derivedStats: {
      ...base.derivedStats,
      hpCurrent: hp,
      hpMax: hpMax,
      ac: asNumber(derived.ac ?? overview.ac, base.derivedStats.ac),
      initiative: asString(derived.initiative ?? overview.initiative, base.derivedStats.initiative),
      speed: asString(derived.speed ?? overview.speed, base.derivedStats.speed),
      level: asNumber(derived.level ?? overview.level, base.derivedStats.level),
      resourceName: asString(derived.resourceName, base.derivedStats.resourceName),
      resourceCurrent: asNumber(derived.resourceCurrent, base.derivedStats.resourceCurrent),
      resourceMax: asNumber(derived.resourceMax, base.derivedStats.resourceMax),
      passives: Array.isArray(derived.passives)
        ? derived.passives.map((p: unknown) => asString(p)).filter(Boolean)
        : (Array.isArray(data.passives) ? data.passives.map((p: unknown) => asString(p)).filter(Boolean) : base.derivedStats.passives)
    },
    personality: {
      ...base.personality,
      traits: asString(personality.traits, base.personality.traits),
      ideals: asString(personality.ideals, base.personality.ideals),
      flaws: asString(personality.flaws, base.personality.flaws),
      fears: asString(personality.fears, base.personality.fears),
      mannerisms: asString(personality.mannerisms, base.personality.mannerisms),
      speech: asString(personality.speech, base.personality.speech)
    },
    relationships: {
      ...base.relationships,
      allies: asString(relationships.allies, base.relationships.allies),
      enemies: asString(relationships.enemies, base.relationships.enemies),
      mentors: asString(relationships.mentors, base.relationships.mentors),
      family: asString(relationships.family, base.relationships.family)
    },
    stats: normalizeStats(data.stats, base.stats)
  };
}
