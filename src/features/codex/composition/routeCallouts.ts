import type { AnchorId, GearSlotId } from "../schema/codexSnapshotV1";
import type { CalloutRoute, RectMm } from "./types";

export const PREFERRED_ANCHOR: Record<GearSlotId, AnchorId> = {
  primaryWeapon: "hand-r",
  secondaryFocus: "hand-l",
  armor: "torso",
  utilityTools: "waist",
  consumables: "shoulder-l",
  relics: "shoulder-r",
};

export const ANCHOR_FALLBACK: readonly AnchorId[] = [
  "hand-r",
  "hand-l",
  "torso",
  "waist",
  "shoulder-l",
  "shoulder-r",
  "head",
  "feet",
];

export const ANCHOR_FRACTION: Record<AnchorId, { fx: number; fy: number }> = {
  head: { fx: 0.5, fy: 0.12 },
  "shoulder-l": { fx: 0.18, fy: 0.28 },
  "shoulder-r": { fx: 0.82, fy: 0.28 },
  "hand-l": { fx: 0.1, fy: 0.56 },
  "hand-r": { fx: 0.9, fy: 0.56 },
  torso: { fx: 0.5, fy: 0.46 },
  waist: { fx: 0.5, fy: 0.68 },
  feet: { fx: 0.5, fy: 0.9 },
};

export interface AnchorRequest {
  id: string;
  preferred: AnchorId;
}

export function assignAnchors(requests: readonly AnchorRequest[]): Array<{ id: string; anchor: AnchorId }> {
  const used = new Set<AnchorId>();
  return requests.map((request) => {
    const order = [request.preferred, ...ANCHOR_FALLBACK.filter((anchor) => anchor !== request.preferred)];
    const anchor = order.find((candidate) => !used.has(candidate));
    if (!anchor) throw new Error("Codex plate ran out of portrait anchors");
    used.add(anchor);
    return { id: request.id, anchor };
  });
}

function roundMm(value: number): number {
  return Math.round(value * 100) / 100;
}

export function anchorPoint(rect: RectMm, anchor: AnchorId): { x: number; y: number } {
  const fraction = ANCHOR_FRACTION[anchor];
  return {
    x: roundMm(rect.x + rect.w * fraction.fx),
    y: roundMm(rect.y + rect.h * fraction.fy),
  };
}

export function routeCallouts(
  gear: ReadonlyArray<{ slot: GearSlotId; label: string; name: string; anchor: AnchorId; truncated: boolean }>,
  portrait: RectMm,
  gearRail: RectMm,
): CalloutRoute[] {
  const cardH = gearRail.h / Math.max(1, gear.length);
  return gear.map((item, index) => {
    const anchor = anchorPoint(portrait, item.anchor);
    const callout = {
      x: roundMm(gearRail.x + 1.5),
      y: roundMm(gearRail.y + cardH * index + cardH / 2),
    };
    return {
      slotId: item.slot,
      label: item.label,
      name: item.name,
      anchor: item.anchor,
      anchorPoint: anchor,
      calloutPoint: callout,
      truncated: item.truncated,
    };
  });
}
