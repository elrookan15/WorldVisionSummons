import type { GenreTheme } from "../../schema/codexSnapshotV1";
import { ILLUMINATED_TOKENS } from "./tokens";

export type PlateFrame = "filigree" | "circuit" | "rivet" | "rift" | "brush" | "stencil" | "pixel" | "lace";
export type PlateTexture = "fiber" | "scan" | "ink" | "dust" | "void" | "grid" | "brass";

export interface PlateSkin {
  id: GenreTheme;
  ground: string;
  mid: string;
  edge: string;
  ink: string;
  accent: string;
  rule: string;
  muted: string;
  frame: PlateFrame;
  texture: PlateTexture;
  portraitFilter: string;
  edgeShadow: string;
}

const manuscript = {
  ground: "#F6EDD8",
  mid: ILLUMINATED_TOKENS.parchment,
  edge: "#8C6842",
  ink: ILLUMINATED_TOKENS.ink,
  accent: ILLUMINATED_TOKENS.oxblood,
  rule: ILLUMINATED_TOKENS.gildedBronze,
  muted: ILLUMINATED_TOKENS.muted,
  frame: "filigree" as const,
  texture: "fiber" as const,
  portraitFilter: "grayscale(0.42) sepia(0.38) contrast(1.08) saturate(0.72)",
  edgeShadow: "inset 0 0 14mm rgba(62, 28, 12, 0.42)",
};

export const PLATE_SKINS: Record<GenreTheme, PlateSkin> = {
  gothic: {
    ...manuscript,
    id: "gothic",
    ground: "#E7D3AE",
    mid: "#CDB892",
    edge: "#5C3318",
    edgeShadow: "inset 0 0 18mm rgba(48, 16, 8, 0.55)",
  },
  default: {
    ...manuscript,
    id: "default",
    ground: "#F8F1E2",
    mid: "#F2E7CF",
    edge: "#C4A574",
  },
  highFantasy: {
    ...manuscript,
    id: "highFantasy",
    ground: "#F7F0DE",
    mid: "#E7D7B0",
    edge: "#8A6A2F",
    ink: "#1A140C",
    accent: "#6E5420",
    rule: "#C6A15A",
    muted: "#6B5A3E",
    portraitFilter: "sepia(0.22) saturate(0.9) contrast(1.04)",
  },
  cyberpunk: {
    id: "cyberpunk",
    ground: "#14101C",
    mid: "#0C0A14",
    edge: "#07060C",
    ink: "#E9DDFF",
    accent: "#FF2A8A",
    rule: "#00F0FF",
    muted: "#9D8AB8",
    frame: "circuit",
    texture: "scan",
    portraitFilter: "grayscale(0.7) contrast(1.2) sepia(0.15) hue-rotate(250deg) saturate(1.4)",
    edgeShadow: "inset 0 0 16mm rgba(0, 240, 255, 0.18)",
  },
  steampunk: {
    id: "steampunk",
    ground: "#F3E6D2",
    mid: "#E0CBA8",
    edge: "#8A5A2B",
    ink: "#2E2118",
    accent: "#8A4B1F",
    rule: "#B87333",
    muted: "#7A6654",
    frame: "rivet",
    texture: "brass",
    portraitFilter: "sepia(0.55) contrast(1.05) saturate(0.8)",
    edgeShadow: "inset 0 0 12mm rgba(90, 50, 20, 0.35)",
  },
  cosmic: {
    id: "cosmic",
    ground: "#10182A",
    mid: "#06080D",
    edge: "#02040A",
    ink: "#D6E4F0",
    accent: "#7DD3FC",
    rule: "#A855F7",
    muted: "#7C8EA3",
    frame: "rift",
    texture: "void",
    portraitFilter: "grayscale(0.35) contrast(1.15) hue-rotate(190deg) saturate(0.85)",
    edgeShadow: "inset 0 0 18mm rgba(56, 189, 248, 0.2)",
  },
  eldritch: {
    id: "eldritch",
    ground: "#1A1230",
    mid: "#0B0813",
    edge: "#05030A",
    ink: "#F3E8FF",
    accent: "#C084FC",
    rule: "#67E8F9",
    muted: "#A78BFA",
    frame: "rift",
    texture: "void",
    portraitFilter: "contrast(1.12) hue-rotate(260deg) saturate(0.9)",
    edgeShadow: "inset 0 0 18mm rgba(192, 132, 252, 0.28)",
  },
  samurai: {
    id: "samurai",
    ground: "#F4EFE6",
    mid: "#E7DCC8",
    edge: "#1A120F",
    ink: "#1A120F",
    accent: "#9F2B2B",
    rule: "#1A120F",
    muted: "#6B5344",
    frame: "brush",
    texture: "ink",
    portraitFilter: "grayscale(0.85) contrast(1.2) sepia(0.12)",
    edgeShadow: "inset 0 0 10mm rgba(26, 18, 15, 0.28)",
  },
  retro: {
    id: "retro",
    ground: "#161B22",
    mid: "#0D1117",
    edge: "#010409",
    ink: "#E6EDF3",
    accent: "#3FB950",
    rule: "#F0883E",
    muted: "#8B949E",
    frame: "pixel",
    texture: "grid",
    portraitFilter: "contrast(1.25) saturate(1.15)",
    edgeShadow: "inset 0 0 0 2mm #010409",
  },
  wasteland: {
    id: "wasteland",
    ground: "#E4D5B0",
    mid: "#CDB88A",
    edge: "#6B4E2E",
    ink: "#2B1F14",
    accent: "#B8451B",
    rule: "#6B5A42",
    muted: "#6B5A42",
    frame: "stencil",
    texture: "dust",
    portraitFilter: "sepia(0.45) contrast(1.1) saturate(0.65)",
    edgeShadow: "inset 0 0 16mm rgba(80, 48, 18, 0.4)",
  },
  victorian: {
    id: "victorian",
    ground: "#EFEAE1",
    mid: "#D9D2C5",
    edge: "#3F3A36",
    ink: "#1C1917",
    accent: "#7F1D1D",
    rule: "#44403C",
    muted: "#57534E",
    frame: "lace",
    texture: "fiber",
    portraitFilter: "grayscale(0.55) contrast(1.08) sepia(0.18)",
    edgeShadow: "inset 0 0 12mm rgba(28, 25, 23, 0.28)",
  },
};

export function skinFor(genre: GenreTheme): PlateSkin {
  return PLATE_SKINS[genre];
}

export function skinFonts(id: GenreTheme): { display: string; body: string; label: string; mono: string } {
  if (id === "cyberpunk") {
    return { display: "Orbitron, sans-serif", body: '"IBM Plex Mono", monospace', label: "Orbitron, sans-serif", mono: '"IBM Plex Mono", monospace' };
  }
  if (id === "retro") {
    return { display: '"JetBrains Mono", monospace', body: '"JetBrains Mono", monospace', label: '"JetBrains Mono", monospace', mono: '"JetBrains Mono", monospace' };
  }
  if (id === "samurai") {
    return { display: "Philosopher, serif", body: "Newsreader, serif", label: "Philosopher, serif", mono: '"IBM Plex Mono", monospace' };
  }
  if (id === "steampunk") {
    return { display: "Philosopher, serif", body: "Newsreader, serif", label: '"Special Elite", serif', mono: '"Special Elite", monospace' };
  }
  if (id === "wasteland") {
    return { display: "Anton, sans-serif", body: '"Special Elite", serif', label: "Anton, sans-serif", mono: '"Special Elite", monospace' };
  }
  if (id === "victorian") {
    return { display: "Newsreader, serif", body: "Newsreader, serif", label: "Cinzel, serif", mono: '"Special Elite", monospace' };
  }
  if (id === "cosmic" || id === "eldritch") {
    return { display: "Fraunces, serif", body: "Newsreader, serif", label: "Cinzel, serif", mono: '"IBM Plex Mono", monospace' };
  }
  return { display: '"Cinzel Decorative", Cinzel, serif', body: '"Cormorant Garamond", Newsreader, serif', label: "Cinzel, serif", mono: '"IBM Plex Mono", monospace' };
}
