/**
 * Style-specific background set pieces for dossier page atmospheres.
 * Local SVG only — three readable motifs per genre, low-presence props (not wallpaper).
 */

type MotifPalette = { accent: string; accent2: string; clash: string };

export type GenreMotifId = string;

export const THEME_MOTIFS = {
  gothicDarkFantasy: ["gargoyle", "stained-glass-rose", "candelabra"],
  cyberpunk: ["laser-skateboard", "cyborg", "futuristic-laptop"],
  steampunkTinkerer: ["airship", "pocket-watch", "brass-cog"],
  retro8Bit: ["pixel-sword", "heart-pickup", "pixel-castle"],
  highFantasy: ["dragon", "crystal-staff", "winged-helm"],
  cosmicHorror: ["tentacle-eye", "non-euclidean-arch", "deep-idol"],
  samuraiEra: ["katana", "torii", "sakura-branch"],
  // Treasure / pirate map language on the parchment wasteland theme
  postApocalyptic: ["pirate-sword", "gold-chest", "pirate-ship"],
  eldritchArcane: ["grimoire", "floating-crystal", "occult-ring"],
  victorianGothic: ["gas-lamp", "cameo-locket", "carriage-wheel"],
} as const;

export type MotifThemeId = keyof typeof THEME_MOTIFS;

type MotifFn = (p: MotifPalette) => string;

function wrap(id: GenreMotifId, x: number, y: number, scale: number, rot: number, body: string): string {
  return `<g data-motif="${id}" transform="translate(${x} ${y}) rotate(${rot}) scale(${scale})" opacity="0.55">${body}</g>`;
}

const MOTIF_DRAW: Record<MotifThemeId, readonly [MotifFn, MotifFn, MotifFn]> = {
  gothicDarkFantasy: [
    (p) => `
      <path d="M0 -70 L18 -20 L55 -20 L26 8 L38 55 L0 28 L-38 55 L-26 8 L-55 -20 L-18 -20 Z"
        fill="none" stroke="${p.accent}" stroke-width="3"/>
      <ellipse cx="0" cy="-8" rx="22" ry="18" fill="none" stroke="${p.clash}" stroke-width="2"/>
      <path d="M-14 -10 L-6 -4 M14 -10 L6 -4" stroke="${p.accent2}" stroke-width="2"/>`,
    (p) => `
      <circle cx="0" cy="0" r="48" fill="none" stroke="${p.accent}" stroke-width="3"/>
      <circle cx="0" cy="0" r="28" fill="none" stroke="${p.clash}" stroke-width="2"/>
      <path d="M0 -48 V48 M-48 0 H48 M-34 -34 L34 34 M34 -34 L-34 34" stroke="${p.accent2}" stroke-width="1.5"/>`,
    (p) => `
      <path d="M-36 40 H36 M-28 40 V10 H-12 V40 M12 40 V10 H28 V40" fill="none" stroke="${p.accent}" stroke-width="3"/>
      <path d="M-20 10 Q-20 -30 0 -40 Q20 -30 20 10" fill="none" stroke="${p.clash}" stroke-width="2.5"/>
      <circle cx="0" cy="-44" r="6" fill="${p.accent2}" opacity="0.8"/>`,
  ],
  cyberpunk: [
    (p) => `
      <!-- laser skateboard -->
      <ellipse cx="0" cy="18" rx="70" ry="12" fill="none" stroke="${p.accent}" stroke-width="4"/>
      <rect x="-55" y="4" width="110" height="14" rx="4" fill="none" stroke="${p.accent2}" stroke-width="2"/>
      <circle cx="-40" cy="28" r="10" fill="none" stroke="${p.clash}" stroke-width="3"/>
      <circle cx="40" cy="28" r="10" fill="none" stroke="${p.clash}" stroke-width="3"/>
      <path d="M-50 0 L50 -18" stroke="${p.clash}" stroke-width="3" stroke-linecap="round"/>
      <path d="M20 -12 L55 -28" stroke="${p.accent}" stroke-width="2"/>`,
    (p) => `
      <!-- cyborg bust -->
      <circle cx="0" cy="-18" r="28" fill="none" stroke="${p.accent}" stroke-width="3"/>
      <rect x="-10" y="-22" width="22" height="14" rx="2" fill="none" stroke="${p.clash}" stroke-width="2"/>
      <path d="M-8 -16 H10 M-4 -10 H8" stroke="${p.accent2}" stroke-width="1.5"/>
      <path d="M-22 12 Q0 28 22 12 L18 55 H-18 Z" fill="none" stroke="${p.accent}" stroke-width="3"/>
      <path d="M-6 30 H6 M0 30 V48" stroke="${p.clash}" stroke-width="2"/>`,
    (p) => `
      <!-- futuristic laptop interface -->
      <rect x="-70" y="-40" width="140" height="70" rx="4" fill="none" stroke="${p.accent2}" stroke-width="3"/>
      <rect x="-58" y="-28" width="116" height="46" fill="none" stroke="${p.clash}" stroke-width="1.5"/>
      <path d="M-50 -18 H40 M-50 -6 H20 M-50 6 H50" stroke="${p.accent}" stroke-width="2"/>
      <circle cx="48" cy="-18" r="5" fill="${p.clash}"/>
      <path d="M-80 30 H80 L60 55 H-60 Z" fill="none" stroke="${p.accent}" stroke-width="3"/>`,
  ],
  steampunkTinkerer: [
    (p) => `
      <ellipse cx="0" cy="10" rx="55" ry="16" fill="none" stroke="${p.accent}" stroke-width="3"/>
      <path d="M-40 0 Q0 -35 40 0" fill="none" stroke="${p.clash}" stroke-width="2"/>
      <rect x="-8" y="-8" width="16" height="28" fill="none" stroke="${p.accent2}" stroke-width="2"/>
      <path d="M0 -8 V-40 M-18 -28 H18" stroke="${p.accent}" stroke-width="2"/>`,
    (p) => `
      <circle cx="0" cy="0" r="40" fill="none" stroke="${p.accent}" stroke-width="4"/>
      <circle cx="0" cy="0" r="4" fill="${p.clash}"/>
      <path d="M0 0 L0 -28 M0 0 L18 14" stroke="${p.accent2}" stroke-width="2"/>
      <path d="M0 40 V55 M-12 55 H12" stroke="${p.accent}" stroke-width="3"/>`,
    (p) => `
      <circle cx="0" cy="0" r="36" fill="none" stroke="${p.accent}" stroke-width="5"/>
      <circle cx="0" cy="0" r="14" fill="none" stroke="${p.clash}" stroke-width="3"/>
      <path d="M0 -36 L6 -48 L-6 -48 Z M36 0 L48 6 L48 -6 Z M0 36 L-6 48 L6 48 Z M-36 0 L-48 -6 L-48 6 Z"
        fill="${p.accent2}" opacity="0.7"/>`,
  ],
  retro8Bit: [
    (p) => `
      <path d="M-8 -50 H8 V10 H20 V30 H-20 V10 H-8 Z" fill="none" stroke="${p.accent}" stroke-width="3"/>
      <rect x="-20" y="30" width="40" height="12" fill="${p.clash}" opacity="0.7"/>
      <rect x="-4" y="-58" width="8" height="10" fill="${p.accent2}"/>`,
    (p) => `
      <path d="M0 20 L-24 -4 Q-24 -24 -8 -24 Q0 -24 0 -12 Q0 -24 8 -24 Q24 -24 24 -4 Z"
        fill="none" stroke="${p.clash}" stroke-width="3"/>
      <rect x="-6" y="-6" width="6" height="6" fill="${p.accent}"/>`,
    (p) => `
      <path d="M-50 40 H50 V10 H30 V-10 H10 V-40 H-10 V-10 H-30 V10 H-50 Z"
        fill="none" stroke="${p.accent}" stroke-width="3"/>
      <rect x="-6" y="10" width="12" height="30" fill="none" stroke="${p.clash}" stroke-width="2"/>`,
  ],
  highFantasy: [
    (p) => `
      <path d="M-40 20 Q-60 -10 -20 -30 Q0 -50 20 -30 Q60 -10 40 20 L20 10 Q0 30 -20 10 Z"
        fill="none" stroke="${p.accent}" stroke-width="3"/>
      <circle cx="12" cy="-18" r="5" fill="${p.clash}"/>
      <path d="M-10 20 Q0 45 10 20" stroke="${p.accent2}" stroke-width="2"/>`,
    (p) => `
      <path d="M0 55 V-10" stroke="${p.accent}" stroke-width="4"/>
      <path d="M0 -10 L-22 -40 L0 -28 L22 -40 Z" fill="none" stroke="${p.clash}" stroke-width="2.5"/>
      <circle cx="0" cy="-48" r="8" fill="none" stroke="${p.accent2}" stroke-width="2"/>`,
    (p) => `
      <path d="M-35 10 Q-50 -20 -20 -35 Q0 -50 20 -35 Q50 -20 35 10 Z" fill="none" stroke="${p.accent}" stroke-width="3"/>
      <ellipse cx="0" cy="18" rx="28" ry="16" fill="none" stroke="${p.clash}" stroke-width="2"/>
      <path d="M-40 -5 Q-70 -40 -30 -55 M40 -5 Q70 -40 30 -55" fill="none" stroke="${p.accent2}" stroke-width="2"/>`,
  ],
  cosmicHorror: [
    (p) => `
      <circle cx="0" cy="0" r="28" fill="none" stroke="${p.accent}" stroke-width="3"/>
      <circle cx="0" cy="0" r="10" fill="${p.clash}"/>
      <path d="M-20 20 Q-40 60 -10 70 M0 28 Q10 75 30 60 M18 18 Q50 50 40 80"
        fill="none" stroke="${p.accent2}" stroke-width="3"/>`,
    (p) => `
      <path d="M-50 40 L-30 -40 L10 -20 L50 -50 L40 40 Z" fill="none" stroke="${p.accent}" stroke-width="3"/>
      <path d="M-20 40 L0 -10 L25 40" fill="none" stroke="${p.clash}" stroke-width="2"/>`,
    (p) => `
      <ellipse cx="0" cy="10" rx="35" ry="45" fill="none" stroke="${p.accent}" stroke-width="3"/>
      <circle cx="-10" cy="-5" r="6" fill="none" stroke="${p.clash}" stroke-width="2"/>
      <circle cx="12" cy="0" r="4" fill="${p.accent2}"/>
      <path d="M-20 40 Q0 60 20 40" stroke="${p.accent}" stroke-width="2"/>`,
  ],
  samuraiEra: [
    (p) => `
      <path d="M-60 10 H55" stroke="${p.accent}" stroke-width="5" stroke-linecap="round"/>
      <path d="M55 10 L75 -5 L70 18 Z" fill="${p.clash}"/>
      <rect x="-20" y="0" width="30" height="18" fill="none" stroke="${p.accent2}" stroke-width="2"/>
      <path d="M-60 10 L-70 0" stroke="${p.accent}" stroke-width="3"/>`,
    (p) => `
      <path d="M-40 40 H40 M-28 40 V10 H28 V40 M-50 10 H50" fill="none" stroke="${p.accent}" stroke-width="3"/>
      <path d="M-55 10 L0 -35 L55 10" fill="none" stroke="${p.clash}" stroke-width="3"/>`,
    (p) => `
      <path d="M-50 20 Q-20 -40 10 5 Q30 -30 50 15" fill="none" stroke="${p.clash}" stroke-width="2"/>
      <circle cx="-20" cy="-10" r="8" fill="none" stroke="${p.accent}" stroke-width="2"/>
      <circle cx="10" cy="0" r="7" fill="none" stroke="${p.accent2}" stroke-width="2"/>
      <circle cx="40" cy="8" r="6" fill="none" stroke="${p.accent}" stroke-width="2"/>`,
  ],
  postApocalyptic: [
    (p) => `
      <!-- pirate sword / cutlass -->
      <path d="M-55 15 H50" stroke="${p.accent}" stroke-width="5" stroke-linecap="round"/>
      <path d="M50 15 Q70 -5 55 25 Z" fill="${p.clash}"/>
      <path d="M-15 5 V30 M-25 30 H5" stroke="${p.accent2}" stroke-width="3"/>
      <circle cx="-45" cy="15" r="6" fill="none" stroke="${p.clash}" stroke-width="2"/>`,
    (p) => `
      <!-- chest of gold -->
      <rect x="-45" y="-5" width="90" height="50" rx="4" fill="none" stroke="${p.accent}" stroke-width="3"/>
      <path d="M-45 -5 Q0 -40 45 -5" fill="none" stroke="${p.accent2}" stroke-width="3"/>
      <circle cx="0" cy="18" r="8" fill="none" stroke="${p.clash}" stroke-width="2"/>
      <circle cx="-18" cy="8" r="5" fill="${p.clash}" opacity="0.8"/>
      <circle cx="16" cy="6" r="5" fill="${p.clash}" opacity="0.8"/>
      <circle cx="4" cy="-8" r="4" fill="${p.accent2}"/>`,
    (p) => `
      <!-- pirate ship -->
      <path d="M-70 30 H70 L50 50 H-50 Z" fill="none" stroke="${p.accent}" stroke-width="3"/>
      <path d="M0 30 V-45" stroke="${p.accent2}" stroke-width="3"/>
      <path d="M0 -40 L40 5 H0 Z" fill="none" stroke="${p.clash}" stroke-width="2.5"/>
      <path d="M0 -20 L-35 15 H0 Z" fill="none" stroke="${p.accent}" stroke-width="2"/>
      <path d="M-20 50 Q0 62 20 50" stroke="${p.accent2}" stroke-width="2"/>`,
  ],
  eldritchArcane: [
    (p) => `
      <path d="M-35 -40 H35 V40 H-35 Z" fill="none" stroke="${p.accent}" stroke-width="3"/>
      <path d="M-25 -25 H25 M-25 -10 H15 M-25 5 H20 M-25 20 H10" stroke="${p.clash}" stroke-width="1.5"/>
      <path d="M35 -20 Q55 0 35 20" fill="none" stroke="${p.accent2}" stroke-width="2"/>`,
    (p) => `
      <path d="M0 -50 L28 10 L0 45 L-28 10 Z" fill="none" stroke="${p.clash}" stroke-width="3"/>
      <path d="M0 -20 L12 5 L0 20 L-12 5 Z" fill="none" stroke="${p.accent}" stroke-width="2"/>
      <circle cx="0" cy="0" r="4" fill="${p.accent2}"/>`,
    (p) => `
      <circle cx="0" cy="0" r="45" fill="none" stroke="${p.accent}" stroke-width="2"/>
      <circle cx="0" cy="0" r="28" fill="none" stroke="${p.clash}" stroke-width="2"/>
      <path d="M0 -45 L12 -12 L45 0 L12 12 L0 45 L-12 12 L-45 0 L-12 -12 Z"
        fill="none" stroke="${p.accent2}" stroke-width="1.5"/>`,
  ],
  victorianGothic: [
    (p) => `
      <path d="M0 40 V-10" stroke="${p.accent}" stroke-width="4"/>
      <path d="M-18 -10 H18 V-35 Q0 -55 -18 -35 Z" fill="none" stroke="${p.clash}" stroke-width="2.5"/>
      <circle cx="0" cy="-42" r="5" fill="${p.accent2}"/>
      <path d="M-22 40 H22" stroke="${p.accent}" stroke-width="3"/>`,
    (p) => `
      <circle cx="0" cy="0" r="36" fill="none" stroke="${p.accent}" stroke-width="3"/>
      <circle cx="0" cy="-4" r="18" fill="none" stroke="${p.clash}" stroke-width="2"/>
      <path d="M-10 20 Q0 32 10 20" stroke="${p.accent2}" stroke-width="2"/>
      <path d="M0 36 V50" stroke="${p.accent}" stroke-width="3"/>`,
    (p) => `
      <circle cx="0" cy="0" r="42" fill="none" stroke="${p.accent}" stroke-width="4"/>
      <circle cx="0" cy="0" r="10" fill="none" stroke="${p.clash}" stroke-width="3"/>
      <path d="M0 -42 L8 -52 L-8 -52 Z M42 0 L52 8 L52 -8 Z M0 42 L-8 52 L8 52 Z M-42 0 L-52 -8 L-52 8 Z"
        fill="${p.accent2}" opacity="0.75"/>`,
  ],
};

/** Base placements: left / center-right / lower — then nudged per page. */
const BASE_PLACEMENTS: ReadonlyArray<{ x: number; y: number; scale: number; rot: number }> = [
  { x: 160, y: 200, scale: 1.05, rot: -8 },
  { x: 920, y: 280, scale: 1.0, rot: 6 },
  { x: 620, y: 620, scale: 0.95, rot: -4 },
];

function pageNudge(page: string, index: number): { dx: number; dy: number; dRot: number } {
  const pages = ["overview", "physical", "lore", "abilities", "equipment", "personality", "relationships", "stats"];
  const i = Math.max(0, pages.indexOf(page));
  const wave = (i + 1) * (index + 1) * 11;
  return {
    dx: ((wave * 13) % 90) - 45,
    dy: ((wave * 7) % 70) - 35,
    dRot: ((wave * 3) % 14) - 7,
  };
}

/**
 * Three genre motifs scattered through the page plate.
 * Physical pages get quieter opacity so portraits stay primary.
 */
export function genreMotifLayer(theme: MotifThemeId, page: string, p: MotifPalette): string {
  const ids = THEME_MOTIFS[theme];
  const drawers = MOTIF_DRAW[theme];
  const quiet = page === "physical" ? 0.55 : 1;
  const parts: string[] = [];

  for (let i = 0; i < 3; i++) {
    const base = BASE_PLACEMENTS[i];
    const nudge = pageNudge(page, i);
    const body = drawers[i](p);
    parts.push(
      `<g data-motif-slot="${i}" opacity="${quiet}">${wrap(
        ids[i],
        base.x + nudge.dx,
        base.y + nudge.dy,
        base.scale,
        base.rot + nudge.dRot,
        body
      )}</g>`
    );
  }

  return `<g data-genre-motifs="${theme}" data-motif-count="3">${parts.join("\n")}</g>`;
}
