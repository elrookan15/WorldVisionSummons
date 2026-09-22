import { describe, it, expect } from "vitest";
import {
  ARCH_CHRONOLOGER_SYSTEM_PROMPT,
  ARCH_CHRONOLOGER_GENRES,
  FIVE_FOLD_BLUEPRINT_SECTIONS,
  FIVE_FOLD_BLUEPRINT_SCHEMA,
  archChronologerFieldPreamble,
} from "../lib/prompts/archChronologer";
import { generateMissingFieldsPrompts, GENRE_ATMOSPHERIC_MATRICES } from "../lib/prompts/generators";

describe("FEDOROV_AI Arch-Chronologer prompt module", () => {
  it("exports system prompt and all five-fold blueprint sections", () => {
    expect(ARCH_CHRONOLOGER_SYSTEM_PROMPT).toContain("Arch-Archivist Vaelith");
    expect(ARCH_CHRONOLOGER_SYSTEM_PROMPT).toContain("FEDOROV_AI");
    expect(FIVE_FOLD_BLUEPRINT_SECTIONS).toHaveLength(5);
    for (const section of FIVE_FOLD_BLUEPRINT_SECTIONS) {
      expect(FIVE_FOLD_BLUEPRINT_SCHEMA).toContain(section);
      expect(ARCH_CHRONOLOGER_SYSTEM_PROMPT).toContain(section);
    }
  });

  it("lists the same ten genres as atmospheric matrices", () => {
    expect(ARCH_CHRONOLOGER_GENRES).toHaveLength(10);
    for (const genre of ARCH_CHRONOLOGER_GENRES) {
      expect(GENRE_ATMOSPHERIC_MATRICES[genre]).toBeDefined();
    }
  });

  it("wires Arch-Chronologer preamble into lore and name field generators", () => {
    const lore = generateMissingFieldsPrompts.formatLorePrompt({
      sheet_style: "Cyberpunk",
      existing_name: "Nyx",
      existing_class: "Neural Ronin",
    });
    const name = generateMissingFieldsPrompts.formatNamePrompt({
      sheet_style: "Samurai Era",
    });
    expect(lore).toContain("FEDOROV_AI / Arch-Chronologer");
    expect(lore).toContain("Cyberpunk");
    expect(lore).toContain("Five-Fold");
    expect(name).toContain(archChronologerFieldPreamble("Samurai Era").slice(0, 40));
  });
});
