import type { CSSProperties } from "react";
import type { RectMm } from "../../composition/types";
import { ILLUMINATED_TOKENS } from "./tokens";

const DISPLAY = '"Cinzel", "Palatino Linotype", Palatino, serif';
const BODY = '"IM Fell English", Palatino, "Palatino Linotype", serif';
const MONO = '"IBM Plex Mono", ui-monospace, monospace';

export function regionBox(rect: RectMm): CSSProperties {
  return {
    position: "absolute",
    left: `${rect.x}mm`,
    top: `${rect.y}mm`,
    width: `${rect.w}mm`,
    height: `${rect.h}mm`,
    overflow: "hidden",
  };
}

export function plateFont(role: "display" | "body" | "mono" | "label"): string {
  if (role === "mono") return MONO;
  if (role === "display") return DISPLAY;
  return BODY;
}

export function CodexOrnamentFrame() {
  const ink = ILLUMINATED_TOKENS.oxblood;
  const bronze = ILLUMINATED_TOKENS.gildedBronze;
  return (
    <svg
      viewBox="0 0 210 297"
      style={{ position: "absolute", inset: 0, width: "210mm", height: "297mm", pointerEvents: "none" }}
      aria-hidden="true"
    >
      <rect x="8" y="8" width="194" height="281" fill="none" stroke={ink} strokeWidth="1.2" />
      <rect x="10" y="10" width="190" height="277" fill="none" stroke={bronze} strokeWidth="0.4" />
      <path d="M8 8 h8 v8" fill="none" stroke={bronze} strokeWidth="0.8" />
      <path d="M202 8 h-8 v8" fill="none" stroke={bronze} strokeWidth="0.8" />
      <path d="M8 289 h8 v-8" fill="none" stroke={bronze} strokeWidth="0.8" />
      <path d="M202 289 h-8 v-8" fill="none" stroke={bronze} strokeWidth="0.8" />
    </svg>
  );
}

export function CodexMonogram({ letters }: { letters: string }) {
  return (
    <svg viewBox="0 0 40 40" width="12mm" height="12mm" aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="none" stroke={ILLUMINATED_TOKENS.gildedBronze} strokeWidth="1.2" />
      <circle cx="20" cy="20" r="15" fill="none" stroke={ILLUMINATED_TOKENS.oxblood} strokeWidth="0.4" />
      <text
        x="20"
        y="25"
        textAnchor="middle"
        fill={ILLUMINATED_TOKENS.oxblood}
        fontFamily={DISPLAY}
        fontSize="12"
      >
        {letters.slice(0, 2)}
      </text>
    </svg>
  );
}

export function CodexLeaderLines({
  lines,
}: {
  lines: ReadonlyArray<{ x1: number; y1: number; x2: number; y2: number }>;
}) {
  return (
    <svg
      viewBox="0 0 210 297"
      style={{ position: "absolute", inset: 0, width: "210mm", height: "297mm", pointerEvents: "none" }}
      aria-hidden="true"
    >
      {lines.map((line) => (
        <line
          key={`${line.x1}-${line.y1}-${line.x2}-${line.y2}`}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={ILLUMINATED_TOKENS.gildedBronze}
          strokeWidth="0.4"
        />
      ))}
    </svg>
  );
}
