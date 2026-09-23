import type { RectMm, RegionId } from "../../composition/types";

export const ILLUMINATED_MANIFEST = {
  templateId: "illuminated-codex" as const,
  version: 1 as const,
  page: { widthMm: 210, heightMm: 297 },
  weights: { hairlinePt: 0.4, rulePt: 0.8, framePt: 1.2 },
  type: {
    namePt: 18,
    epithetPt: 9,
    bodyPt: 8,
    labelPt: 7,
    monoPt: 6.5,
    lineHeight: 1.2,
  },
  regions: {
    title: { x: 12, y: 12, w: 186, h: 26 },
    identity: { x: 12, y: 42, w: 46, h: 148 },
    portrait: { x: 62, y: 42, w: 86, h: 148 },
    gear: { x: 152, y: 42, w: 46, h: 148 },
    vitals: { x: 12, y: 194, w: 60, h: 72 },
    attributes: { x: 76, y: 194, w: 60, h: 72 },
    chronicle: { x: 140, y: 194, w: 58, h: 72 },
    footer: { x: 12, y: 272, w: 186, h: 14 },
  } satisfies Record<RegionId, RectMm>,
} as const;

export function regionOf(id: RegionId): RectMm {
  return ILLUMINATED_MANIFEST.regions[id];
}
