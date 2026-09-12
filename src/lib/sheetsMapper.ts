import { DossierSheet } from "../types/dossier";

export function findStat(sheet: DossierSheet, key: string): number {
  const hit = sheet.stats?.find((s) => (s.key || s.label || "").toUpperCase().includes(key));
  return hit?.value ?? 10;
}

export function buildSheetRows(sheetData: DossierSheet): (string | number | undefined)[][] {
  const derived = sheetData.derivedStats;
  const overview = sheetData.overview;
  const physical = sheetData.physical;
  const traits = sheetData.signatureAttributes;
  const equipment = sheetData.equipment;

  return [
    ["WORLDVISION SUMMONS - CHARACTER RECORD"],
    ["Name", sheetData.name],
    ["Title", sheetData.title],
    ["Player", sheetData.player],
    ["Class Role", overview?.classRole],
    ["Style", sheetData.sheet_style],
    ["Alignment", overview?.alignment],
    ["Level", derived?.level ?? overview?.level],
    ["HP", derived?.hpCurrent],
    ["HP Max", derived?.hpMax],
    ["AC", derived?.ac],
    ["Speed", derived?.speed],
    ["Initiative", derived?.initiative],
    ["Resource", `${derived?.resourceName || ""} ${derived?.resourceCurrent ?? ""}/${derived?.resourceMax ?? ""}`.trim()],
    ["Bio / Lore", sheetData.lore?.backstory],
    [],
    ["PHYSICAL ATTRIBUTES"],
    ["Height", physical?.height],
    ["Weight", physical?.weight],
    ["Build", physical?.build],
    ["Distinguishing Feature", physical?.marks],
    ["Eyes", physical?.eyes],
    ["Hair", physical?.hair],
    ["Clothing", physical?.clothing],
    [],
    ["CORE ATTRIBUTES"],
    ["Strength", findStat(sheetData, "STR")],
    ["Dexterity", findStat(sheetData, "DEX")],
    ["Constitution", findStat(sheetData, "CON")],
    ["Intelligence", findStat(sheetData, "INT")],
    ["Wisdom", findStat(sheetData, "WIS")],
    ["Charisma", findStat(sheetData, "CHA")],
    [],
    ["EQUIPMENT"],
    ["Primary Weapon", equipment?.primaryWeapon || equipment?.weapons],
    ["Secondary Focus", equipment?.secondaryFocus],
    ["Armor", equipment?.armor],
    ["Utility Tools", equipment?.utilityTools],
    ["Consumables", equipment?.consumables],
    ["Relics", equipment?.relics],
    ["Currency", equipment?.currency],
    [],
    ["INVENTORY ITEMS"],
    ...(String(equipment?.items || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item, idx) => [`Item ${idx + 1}`, item])),
    [],
    ["PSYCHOLOGICAL TRAITS (DNA)"],
    ["Reputation", traits?.reputation],
    ["Vice", traits?.vice],
    ["Virtue", traits?.virtue],
    ["Fear", traits?.fear],
    ["Obsession", traits?.obsession],
    ["Tell", traits?.tell],
    ["Loyalty", traits?.loyalty],
    ["Blind Spot", traits?.blindSpot],
    ["Survival Instinct", traits?.survivalInstinct],
    ["Legacy Fear", traits?.legacyFear]
  ];
}

export function parseSheetRows(rows: string[][]): Record<string, any> {
  const findVal = (key: string) => {
    const row = rows.find((r) => r[0]?.toLowerCase() === key.toLowerCase());
    return row ? row[1] || "" : "";
  };

  const name = findVal("Name") || "Imported Summon";
  const title = findVal("Title") || "Wanderer";
  const classRole = findVal("Class Role") || "Adventurer";
  const style = findVal("Style") || "High Fantasy";
  const alignment = findVal("Alignment") || "Neutral";
  const level = parseInt(findVal("Level")) || 1;
  const hp = parseInt(findVal("HP")) || 50;
  const hpMax = parseInt(findVal("HP Max")) || hp;
  const ac = parseInt(findVal("AC")) || 15;
  const speed = findVal("Speed") || "30 ft";
  const initiative = findVal("Initiative") || "+2";
  const bio = findVal("Bio / Lore") || "An enigmatic summon stepped through the rift.";

  const height = findVal("Height") || "6'0\"";
  const weight = findVal("Weight") || "180 lbs";
  const build = findVal("Build") || "Athletic";
  const distinguishing_feature = findVal("Distinguishing Feature") || "Marked by arcane sigils";

  const str = parseInt(findVal("Strength")) || 12;
  const dex = parseInt(findVal("Dexterity")) || 14;
  const con = parseInt(findVal("Constitution")) || 13;
  const int = parseInt(findVal("Intelligence")) || 10;
  const wis = parseInt(findVal("Wisdom")) || 11;
  const cha = parseInt(findVal("Charisma")) || 10;

  const inventory: string[] = [];
  let collectingItems = false;
  for (const row of rows) {
    if (row[0] === "INVENTORY ITEMS") {
      collectingItems = true;
      continue;
    }
    if (row[0] === "PSYCHOLOGICAL TRAITS (DNA)") {
      collectingItems = false;
      break;
    }
    if (collectingItems && row[1]) {
      inventory.push(row[1]);
    }
  }

  if (inventory.length === 0) {
    inventory.push("Obsidian Blade", "Health Potion", "Traveler's Cloak");
  }

  return {
    name,
    title,
    player: findVal("Player") || "Imported Keeper",
    sheet_style: style,
    overview: {
      classRole,
      alignment,
      level: String(level),
      origin: bio.slice(0, 48),
      faction: alignment
    },
    physical: {
      height,
      weight,
      build,
      marks: distinguishing_feature,
      distinguishing_feature,
      eyes: findVal("Eyes"),
      hair: findVal("Hair"),
      clothing: findVal("Clothing")
    },
    lore: { backstory: bio },
    derivedStats: {
      hpCurrent: hp,
      hpMax,
      ac,
      initiative,
      speed,
      level,
      resourceName: "Focus",
      resourceCurrent: 6,
      resourceMax: 6
    },
    stats: [
      { key: "STR", label: "Strength", value: str, desc: "Physical power & muscle mass" },
      { key: "DEX", label: "Dexterity", value: dex, desc: "Agility, reflexes & poise" },
      { key: "CON", label: "Constitution", value: con, desc: "Endurance & vitality" },
      { key: "INT", label: "Intelligence", value: int, desc: "Reason & arcana knowledge" },
      { key: "WIS", label: "Wisdom", value: wis, desc: "Intuition & perception" },
      { key: "CHA", label: "Charisma", value: cha, desc: "Presence & command" }
    ],
    equipment: {
      primaryWeapon: findVal("Primary Weapon") || inventory[0],
      secondaryFocus: findVal("Secondary Focus") || inventory[1] || "",
      armor: findVal("Armor") || inventory[2] || "",
      utilityTools: findVal("Utility Tools"),
      consumables: findVal("Consumables"),
      relics: findVal("Relics"),
      currency: findVal("Currency"),
      weapons: findVal("Primary Weapon") || inventory[0],
      items: inventory.join(", ")
    },
    inventory,
    signatureAttributes: {
      reputation: findVal("Reputation") || "Unknown Wanderer",
      vice: findVal("Vice") || "Hubris",
      virtue: findVal("Virtue") || "Resilience",
      fear: findVal("Fear") || "Oblivion",
      obsession: findVal("Obsession") || "Truth",
      tell: findVal("Tell") || "Quiet gaze",
      loyalty: findVal("Loyalty") || "Oathed",
      blindSpot: findVal("Blind Spot") || "Pride",
      survivalInstinct: findVal("Survival Instinct") || "Vigilant",
      legacyFear: findVal("Legacy Fear") || "Forgotten name"
    }
  };
}
