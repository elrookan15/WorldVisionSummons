import type { EquipmentTarget } from "../schema/codexSnapshotV1";
import type { CalloutRoute, PointMm, RectMm } from "./types";

export const ANCHOR_FRACTION: Record<Exclude<EquipmentTarget, "free">, { fx: number; fy: number }> = {
  head: { fx: 0.5, fy: 0.12 },
  torso: { fx: 0.5, fy: 0.48 },
  leftHand: { fx: 0.12, fy: 0.58 },
  rightHand: { fx: 0.88, fy: 0.58 },
  waist: { fx: 0.5, fy: 0.7 },
  feet: { fx: 0.5, fy: 0.9 },
};

const FACE: { fx: number; fy: number; fw: number; fh: number } = { fx: 0.28, fy: 0.14, fw: 0.44, fh: 0.34 };

function roundMm(value: number): number {
  return Math.round(value * 100) / 100;
}

function point(rect: RectMm, fx: number, fy: number): PointMm {
  return { x: roundMm(rect.x + rect.w * fx), y: roundMm(rect.y + rect.h * fy) };
}

function hits(x1: number, y1: number, x2: number, y2: number, rect: RectMm): boolean {
  const edge = 0.05;
  if (y1 === y2) {
    if (y1 <= rect.y + edge || y1 >= rect.y + rect.h - edge) return false;
    return Math.max(x1, x2) > rect.x + edge && Math.min(x1, x2) < rect.x + rect.w - edge;
  }
  if (x1 === x2) {
    if (x1 <= rect.x + edge || x1 >= rect.x + rect.w - edge) return false;
    return Math.max(y1, y2) > rect.y + edge && Math.min(y1, y2) < rect.y + rect.h - edge;
  }
  return false;
}

function pathHits(points: PointMm[], obstacles: RectMm[]): boolean {
  for (let index = 0; index < points.length - 1; index += 1) {
    const from = points[index];
    const to = points[index + 1];
    if (obstacles.some((rect) => hits(from.x, from.y, to.x, to.y, rect))) return true;
  }
  return false;
}

export interface RoutedCallouts {
  callouts: CalloutRoute[];
  leadersDropped: boolean;
}

export function routeCallouts(
  gear: ReadonlyArray<{ id: string; name: string; annotation: string; target: EquipmentTarget; truncated: boolean }>,
  portrait: RectMm,
  gearRail: RectMm,
  title: RectMm,
): RoutedCallouts {
  const face: RectMm = {
    x: roundMm(portrait.x + portrait.w * FACE.fx),
    y: roundMm(portrait.y + portrait.h * FACE.fy),
    w: roundMm(portrait.w * FACE.fw),
    h: roundMm(portrait.h * FACE.fh),
  };
  const targets = gear.map((item) => item.target).filter((target) => target !== "free");
  const collided = targets.some((target, index) => targets.indexOf(target) !== index);
  const cardH = gearRail.h / Math.max(1, gear.length);

  const drafted = gear.map((item, index) => {
    const callout = {
      x: roundMm(gearRail.x),
      y: roundMm(gearRail.y + cardH * index + cardH / 2),
    };
    if (item.target === "free") {
      return { item, callout, anchor: callout, bend: null as PointMm | null, leader: false };
    }
    const fraction = ANCHOR_FRACTION[item.target];
    const anchor = point(portrait, fraction.fx, fraction.fy);
    const elbowH: PointMm[] = [anchor, { x: callout.x, y: anchor.y }, callout];
    const elbowV: PointMm[] = [anchor, { x: anchor.x, y: callout.y }, callout];
    const chosen = !pathHits(elbowH, [face, title]) ? elbowH : !pathHits(elbowV, [face, title]) ? elbowV : null;
    return {
      item,
      callout,
      anchor,
      bend: chosen ? chosen[1] : null,
      leader: chosen !== null,
    };
  });

  const leadersDropped = collided || drafted.some((route) => route.item.target !== "free" && !route.leader);
  return {
    leadersDropped,
    callouts: drafted.map((route) => ({
      id: route.item.id,
      name: route.item.name,
      annotation: route.item.annotation,
      target: route.item.target,
      anchorPoint: route.anchor,
      bend: leadersDropped ? null : route.bend,
      calloutPoint: route.callout,
      leader: leadersDropped ? false : route.leader,
      truncated: route.item.truncated,
    })),
  };
}
