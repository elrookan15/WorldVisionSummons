import type { CSSProperties } from "react";
import type { EquipmentTarget } from "../../schema/codexSnapshotV1";
import type { CalloutRoute, PlateRule, RectMm } from "../../composition/types";
import { ILLUMINATED_TOKENS } from "./tokens";

const PT_IN_MM = 25.4 / 72;

export function regionBox(region: RectMm): CSSProperties {
  return {
    position: "absolute",
    left: `${region.x}mm`,
    top: `${region.y}mm`,
    width: `${region.w}mm`,
    height: `${region.h}mm`,
    overflow: "hidden",
  };
}

export function plateFont(role: "display" | "body" | "mono" | "label"): string {
  if (role === "display") return '"Cinzel Decorative", Cinzel, Palatino, serif';
  if (role === "label") return "Cinzel, Palatino, serif";
  if (role === "mono") return '"IBM Plex Mono", ui-monospace, monospace';
  return '"Cormorant Garamond", Newsreader, Palatino, serif';
}

export function CodexParchmentGround() {
  return (
    <svg viewBox="0 0 210 297" width="210mm" height="297mm" style={{ position: "absolute", inset: 0 }} aria-hidden="true">
      <defs>
        <radialGradient id="codex-sheet" cx="48%" cy="42%" r="72%">
          <stop offset="0%" stopColor="#F6EDD8" />
          <stop offset="46%" stopColor={ILLUMINATED_TOKENS.parchment} />
          <stop offset="78%" stopColor="#D7C09A" />
          <stop offset="100%" stopColor="#8C6842" />
        </radialGradient>
        <filter id="codex-fiber" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="7" result="noise" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.38  0 0 0 0 0.24  0 0 0 0 0.12  0 0 0 0.42 0" />
        </filter>
        <radialGradient id="codex-stain-a" cx="18%" cy="22%" r="28%">
          <stop offset="0%" stopColor={ILLUMINATED_TOKENS.oxblood} stopOpacity="0.16" />
          <stop offset="100%" stopColor={ILLUMINATED_TOKENS.oxblood} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="codex-stain-b" cx="84%" cy="76%" r="34%">
          <stop offset="0%" stopColor="#5C3A22" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#5C3A22" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="210" height="297" fill="url(#codex-sheet)" />
      <rect width="210" height="297" filter="url(#codex-fiber)" />
      <rect width="210" height="297" fill="url(#codex-stain-a)" />
      <rect width="210" height="297" fill="url(#codex-stain-b)" />
    </svg>
  );
}

export function CodexOrnamentFrame({ rules }: { rules: readonly PlateRule[] }) {
  return (
    <svg viewBox="0 0 210 297" width="210mm" height="297mm" style={{ position: "absolute", inset: 0 }} aria-hidden="true">
      {rules.map((rule) => (
        <line
          key={`${rule.x1}-${rule.y1}-${rule.x2}-${rule.weightPt}`}
          x1={rule.x1}
          y1={rule.y1}
          x2={rule.x2}
          y2={rule.y2}
          stroke={rule.color}
          strokeWidth={rule.weightPt * PT_IN_MM}
        />
      ))}
      {[
        [12, 12, 1, 1],
        [198, 12, -1, 1],
        [12, 285, 1, -1],
        [198, 285, -1, -1],
      ].map(([x, y, dx, dy]) => (
        <g key={`${x}-${y}`}>
          <polyline
            points={`${x},${Number(y) + Number(dy) * 8} ${x},${y} ${Number(x) + Number(dx) * 8},${y}`}
            fill="none"
            stroke={ILLUMINATED_TOKENS.oxblood}
            strokeWidth={1.2 * PT_IN_MM}
          />
          <polyline
            points={`${Number(x) + Number(dx) * 1.6},${Number(y) + Number(dy) * 5} ${Number(x) + Number(dx) * 1.6},${Number(y) + Number(dy) * 1.6} ${Number(x) + Number(dx) * 5},${Number(y) + Number(dy) * 1.6}`}
            fill="none"
            stroke={ILLUMINATED_TOKENS.gildedBronze}
            strokeWidth={0.4 * PT_IN_MM}
          />
          <rect
            x={Number(x) + Number(dx) * 2.2 - 0.7}
            y={Number(y) + Number(dy) * 2.2 - 0.7}
            width="1.4"
            height="1.4"
            transform={`rotate(45 ${Number(x) + Number(dx) * 2.2} ${Number(y) + Number(dy) * 2.2})`}
            fill="none"
            stroke={ILLUMINATED_TOKENS.gildedBronze}
            strokeWidth={0.4 * PT_IN_MM}
          />
        </g>
      ))}
    </svg>
  );
}

export function CodexCrest({ letters, size = 28 }: { letters: string | null; size?: number }) {
  const mark = (letters ?? "").slice(0, 3);
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 40 46" aria-hidden="true">
      <path d="M20 2 L36 8 V24 C36 34 28 42 20 44 C12 42 4 34 4 24 V8 Z" fill={ILLUMINATED_TOKENS.agedFiber} stroke={ILLUMINATED_TOKENS.oxblood} strokeWidth="1.2" />
      <path d="M20 7 L31 12 V23 C31 30 26 36 20 38 C14 36 9 30 9 23 V12 Z" fill="none" stroke={ILLUMINATED_TOKENS.gildedBronze} strokeWidth="0.7" />
      {mark ? null : <path d="M20 12 V30 M14 18 H26" stroke={ILLUMINATED_TOKENS.oxblood} strokeWidth="0.6" />}
      {mark ? (
        <text x="20" y="27" textAnchor="middle" fontSize="7" fill={ILLUMINATED_TOKENS.ink} fontFamily="Cinzel, Palatino, serif">
          {mark}
        </text>
      ) : null}
    </svg>
  );
}

export function CodexItemVignette({ target }: { target: EquipmentTarget }) {
  return (
    <svg width="8mm" height="8mm" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="1" y="1" width="22" height="22" fill={ILLUMINATED_TOKENS.agedFiber} stroke={ILLUMINATED_TOKENS.gildedBronze} strokeWidth="0.7" />
      <g fill="none" stroke={ILLUMINATED_TOKENS.ink} strokeWidth="0.9" strokeLinecap="square">
        {target === "head" ? <path d="M7 14 V10 C7 7 9 5 12 5 C15 5 17 7 17 10 V14 M8 14 H16" /> : null}
        {target === "torso" ? <path d="M8 6 L12 8 L16 6 V16 H8 Z" /> : null}
        {target === "leftHand" || target === "rightHand" ? <path d="M12 4 V16 M9 16 H15 M10 18 H14" /> : null}
        {target === "waist" ? <path d="M6 10 H18 V16 H6 Z M12 10 V16" /> : null}
        {target === "feet" ? <path d="M8 8 H14 V14 H18 V17 H7 V12 H8 Z" /> : null}
        {target === "free" ? <circle cx="12" cy="12" r="4" /> : null}
      </g>
    </svg>
  );
}

export function CodexMonogram({ letters }: { letters: string | null }) {
  return <CodexCrest letters={letters} size={28} />;
}

export function CodexLeaderLines({ routes }: { routes: readonly CalloutRoute[] }) {
  return (
    <svg viewBox="0 0 210 297" width="210mm" height="297mm" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} aria-hidden="true">
      {routes.filter((route) => route.leader && route.bend).map((route) => {
        const bend = route.bend;
        if (!bend) return null;
        const tip = route.calloutPoint;
        return (
          <g key={route.id}>
            <polyline
              points={`${route.anchorPoint.x},${route.anchorPoint.y} ${bend.x},${bend.y} ${tip.x},${tip.y}`}
              fill="none"
              stroke={ILLUMINATED_TOKENS.gildedBronze}
              strokeWidth={0.6 * PT_IN_MM}
            />
            <circle cx={route.anchorPoint.x} cy={route.anchorPoint.y} r="0.7" fill={ILLUMINATED_TOKENS.gildedBronze} />
            <polygon
              points={`${tip.x},${tip.y} ${tip.x - 1.6},${tip.y - 0.7} ${tip.x - 1.6},${tip.y + 0.7}`}
              fill={ILLUMINATED_TOKENS.gildedBronze}
            />
          </g>
        );
      })}
    </svg>
  );
}
