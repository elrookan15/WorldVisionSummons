import type { AnchorId } from "../schema/codexSnapshotV1";

export interface RectMm {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PointMm {
  x: number;
  y: number;
}

export type RegionId = "title" | "identity" | "portrait" | "gear" | "vitals" | "attributes" | "chronicle" | "footer";

export interface TextRun {
  id: string;
  text: string;
  x: number;
  y: number;
  maxWidthMm: number;
  fontPt: number;
  role: "display" | "body" | "mono" | "label";
  color: string;
  wrap: boolean;
  truncated: boolean;
}

export interface PlateRule {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  weightPt: number;
  color: string;
}

export interface CalloutRoute {
  slotId: string;
  label: string;
  name: string;
  anchor: AnchorId;
  anchorPoint: PointMm;
  calloutPoint: PointMm;
  truncated: boolean;
}

export interface CodexRenderModel {
  templateId: "illuminated-codex";
  page: { widthMm: number; heightMm: number };
  snapshotHash: string;
  revision: number;
  locked: boolean;
  texts: TextRun[];
  rules: PlateRule[];
  callouts: CalloutRoute[];
  regions: Record<RegionId, RectMm>;
  warnings: readonly string[];
  overflowIds: readonly string[];
  crest: string;
  portraitUrl: string | null;
  portraitCrop: { x: number; y: number; w: number; h: number };
}
