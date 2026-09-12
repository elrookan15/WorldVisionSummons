/** Map preset / sheet style names (including aliases) onto THEMES[].id */
export const STYLE_TO_THEME_ID: Record<string, string> = {
  "gothic dark fantasy": "gothicDarkFantasy",
  obsidiancult: "gothicDarkFantasy",
  "obsidian cult": "gothicDarkFantasy",
  cyberpunk: "cyberpunk",
  "neon ronin": "cyberpunk",
  neonronin: "cyberpunk",
  steampunk: "steampunkTinkerer",
  "steampunk tinkerer": "steampunkTinkerer",
  "8-bit retro rpg": "retro8Bit",
  "8bit retro": "retro8Bit",
  "high fantasy": "highFantasy",
  "arcane codex": "highFantasy",
  "cosmic horror": "cosmicHorror",
  cosmic: "cosmicHorror",
  "samurai era": "samuraiEra",
  samurai: "samuraiEra",
  "post-apocalyptic": "postApocalyptic",
  postapocalyptic: "postApocalyptic",
  "wasteland scavenger": "postApocalyptic",
  wastelandscavenger: "postApocalyptic",
  "eldritch arcane": "eldritchArcane",
  eldritch: "eldritchArcane",
  "victorian gothic": "victorianGothic",
  victorian: "victorianGothic",
  "starship log": "cosmicHorror",
  "feywild bloom": "highFantasy",
  "shadow protocol": "cyberpunk",
  "royal court": "victorianGothic",
  biohacker: "cyberpunk",
};

export function resolveThemeId(
  styleOrAlias: string | undefined,
  themes: Array<{ id: string; alias?: string; name: string }>
): string | null {
  if (!styleOrAlias) return null;
  const exact = themes.find(
    (t) => t.id === styleOrAlias || t.alias === styleOrAlias || t.name === styleOrAlias
  );
  if (exact) return exact.id;

  const key = styleOrAlias.toLowerCase().replace(/[_-]+/g, " ").trim();
  const compact = key.replace(/\s+/g, "");
  if (STYLE_TO_THEME_ID[key]) return STYLE_TO_THEME_ID[key];
  if (STYLE_TO_THEME_ID[compact]) return STYLE_TO_THEME_ID[compact];

  const fuzzy = themes.find(
    (t) =>
      t.name.toLowerCase().includes(key) ||
      key.includes(t.name.toLowerCase()) ||
      (t.alias && (t.alias.toLowerCase().includes(compact) || compact.includes(t.alias.toLowerCase())))
  );
  return fuzzy ? fuzzy.id : null;
}
