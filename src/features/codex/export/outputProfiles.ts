export interface OutputProfile {
  id: "a4" | "us-letter";
  widthMm: number;
  heightMm: number;
  pngWidth: number;
  pngHeight: number;
  pdfWidthPt: number;
  pdfHeightPt: number;
}

export const OUTPUT_PROFILES = {
  a4: {
    id: "a4",
    widthMm: 210,
    heightMm: 297,
    pngWidth: 2480,
    pngHeight: 3508,
    pdfWidthPt: 595.28,
    pdfHeightPt: 841.89,
  },
  usLetter: {
    id: "us-letter",
    widthMm: 215.9,
    heightMm: 279.4,
    pngWidth: 2550,
    pngHeight: 3300,
    pdfWidthPt: 612,
    pdfHeightPt: 792,
  },
} as const satisfies Record<string, OutputProfile>;

export type OutputProfileId = keyof typeof OUTPUT_PROFILES;
