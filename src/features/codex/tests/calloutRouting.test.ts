import { describe, expect, it } from "vitest";
import { routeCallouts } from "../composition/routeCallouts";
import { ILLUMINATED_MANIFEST } from "../templates/illuminated-codex/manifest";
import { composeCodex } from "../composition/composeCodex";
import { normalizeSnapshot } from "../schema/normalizeSnapshot";
import { workshopFixture } from "./fixture";

const portrait = ILLUMINATED_MANIFEST.regions.portrait;
const gear = ILLUMINATED_MANIFEST.regions.gear;
const title = ILLUMINATED_MANIFEST.regions.title;

describe("callout routing", () => {
  it("draws one orthogonal bend for six distinct anchors", () => {
    const model = composeCodex(normalizeSnapshot(workshopFixture(), {
      finalizedAt: "2026-09-23T13:43:00.000Z",
      snapshotId: "00000000-0000-4000-8000-000000000001",
      characterId: "sheet-1",
      portraitUrl: null,
    }));
    expect(new Set(model.callouts.map((callout) => callout.target)).size).toBe(6);
    expect(model.callouts.every((callout) => callout.leader && callout.bend)).toBe(true);
    for (const callout of model.callouts) {
      const bend = callout.bend;
      if (!bend) continue;
      const horizontal = bend.y === callout.anchorPoint.y || bend.y === callout.calloutPoint.y;
      const vertical = bend.x === callout.anchorPoint.x || bend.x === callout.calloutPoint.x;
      expect(horizontal && vertical).toBe(true);
    }
  });

  it("drops leaders when two items claim the same anchor", () => {
    const routed = routeCallouts([
      { id: "a", name: "Blade", annotation: "Blade Primary", target: "rightHand", truncated: false },
      { id: "b", name: "Knife", annotation: "Knife Primary", target: "rightHand", truncated: false },
    ], portrait, gear, title);
    expect(routed.leadersDropped).toBe(true);
    expect(routed.callouts.every((callout) => callout.leader === false)).toBe(true);
  });

  it("omits an empty slot instead of printing None", () => {
    const model = composeCodex(normalizeSnapshot(workshopFixture({
      equipment: {
        primaryWeapon: "Threshold Blade",
        secondaryFocus: "None",
        armor: "Warden Coat",
        utilityTools: "",
        consumables: "Black salt",
        relics: "Unfinished Key",
      },
    }), {
      finalizedAt: "2026-09-23T13:43:00.000Z",
      snapshotId: "00000000-0000-4000-8000-000000000001",
      characterId: "sheet-1",
      portraitUrl: null,
    }));
    expect(model.callouts.map((callout) => callout.name)).toEqual([
      "Threshold Blade",
      "Warden Coat",
      "Unfinished Key",
      "Black salt",
    ]);
  });
});
