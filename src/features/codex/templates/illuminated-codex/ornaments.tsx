import type { CSSProperties } from "react";
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
  if (role === "display") return '"Cinzel", "Noto Serif", Palatino, serif';
  if (role === "mono" || role === "label") return '"Noto Sans", ui-sans-serif, sans-serif';
  return '"Noto Serif", Palatino, serif';
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
        <polyline
          key={`${x}-${y}`}
          points={`${x},${y + dy * 6} ${x},${y} ${x + dx * 6},${y}`}
          fill="none"
          stroke={ILLUMINATED_TOKENS.oxblood}
          strokeWidth={1.2 * PT_IN_MM}
        />
      ))}
    </svg>
  );
}

export function CodexMonogram({ letters }: { letters: string | null }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <circle cx="14" cy="14" r="12" fill="none" stroke={ILLUMINATED_TOKENS.gildedBronze} strokeWidth="0.8" />
      <text x="14" y="17" textAnchor="middle" fontSize="7" fill={ILLUMINATED_TOKENS.oxblood} fontFamily="Cinzel, Palatino, serif">
        {letters ?? ""}
      </text>
    </svg>
  );
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
