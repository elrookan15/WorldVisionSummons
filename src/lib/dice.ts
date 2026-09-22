export type DieSize = 4 | 6 | 8 | 10 | 12 | 20 | 100;

export type DiceMode = "normal" | "advantage" | "disadvantage";

export interface DiceRollResult {
  id: string;
  at: string;
  label: string;
  sides: number;
  dice: number[];
  chosen: number;
  modifier: number;
  total: number;
  mode: DiceMode;
  natural: "crit" | "fail" | null;
}

export function abilityModifier(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.floor((score - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : String(mod);
}

export function parseInitiativeModifier(initiative: string | number | undefined): number {
  if (typeof initiative === "number" && Number.isFinite(initiative)) return initiative;
  const match = String(initiative ?? "").match(/-?\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

export function rollDie(sides: number, rng: () => number = Math.random): number {
  const n = Math.max(2, Math.floor(sides));
  return Math.floor(rng() * n) + 1;
}

let rollSeq = 0;

export function rollCheck(opts: {
  label: string;
  sides: DieSize | number;
  modifier?: number;
  mode?: DiceMode;
  rng?: () => number;
}): DiceRollResult {
  const rng = opts.rng ?? Math.random;
  const sides = opts.sides;
  const mode = opts.mode ?? "normal";
  const modifier = opts.modifier ?? 0;
  const a = rollDie(sides, rng);
  const b = rollDie(sides, rng);

  let chosen = a;
  let dice = [a];
  if (sides === 20 && mode === "advantage") {
    chosen = Math.max(a, b);
    dice = [a, b];
  } else if (sides === 20 && mode === "disadvantage") {
    chosen = Math.min(a, b);
    dice = [a, b];
  }

  const natural: DiceRollResult["natural"] =
    sides === 20 && chosen === 20 ? "crit" : sides === 20 && chosen === 1 ? "fail" : null;

  rollSeq += 1;
  return {
    id: `roll-${Date.now()}-${rollSeq}`,
    at: new Date().toISOString(),
    label: opts.label,
    sides,
    dice,
    chosen,
    modifier,
    total: chosen + modifier,
    mode: sides === 20 ? mode : "normal",
    natural
  };
}
