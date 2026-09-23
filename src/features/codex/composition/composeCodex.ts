import type { CodexSnapshotV1 } from "../schema/codexSnapshotV1";
import { isSealedSnapshot } from "../schema/normalizeSnapshot";
import type { OutputProfile } from "../export/outputProfiles";
import { OUTPUT_PROFILES } from "../export/outputProfiles";
import { ILLUMINATED_MANIFEST, regionOf, type IlluminatedManifest } from "../templates/illuminated-codex/manifest";
import { ILLUMINATED_TOKENS } from "../templates/illuminated-codex/tokens";
import { fitBlock, fitLine } from "./fitText";
import { routeCallouts } from "./routeCallouts";
import { extractiveBeats, selectEquipment, selectPsychology } from "./selectContent";
import type { CodexRenderModel, TextRun } from "./types";

function roundMm(value: number): number {
  return Math.round(value * 100) / 100;
}

function line(run: Omit<TextRun, "truncated" | "wrap"> & { text: string }, truncated: boolean, wrap = false): TextRun {
  return { ...run, truncated, wrap };
}

function crestFrom(faction: string | null): string | null {
  if (!faction) return null;
  const initials = faction.split(/\s+/).map((part) => part[0] ?? "").join("").slice(0, 3).toUpperCase();
  return initials || null;
}

function splitName(name: string): { lines: string[]; fontPt: number; truncated: boolean } {
  const chars = [...name];
  const capped = chars.slice(0, 42).join("");
  const truncated = chars.length > 42;
  if ([...capped].length <= 24) return { lines: [capped], fontPt: ILLUMINATED_MANIFEST.type.namePt, truncated };
  const midpoint = Math.ceil([...capped].length / 2);
  const space = capped.lastIndexOf(" ", midpoint);
  const splitAt = space > 8 ? space : midpoint;
  return {
    lines: [capped.slice(0, splitAt).trim(), capped.slice(splitAt).trim()].filter(Boolean),
    fontPt: ILLUMINATED_MANIFEST.type.nameCondensedPt,
    truncated,
  };
}

export function composeCodex(
  snapshot: CodexSnapshotV1,
  templateManifest: IlluminatedManifest = ILLUMINATED_MANIFEST,
  outputProfile: OutputProfile = OUTPUT_PROFILES.a4,
): CodexRenderModel {
  if (outputProfile.widthMm <= 0 || outputProfile.heightMm <= 0) {
    throw new Error("Output profile has no page size");
  }
  const type = templateManifest.type;
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

  const title = regionOf("title", templateManifest);
  const name = splitName(snapshot.identity.name ?? "");
  name.lines.forEach((row, index) => {
    const fitted = fitLine(row, title.w - 8, name.fontPt, 42);
    push(line({
      id: index === 0 ? "title.name" : "title.name.2",
      text: fitted.text,
      x: roundMm(title.x + 4),
      y: roundMm(title.y + 1 + index * (name.fontPt * 0.36)),
      maxWidthMm: title.w - 8,
      fontPt: name.fontPt,
      role: "display",
      color: ink,
    }, fitted.truncated || name.truncated));
  });

  const classTitle = snapshot.identity.classTitle ?? "";
  const classPt = [...classTitle].length > 44 ? type.minBodyPt : type.epithetPt;
  const classFit = fitLine(classTitle, title.w - 8, classPt, 72);
  push(line({
    id: "title.class",
    text: classFit.text,
    x: roundMm(title.x + 4),
    y: roundMm(title.y + 14),
    maxWidthMm: title.w - 8,
    fontPt: Math.max(type.minBodyPt, classPt),
    role: "label",
    color: oxblood,
  }, classFit.truncated));

  const mottoRaw = snapshot.identity.motto ?? "";
  const mottoRelocated = [...mottoRaw].length > 90;
  if (!mottoRelocated && mottoRaw) {
    const motto = fitLine(mottoRaw, title.w - 8, type.bodyPt, 90);
    push(line({
      id: "title.motto",
      text: motto.text,
      x: roundMm(title.x + 4),
      y: roundMm(title.y + 18),
      maxWidthMm: title.w - 8,
      fontPt: type.bodyPt,
      role: "body",
      color: ink,
    }, motto.truncated));
  }

  const identity = regionOf("identity", templateManifest);
  const traits = selectPsychology(snapshot.psychology);
  const traitPitch = 26;
  traits.forEach((trait, index) => {
    const slotY = identity.y + 16 + index * traitPitch;
    const label = fitLine(trait.label, identity.w - 3, type.labelPt, 40);
    push(line({
      id: `identity.trait.${index}.label`,
      text: label.text,
      x: roundMm(identity.x + 1.5),
      y: roundMm(slotY),
      maxWidthMm: identity.w - 3,
      fontPt: type.labelPt,
      role: "label",
      color: oxblood,
    }, label.truncated));
    const body = fitBlock(trait.description, identity.w - 3, 16, type.minBodyPt, 1.15, 140);
    if (body.text.length > 0) {
      push(line({
        id: `identity.trait.${index}`,
        text: body.text,
        x: roundMm(identity.x + 1.5),
        y: roundMm(slotY + 4),
        maxWidthMm: identity.w - 3,
        fontPt: type.minBodyPt,
        role: "body",
        color: ink,
      }, body.truncated, true));
    }
  });
  snapshot.physical.marks.slice(0, 3).forEach((mark, index) => {
    const fitted = fitLine(mark, identity.w - 3, type.labelPt, 80);
    push(line({
      id: `identity.mark.${index}`,
      text: fitted.text,
      x: roundMm(identity.x + 1.5),
      y: roundMm(identity.y + 16 + traits.length * traitPitch + index * 6),
      maxWidthMm: identity.w - 3,
      fontPt: type.labelPt,
      role: "label",
      color: muted,
    }, fitted.truncated));
  });

  const vitals = regionOf("vitals", templateManifest);
  const vitalLines = [
    ["vitals.hp", `HP ${snapshot.combat.hp}/${snapshot.combat.maxHp}`],
    ["vitals.ac", `AC ${snapshot.combat.ac}`],
    ["vitals.speed", `SPD ${snapshot.combat.speed}`],
    ["vitals.init", `INIT ${snapshot.combat.initiative}`],
  ] as const;
  vitalLines.forEach(([id, value], index) => {
    const fitted = fitLine(value, vitals.w - 3, type.monoPt, 24);
    push(line({
      id,
      text: fitted.text,
      x: roundMm(vitals.x + 1.5),
      y: roundMm(vitals.y + 4 + index * 10),
      maxWidthMm: vitals.w - 3,
      fontPt: type.monoPt,
      role: "mono",
      color: ink,
    }, fitted.truncated));
  });

  const attributes = regionOf("attributes", templateManifest);
  const keys = ["str", "dex", "con", "int", "wis", "cha"] as const;
  keys.forEach((key, index) => {
    const stat = snapshot.attributes[key];
    const sign = stat.modifier > 0 ? `+${stat.modifier}` : String(stat.modifier);
    const fitted = fitLine(`${key.toUpperCase()} ${stat.score} ${sign}`, attributes.w - 3, type.monoPt, 16);
    push(line({
      id: `attr.${key}`,
      text: fitted.text,
      x: roundMm(attributes.x + 1.5),
      y: roundMm(attributes.y + 4 + index * 7),
      maxWidthMm: attributes.w - 3,
      fontPt: type.monoPt,
      role: "mono",
      color: ink,
    }, fitted.truncated));
  });

  const chronicle = regionOf("chronicle", templateManifest);
  const beats = extractiveBeats(snapshot.chronicle.backstorySummary, 720);
  const relocated = mottoRelocated ? mottoRaw : "";
  const storySource = relocated ? `${beats.text} ${relocated}`.trim() : beats.text;
  const story = fitBlock(storySource, chronicle.w - 3, chronicle.h - 6, type.bodyPt, type.lineHeight, 720);
  push(line({
    id: "chronicle.body",
    text: story.text,
    x: roundMm(chronicle.x + 1.5),
    y: roundMm(chronicle.y + 3),
    maxWidthMm: chronicle.w - 3,
    fontPt: type.bodyPt,
    role: "body",
    color: ink,
  }, story.truncated || beats.truncated || mottoRelocated, true));

  const footer = regionOf("footer", templateManifest);
  const stamp = /^\d{4}-\d{2}-\d{2}/.test(snapshot.finalizedAt) ? snapshot.finalizedAt.slice(0, 10) : snapshot.finalizedAt;
  const provenance = `Revision ${snapshot.revision} • Template: ${snapshot.template.id}@${snapshot.template.version} • Hash: ${snapshot.provenance.sourceHash.slice(0, 8)} • Finalized ${stamp}`;
  const footerFit = fitLine(provenance, footer.w - 4, type.labelPt, 160);
  push(line({
    id: "footer.provenance",
    text: footerFit.text,
    x: roundMm(footer.x + 2),
    y: roundMm(footer.y + 2),
    maxWidthMm: footer.w - 4,
    fontPt: type.labelPt,
    role: "mono",
    color: muted,
  }, footerFit.truncated));

  const gearRegion = regionOf("gear", templateManifest);
  const portrait = regionOf("portrait", templateManifest);
  const gear = selectEquipment(snapshot.equipment).map((item) => {
    const annotation = fitLine(`${item.name} ${item.description}`.trim(), gearRegion.w - 3, type.labelPt, 120);
    return { ...item, annotation: annotation.text, truncated: annotation.truncated };
  });
  const routed = routeCallouts(gear, portrait, gearRegion, title);

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
    templateVersion: "1.0.0",
    page: { ...templateManifest.page },
    snapshotHash: snapshot.provenance.sourceHash,
    revision: snapshot.revision,
    sealed: isSealedSnapshot(snapshot),
    texts,
    rules,
    callouts: routed.callouts,
    leadersDropped: routed.leadersDropped,
    regions: templateManifest.regions,
    overflowIds,
    crest: crestFrom(snapshot.identity.faction),
    silhouette: snapshot.physical.silhouette,
    portraitUrl: snapshot.portrait?.renditionUrl ?? null,
    portraitCrop: snapshot.portrait?.cropRect ?? { x: 0, y: 0, width: 1, height: 1 },
    focalPoint: snapshot.portrait?.focalPoint ?? { x: 0.5, y: 0.5 },
  };
}
