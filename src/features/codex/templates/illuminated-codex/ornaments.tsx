import type { CSSProperties } from "react";
import type { EquipmentTarget } from "../../schema/codexSnapshotV1";
import type { CalloutRoute, PlateRule, RectMm } from "../../composition/types";
import type { PlateFrame, PlateSkin } from "./skins";

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
  if (role === "display") return "var(--codex-display), Cinzel, Palatino, serif";
  if (role === "label") return "var(--codex-label), Cinzel, Palatino, serif";
  if (role === "mono") return "var(--codex-mono), 'IBM Plex Mono', ui-monospace, monospace";
  return "var(--codex-body), 'Cormorant Garamond', Newsreader, Palatino, serif";
}

export function CodexParchmentGround({ skin }: { skin: PlateSkin }) {
  const gid = `codex-sheet-${skin.id}`;
  return (
    <svg viewBox="0 0 210 297" width="210mm" height="297mm" style={{ position: "absolute", inset: 0 }} aria-hidden="true">
      <defs>
        <radialGradient id={gid} cx="48%" cy="42%" r="72%">
          <stop offset="0%" stopColor={skin.ground} />
          <stop offset="58%" stopColor={skin.mid} />
          <stop offset="100%" stopColor={skin.edge} />
        </radialGradient>
        <filter id={`codex-fiber-${skin.id}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency={skin.texture === "grid" ? "0.35" : "0.9"} numOctaves="4" seed="7" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.38  0 0 0 0 0.24  0 0 0 0 0.12  0 0 0 0.38 0" />
        </filter>
        <pattern id={`codex-scan-${skin.id}`} width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="1" fill={skin.rule} opacity="0.18" />
        </pattern>
      </defs>
      <rect width="210" height="297" fill={`url(#${gid})`} />
      {skin.texture === "scan" || skin.texture === "grid" ? (
        <rect width="210" height="297" fill={`url(#codex-scan-${skin.id})`} />
      ) : (
        <rect width="210" height="297" filter={`url(#codex-fiber-${skin.id})`} />
      )}
    </svg>
  );
}

function cornerMark(frame: PlateFrame, x: number, y: number, dx: number, dy: number, skin: PlateSkin) {
  const accent = skin.accent;
  const rule = skin.rule;
  if (frame === "circuit") {
    return (
      <g key={`${x}-${y}`}>
        <polyline points={`${x},${y + dy * 10} ${x},${y} ${x + dx * 10},${y}`} fill="none" stroke={rule} strokeWidth={0.5} />
        <circle cx={x + dx * 3} cy={y + dy * 3} r="0.8" fill={accent} />
      </g>
    );
  }
  if (frame === "pixel") {
    return (
      <g key={`${x}-${y}`}>
        <rect x={Math.min(x, x + dx * 4)} y={Math.min(y, y + dy * 2)} width="4" height="2" fill={accent} />
        <rect x={Math.min(x, x + dx * 2)} y={Math.min(y, y + dy * 4)} width="2" height="4" fill={rule} />
      </g>
    );
  }
  if (frame === "rivet") {
    return (
      <g key={`${x}-${y}`}>
        <polyline points={`${x},${y + dy * 7} ${x},${y} ${x + dx * 7},${y}`} fill="none" stroke={rule} strokeWidth={0.7} />
        <circle cx={x + dx * 2.2} cy={y + dy * 2.2} r="0.9" fill="none" stroke={accent} strokeWidth="0.4" />
      </g>
    );
  }
  if (frame === "brush") {
    return (
      <polyline key={`${x}-${y}`} points={`${x},${y + dy * 9} ${x + dx * 0.4},${y} ${x + dx * 9},${y + dy * 0.3}`} fill="none" stroke={accent} strokeWidth="1.1" />
    );
  }
  if (frame === "stencil") {
    return (
      <polyline key={`${x}-${y}`} points={`${x},${y + dy * 8} ${x},${y} ${x + dx * 8},${y}`} fill="none" stroke={accent} strokeWidth="0.9" strokeDasharray="2 1.2" />
    );
  }
  if (frame === "rift") {
    return (
      <path key={`${x}-${y}`} d={`M ${x} ${y + dy * 8} Q ${x + dx * 4} ${y + dy * 4} ${x + dx * 8} ${y}`} fill="none" stroke={rule} strokeWidth="0.6" />
    );
  }
  return (
    <g key={`${x}-${y}`}>
      <polyline points={`${x},${y + dy * 8} ${x},${y} ${x + dx * 8},${y}`} fill="none" stroke={accent} strokeWidth={1.2 * PT_IN_MM} />
      <polyline points={`${x + dx * 1.6},${y + dy * 5} ${x + dx * 1.6},${y + dy * 1.6} ${x + dx * 5},${y + dy * 1.6}`} fill="none" stroke={rule} strokeWidth={0.4 * PT_IN_MM} />
    </g>
  );
}

export function CodexOrnamentFrame({ rules, skin }: { rules: readonly PlateRule[]; skin: PlateSkin }) {
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
      ].map(([x, y, dx, dy]) => cornerMark(skin.frame, x, y, dx, dy, skin))}
    </svg>
  );
}

export function CodexCrest({ letters, size = 28, skin }: { letters: string | null; size?: number; skin: PlateSkin }) {
  const mark = (letters ?? "").slice(0, 3);
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 40 46" aria-hidden="true">
      <path d="M20 2 L36 8 V24 C36 34 28 42 20 44 C12 42 4 34 4 24 V8 Z" fill={skin.mid} stroke={skin.accent} strokeWidth="1.2" />
      <path d="M20 7 L31 12 V23 C31 30 26 36 20 38 C14 36 9 30 9 23 V12 Z" fill="none" stroke={skin.rule} strokeWidth="0.7" />
      {mark ? null : <path d="M20 12 V30 M14 18 H26" stroke={skin.accent} strokeWidth="0.6" />}
      {mark ? (
        <text x="20" y="27" textAnchor="middle" fontSize="7" fill={skin.ink} fontFamily="Cinzel, Palatino, serif">
          {mark}
        </text>
      ) : null}
    </svg>
  );
}

export function CodexItemVignette({ target, skin }: { target: EquipmentTarget; skin: PlateSkin }) {
  return (
    <svg width="8mm" height="8mm" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="1" y="1" width="22" height="22" fill={skin.mid} stroke={skin.rule} strokeWidth="0.7" />
      <g fill="none" stroke={skin.ink} strokeWidth="0.9" strokeLinecap="square">
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

export function CodexLeaderLines({ routes, skin }: { routes: readonly CalloutRoute[]; skin: PlateSkin }) {
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
              stroke={skin.rule}
              strokeWidth={0.6 * PT_IN_MM}
            />
            <circle cx={route.anchorPoint.x} cy={route.anchorPoint.y} r="0.7" fill={skin.rule} />
            <polygon
              points={`${tip.x},${tip.y} ${tip.x - 1.6},${tip.y - 0.7} ${tip.x - 1.6},${tip.y + 0.7}`}
              fill={skin.rule}
            />
          </g>
        );
      })}
    </svg>
  );
}
