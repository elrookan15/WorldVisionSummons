import type { CodexSnapshotV1 } from "../schema/codexSnapshotV1";
import { ILLUMINATED_MANIFEST, regionOf } from "../templates/illuminated-codex/manifest";
import { ILLUMINATED_TOKENS } from "../templates/illuminated-codex/tokens";
import { fitBlock, fitLine } from "./fitText";
import { routeCallouts } from "./routeCallouts";
import type { CodexRenderModel, TextRun } from "./types";

function roundMm(value: number): number {
  return Math.round(value * 100) / 100;
}

function line(run: Omit<TextRun, "truncated" | "wrap"> & { text: string }, truncated: boolean, wrap = false): TextRun {
  return { ...run, truncated, wrap };
}

export function composeCodex(snapshot: CodexSnapshotV1): CodexRenderModel {
  const type = ILLUMINATED_MANIFEST.type;
  const ink = ILLUMINATED_TOKENS.ink;
  const bronze = ILLUMINATED_TOKENS.gildedBronze;
  const oxblood = ILLUMINATED_TOKENS.oxblood;
  const muted = ILLUMINATED_TOKENS.muted;
  const texts: TextRun[] = [];
  const overflowIds: string[] = [];

  const push = (run: TextRun): void => {
    texts.push(run);
    if (run.truncated) overflowIds.push(run.id);
  };

  const title = regionOf("title");
  const name = fitLine(snapshot.identity.name, title.w - 8, type.namePt, 80);
  push(line({
    id: "title.name",
    text: name.text,
    x: roundMm(title.x + 4),
    y: roundMm(title.y + 2),
    maxWidthMm: title.w - 8,
    fontPt: type.namePt,
    role: "display",
    color: ink,
  }, name.truncated));
  const epithet = fitLine(snapshot.identity.epithet, title.w - 8, type.epithetPt, 80);
  push(line({
    id: "title.epithet",
    text: epithet.text,
    x: roundMm(title.x + 4),
    y: roundMm(title.y + 10),
    maxWidthMm: title.w - 8,
    fontPt: type.epithetPt,
    role: "body",
    color: oxblood,
  }, epithet.truncated));
  const rank = fitLine(snapshot.identity.title, title.w * 0.62, type.bodyPt, 80);
  push(line({
    id: "title.rank",
    text: rank.text,
    x: roundMm(title.x + 4),
    y: roundMm(title.y + 15.5),
    maxWidthMm: roundMm(title.w * 0.62),
    fontPt: type.bodyPt,
    role: "label",
    color: muted,
  }, rank.truncated));
  const motto = fitLine(snapshot.identity.motto, title.w - 8, type.bodyPt, 160);
  push(line({
    id: "title.motto",
    text: motto.text,
    x: roundMm(title.x + 4),
    y: roundMm(title.y + 20),
    maxWidthMm: title.w - 8,
    fontPt: type.bodyPt,
    role: "body",
    color: ink,
  }, motto.truncated));

  const identity = regionOf("identity");
  push(line({
    id: "identity.kicker",
    text: "ROLE",
    x: roundMm(identity.x + 2),
    y: roundMm(identity.y + 2),
    maxWidthMm: identity.w - 4,
    fontPt: type.labelPt,
    role: "label",
    color: bronze,
  }, false));
  const role = fitLine(snapshot.identity.role, identity.w - 4, type.bodyPt, 60);
  push(line({
    id: "identity.role",
    text: role.text,
    x: roundMm(identity.x + 2),
    y: roundMm(identity.y + 6),
    maxWidthMm: identity.w - 4,
    fontPt: type.bodyPt,
    role: "display",
    color: ink,
  }, role.truncated));
  push(line({
    id: "identity.crest",
    text: snapshot.identity.crest,
    x: roundMm(identity.x + 2),
    y: roundMm(identity.y + 16),
    maxWidthMm: 16,
    fontPt: 14,
    role: "display",
    color: oxblood,
  }, false));
  snapshot.physicalMarks.forEach((mark, index) => {
    const fitted = fitLine(mark, identity.w - 4, type.labelPt, 48);
    push(line({
      id: `identity.mark.${index}`,
      text: fitted.text,
      x: roundMm(identity.x + 2),
      y: roundMm(identity.y + 28 + index * 6),
      maxWidthMm: identity.w - 4,
      fontPt: type.labelPt,
      role: "body",
      color: muted,
    }, fitted.truncated));
  });
  snapshot.traits.forEach((trait, index) => {
    const fitted = fitLine(`${trait.label}: ${trait.value}`, identity.w - 4, type.labelPt, 80);
    push(line({
      id: `identity.trait.${index}`,
      text: fitted.text,
      x: roundMm(identity.x + 2),
      y: roundMm(identity.y + 56 + index * 12),
      maxWidthMm: identity.w - 4,
      fontPt: type.labelPt,
      role: "body",
      color: ink,
    }, fitted.truncated));
  });

  const vitals = regionOf("vitals");
  const vitalLines = [
    ["vitals.hp", `HP ${snapshot.vitals.hpCurrent}/${snapshot.vitals.hpMax}`],
    ["vitals.ac", `AC ${snapshot.vitals.ac}`],
    ["vitals.init", `INIT ${snapshot.vitals.initiative}`],
    ["vitals.speed", `SPD ${snapshot.vitals.speed}`],
    ["vitals.level", `LVL ${snapshot.vitals.level}`],
    ["vitals.resource", `${snapshot.vitals.resourceName} ${snapshot.vitals.resourceCurrent}/${snapshot.vitals.resourceMax}`],
  ] as const;
  vitalLines.forEach(([id, value], index) => {
    const fitted = fitLine(value, vitals.w - 4, type.bodyPt, 32);
    push(line({
      id,
      text: fitted.text,
      x: roundMm(vitals.x + 2),
      y: roundMm(vitals.y + 4 + index * 10),
      maxWidthMm: vitals.w - 4,
      fontPt: type.bodyPt,
      role: "mono",
      color: ink,
    }, fitted.truncated));
  });

  const attributes = regionOf("attributes");
  snapshot.attributes.forEach((stat, index) => {
    const fitted = fitLine(`${stat.key} ${stat.value}`, attributes.w - 4, type.bodyPt, 16);
    push(line({
      id: `attr.${stat.key}`,
      text: fitted.text,
      x: roundMm(attributes.x + 2),
      y: roundMm(attributes.y + 4 + index * 10),
      maxWidthMm: attributes.w - 4,
      fontPt: type.bodyPt,
      role: "mono",
      color: ink,
    }, fitted.truncated));
  });

  const chronicle = regionOf("chronicle");
  const story = fitBlock(
    snapshot.chronicle.backstory,
    chronicle.w - 4,
    chronicle.h - 8,
    type.bodyPt,
    type.lineHeight,
    2000,
  );
  push(line({
    id: "chronicle.body",
    text: story.text,
    x: roundMm(chronicle.x + 2),
    y: roundMm(chronicle.y + 3),
    maxWidthMm: chronicle.w - 4,
    fontPt: type.bodyPt,
    role: "body",
    color: ink,
  }, story.truncated, true));

  const footer = regionOf("footer");
  const stamp = snapshot.locked ? snapshot.finalizedAt : "UNSEALED";
  const provenance = `REV ${String(snapshot.revision).padStart(2, "0")}  ${snapshot.templateId}@1  ${snapshot.contentHash.slice(0, 12)}  ${stamp}`;
  const footerFit = fitLine(provenance, footer.w - 4, type.monoPt, 120);
  push(line({
    id: "footer.provenance",
    text: footerFit.text,
    x: roundMm(footer.x + 2),
    y: roundMm(footer.y + 4),
    maxWidthMm: footer.w - 4,
    fontPt: type.monoPt,
    role: "mono",
    color: muted,
  }, footerFit.truncated));

  const gearRegion = regionOf("gear");
  const portrait = regionOf("portrait");
  const fittedGear = snapshot.gear.map((piece) => {
    const fitted = fitLine(piece.name, gearRegion.w - 4, type.labelPt, 48);
    return { ...piece, name: fitted.text, truncated: fitted.truncated };
  });
  const callouts = routeCallouts(fittedGear, portrait, gearRegion);

  const rules = [
    { x1: 8, y1: 8, x2: 202, y2: 8, weightPt: 1.2, color: oxblood },
    { x1: 8, y1: 289, x2: 202, y2: 289, weightPt: 1.2, color: oxblood },
    { x1: 8, y1: 8, x2: 8, y2: 289, weightPt: 1.2, color: oxblood },
    { x1: 202, y1: 8, x2: 202, y2: 289, weightPt: 1.2, color: oxblood },
    { x1: 10, y1: 10, x2: 200, y2: 10, weightPt: 0.4, color: bronze },
    { x1: 10, y1: 287, x2: 200, y2: 287, weightPt: 0.4, color: bronze },
    { x1: 10, y1: 10, x2: 10, y2: 287, weightPt: 0.4, color: bronze },
    { x1: 200, y1: 10, x2: 200, y2: 287, weightPt: 0.4, color: bronze },
  ];

  return {
    templateId: "illuminated-codex",
    page: { ...ILLUMINATED_MANIFEST.page },
    snapshotHash: snapshot.contentHash,
    revision: snapshot.revision,
    locked: snapshot.locked,
    texts,
    rules,
    callouts,
    regions: ILLUMINATED_MANIFEST.regions,
    warnings: snapshot.warnings,
    overflowIds,
    crest: snapshot.identity.crest,
    portraitUrl: snapshot.portrait.url,
    portraitCrop: snapshot.portrait.crop,
  };
}
