import { canonicalizeSheetStyle } from "./themeMap";

const STYLE_PALETTES: Record<string, { bg: string; bg2: string; accent: string; accent2: string; text: string }> = {
  "Gothic Dark Fantasy": { bg: "#12080a", bg2: "#2a1014", accent: "#8b0000", accent2: "#d4a017", text: "#f3d9d9" },
  Cyberpunk: { bg: "#0c0a14", bg2: "#1a1430", accent: "#ff2a8a", accent2: "#00f0ff", text: "#f4e9ff" },
  Steampunk: { bg: "#2a1c12", bg2: "#4a301c", accent: "#b87333", accent2: "#e8c37a", text: "#f8ead4" },
  "8-Bit Retro RPG": { bg: "#0d1117", bg2: "#16301d", accent: "#2ea043", accent2: "#f0883e", text: "#e6edf3" },
  "High Fantasy": { bg: "#151224", bg2: "#2a2140", accent: "#d9c5a0", accent2: "#7dd3fc", text: "#f4ead8" },
  "Cosmic Horror": { bg: "#06080d", bg2: "#122038", accent: "#38bdf8", accent2: "#a855f7", text: "#dbeafe" },
  "Samurai Era": { bg: "#1a1010", bg2: "#3a1818", accent: "#dc2626", accent2: "#eab308", text: "#fde8e8" },
  "Post-Apocalyptic": { bg: "#2b1f14", bg2: "#4a341c", accent: "#b8451b", accent2: "#ff6b2a", text: "#f5e6c8" },
  "Eldritch Arcane": { bg: "#0b0813", bg2: "#241c3d", accent: "#c084fc", accent2: "#38bdf8", text: "#f3e8ff" },
  "Victorian Gothic": { bg: "#0e1013", bg2: "#252a32", accent: "#cbd5e1", accent2: "#f59e0b", text: "#e2e8f0" },
};

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "WV";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * Character-specific SVG portrait used only when the live image model is unavailable.
 * This is a unique dossier plate, never a generic stock photo.
 */
export function buildProceduralPortrait(opts: {
  name?: string;
  charClass?: string;
  style?: string;
  distinguishingFeature?: string;
}): string {
  const name = opts.name?.trim() || "Summoned Hero";
  const charClass = opts.charClass?.trim() || "Adventurer";
  const style = canonicalizeSheetStyle(opts.style);
  const feature = opts.distinguishingFeature?.trim() || style;
  const palette = STYLE_PALETTES[style] || STYLE_PALETTES["Gothic Dark Fantasy"];
  const mark = initials(name);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1280" viewBox="0 0 1024 1280" role="img" aria-label="${xmlEscape(name)} portrait">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.bg}"/>
      <stop offset="100%" stop-color="${palette.bg2}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="38%" r="45%">
      <stop offset="0%" stop-color="${palette.accent2}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${palette.bg}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1024" height="1280" fill="url(#bg)"/>
  <rect width="1024" height="1280" fill="url(#glow)"/>
  <rect x="48" y="48" width="928" height="1184" rx="36" fill="none" stroke="${palette.accent}" stroke-width="6" opacity="0.85"/>
  <rect x="72" y="72" width="880" height="1136" rx="28" fill="none" stroke="${palette.accent2}" stroke-width="1.5" opacity="0.45"/>
  <circle cx="512" cy="470" r="196" fill="${palette.accent}" opacity="0.16"/>
  <circle cx="512" cy="470" r="148" fill="${palette.bg2}" stroke="${palette.accent2}" stroke-width="8"/>
  <text x="512" y="500" text-anchor="middle" font-family="Cinzel, Georgia, serif" font-size="108" font-weight="700" fill="${palette.text}">${xmlEscape(mark)}</text>
  <text x="512" y="760" text-anchor="middle" font-family="Cinzel, Georgia, serif" font-size="52" font-weight="700" fill="${palette.text}">${xmlEscape(name.slice(0, 28))}</text>
  <text x="512" y="824" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="26" fill="${palette.accent2}">${xmlEscape(charClass.slice(0, 42))}</text>
  <text x="512" y="890" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="18" letter-spacing="4" fill="${palette.accent}">${xmlEscape(style.toUpperCase())}</text>
  <text x="512" y="980" text-anchor="middle" font-family="Newsreader, serif" font-size="20" fill="${palette.text}" opacity="0.8">${xmlEscape(feature.slice(0, 64))}</text>
  <text x="512" y="1168" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="14" fill="${palette.text}" opacity="0.45">WORLDVISION SUMMONS • AWAITING NEURAL RENDER</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
