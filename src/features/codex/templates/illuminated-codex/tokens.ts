export const ILLUMINATED_TOKENS = {
  ink: "#1c140e",
  oxblood: "#6e2430",
  gildedBronze: "#a6844a",
  parchment: "#f4e7cb",
  parchmentDeep: "#e7d3ae",
  muted: "#5c4636",
  seal: "#6e2430",
} as const;

export type IlluminatedTokens = typeof ILLUMINATED_TOKENS;
