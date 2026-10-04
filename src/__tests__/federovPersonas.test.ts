import { describe, expect, it } from "vitest";
import {
  FEDEROV_PERSONAS,
  buildPersonaChatInstruction,
  findPersonaById,
  getPersonaById,
} from "../lib/federovPersonas";
import { parseCharacterProposal, stripProposalBlock } from "../lib/characterProposal";

describe("federovPersonas", () => {
  it("ships 15 unique allowlisted persona ids", () => {
    const ids = FEDEROV_PERSONAS.map((p) => p.id);
    expect(ids).toHaveLength(15);
    expect(new Set(ids).size).toBe(15);
    expect(ids).toContain("archivist");
    expect(ids).toContain("nordic-skald");
  });

  it("resolves known ids and ignores unknown ones", () => {
    expect(findPersonaById("cyber-fixer")?.name).toBe("Cyber-Fixer Federov");
    expect(findPersonaById("not-a-persona")).toBeUndefined();
    expect(getPersonaById("garbage").id).toBe("archivist");
  });

  it("builds a persona instruction from allowlisted data and clips context", () => {
    const persona = getPersonaById("archivist");
    const instruction = buildPersonaChatInstruction({
      persona,
      sheetStyle: "Cyberpunk",
      charName: "Ada",
      charClass: "Hexblade",
      level: "7",
      lore: "x".repeat(2000),
      inventory: "Ashen saber",
      currentSeed: 42,
    });
    expect(instruction).toContain("ACTIVE PERSONA: Archivist Federov");
    expect(instruction).toContain("Currently Summoned Character: Ada (Hexblade, Level 7)");
    expect(instruction).toContain("[CHARACTER_PROPOSAL]");
    expect(instruction).toContain("BioMechanical, 1980s 3D Render, Solarpunk Utopia");
    expect(instruction).toContain("STOCHASTIC VECTOR: #42");
    expect(instruction).not.toContain("x".repeat(801));
  });
});

describe("characterProposal", () => {
  it("parses a complete proposal block", () => {
    const parsed = parseCharacterProposal(`Hail.

[CHARACTER_PROPOSAL]
Name: Ada Voss
Class: Hexblade
Style: Cyberpunk
Lore: Harbor-born oathbreaker.
Inventory: Ashen saber, rain-slick coat
[/CHARACTER_PROPOSAL]`);
    expect(parsed).toEqual({
      name: "Ada Voss",
      classRole: "Hexblade",
      style: "Cyberpunk",
      lore: "Harbor-born oathbreaker.",
      inventory: "Ashen saber, rain-slick coat",
    });
  });

  it("rejects missing identity and strips the block from display text", () => {
    expect(parseCharacterProposal("No block here")).toBeNull();
    expect(parseCharacterProposal("[CHARACTER_PROPOSAL]\nStyle: Cyberpunk\n[/CHARACTER_PROPOSAL]")).toBeNull();
    expect(stripProposalBlock("Intro\n[CHARACTER_PROPOSAL]\nName: Ada\nClass: Hexblade\n[/CHARACTER_PROPOSAL]\nOutro")).toBe("Intro\n\nOutro");
  });
});
