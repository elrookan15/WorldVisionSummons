import { describe, expect, it } from "vitest";
import { assignAnchors, routeCallouts } from "../composition/routeCallouts";
import type { GearSlotId } from "../schema/codexSnapshotV1";
import { composeCodex } from "../composition/composeCodex";
import { normalizeSnapshot } from "../schema/normalizeSnapshot";
import { regionOf } from "../templates/illuminated-codex/manifest";
import { workshopFixture } from "./fixture";

describe("callout routing", () => {
  it("gives every gear slot a distinct portrait anchor", () => {
    const snapshot = normalizeSnapshot(workshopFixture(), { finalizedAt: "UNSEALED" });
    const anchors = snapshot.gear.map((piece) => piece.anchor);
    expect(new Set(anchors).size).toBe(6);
    const model = composeCodex(snapshot);
    expect(new Set(model.callouts.map((callout) => callout.anchor)).size).toBe(6);
    for (const callout of model.callouts) {
      expect(callout.anchorPoint.x).toBeGreaterThan(regionOf("portrait").x);
      expect(callout.calloutPoint.x).toBeGreaterThan(regionOf("gear").x);
    }
  });

  it("moves a colliding preferred anchor to the next free point", () => {
    const routed = assignAnchors([
      { id: "primaryWeapon", preferred: "hand-r" },
      { id: "relics", preferred: "hand-r" },
      { id: "armor", preferred: "torso" },
    ]);
    expect(routed).toEqual([
      { id: "primaryWeapon", anchor: "hand-r" },
      { id: "relics", anchor: "hand-l" },
      { id: "armor", anchor: "torso" },
    ]);
    const lines = routeCallouts(
      routed.map((item) => ({
        slot: item.id as GearSlotId,
        label: item.id,
        name: item.id,
        anchor: item.anchor,
        truncated: false,
      })),
      regionOf("portrait"),
      regionOf("gear"),
    );
    expect(lines).toHaveLength(3);
    expect(lines[1].anchor).toBe("hand-l");
  });
});
