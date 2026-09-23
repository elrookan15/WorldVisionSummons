import type { CodexSnapshotV1, PsychologyCategory } from "../schema/codexSnapshotV1";

const TRAIT_PRIORITY: readonly PsychologyCategory[] = [
  "reputation",
  "virtue",
  "vice",
  "fear",
  "loyalty",
  "survival",
  "obsession",
  "tell",
  "blindSpot",
];

const EQUIPMENT_ORDER = ["eq-primary", "eq-armor", "eq-relic", "eq-secondary", "eq-utility", "eq-consumable"];

export function selectPsychology(traits: CodexSnapshotV1["psychology"]): CodexSnapshotV1["psychology"] {
  const pinned = traits.filter((trait) => trait.pinned);
  const open = traits.filter((trait) => !trait.pinned);
  const ordered = [...pinned];
  for (const category of TRAIT_PRIORITY) {
    const match = open.find((trait) => trait.category === category);
    if (match && !ordered.some((trait) => trait.id === match.id)) ordered.push(match);
  }
  return ordered.slice(0, 6);
}

export function selectEquipment(items: CodexSnapshotV1["equipment"]): CodexSnapshotV1["equipment"] {
  const picked: CodexSnapshotV1["equipment"] = [];
  for (const id of EQUIPMENT_ORDER) {
    const match = items.find((item) => item.id === id);
    if (match) picked.push(match);
  }
  for (const item of [...items].sort((left, right) => left.priority - right.priority)) {
    if (picked.length >= 6) break;
    if (!picked.some((chosen) => chosen.id === item.id)) picked.push(item);
  }
  return picked.slice(0, 6);
}

export function extractiveBeats(text: string, hardMax = 720): { text: string; truncated: boolean } {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return { text: "", truncated: false };
  const beats = clean.split(/(?<=[.!?])\s+/).map((beat) => beat.trim()).filter(Boolean).slice(0, 3);
  const joined = (beats.length > 0 ? beats : [clean]).join(" ");
  if (joined.length <= hardMax) return { text: joined, truncated: joined.length > 480 };
  return { text: `${joined.slice(0, hardMax - 1)}…`, truncated: true };
}
