import { CharacterSheetData } from "../types";
import { canonicalizeSheetStyle } from "./themeMap";

export type UiSheetData = {
  name: string;
  title: string;
  player: string;
  sheet_style: string;
  overview: {
    race: string;
    age: string;
    gender: string;
    alignment: string;
    classRole: string;
    level: string;
    origin: string;
    faction: string;
  };
  physical: {
    height: string;
    weight: string;
    build: string;
    eyes: string;
    hair: string;
    skin: string;
    marks: string;
    scars: string;
    clothing: string;
    voice: string;
    posture: string;
  };
  signatureAttributes: {
    reputation: string;
    vice: string;
    virtue: string;
    fear: string;
    obsession: string;
    tell: string;
    loyalty: string;
    blindSpot: string;
    survivalInstinct: string;
    legacyFear: string;
  };
  derivedStats: {
    hpCurrent: number;
    hpMax: number;
    ac: number;
    initiative: string;
    speed: string;
    level: number;
    resourceName: string;
    resourceCurrent: number;
    resourceMax: number;
    passives: string[];
  };
  lore: {
    backstory: string;
    childhood: string;
    formative: string;
    motivations: string;
    secrets: string;
    world: string;
  };
  abilities: Array<{ name: string; desc: string; cooldown: string; cost: string; type: string }>;
  weaknesses: string;
  skills: Array<{ name: string; value: number }>;
  magic: string;
  equipment: {
    primaryWeapon: string;
    secondaryFocus: string;
    armor: string;
    utilityTools: string;
    consumables: string;
    relics: string;
    currency: string;
    weapons: string;
    items: string;
  };
  personality: {
    traits: string;
    ideals: string;
    flaws: string;
    fears: string;
    mannerisms: string;
    speech: string;
  };
  relationships: {
    allies: string;
    enemies: string;
    mentors: string;
    family: string;
  };
  stats: Array<{ key: string; label: string; value: number; desc: string }>;
};

function splitInventory(raw?: string): string[] {
  return (raw || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseResource(currentMax?: string): { current: number; max: number } {
  const parts = String(currentMax || "20 / 20").split("/");
  const current = parseInt(String(parts[0]).trim(), 10);
  const max = parseInt(String(parts[1] ?? parts[0]).trim(), 10);
  return {
    current: Number.isFinite(current) ? current : 20,
    max: Number.isFinite(max) ? max : 20,
  };
}

export function mapGeneratedSheetToUi(
  data: CharacterSheetData,
  extras: {
    characterLevel: string | number;
    playerName?: string;
    sheetStyle: string;
  }
): UiSheetData {
  const style = canonicalizeSheetStyle(data.character_data?.sheet_style || extras.sheetStyle);
  const invArray = splitInventory(data.character_data?.inventory_items);
  const resource = parseResource(data.rpg_stats?.class_resource?.current_max);
  const levelNum = Number(extras.characterLevel) || data.rpg_stats?.derived_stats?.level || 5;
  const lore = data.character_data?.character_lore || "A summoned wanderer bound by an unfinished oath.";
  const hp = data.rpg_stats?.derived_stats?.hp || 75;

  return {
    name: data.character_data?.character_name || "Unnamed Summon",
    title: `${data.character_data?.character_class || "Adventurer"} • Tier ${levelNum}`,
    player: extras.playerName?.trim() ? "Summoned Hero" : "Autonomous Inference",
    sheet_style: style,
    overview: {
      race: "Generated Entity",
      age: "Timeless",
      gender: "Various",
      alignment: data.rpg_stats?.alignment_or_faction || "Neutral",
      classRole: data.character_data?.character_class || "Adventurer",
      level: `Level ${levelNum}`,
      origin: lore.length > 48 ? `${lore.slice(0, 48)}...` : lore,
      faction: data.rpg_stats?.alignment_or_faction || "None",
    },
    physical: {
      height: data.character_data?.physical_attributes?.height || "6'0\"",
      weight: data.character_data?.physical_attributes?.weight || "180 lbs",
      build: data.character_data?.physical_attributes?.build || "Athletic",
      eyes: "Inferred from lore",
      hair: "Coordinated with style",
      skin: "Weathered",
      marks: data.character_data?.physical_attributes?.distinguishing_feature || "None",
      scars: "Battle-tested",
      clothing: `${style} attire`,
      voice: "Resonant",
      posture: "Ready for combat",
    },
    signatureAttributes: {
      reputation: data.signature_attributes?.reputation || "The Unseen",
      vice: data.signature_attributes?.vice || "Gambling with fate",
      virtue: data.signature_attributes?.virtue || "Mercy to the defenseless",
      fear: data.signature_attributes?.fear || "Abyssal silence",
      obsession: data.signature_attributes?.obsession || "Collecting names",
      tell: data.signature_attributes?.tell || "Tapping fingers on scabbard",
      loyalty: data.signature_attributes?.loyalty || "Sworn vanguard oath",
      blindSpot: data.signature_attributes?.blind_spot || "Cannot perceive false allies",
      survivalInstinct: data.signature_attributes?.survival_instinct || "Feigning submission",
      legacyFear: data.signature_attributes?.legacy_fear || "Being forgotten in ash",
    },
    derivedStats: {
      hpCurrent: hp,
      hpMax: hp,
      ac: data.rpg_stats?.derived_stats?.ac || 15,
      initiative: data.rpg_stats?.derived_stats?.initiative || "+1",
      speed: data.rpg_stats?.derived_stats?.speed || "30 ft",
      level: levelNum,
      resourceName: data.rpg_stats?.class_resource?.resource_type || "Energy / Focus",
      resourceCurrent: resource.current,
      resourceMax: resource.max,
      passives: data.rpg_stats?.passive_skills || ["Core Specialty", "Combat Focus"],
    },
    lore: {
      backstory: lore,
      childhood: "Formative years in the frontier.",
      formative: "Awakened by destiny and trial.",
      motivations: data.signature_attributes?.obsession || "Seek truth and survival.",
      secrets: data.signature_attributes?.fear || "Fears the unseen void.",
      world: `Realm of ${style}`,
    },
    abilities: [
      { name: "Core Specialization", desc: data.rpg_stats?.passive_skills?.[0] || "Mastery of discipline", cooldown: "Active", cost: "Focus", type: "Primary" },
      { name: "Tactical Maneuver", desc: data.rpg_stats?.passive_skills?.[1] || "Defensive stance", cooldown: "Passive", cost: "None", type: "Passive" },
      { name: "Ultimate Resolve", desc: data.rpg_stats?.passive_skills?.[2] || "Unshakable oath", cooldown: "1/day", cost: "Willpower", type: "Ultimate" },
    ],
    weaknesses: `Vulnerable when isolated; bound by the laws of ${style}.`,
    skills: [
      { name: "Combat & Arms", value: 85 },
      { name: "Lore & Arcana", value: 78 },
      { name: "Stealth & Evasion", value: 70 },
      { name: "Willpower", value: 90 },
    ],
    magic: `Resonates with ${style} energies.`,
    equipment: {
      primaryWeapon: invArray[0] || "Primary Weapon",
      secondaryFocus: invArray[1] || "Secondary Focus / Shield",
      armor: invArray[2] || "Protective Armor / Robes",
      utilityTools: invArray.slice(3, 5).join(", ") || "Utility Gear & Kits",
      consumables: invArray.slice(5, 7).join(", ") || "Consumables & Elixirs",
      relics: invArray.slice(7).join(", ") || "Relic Artifact",
      currency: "Standard Coinage & Relics",
      weapons: invArray[0] || "Primary Weapon",
      items: data.character_data?.inventory_items || invArray.join(", "),
    },
    personality: {
      traits: data.signature_attributes?.virtue || "Brave",
      ideals: data.signature_attributes?.loyalty || "Honor above all",
      flaws: data.signature_attributes?.vice || "Stubborn",
      fears: data.signature_attributes?.fear || "Darkness",
      mannerisms: data.signature_attributes?.tell || "Observant",
      speech: data.personal_quote?.text || "Determined.",
    },
    relationships: {
      allies: "Guild companions and loyal followers",
      enemies: "Rivals of the faction",
      mentors: "Ancient masters",
      family: "Lost to history",
    },
    stats: [
      { key: "STR", label: "Strength", value: data.rpg_stats?.core_attributes?.str || 14, desc: "Physical might" },
      { key: "DEX", label: "Dexterity", value: data.rpg_stats?.core_attributes?.dex || 14, desc: "Agility & reflexes" },
      { key: "CON", label: "Constitution", value: data.rpg_stats?.core_attributes?.con || 14, desc: "Vigor & health" },
      { key: "INT", label: "Intelligence", value: data.rpg_stats?.core_attributes?.int || 14, desc: "Reason & lore" },
      { key: "WIS", label: "Wisdom", value: data.rpg_stats?.core_attributes?.wis || 14, desc: "Perception & intuition" },
      { key: "CHA", label: "Charisma", value: data.rpg_stats?.core_attributes?.cha || 14, desc: "Presence & resolve" },
    ],
  };
}

export function portraitPromptContext(sheet: UiSheetData) {
  return {
    name: sheet.name,
    character_name: sheet.name,
    character_class: sheet.overview.classRole,
    character_lore: sheet.lore.backstory,
    sheet_style: sheet.sheet_style,
    inventory_items: sheet.equipment.items,
    physical: {
      height: sheet.physical.height,
      weight: sheet.physical.weight,
      build: sheet.physical.build,
      distinguishing_feature: sheet.physical.marks,
      marks: sheet.physical.marks,
    },
    overview: sheet.overview,
    lore: sheet.lore,
    equipment: sheet.equipment,
  };
}

export function clampResource(current: number, max: number, delta: number): number {
  const next = current + delta;
  return Math.max(0, Math.min(Math.max(0, max), next));
}

export function mergeImportedSheet(current: UiSheetData, imported: Record<string, any>): UiSheetData {
  const style = canonicalizeSheetStyle(imported.sheet_style || current.sheet_style);
  const importedStats = Array.isArray(imported.stats) ? imported.stats : [];
  const nextStats = current.stats.map((st) => {
    const match = importedStats.find(
      (s: any) => s?.key === st.key || String(s?.label || "").toUpperCase().includes(st.key)
    );
    return match ? { ...st, value: Number(match.value) || st.value } : st;
  });

  const inventory: string[] = Array.isArray(imported.inventory)
    ? imported.inventory.filter(Boolean)
    : [];

  return {
    ...current,
    name: imported.name || current.name,
    title: imported.title || current.title,
    sheet_style: style,
    overview: {
      ...current.overview,
      classRole: imported.overview?.classRole || current.overview.classRole,
      alignment: imported.overview?.alignment || current.overview.alignment,
      level: String(imported.overview?.level || current.overview.level),
      faction: imported.overview?.faction || current.overview.faction,
    },
    physical: {
      ...current.physical,
      height: imported.physical?.height || current.physical.height,
      weight: imported.physical?.weight || current.physical.weight,
      build: imported.physical?.build || current.physical.build,
      marks:
        imported.physical?.distinguishing_feature ||
        imported.physical?.marks ||
        current.physical.marks,
    },
    lore: {
      ...current.lore,
      backstory: imported.overview?.bio || imported.lore?.backstory || current.lore.backstory,
    },
    derivedStats: {
      ...current.derivedStats,
      hpCurrent: Number(imported.overview?.hp || imported.derivedStats?.hpCurrent || current.derivedStats.hpCurrent),
      hpMax: Number(imported.overview?.hp || imported.derivedStats?.hpMax || current.derivedStats.hpMax),
      ac: Number(imported.overview?.ac || imported.derivedStats?.ac || current.derivedStats.ac),
      speed: imported.overview?.speed || current.derivedStats.speed,
      initiative: imported.overview?.initiative || current.derivedStats.initiative,
    },
    equipment: {
      ...current.equipment,
      primaryWeapon: inventory[0] || current.equipment.primaryWeapon,
      secondaryFocus: inventory[1] || current.equipment.secondaryFocus,
      armor: inventory[2] || current.equipment.armor,
      items: inventory.length ? inventory.join(", ") : current.equipment.items,
      weapons: inventory[0] || current.equipment.weapons,
    },
    signatureAttributes: {
      ...current.signatureAttributes,
      ...(imported.traits
        ? {
            reputation: imported.traits.reputation || current.signatureAttributes.reputation,
            vice: imported.traits.vice || current.signatureAttributes.vice,
            virtue: imported.traits.virtue || current.signatureAttributes.virtue,
            fear: imported.traits.fear || current.signatureAttributes.fear,
            obsession: imported.traits.obsession || current.signatureAttributes.obsession,
            tell: imported.traits.tell || current.signatureAttributes.tell,
            loyalty: imported.traits.loyalty || current.signatureAttributes.loyalty,
            blindSpot: imported.traits.blind_spot || current.signatureAttributes.blindSpot,
            survivalInstinct: imported.traits.survival_instinct || current.signatureAttributes.survivalInstinct,
            legacyFear: imported.traits.legacy_fear || current.signatureAttributes.legacyFear,
          }
        : {}),
    },
    personality: {
      ...current.personality,
      traits: imported.traits?.virtue || current.personality.traits,
      ideals: imported.traits?.loyalty || current.personality.ideals,
      flaws: imported.traits?.vice || current.personality.flaws,
      fears: imported.traits?.fear || current.personality.fears,
    },
    stats: nextStats,
  };
}
