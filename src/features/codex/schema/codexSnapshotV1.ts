import { z } from "zod";

export const CODEX_SCHEMA_VERSION = 1 as const;
export const CODEX_TEMPLATE_ID = "illuminated-codex" as const;
export const MAX_PORTRAIT_CHARS = 350_000;
export const FIXED_PORTRAIT_CROP = { x: 500, y: 160, w: 1000, h: 780 } as const;

export const GEAR_SLOT_IDS = [
  "primaryWeapon",
  "secondaryFocus",
  "armor",
  "utilityTools",
  "consumables",
  "relics",
] as const;

export const ANCHOR_IDS = [
  "head",
  "shoulder-l",
  "shoulder-r",
  "hand-l",
  "hand-r",
  "torso",
  "waist",
  "feet",
] as const;

export type GearSlotId = (typeof GEAR_SLOT_IDS)[number];
export type AnchorId = (typeof ANCHOR_IDS)[number];

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function rotr(x: number, n: number): number {
  return (x >>> n) | (x << (32 - n));
}

function sha256HexBytes(data: Uint8Array): string {
  const bitLen = data.length * 8;
  const padLen = (64 - ((data.length + 1 + 8) % 64)) % 64;
  const buf = new Uint8Array(data.length + 1 + padLen + 8);
  buf.set(data);
  buf[data.length] = 0x80;
  const view = new DataView(buf.buffer);
  view.setUint32(buf.length - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(buf.length - 4, bitLen >>> 0, false);

  const h = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);
  const w = new Uint32Array(64);

  for (let offset = 0; offset < buf.length; offset += 64) {
    for (let i = 0; i < 16; i += 1) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i += 1) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let a = h[0];
    let b = h[1];
    let c = h[2];
    let d = h[3];
    let e = h[4];
    let f = h[5];
    let g = h[6];
    let hh = h[7];
    for (let i = 0; i < 64; i += 1) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (hh + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      hh = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }
    h[0] = (h[0] + a) >>> 0;
    h[1] = (h[1] + b) >>> 0;
    h[2] = (h[2] + c) >>> 0;
    h[3] = (h[3] + d) >>> 0;
    h[4] = (h[4] + e) >>> 0;
    h[5] = (h[5] + f) >>> 0;
    h[6] = (h[6] + g) >>> 0;
    h[7] = (h[7] + hh) >>> 0;
  }

  let hex = "";
  for (let i = 0; i < 8; i += 1) {
    hex += h[i].toString(16).padStart(8, "0");
  }
  return hex;
}

export function sha256Hex(text: string): string {
  return sha256HexBytes(new TextEncoder().encode(text));
}

export function canonicalJson(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string" || typeof value === "boolean") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("Codex canonical JSON rejects non-finite numbers");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map((entry) => canonicalJson(entry)).join(",")}]`;
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record)
      .filter((key) => record[key] !== undefined)
      .sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(",")}}`;
  }
  throw new Error("Codex canonical JSON rejects this value");
}

export function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value as object)) deepFreeze(nested);
  return Object.freeze(value);
}

const GearSchema = z.object({
  slot: z.enum(GEAR_SLOT_IDS),
  label: z.string().min(1).max(24),
  name: z.string().min(1).max(120),
  anchor: z.enum(ANCHOR_IDS),
}).strict();

const TraitSchema = z.object({
  key: z.string().min(1).max(32),
  label: z.string().min(1).max(24),
  value: z.string().min(1).max(160),
}).strict();

const AttributeSchema = z.object({
  key: z.string().min(1).max(8),
  label: z.string().min(1).max(24),
  value: z.number().int().min(1).max(30),
}).strict();

export const SnapshotBodySchema = z.object({
  schemaVersion: z.literal(CODEX_SCHEMA_VERSION),
  templateId: z.literal(CODEX_TEMPLATE_ID),
  revision: z.number().int().nonnegative().max(9999),
  locked: z.boolean(),
  finalizedAt: z.string().min(1).max(40),
  sourceSheetId: z.string().min(1).max(80).nullable(),
  identity: z.object({
    name: z.string().min(1).max(80),
    epithet: z.string().max(80),
    title: z.string().max(80),
    motto: z.string().max(160),
    role: z.string().min(1).max(60),
    crest: z.string().min(1).max(3),
    sheetStyle: z.string().min(1).max(80),
  }).strict(),
  physicalMarks: z.array(z.string().min(1).max(48)).max(4),
  traits: z.array(TraitSchema).max(6),
  gear: z.array(GearSchema).length(6),
  vitals: z.object({
    hpCurrent: z.number().int().nonnegative().max(9999),
    hpMax: z.number().int().positive().max(9999),
    ac: z.number().int().min(0).max(99),
    initiative: z.string().min(1).max(16),
    speed: z.string().min(1).max(16),
    level: z.number().int().min(1).max(40),
    resourceName: z.string().min(1).max(32),
    resourceCurrent: z.number().int().nonnegative().max(9999),
    resourceMax: z.number().int().nonnegative().max(9999),
  }).strict(),
  attributes: z.array(AttributeSchema).length(6),
  chronicle: z.object({
    backstory: z.string().max(2000),
    quote: z.string().max(160),
  }).strict(),
  portrait: z.object({
    url: z.string().max(MAX_PORTRAIT_CHARS).nullable(),
    crop: z.object({
      x: z.number().int().min(0).max(1000),
      y: z.number().int().min(0).max(1000),
      w: z.number().int().min(1).max(1000),
      h: z.number().int().min(1).max(1000),
    }).strict(),
  }).strict(),
  warnings: z.array(z.string().min(1).max(180)).max(32),
}).strict();

export const CodexSnapshotV1Schema = SnapshotBodySchema.extend({
  contentHash: z.string().regex(/^[0-9a-f]{64}$/),
}).strict();

export type CodexSnapshotV1 = z.infer<typeof CodexSnapshotV1Schema>;
export type SnapshotBody = z.infer<typeof SnapshotBodySchema>;

export interface WorkshopEquipment {
  primaryWeapon: string;
  secondaryFocus: string;
  armor: string;
  utilityTools: string;
  consumables: string;
  relics: string;
}

export interface WorkshopSignature {
  reputation: string;
  vice: string;
  virtue: string;
  fear: string;
  obsession: string;
  tell: string;
  loyalty: string;
  blindSpot: string;
  survivalInstinct: string;
  legacyFear: string;
}

/** Structural slice of `UiSheetData` from `src/lib/sheetMapper.ts`. */
export interface WorkshopSheet {
  name: string;
  title: string;
  sheet_style: string;
  overview: {
    classRole: string;
    faction: string;
    alignment: string;
  };
  physical: {
    height: string;
    weight: string;
    build: string;
    marks: string;
    scars: string;
  };
  signatureAttributes: WorkshopSignature;
  derivedStats: {
    hpCurrent: number;
    hpMax: number;
    ac: number;
    initiative: string;
    speed: string;
    level: number;
    resourceName: string;
    resourceCurrent: number;
    resourceMax: number;
  };
  lore: { backstory: string };
  equipment: WorkshopEquipment;
  personality: { speech: string };
  stats: Array<{ key: string; label: string; value: number }>;
}

export function snapshotBody(snapshot: CodexSnapshotV1): SnapshotBody {
  const { contentHash: _contentHash, ...body } = snapshot;
  return SnapshotBodySchema.parse(body);
}

export function hashSnapshotBody(body: SnapshotBody): string {
  return sha256Hex(canonicalJson(body));
}

export function sealSnapshot(body: SnapshotBody): CodexSnapshotV1 {
  const parsed = SnapshotBodySchema.parse(body);
  const sealed = CodexSnapshotV1Schema.parse({
    ...parsed,
    contentHash: hashSnapshotBody(parsed),
  });
  return deepFreeze(sealed);
}

export function plateFingerprint(snapshot: CodexSnapshotV1): string {
  const body = snapshotBody(snapshot);
  const plate = {
    identity: body.identity,
    physicalMarks: body.physicalMarks,
    traits: body.traits,
    gear: body.gear,
    vitals: body.vitals,
    attributes: body.attributes,
    chronicle: body.chronicle,
    portrait: body.portrait,
  };
  return sha256Hex(canonicalJson(plate));
}
