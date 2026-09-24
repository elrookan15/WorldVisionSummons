import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import CodexFinalizer from "../components/CodexFinalizer";
import { buildCodexPageModel } from "../lib/codexPageModel";
import { CODEX_STYLES, defaultCodexStyleForGenre } from "../lib/codexStyles";
import { hashSheet, listSnapshots, mintSnapshot } from "../lib/codexSnapshot";
import { codexPngPixels } from "../lib/codexRaster";
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
    sheet.relationships.allies = "The grave choir";
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
    expect(html).toContain('data-codex-style="illuminated-parchment"');
    const lore = html.slice(html.indexOf('data-codex-zone="lore"'), html.indexOf('data-codex-zone="portrait"'));
    expect(lore).toContain("The grave choir");
    expect(lore).toContain('data-codex-zone="bonds"');
    const bottom = html.slice(html.indexOf('data-codex-zone="bottom"'));
    expect(bottom).toContain('data-codex-zone="heraldry"');
    expect(bottom).not.toContain("The grave choir");
    expect(html).toContain("Export PNG");
    expect(html).toContain("disabled=\"\"");
  });

  it("sizes the shared plate raster at 300 DPI", () => {
    expect(codexPngPixels("A4")).toEqual({ width: 2480, height: 3508 });
    expect(codexPngPixels("US-Letter")).toEqual({ width: 2550, height: 3300 });
  });

  it("maps each generator genre to one codex skin and keeps seventeen distinct styles", () => {
    expect(CODEX_STYLES).toHaveLength(17);
    expect(new Set(CODEX_STYLES.map((style) => style.id)).size).toBe(17);
    expect(defaultCodexStyleForGenre("Gothic Dark Fantasy")).toBe("illuminated-parchment");
    expect(defaultCodexStyleForGenre("Cyberpunk")).toBe("cyberpunk-dossier");
    expect(defaultCodexStyleForGenre("Samurai Era")).toBe("samurai-emakimono");
    expect(defaultCodexStyleForGenre("8-Bit Retro RPG")).toBe("retro-8bit");
    expect(defaultCodexStyleForGenre("Victorian Gothic")).toBe("victorian-gothic");
    const sheet = emptySheet();
    sheet.name = "Neon";
    sheet.sheet_style = "Cyberpunk";
    sheet.equipment.primaryWeapon = "Laser skateboard";
    const html = renderToStaticMarkup(
      <CodexFinalizer sheet={sheet} portraitUrl={null} onClose={() => undefined} />
    );
    expect(html).toContain('data-codex-style="cyberpunk-dossier"');
    expect(html).toContain("Laser skateboard");
    expect(html).toContain("Recorded in the codex");
  });

  it("keeps six equipment callouts and steps a long name down", () => {
    const sheet = emptySheet();
    sheet.name = "A Very Long Summon Name Indeed";
    sheet.equipment.primaryWeapon = "Blade";
    sheet.equipment.secondaryFocus = "Focus";
    sheet.equipment.armor = "Mail";
    sheet.equipment.utilityTools = "Kit";
    sheet.equipment.consumables = "Vial";
    sheet.equipment.relics = "Relic";
    expect(buildCodexPageModel(sheet).callouts).toHaveLength(6);
    const html = renderToStaticMarkup(
      <CodexFinalizer sheet={sheet} portraitUrl={null} onClose={() => undefined} />
    );
    expect(html).toContain("codex-name--long");
    expect(html).toContain('data-codex-zone="heraldry-high"');
    expect(html).not.toContain("Lorem");
  });

  it("stores a callout medium on every style", () => {
    for (const style of CODEX_STYLES) {
      expect(style.borderOrnament.length).toBeGreaterThan(3);
      expect(style.calloutMedium.length).toBeGreaterThan(3);
      expect(style.footerDevice.length).toBeGreaterThan(2);
    }
  });

  it("mints the next revision without rewriting the previous character", async () => {
    const mem = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => mem.get(key) ?? null,
      setItem: (key: string, value: string) => { mem.set(key, value); },
      removeItem: (key: string) => { mem.delete(key); },
    });
    const first = emptySheet();
    first.name = "Gelbinor";
    const opened = await mintSnapshot({ sheet: first, portraitUrl: null, sourceKey: "hero" });
    const edited = emptySheet();
    edited.name = "Gelbinor Renamed";
    const next = await mintSnapshot({ sheet: edited, portraitUrl: null, sourceKey: "hero" });
    const stored = listSnapshots("hero");
    expect(next.revision).toBe(opened.revision + 1);
    expect(stored[0].contentHash).toBe(opened.contentHash);
    expect(stored[0].character.name).toBe("Gelbinor");
    expect(stored[1].character.name).toBe("Gelbinor Renamed");
    vi.unstubAllGlobals();
  });

  it("hashes identical sheet text to the same snapshot digest", async () => {
    const spaced = emptySheet();
    spaced.name = " Gelbinor \r\n";
    const trimmed = emptySheet();
    trimmed.name = "Gelbinor";
    expect(await hashSheet(spaced)).toBe(await hashSheet(trimmed));
  });
});
