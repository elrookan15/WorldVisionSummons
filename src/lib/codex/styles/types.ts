export type CodexStyleId =
  | "illuminated-parchment"
  | "elven-manuscript"
  | "dwarven-runeplate"
  | "necromancer-grimoire"
  | "celestial-chart"
  | "ronin-dossier"
  | "samurai-emakimono"
  | "viking-oak"
  | "royal-decree"
  | "alchemist-notes"
  | "cyberpunk-dossier"
  | "steampunk-folio"
  | "eldritch-arcane"
  | "wasteland-record"
  | "retro-8bit"
  | "high-fantasy"
  | "victorian-gothic";

export type CodexStyleSpec = {
  id: CodexStyleId;
  name: string;
  mood: string;
  ground: string;
  ground2: string;
  ink: string;
  accent: string;
  accent2: string;
  display: string;
  body: string;
  caps: string;
  portrait: string;
  borderOrnament: string;
  calloutMedium: string;
  footerDevice: string;
};
