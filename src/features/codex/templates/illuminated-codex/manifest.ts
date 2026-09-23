import type { RectMm, RegionId } from "../../composition/types";
import { ILLUMINATED_TYPE } from "./tokens";

export interface IlluminatedManifest {
  id: "illuminated-codex";
  version: "1.0.0";
  page: { widthMm: number; heightMm: number };
  marginMm: number;
  regions: Record<RegionId, RectMm>;
  type: typeof ILLUMINATED_TYPE;
}

const contentW = 186;
const gutter = 9.5;

export const ILLUMINATED_MANIFEST: IlluminatedManifest = {
  id: "illuminated-codex",
  version: "1.0.0",
  page: { widthMm: 210, heightMm: 297 },
  marginMm: 12,
  type: ILLUMINATED_TYPE,
  regions: {
    title: { x: 12, y: 12, w: contentW, h: 22 },
    identity: { x: 12, y: 34, w: 35, h: 188 },
    portrait: { x: 12 + 35 + gutter, y: 34, w: 95, h: 188 },
    gear: { x: 12 + 35 + gutter + 95 + gutter, y: 34, w: 37, h: 188 },
    vitals: { x: 12, y: 222, w: 46, h: 50 },
    attributes: { x: 60, y: 222, w: 62, h: 50 },
    chronicle: { x: 124, y: 222, w: 74, h: 50 },
    footer: { x: 12, y: 277, w: contentW, h: 8 },
  },
};

export function regionOf(id: RegionId, manifest: IlluminatedManifest = ILLUMINATED_MANIFEST): RectMm {
  return manifest.regions[id];
}
