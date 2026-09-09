export interface StatBaseline {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
}

export interface StatComparisonItem {
  stat: string;
  label: string;
  current: number;
  baseline: number;
  diff: number;
}

export const ARCHETYPE_EXPLICIT_BASELINES: Record<string, StatBaseline> = {
  "Gelbinor — The Shy Grave": { STR: 8, DEX: 12, CON: 14, INT: 20, WIS: 18, CHA: 8 },
  "Vaelin the Gravebound": { STR: 18, DEX: 12, CON: 16, INT: 10, WIS: 14, CHA: 12 },
  "Kaelen Vex - Netrunner": { STR: 9, DEX: 18, CON: 12, INT: 20, WIS: 14, CHA: 10 },
  "Lyra Vane — Void Alchemist": { STR: 8, DEX: 14, CON: 12, INT: 20, WIS: 16, CHA: 12 },
  "Kenshiro — Rust-Blade Ronin": { STR: 17, DEX: 18, CON: 15, INT: 11, WIS: 14, CHA: 9 },
  "Orlaith — Ironclad Artificer": { STR: 14, DEX: 14, CON: 15, INT: 19, WIS: 12, CHA: 10 },
  "Balthazar Crown — Clockwork Magistrate": { STR: 12, DEX: 13, CON: 14, INT: 18, WIS: 16, CHA: 13 },
  "Nyx Talon — Neon Courier": { STR: 11, DEX: 19, CON: 13, INT: 14, WIS: 12, CHA: 14 },
  "Aethelgard — Sunken Paladin": { STR: 18, DEX: 10, CON: 17, INT: 9, WIS: 16, CHA: 14 },
  "Evelyn Sterling — Solar Archivist": { STR: 8, DEX: 12, CON: 12, INT: 19, WIS: 17, CHA: 14 },
  "Ignis Thorne — Pyre Inquisitor": { STR: 15, DEX: 12, CON: 14, INT: 14, WIS: 17, CHA: 14 },
  "Silas Moore — 8-Bit Hero": { STR: 14, DEX: 14, CON: 14, INT: 14, WIS: 14, CHA: 14 },
  "Mirela — Thornwood Druid": { STR: 10, DEX: 14, CON: 15, INT: 12, WIS: 20, CHA: 11 },
  "Cain — Sector 9 Enforcer": { STR: 17, DEX: 14, CON: 16, INT: 12, WIS: 11, CHA: 14 },
  "Zephyrine — Void Stalker": { STR: 12, DEX: 19, CON: 13, INT: 15, WIS: 15, CHA: 9 },
  "Gideon Vance — Alchemist of Ashes": { STR: 9, DEX: 13, CON: 13, INT: 20, WIS: 16, CHA: 11 },
  "Morrigan — Bloodroot Witch": { STR: 8, DEX: 13, CON: 13, INT: 19, WIS: 18, CHA: 13 },
  "Tariq — Silk Road Assassin": { STR: 13, DEX: 19, CON: 13, INT: 14, WIS: 13, CHA: 12 },
  "Valeria — Star-Drift Captain": { STR: 13, DEX: 15, CON: 14, INT: 15, WIS: 14, CHA: 18 },
  "Dmitri — Neon Street Samurai": { STR: 17, DEX: 17, CON: 15, INT: 12, WIS: 13, CHA: 10 }
};

export function getArchetypeBaseline(
  presetNameOrClass: string,
  category: string = ""
): StatBaseline {
  // Check exact preset name match
  if (ARCHETYPE_EXPLICIT_BASELINES[presetNameOrClass]) {
    return ARCHETYPE_EXPLICIT_BASELINES[presetNameOrClass];
  }

  // Check case-insensitive key search
  const foundKey = Object.keys(ARCHETYPE_EXPLICIT_BASELINES).find(k =>
    k.toLowerCase().includes(presetNameOrClass.toLowerCase()) ||
    presetNameOrClass.toLowerCase().includes(k.toLowerCase())
  );
  if (foundKey) {
    return ARCHETYPE_EXPLICIT_BASELINES[foundKey];
  }

  const query = `${presetNameOrClass} ${category}`.toLowerCase();

  if (/necromancer|ossuary|lich|dead|grave|undead|shade/.test(query)) {
    return { STR: 8, DEX: 12, CON: 14, INT: 20, WIS: 18, CHA: 8 };
  }
  if (/knight|paladin|warrior|berserker|fighter|brawler|vanguard|ironclad|martial|samurai|ronin/.test(query)) {
    return { STR: 18, DEX: 13, CON: 16, INT: 10, WIS: 13, CHA: 11 };
  }
  if (/netrunner|cyber|tech|hacker|drone|synthetic|data/.test(query)) {
    return { STR: 9, DEX: 18, CON: 12, INT: 20, WIS: 14, CHA: 11 };
  }
  if (/alchemist|mage|wizard|sorcerer|scholar|archivist|arcane|void|astronomer/.test(query)) {
    return { STR: 8, DEX: 13, CON: 12, INT: 20, WIS: 16, CHA: 13 };
  }
  if (/rogue|assassin|courier|stalker|scout|sniper|thief|stealth|ninja/.test(query)) {
    return { STR: 11, DEX: 19, CON: 13, INT: 14, WIS: 13, CHA: 13 };
  }
  if (/druid|shaman|monk|priest|cleric|inquisitor|nature|oracle|seer/.test(query)) {
    return { STR: 11, DEX: 13, CON: 14, INT: 12, WIS: 20, CHA: 12 };
  }
  if (/bard|diplomat|captain|commander|enforcer|leader|noble|politician/.test(query)) {
    return { STR: 12, DEX: 14, CON: 13, INT: 14, WIS: 13, CHA: 18 };
  }
  if (/scavenger|wasteland|survivor|tinkerer|artificer|mechanic/.test(query)) {
    return { STR: 15, DEX: 15, CON: 16, INT: 16, WIS: 12, CHA: 9 };
  }

  // Balanced heroic standard
  return { STR: 14, DEX: 14, CON: 14, INT: 14, WIS: 14, CHA: 14 };
}
