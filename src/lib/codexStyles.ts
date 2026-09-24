import { canonicalizeSheetStyle } from "./themeMap";

export const CODEX_STYLE_IDS = [
  "illuminated-parchment",
  "elven-manuscript",
  "dwarven-runeplate",
  "necromancer-grimoire",
  "celestial-star-chart",
  "iron-ronin-dossier",
  "samurai-emakimono",
  "viking-carved-oak",
  "royal-heraldic-decree",
  "alchemist-field-notes",
  "cyberpunk-neon-dossier",
  "steampunk-brass-folio",
  "eldritch-arcane",
  "post-apocalyptic-record",
  "retro-8bit",
  "high-fantasy-epic",
  "victorian-gothic-mourning",
] as const;

export type CodexStyleId = (typeof CODEX_STYLE_IDS)[number];

export type CodexStyleSpec = {
  id: CodexStyleId;
  name: string;
  mood: string;
  ground: string;
  ground2: string;
  ink: string;
  accent: string;
  accent2: string;
  display: string;
  body: string;
  caps: string;
  portrait: string;
};

export const CODEX_STYLES: readonly CodexStyleSpec[] = [
  { id: "illuminated-parchment", name: "Illuminated Parchment", mood: "Candlelit archive, gold on burnt vellum", ground: "#3d2f1f", ground2: "#2a2118", ink: "#e8dcc0", accent: "#c9a227", accent2: "#8a6a32", display: "'Cinzel Decorative', Palatino, serif", body: "'Cormorant Garamond', Palatino, serif", caps: "Cinzel, Palatino, serif", portrait: "grayscale(0.35) sepia(0.7) contrast(1.08) brightness(0.9)" },
  { id: "elven-manuscript", name: "Elven Manuscript", mood: "Moonlit vellum and pressed flowers", ground: "#e9e2d0", ground2: "#d5cdb8", ink: "#1f3d2b", accent: "#7fa3b8", accent2: "#a8b8a0", display: "'Cormorant Garamond', Palatino, serif", body: "'Cormorant Garamond', Palatino, serif", caps: "Cinzel, Palatino, serif", portrait: "grayscale(0.45) sepia(0.15) hue-rotate(160deg) saturate(0.6) brightness(1.05)" },
  { id: "dwarven-runeplate", name: "Dwarven Runeplate", mood: "Hammered bronze, rivets, and chisel marks", ground: "#4a3a26", ground2: "#2e2417", ink: "#b8b0a0", accent: "#d4a017", accent2: "#c96a1e", display: "Cinzel, Palatino, serif", body: "'Cormorant Garamond', Palatino, serif", caps: "Cinzel, Palatino, serif", portrait: "sepia(0.55) contrast(1.2) saturate(0.7) brightness(0.85)" },
  { id: "necromancer-grimoire", name: "Necromancer's Grimoire", mood: "Grave-ash, bone, and spectral green", ground: "#12100e", ground2: "#1c2420", ink: "#cfc8b8", accent: "#6fae7f", accent2: "#7a2a22", display: "'UnifrakturMaguntia', 'Cinzel Decorative', serif", body: "'Cormorant Garamond', Palatino, serif", caps: "Cinzel, Palatino, serif", portrait: "grayscale(0.7) sepia(0.3) hue-rotate(70deg) brightness(0.8) contrast(1.1)" },
  { id: "celestial-star-chart", name: "Celestial Star Chart", mood: "Midnight observatory and brass astrolabe", ground: "#101a33", ground2: "#0a1226", ink: "#dfe6f2", accent: "#d4af37", accent2: "#6a5a9e", display: "Cinzel, Palatino, serif", body: "'Cormorant Garamond', Palatino, serif", caps: "Cinzel, Palatino, serif", portrait: "grayscale(0.5) sepia(0.2) hue-rotate(190deg) saturate(0.7) brightness(0.95)" },
  { id: "iron-ronin-dossier", name: "Iron Ronin Dossier", mood: "Classified tactical file, black and hazard red", ground: "#0d0d0f", ground2: "#16181c", ink: "#e5e2da", accent: "#c8102e", accent2: "#8a8f98", display: "Orbitron, 'Share Tech Mono', sans-serif", body: "'IBM Plex Mono', ui-monospace, monospace", caps: "Orbitron, sans-serif", portrait: "grayscale(1) contrast(1.25) brightness(0.92)" },
  { id: "samurai-emakimono", name: "Samurai Emakimono", mood: "Ink, rice paper, and vermillion seals", ground: "#efe6d0", ground2: "#e2d5b8", ink: "#1a1a1a", accent: "#b5341f", accent2: "#2a3a5e", display: "'Shippori Mincho', 'Noto Serif', serif", body: "'Shippori Mincho', 'Cormorant Garamond', serif", caps: "Cinzel, Palatino, serif", portrait: "grayscale(0.85) contrast(1.15) sepia(0.15)" },
  { id: "viking-carved-oak", name: "Viking Carved Oak", mood: "Words cut into a charred plank", ground: "#3a2a1c", ground2: "#241a10", ink: "#d8cdb4", accent: "#8e2f21", accent2: "#7a7f85", display: "Cinzel, Palatino, serif", body: "'Cormorant Garamond', Palatino, serif", caps: "Cinzel, Palatino, serif", portrait: "sepia(0.65) contrast(1.25) brightness(0.82)" },
  { id: "royal-heraldic-decree", name: "Royal Heraldic Decree", mood: "Crimson damask and gold-leaf authority", ground: "#5e1220", ground2: "#3d0b14", ink: "#e8dcc0", accent: "#d4af37", accent2: "#14100c", display: "'Cinzel Decorative', Palatino, serif", body: "'Cormorant Garamond', Palatino, serif", caps: "Cinzel, Palatino, serif", portrait: "saturate(1.15) sepia(0.25) contrast(1.05)" },
  { id: "alchemist-field-notes", name: "Alchemist's Field Notes", mood: "Sepia lab journal, coffee rings, marginalia", ground: "#d9c9a3", ground2: "#cbb892", ink: "#2b2118", accent: "#a06a2c", accent2: "#9e4a3a", display: "'Special Elite', 'Courier New', monospace", body: "'Cormorant Garamond', Palatino, serif", caps: "'Special Elite', monospace", portrait: "sepia(0.85) contrast(1.05) brightness(0.98)" },
  { id: "cyberpunk-neon-dossier", name: "Cyberpunk Neon Dossier", mood: "Chrome, rain, cyan and magenta", ground: "#14161c", ground2: "#0c1018", ink: "#eef2f6", accent: "#00e5ff", accent2: "#ff2a6d", display: "Orbitron, sans-serif", body: "'IBM Plex Mono', ui-monospace, monospace", caps: "Orbitron, sans-serif", portrait: "grayscale(1) contrast(1.2) sepia(1) hue-rotate(150deg) saturate(2.4)" },
  { id: "steampunk-brass-folio", name: "Steampunk Brass Folio", mood: "Riveted brass, leather, and gauges", ground: "#d8c39a", ground2: "#6b4a2e", ink: "#241a12", accent: "#b08d3e", accent2: "#6b2a22", display: "'Cinzel Decorative', Palatino, serif", body: "'Cormorant Garamond', Palatino, serif", caps: "Cinzel, Palatino, serif", portrait: "sepia(0.7) saturate(0.8) contrast(1.08)" },
  { id: "eldritch-arcane", name: "Eldritch Arcane", mood: "Wrong geometry, violet and sickly teal", ground: "#0d0a14", ground2: "#1a1028", ink: "#c9b8e8", accent: "#7a3fa0", accent2: "#3fa08a", display: "Cinzel, Palatino, serif", body: "'Cormorant Garamond', Palatino, serif", caps: "Cinzel, Palatino, serif", portrait: "grayscale(0.4) sepia(0.4) hue-rotate(230deg) saturate(1.3) contrast(1.1)" },
  { id: "post-apocalyptic-record", name: "Post-Apocalyptic Record", mood: "Sun-bleached scrap and hazard yellow", ground: "#6a655c", ground2: "#4a453c", ink: "#1c1a17", accent: "#d8a012", accent2: "#a03a24", display: "'Special Elite', Impact, sans-serif", body: "'IBM Plex Mono', ui-monospace, monospace", caps: "'Special Elite', sans-serif", portrait: "grayscale(0.75) sepia(0.35) contrast(1.1) brightness(1.05)" },
  { id: "retro-8bit", name: "8-Bit Retro RPG", mood: "Status-screen menu, gold and pixel edges", ground: "#1a1a5e", ground2: "#10103a", ink: "#ffffff", accent: "#ffd700", accent2: "#3ae83a", display: "'Press Start 2P', monospace", body: "'IBM Plex Mono', ui-monospace, monospace", caps: "'Press Start 2P', monospace", portrait: "contrast(1.4) saturate(0.2) brightness(1.05)" },
  { id: "high-fantasy-epic", name: "High Fantasy Epic", mood: "Sunlit ivory and heroic gold", ground: "#ece0c8", ground2: "#f7f0de", ink: "#1f3a6e", accent: "#c9a227", accent2: "#2e6b34", display: "'Cinzel Decorative', Palatino, serif", body: "'Cormorant Garamond', Palatino, serif", caps: "Cinzel, Palatino, serif", portrait: "saturate(1.2) contrast(1.05) brightness(1.04)" },
  { id: "victorian-gothic-mourning", name: "Victorian Gothic Mourning", mood: "Gaslight, black lace, and cameos", ground: "#0e0d10", ground2: "#2a1a3a", ink: "#b8b4c0", accent: "#6a4a8a", accent2: "#8a4a5a", display: "'Cormorant Garamond', Palatino, serif", body: "'Cormorant Garamond', Palatino, serif", caps: "Cinzel, Palatino, serif", portrait: "grayscale(0.9) contrast(1.15) brightness(0.95) sepia(0.12)" },
];

const GENRE_DEFAULTS: Record<string, CodexStyleId> = {
  "Gothic Dark Fantasy": "illuminated-parchment",
  "Victorian Gothic": "victorian-gothic-mourning",
  "High Fantasy": "high-fantasy-epic",
  "Cosmic Horror": "celestial-star-chart",
  "Samurai Era": "samurai-emakimono",
  Steampunk: "steampunk-brass-folio",
  Cyberpunk: "cyberpunk-neon-dossier",
  "Eldritch Arcane": "eldritch-arcane",
  "Post-Apocalyptic": "post-apocalyptic-record",
  "8-Bit Retro RPG": "retro-8bit",
};

const SNAPSHOT_KEY = "worldvision_codex_plate_snapshot";

export type PlateSnapshot = {
  plateStyleId: CodexStyleId;
  sheetName: string;
  sheetStyle: string;
  recordedAt: string;
};

export function isCodexStyleId(value: string): value is CodexStyleId {
  return (CODEX_STYLE_IDS as readonly string[]).includes(value);
}

export function codexStyleById(id: string | null | undefined): CodexStyleSpec {
  const found = CODEX_STYLES.find((style) => style.id === id);
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
  if (opts.explicit && isCodexStyleId(opts.explicit)) return opts.explicit;
  const saved = readPlateSnapshot();
  if (
    saved &&
    saved.sheetName === opts.sheetName &&
    saved.sheetStyle === opts.sheetStyle &&
    isCodexStyleId(saved.plateStyleId)
  ) {
    return saved.plateStyleId;
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
