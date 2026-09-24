import type { CodexStyleId, CodexStyleSpec } from "./types";

export type { CodexStyleId, CodexStyleSpec };
import illuminated_parchment from "./illuminated-parchment";
import elven_manuscript from "./elven-manuscript";
import dwarven_runeplate from "./dwarven-runeplate";
import necromancer_grimoire from "./necromancer-grimoire";
import celestial_chart from "./celestial-chart";
import ronin_dossier from "./ronin-dossier";
import samurai_emakimono from "./samurai-emakimono";
import viking_oak from "./viking-oak";
import royal_decree from "./royal-decree";
import alchemist_notes from "./alchemist-notes";
import cyberpunk_dossier from "./cyberpunk-dossier";
import steampunk_folio from "./steampunk-folio";
import eldritch_arcane from "./eldritch-arcane";
import wasteland_record from "./wasteland-record";
import retro_8bit from "./retro-8bit";
import high_fantasy from "./high-fantasy";
import victorian_gothic from "./victorian-gothic";

export const CODEX_STYLES: readonly CodexStyleSpec[] = [
  illuminated_parchment,
  elven_manuscript,
  dwarven_runeplate,
  necromancer_grimoire,
  celestial_chart,
  ronin_dossier,
  samurai_emakimono,
  viking_oak,
  royal_decree,
  alchemist_notes,
  cyberpunk_dossier,
  steampunk_folio,
  eldritch_arcane,
  wasteland_record,
  retro_8bit,
  high_fantasy,
  victorian_gothic,
];

export const CODEX_STYLE_IDS: readonly CodexStyleId[] = CODEX_STYLES.map((style) => style.id);
