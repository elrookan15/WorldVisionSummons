import { genreMotifLayer } from "./sheetGenreMotifs";

/**
 * Procedural SVG atmospheres for dossier pages.
 * Local-only (no remote images / Unsplash). Tuned to sit under UI via soft-light
 * blend + mask fade — texture, not wallpaper.
 */

export const SHEET_PAGE_IDS = [
  "overview",
  "physical",
  "lore",
  "abilities",
  "equipment",
  "personality",
  "relationships",
  "stats",
] as const;

export type SheetPageId = (typeof SHEET_PAGE_IDS)[number];

export const SHEET_THEME_IDS = [
  "gothicDarkFantasy",
  "cyberpunk",
  "steampunkTinkerer",
  "retro8Bit",
  "highFantasy",
  "cosmicHorror",
  "samuraiEra",
  "postApocalyptic",
  "eldritchArcane",
  "victorianGothic",
] as const;

export type SheetThemeId = (typeof SHEET_THEME_IDS)[number];

type BgPalette = { bg: string; bg2: string; accent: string; accent2: string; clash: string };

export type { BgPalette };

const THEME_PALETTES: Record<SheetThemeId, BgPalette> = {
  gothicDarkFantasy: { bg: "#12080a", bg2: "#2a1014", accent: "#8b0000", accent2: "#d4a017", clash: "#00e8a8" },
  cyberpunk: { bg: "#0c0a14", bg2: "#1a1430", accent: "#ff2a8a", accent2: "#00f0ff", clash: "#d4ff00" },
  steampunkTinkerer: { bg: "#2a1c12", bg2: "#4a301c", accent: "#b87333", accent2: "#e8c37a", clash: "#14b8a6" },
  retro8Bit: { bg: "#0d1117", bg2: "#16301d", accent: "#2ea043", accent2: "#f0883e", clash: "#ff2bd6" },
  highFantasy: { bg: "#151224", bg2: "#2a2140", accent: "#d9c5a0", accent2: "#7dd3fc", clash: "#6366f1" },
  cosmicHorror: { bg: "#06080d", bg2: "#122038", accent: "#38bdf8", accent2: "#a855f7", clash: "#fb923c" },
  samuraiEra: { bg: "#1a1010", bg2: "#3a1818", accent: "#dc2626", accent2: "#eab308", clash: "#2dd4bf" },
  postApocalyptic: { bg: "#2b1f14", bg2: "#4a341c", accent: "#b8451b", accent2: "#ff6b2a", clash: "#a3e635" },
  eldritchArcane: { bg: "#0b0813", bg2: "#241c3d", accent: "#c084fc", accent2: "#38bdf8", clash: "#84cc16" },
  victorianGothic: { bg: "#0e1013", bg2: "#252a32", accent: "#cbd5e1", accent2: "#f59e0b", clash: "#f43f5e" },
};

/** Genre artifact language — drives ornament geometry, not palette alone. */
export const THEME_ARTIFACT: Record<SheetThemeId, string> = {
  gothicDarkFantasy: "cathedral-stone",
  cyberpunk: "neon-hud",
  steampunkTinkerer: "brass-blueprint",
  retro8Bit: "pixel-grid",
  highFantasy: "mythril-filigree",
  cosmicHorror: "abyssal-rift",
  samuraiEra: "sumi-washi",
  postApocalyptic: "treasure-map",
  eldritchArcane: "runic-crystal",
  victorianGothic: "gazette-lace",
};

/** Per-page document metaphor — distinct composition even within one genre. */
export const PAGE_METAPHOR: Record<SheetPageId, string> = {
  overview: "identity-seal",
  physical: "figure-stage",
  lore: "manuscript-grain",
  abilities: "power-diagram",
  equipment: "locker-mesh",
  personality: "psyche-rings",
  relationships: "bond-threads",
  stats: "combat-reticle",
};

function genreOrnaments(theme: SheetThemeId, p: BgPalette): string {
  switch (theme) {
    case "gothicDarkFantasy":
      return `
        <path d="M80 720 Q320 180 560 720" fill="none" stroke="${p.accent}" stroke-width="3" opacity="0.35"/>
        <path d="M560 720 Q800 180 1040 720" fill="none" stroke="${p.accent}" stroke-width="3" opacity="0.28"/>
        <path d="M200 720 L200 200 L400 80 L600 200 L600 720" fill="none" stroke="${p.accent2}" stroke-width="1.2" opacity="0.22"/>
        <circle cx="400" cy="240" r="18" fill="none" stroke="${p.accent}" stroke-width="2" opacity="0.3"/>`;
    case "cyberpunk":
      return `
        <g stroke="${p.accent2}" stroke-width="1" opacity="0.22">
          <path d="M0 120 H1200 M0 240 H1200 M0 360 H1200 M0 480 H1200 M0 600 H1200"/>
          <path d="M120 0 V800 M240 0 V800 M360 0 V800 M480 0 V800 M600 0 V800 M720 0 V800 M840 0 V800 M960 0 V800 M1080 0 V800"/>
        </g>
        <path d="M40 40 L180 40 L180 70 L70 70 L70 180 L40 180 Z" fill="none" stroke="${p.accent}" stroke-width="2" opacity="0.4"/>
        <path d="M1160 760 L1020 760 L1020 730 L1130 730 L1130 620 L1160 620 Z" fill="none" stroke="${p.accent2}" stroke-width="2" opacity="0.35"/>
        <rect x="820" y="80" width="280" height="8" fill="${p.accent}" opacity="0.25"/>`;
    case "steampunkTinkerer":
      return `
        <circle cx="180" cy="160" r="70" fill="none" stroke="${p.accent}" stroke-width="6" opacity="0.28"/>
        <circle cx="180" cy="160" r="42" fill="none" stroke="${p.accent2}" stroke-width="3" opacity="0.3"/>
        <circle cx="980" cy="620" r="90" fill="none" stroke="${p.accent}" stroke-width="5" opacity="0.22"/>
        <circle cx="980" cy="620" r="54" fill="none" stroke="${p.accent2}" stroke-width="2" opacity="0.28"/>
        <path d="M250 160 H920 M180 230 V540" stroke="${p.accent}" stroke-width="2" opacity="0.18" stroke-dasharray="8 10"/>`;
    case "retro8Bit":
      return `
        <g fill="${p.accent}" opacity="0.2">
          <rect x="60" y="60" width="24" height="24"/><rect x="100" y="60" width="24" height="24"/>
          <rect x="60" y="100" width="24" height="24"/><rect x="140" y="100" width="24" height="24"/>
          <rect x="1000" y="640" width="24" height="24"/><rect x="1040" y="680" width="24" height="24"/>
          <rect x="960" y="680" width="24" height="24"/><rect x="1080" y="640" width="24" height="24"/>
        </g>
        <g fill="${p.accent2}" opacity="0.16">
          <rect x="520" y="40" width="16" height="16"/><rect x="560" y="56" width="16" height="16"/>
          <rect x="480" y="56" width="16" height="16"/><rect x="600" y="40" width="16" height="16"/>
        </g>`;
    case "highFantasy":
      return `
        <path d="M600 40 L620 90 L675 90 L630 122 L648 175 L600 145 L552 175 L570 122 L525 90 L580 90 Z"
          fill="none" stroke="${p.accent}" stroke-width="2" opacity="0.32"/>
        <circle cx="200" cy="600" r="4" fill="${p.accent2}" opacity="0.4"/>
        <circle cx="980" cy="180" r="3" fill="${p.accent}" opacity="0.35"/>
        <circle cx="860" cy="520" r="2.5" fill="${p.accent2}" opacity="0.4"/>
        <path d="M80 700 C300 500 500 720 700 480 C850 360 1000 520 1120 400" fill="none" stroke="${p.accent}" stroke-width="1.5" opacity="0.2"/>`;
    case "cosmicHorror":
      return `
        <ellipse cx="600" cy="400" rx="220" ry="140" fill="none" stroke="${p.accent2}" stroke-width="2" opacity="0.22" transform="rotate(-18 600 400)"/>
        <ellipse cx="600" cy="400" rx="160" ry="90" fill="none" stroke="${p.accent}" stroke-width="1.5" opacity="0.28" transform="rotate(24 600 400)"/>
        <circle cx="600" cy="400" r="28" fill="${p.accent}" opacity="0.18"/>
        <circle cx="180" cy="140" r="3" fill="${p.accent2}" opacity="0.5"/>
        <circle cx="1040" cy="680" r="2" fill="${p.accent}" opacity="0.45"/>
        <circle cx="920" cy="120" r="2.5" fill="${p.accent2}" opacity="0.4"/>`;
    case "samuraiEra":
      return `
        <circle cx="980" cy="140" r="70" fill="${p.accent}" opacity="0.2"/>
        <path d="M80 620 Q300 480 520 600 T980 560" fill="none" stroke="${p.accent2}" stroke-width="2" opacity="0.22"/>
        <path d="M120 200 Q200 280 160 360" fill="none" stroke="${p.accent}" stroke-width="8" stroke-linecap="round" opacity="0.16"/>
        <rect x="70" y="70" width="1060" height="660" fill="none" stroke="${p.accent}" stroke-width="1" opacity="0.12"/>`;
    case "postApocalyptic":
      return `
        <g stroke="${p.accent}" stroke-width="10" opacity="0.14">
          <path d="M0 100 L120 0 M40 160 L200 0 M200 200 L360 40"/>
          <path d="M900 800 L1100 600 M980 800 L1200 580"/>
        </g>
        <path d="M80 80 H200 V120 H80 Z" fill="none" stroke="${p.accent2}" stroke-width="3" opacity="0.28"/>
        <path d="M1000 640 H1120 V700 H1000 Z" fill="none" stroke="${p.accent}" stroke-width="3" opacity="0.25"/>`;
    case "eldritchArcane":
      return `
        <polygon points="600,80 640,160 720,160 655,210 680,290 600,245 520,290 545,210 480,160 560,160"
          fill="none" stroke="${p.accent}" stroke-width="1.5" opacity="0.3"/>
        <circle cx="240" cy="520" r="50" fill="none" stroke="${p.accent2}" stroke-width="1.5" opacity="0.25"/>
        <circle cx="960" cy="240" r="36" fill="none" stroke="${p.accent}" stroke-width="1.5" opacity="0.28"/>
        <path d="M240 520 L600 200 L960 240" fill="none" stroke="${p.accent2}" stroke-width="1" opacity="0.18"/>`;
    case "victorianGothic":
      return `
        <g stroke="${p.accent}" stroke-width="1" opacity="0.16">
          <path d="M0 0 V800 M40 0 V800 M80 0 V800 M120 0 V800 M160 0 V800"/>
          <path d="M1040 0 V800 M1080 0 V800 M1120 0 V800 M1160 0 V800 M1200 0 V800"/>
        </g>
        <path d="M560 60 Q600 120 640 60 Q680 0 720 60" fill="none" stroke="${p.accent2}" stroke-width="1.5" opacity="0.28"/>
        <rect x="100" y="100" width="1000" height="600" fill="none" stroke="${p.accent}" stroke-width="2" opacity="0.12"/>`;
  }
}

function pageComposition(page: SheetPageId, p: BgPalette): string {
  switch (page) {
    case "overview":
      return `
        <circle cx="600" cy="400" r="210" fill="none" stroke="${p.accent}" stroke-width="2" opacity="0.2"/>
        <circle cx="600" cy="400" r="150" fill="none" stroke="${p.accent2}" stroke-width="1" opacity="0.22"/>
        <path d="M600 160 V240 M600 560 V640 M390 400 H470 M730 400 H810" stroke="${p.accent}" stroke-width="2" opacity="0.25"/>
        <rect x="480" y="320" width="240" height="160" rx="8" fill="none" stroke="${p.accent}" stroke-width="1.5" opacity="0.18"/>`;
    case "physical":
      return `
        <ellipse cx="420" cy="380" rx="180" ry="260" fill="${p.accent}" opacity="0.08"/>
        <ellipse cx="420" cy="380" rx="120" ry="200" fill="none" stroke="${p.accent2}" stroke-width="1.5" opacity="0.16"/>
        <path d="M700 120 H1100 M700 200 H1050 M700 280 H1000" stroke="${p.accent}" stroke-width="1" opacity="0.14"/>`;
    case "lore":
      return `
        <path d="M180 80 V720 M220 80 V720" stroke="${p.accent}" stroke-width="3" opacity="0.32"/>
        <g stroke="${p.accent2}" stroke-width="1.4" opacity="0.28">
          <path d="M260 140 H1040 M260 190 H1000 M260 240 H1020 M260 290 H980 M260 340 H1010"/>
          <path d="M260 420 H1040 M260 470 H990 M260 520 H1030 M260 570 H970 M260 620 H1000"/>
        </g>
        <path d="M240 100 H1080 V700 H240 Z" fill="none" stroke="${p.accent}" stroke-width="1.5" opacity="0.22"/>
        <text x="200" y="120" font-family="Georgia, serif" font-size="56" fill="${p.accent}" opacity="0.36">¶</text>
        <text x="980" y="680" font-family="Georgia, serif" font-size="28" fill="${p.accent2}" opacity="0.24">※</text>`;
    case "abilities":
      return `
        <path d="M200 400 L400 200 L600 400 L800 200 L1000 400" fill="none" stroke="${p.accent}" stroke-width="2" opacity="0.2"/>
        <circle cx="400" cy="200" r="16" fill="${p.accent2}" opacity="0.22"/>
        <circle cx="600" cy="400" r="22" fill="${p.accent}" opacity="0.2"/>
        <circle cx="800" cy="200" r="16" fill="${p.accent2}" opacity="0.22"/>
        <circle cx="200" cy="400" r="12" fill="none" stroke="${p.accent}" stroke-width="2" opacity="0.25"/>
        <circle cx="1000" cy="400" r="12" fill="none" stroke="${p.accent}" stroke-width="2" opacity="0.25"/>`;
    case "equipment":
      return `
        <g fill="none" stroke="${p.accent}" stroke-width="1.5" opacity="0.18">
          <rect x="120" y="120" width="200" height="240" rx="4"/>
          <rect x="360" y="120" width="200" height="240" rx="4"/>
          <rect x="600" y="120" width="200" height="240" rx="4"/>
          <rect x="840" y="120" width="200" height="240" rx="4"/>
          <rect x="200" y="420" width="200" height="240" rx="4"/>
          <rect x="500" y="420" width="200" height="240" rx="4"/>
          <rect x="800" y="420" width="200" height="240" rx="4"/>
        </g>`;
    case "personality":
      return `
        <circle cx="600" cy="400" r="80" fill="none" stroke="${p.accent}" stroke-width="2" opacity="0.25"/>
        <circle cx="600" cy="400" r="140" fill="none" stroke="${p.accent2}" stroke-width="1.5" opacity="0.2"/>
        <circle cx="600" cy="400" r="200" fill="none" stroke="${p.accent}" stroke-width="1" opacity="0.16"/>
        <circle cx="600" cy="400" r="260" fill="none" stroke="${p.accent2}" stroke-width="1" opacity="0.12"/>
        <circle cx="600" cy="220" r="10" fill="${p.accent}" opacity="0.28"/>
        <circle cx="760" cy="400" r="10" fill="${p.accent2}" opacity="0.28"/>
        <circle cx="600" cy="580" r="10" fill="${p.accent}" opacity="0.28"/>
        <circle cx="440" cy="400" r="10" fill="${p.accent2}" opacity="0.28"/>`;
    case "relationships":
      return `
        <circle cx="280" cy="260" r="36" fill="none" stroke="${p.accent}" stroke-width="2" opacity="0.28"/>
        <circle cx="920" cy="260" r="36" fill="none" stroke="${p.accent}" stroke-width="2" opacity="0.28"/>
        <circle cx="280" cy="560" r="36" fill="none" stroke="${p.accent2}" stroke-width="2" opacity="0.25"/>
        <circle cx="920" cy="560" r="36" fill="none" stroke="${p.accent2}" stroke-width="2" opacity="0.25"/>
        <circle cx="600" cy="400" r="48" fill="none" stroke="${p.accent}" stroke-width="2.5" opacity="0.3"/>
        <path d="M316 260 L552 380 M884 260 L648 380 M316 560 L552 420 M884 560 L648 420"
          stroke="${p.accent2}" stroke-width="1.5" opacity="0.2"/>`;
    case "stats":
      return `
        <rect x="80" y="80" width="1040" height="640" fill="none" stroke="${p.accent}" stroke-width="2.5" opacity="0.34"/>
        <path d="M80 160 H1120 M80 80 V160 M1120 80 V160" stroke="${p.accent2}" stroke-width="2" opacity="0.38"/>
        <circle cx="200" cy="400" r="70" fill="none" stroke="${p.accent}" stroke-width="2.5" opacity="0.4"/>
        <circle cx="420" cy="400" r="70" fill="none" stroke="${p.accent}" stroke-width="2.5" opacity="0.34"/>
        <circle cx="640" cy="400" r="70" fill="none" stroke="${p.accent2}" stroke-width="2.5" opacity="0.38"/>
        <circle cx="860" cy="400" r="70" fill="none" stroke="${p.accent}" stroke-width="2.5" opacity="0.34"/>
        <circle cx="1040" cy="400" r="50" fill="none" stroke="${p.accent2}" stroke-width="2.5" opacity="0.38"/>
        <path d="M200 400 L420 400 L640 400 L860 400 L1040 400" stroke="${p.accent2}" stroke-width="1" opacity="0.22"/>
        <path d="M140 640 H1060" stroke="${p.accent}" stroke-width="1.5" opacity="0.28" stroke-dasharray="4 8"/>
        <path d="M100 100 L140 100 L140 140" fill="none" stroke="${p.accent}" stroke-width="2" opacity="0.36"/>
        <path d="M1100 700 L1060 700 L1060 660" fill="none" stroke="${p.accent2}" stroke-width="2" opacity="0.36"/>`;
  }
}

function noiseLayer(seed: number, opacity: number): string {
  return `
    <filter id="grain${seed}" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="${seed}" stitchTiles="stitch"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 ${opacity} 0"/>
    </filter>
    <rect width="1200" height="800" filter="url(#grain${seed})" opacity="0.7"/>`;
}

function pageSeed(page: SheetPageId): number {
  return SHEET_PAGE_IDS.indexOf(page) * 17 + 3;
}

/**
 * Build a soft atmospheric SVG for one dossier page under one genre theme.
 * Returned as a data URL suitable for CSS background-image.
 */
export function buildSheetPageBackground(page: SheetPageId, themeId: string): string {
  const theme = (SHEET_THEME_IDS.includes(themeId as SheetThemeId)
    ? themeId
    : "gothicDarkFantasy") as SheetThemeId;
  const p = THEME_PALETTES[theme];
  const artifact = THEME_ARTIFACT[theme];
  const metaphor = PAGE_METAPHOR[page];
  const seed = pageSeed(page);

  const accentWash = page === "lore" || page === "stats" ? "0.42" : "0.28";
  const midWash = page === "lore" || page === "stats" ? "0.14" : "0.08";

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800" role="img" aria-hidden="true"
  data-sheet-bg="${theme}" data-page-bg="${page}" data-artifact="${artifact}" data-metaphor="${metaphor}">
  <defs>
    <linearGradient id="wash" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${p.bg}"/>
      <stop offset="55%" stop-color="${p.bg2}"/>
      <stop offset="100%" stop-color="${p.bg}"/>
    </linearGradient>
    <radialGradient id="vignette" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="${p.accent}" stop-opacity="${accentWash}"/>
      <stop offset="55%" stop-color="${p.bg2}" stop-opacity="${midWash}"/>
      <stop offset="100%" stop-color="${p.bg}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="clashSpark" cx="88%" cy="18%" r="22%">
      <stop offset="0%" stop-color="${p.clash}" stop-opacity="0.38"/>
      <stop offset="100%" stop-color="${p.clash}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#wash)"/>
  <rect width="1200" height="800" fill="url(#vignette)"/>
  <rect width="1200" height="800" fill="url(#clashSpark)"/>
  ${noiseLayer(seed, page === "lore" || page === "stats" ? 0.06 : 0.045)}
  ${genreOrnaments(theme, p)}
  ${genreMotifLayer(theme, page, p)}
  ${pageComposition(page, p)}
  <circle cx="1120" cy="90" r="7" fill="${p.clash}" opacity="0.55" data-clash-spark="1"/>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** CSS custom-property block for all 8 dossier pages under the active theme. */
export function sheetPageBackgroundCssVars(themeId: string): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const page of SHEET_PAGE_IDS) {
    vars[`--sheet-bg-${page}`] = `url("${buildSheetPageBackground(page, themeId)}")`;
  }
  return vars;
}

export function sheetPageBackgroundOpacity(page: SheetPageId): number {
  // Physical stays quiet (portrait-first). Lore/Stats are intentionally louder
  // atmospheres per PR #8 feedback — still meant for CSS soft blend, not wallpaper.
  switch (page) {
    case "physical":
      return 0.14;
    case "stats":
      return 0.52;
    case "lore":
      return 0.5;
    default:
      return 0.2;
  }
}
