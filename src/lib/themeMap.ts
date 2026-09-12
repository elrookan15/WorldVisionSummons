export const CANONICAL_SHEET_STYLES = [
  "Gothic Dark Fantasy",
  "Cyberpunk",
  "Steampunk",
  "8-Bit Retro RPG",
  "High Fantasy",
  "Cosmic Horror",
  "Samurai Era",
  "Post-Apocalyptic",
  "Eldritch Arcane",
  "Victorian Gothic",
] as const;

export type CanonicalSheetStyle = (typeof CANONICAL_SHEET_STYLES)[number];

export const STYLE_TO_THEME_ID: Record<CanonicalSheetStyle, string> = {
  "Gothic Dark Fantasy": "gothicDarkFantasy",
  Cyberpunk: "cyberpunk",
  Steampunk: "steampunkTinkerer",
  "8-Bit Retro RPG": "retro8Bit",
  "High Fantasy": "highFantasy",
  "Cosmic Horror": "cosmicHorror",
  "Samurai Era": "samuraiEra",
  "Post-Apocalyptic": "postApocalyptic",
  "Eldritch Arcane": "eldritchArcane",
  "Victorian Gothic": "victorianGothic",
};

const STYLE_ALIASES: Record<string, CanonicalSheetStyle> = {
  "gothic dark fantasy": "Gothic Dark Fantasy",
  gothicdarkfantasy: "Gothic Dark Fantasy",
  "obsidian cult": "Gothic Dark Fantasy",
  obsidiancult: "Gothic Dark Fantasy",
  cyberpunk: "Cyberpunk",
  "neon ronin": "Cyberpunk",
  neonronin: "Cyberpunk",
  neon: "Cyberpunk",
  steampunk: "Steampunk",
  "steampunk tinkerer": "Steampunk",
  steampunktinkerer: "Steampunk",
  "8-bit retro rpg": "8-Bit Retro RPG",
  "8bit retro rpg": "8-Bit Retro RPG",
  retro8bit: "8-Bit Retro RPG",
  "high fantasy": "High Fantasy",
  "arcane codex": "High Fantasy",
  arcanecodex: "High Fantasy",
  "feywild bloom": "High Fantasy",
  "royal court": "High Fantasy",
  "cosmic horror": "Cosmic Horror",
  cosmic: "Cosmic Horror",
  "samurai era": "Samurai Era",
  samurai: "Samurai Era",
  "post-apocalyptic": "Post-Apocalyptic",
  postapocalyptic: "Post-Apocalyptic",
  "wasteland scavenger": "Post-Apocalyptic",
  wastelandscavenger: "Post-Apocalyptic",
  "eldritch arcane": "Eldritch Arcane",
  eldritch: "Eldritch Arcane",
  "victorian gothic": "Victorian Gothic",
  victorian: "Victorian Gothic",
  "shadow protocol": "Victorian Gothic",
  "starship log": "Cyberpunk",
  biohacker: "Cyberpunk",
};

export function canonicalizeSheetStyle(style?: string | null): CanonicalSheetStyle {
  const raw = (style || "").trim();
  if (!raw) return "Gothic Dark Fantasy";

  const lower = raw.toLowerCase();
  const compact = lower.replace(/[\s_-]+/g, "");

  const exact = CANONICAL_SHEET_STYLES.find((s) => s.toLowerCase() === lower);
  if (exact) return exact;

  if (STYLE_ALIASES[lower]) return STYLE_ALIASES[lower];
  if (STYLE_ALIASES[compact]) return STYLE_ALIASES[compact];

  for (const canonical of CANONICAL_SHEET_STYLES) {
    const cLower = canonical.toLowerCase();
    if (lower.includes(cLower) || cLower.includes(lower)) return canonical;
  }

  for (const [alias, canonical] of Object.entries(STYLE_ALIASES)) {
    if (alias.length < 4) continue;
    if (lower.includes(alias) || compact.includes(alias.replace(/[\s_-]+/g, ""))) {
      return canonical;
    }
  }

  return "Gothic Dark Fantasy";
}

export function themeIdForStyle(style?: string | null): string {
  return STYLE_TO_THEME_ID[canonicalizeSheetStyle(style)];
}

export function primaryItemFromInventory(inventory?: unknown): string {
  if (Array.isArray(inventory)) {
    const first = inventory[0];
    if (typeof first === "string") return first.split(",")[0]?.trim() || "Primary Weapon";
    if (first && typeof first === "object" && "name" in first) {
      return String((first as { name?: string }).name || "Primary Weapon");
    }
  }
  if (typeof inventory === "string" && inventory.trim()) {
    return inventory.split(",")[0]?.trim() || "Primary Weapon";
  }
  return "Primary Weapon";
}
