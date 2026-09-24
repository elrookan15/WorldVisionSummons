import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import CodexFinalizer from "../components/CodexFinalizer";
import { buildCodexPageModel } from "../lib/codexPageModel";
import type { UiSheetData } from "../lib/sheetMapper";

function emptySheet(): UiSheetData {
  return {
    name: "",
    title: "",
    player: "",
    sheet_style: "",
    overview: { race: "", age: "", gender: "", alignment: "", classRole: "", level: "", origin: "", faction: "" },
    physical: { height: "", weight: "", build: "", eyes: "", hair: "", skin: "", marks: "", scars: "", clothing: "", voice: "", posture: "" },
    signatureAttributes: {
      reputation: "", vice: "", virtue: "", fear: "", obsession: "", tell: "", loyalty: "", blindSpot: "", survivalInstinct: "", legacyFear: ""
    },
    derivedStats: {
      hpCurrent: 0, hpMax: 0, ac: 0, initiative: "", speed: "", level: 0,
      resourceName: "", resourceCurrent: 0, resourceMax: 0, passives: []
    },
    lore: { backstory: "", childhood: "", formative: "", motivations: "", secrets: "", world: "" },
    abilities: [],
    weaknesses: "",
    skills: [],
    magic: "",
    equipment: {
      primaryWeapon: "", secondaryFocus: "", armor: "", utilityTools: "", consumables: "", relics: "", currency: "", weapons: "", items: ""
    },
    personality: { traits: "", ideals: "", flaws: "", fears: "", mannerisms: "", speech: "" },
    relationships: { allies: "", enemies: "", mentors: "", family: "" },
    stats: []
  };
}

describe("codex finalizer page", () => {
  it("drops empty fields and never invents placeholder copy", () => {
    const model = buildCodexPageModel(emptySheet());
    expect(model.roleLines).toEqual([]);
    expect(model.callouts).toEqual([]);
    expect(model.loreParagraphs).toEqual([]);
    expect(model.quote).toBe("");
    const html = renderToStaticMarkup(
      <CodexFinalizer sheet={emptySheet()} portraitUrl={null} onClose={() => undefined} />
    );
    expect(html).toContain('data-codex-page="final"');
    expect(html).toContain('data-codex-portrait="empty"');
    expect(html).not.toContain("Lorem");
    expect(html).not.toContain("Role &amp; Purpose");
    expect(html).not.toContain("Primary Weapon");
  });

  it("renders live sheet zones for a filled character", () => {
    const sheet = emptySheet();
    sheet.name = "Gelbinor";
    sheet.title = "The Shy Grave";
    sheet.sheet_style = "Gothic Dark Fantasy";
    sheet.overview.classRole = "Necromancer";
    sheet.lore.backstory = "Born over a mass grave.";
    sheet.equipment.primaryWeapon = "Mister Cracks — cracked skull grimoire";
    sheet.personality.speech = "Mumbles apologies.";
    sheet.stats = [{ key: "INT", label: "Intelligence", value: 22, desc: "Names" }];
    sheet.derivedStats.hpMax = 74;
    sheet.derivedStats.hpCurrent = 74;
    sheet.derivedStats.ac = 14;
    const html = renderToStaticMarkup(
      <CodexFinalizer sheet={sheet} portraitUrl="https://example.test/portrait.png" onClose={() => undefined} />
    );
    expect(html).toContain("Gelbinor");
    expect(html).toContain("Mister Cracks");
    expect(html).toContain("Mumbles apologies.");
    expect(html).toContain('data-codex-zone="combat"');
    expect(html).toContain('data-codex-portrait="live"');
    expect(html).toContain("74 / 74");
  });
});
