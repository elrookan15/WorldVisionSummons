import type { EquipmentTarget } from "../schema/codexSnapshotV1";

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
  id: string;
  name: string;
  annotation: string;
  target: EquipmentTarget;
  anchorPoint: PointMm;
  bend: PointMm | null;
  calloutPoint: PointMm;
  leader: boolean;
  truncated: boolean;
}

export interface CodexRenderModel {
  templateId: "illuminated-codex";
  templateVersion: "1.0.0";
  page: { widthMm: number; heightMm: number };
  snapshotHash: string;
  revision: number;
  sealed: boolean;
  texts: TextRun[];
  rules: PlateRule[];
  callouts: CalloutRoute[];
  leadersDropped: boolean;
  regions: Record<RegionId, RectMm>;
  overflowIds: readonly string[];
  crest: string | null;
  silhouette: string | null;
  portraitUrl: string | null;
  portraitCrop: { x: number; y: number; width: number; height: number };
  focalPoint: { x: number; y: number };
}
