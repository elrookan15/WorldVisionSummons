import React, { useState } from "react";
import { RotateCcw, X, Sparkles } from "lucide-react";
import {
  DiceMode,
  DiceRollResult,
  DieSize,
  abilityModifier,
  formatModifier,
  parseInitiativeModifier,
  rollCheck
} from "../lib/dice";
import type { UiSheetData } from "../lib/sheetMapper";

const DICE: DieSize[] = [4, 6, 8, 10, 12, 20, 100];

type ThemeColors = Record<string, string>;

interface DiceTrayProps {
  sheet: UiSheetData;
  open: boolean;
  onToggle: () => void;
  c: ThemeColors;
  fonts: { display: string; body: string; mono: string };
}

export default function DiceTray({ sheet, open, onToggle, c, fonts }: DiceTrayProps) {
  const [mode, setMode] = useState<DiceMode>("normal");
  const [history, setHistory] = useState<DiceRollResult[]>([]);
  const [last, setLast] = useState<DiceRollResult | null>(null);

  const pushRoll = (result: DiceRollResult) => {
    setLast(result);
    setHistory((prev) => [result, ...prev].slice(0, 12));
  };

  const rollSides = (sides: DieSize, label?: string, modifier = 0) => {
    pushRoll(rollCheck({
      label: label || `d${sides}`,
      sides,
      modifier,
      mode: sides === 20 ? mode : "normal"
    }));
  };

  const initiativeMod = parseInitiativeModifier(sheet.derivedStats?.initiative);
  const stats = Array.isArray(sheet.stats) ? sheet.stats : [];

  if (!open) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 no-print" style={{ fontFamily: fonts.body }}>
      <div
        className="w-[min(100vw-2.5rem,22rem)] rounded-2xl border shadow-2xl overflow-hidden"
        style={{
          backgroundColor: c.card,
          borderColor: c.border,
          color: c.text,
          boxShadow: `0 18px 50px ${c.shadow || "rgba(0,0,0,0.4)"}`,
          borderTop: `3px solid ${c.clash || c.accent}`
        }}
      >
        <div
          className="px-4 py-3 border-b flex items-center justify-between"
          style={{ borderColor: c.border, backgroundColor: c.bg2 }}
        >
          <div>
            <div className="mono text-[9px] tracking-[0.16em] uppercase" style={{ color: c.clash || c.muted }}>
              Tabletop Tray
            </div>
            <div className="display text-lg leading-tight" style={{ fontFamily: fonts.display }}>
              Dice & Checks
            </div>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="w-8 h-8 rounded-full border grid place-items-center"
            style={{ borderColor: c.border }}
            aria-label="Collapse dice tray"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex gap-1.5">
            {(["normal", "advantage", "disadvantage"] as DiceMode[]).map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => setMode(m)}
                className="flex-1 h-8 rounded-lg border text-[10px] font-bold uppercase tracking-wide"
                style={{
                  backgroundColor: mode === m ? c.accent : c.bg2,
                  color: mode === m ? c.accentText : c.text,
                  borderColor: mode === m ? (c.clash || c.borderStrong) : c.border
                }}
              >
                {m === "normal" ? "Flat" : m === "advantage" ? "Adv" : "Dis"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {DICE.map((sides) => (
              <button
                type="button"
                key={sides}
                onClick={() => rollSides(sides)}
                className="h-10 rounded-lg border text-xs font-bold"
                style={{ backgroundColor: c.bg2, borderColor: c.border, color: c.text }}
                title={`Roll d${sides}`}
              >
                d{sides}
              </button>
            ))}
          </div>

          <div>
            <div className="mono text-[9px] tracking-[0.14em] uppercase mb-1.5" style={{ color: c.muted }}>
              Ability checks — {sheet.name}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {stats.map((st) => {
                const mod = abilityModifier(st.value);
                return (
                  <button
                    type="button"
                    key={st.key}
                    onClick={() => rollSides(20, `${st.key} check`, mod)}
                    className="h-9 rounded-lg border text-[11px] font-semibold flex items-center justify-between px-2"
                    style={{ backgroundColor: c.bg2, borderColor: c.border }}
                  >
                    <span>{st.key}</span>
                    <span className="mono" style={{ color: c.clash || c.accent }}>{formatModifier(mod)}</span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => rollSides(20, "Initiative", initiativeMod)}
              className="mt-1.5 w-full h-9 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-2"
              style={{ backgroundColor: c.bg2, borderColor: c.clash || c.borderStrong, color: c.text }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: c.clash || c.accent }} />
              Initiative {formatModifier(initiativeMod)}
            </button>
          </div>

          {last && (
            <div
              className="rounded-xl border p-3 text-center"
              style={{
                backgroundColor: c.bg,
                borderColor:
                  last.natural === "crit"
                    ? (c.clash || "#10b981")
                    : last.natural === "fail"
                      ? "#e11d48"
                      : c.border
              }}
            >
              <div className="mono text-[9px] uppercase tracking-widest" style={{ color: c.muted }}>{last.label}</div>
              <div className="display text-4xl leading-none my-1" style={{ fontFamily: fonts.display }}>
                {last.total}
              </div>
              <div className="text-[11px]" style={{ color: c.muted }}>
                {last.dice.length > 1 ? `${last.dice.join(" / ")} → ${last.chosen}` : last.chosen}
                {last.modifier !== 0 ? ` ${formatModifier(last.modifier)}` : ""}
                {last.natural === "crit" ? " • NATURAL 20" : last.natural === "fail" ? " • NATURAL 1" : ""}
              </div>
            </div>
          )}

          {history.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="mono text-[9px] uppercase tracking-widest" style={{ color: c.muted }}>History</span>
                <button
                  type="button"
                  onClick={() => { setHistory([]); setLast(null); }}
                  className="text-[10px] flex items-center gap-1"
                  style={{ color: c.muted }}
                >
                  <RotateCcw className="w-3 h-3" /> Clear
                </button>
              </div>
              <ul className="space-y-1 max-h-28 overflow-y-auto">
                {history.map((h) => (
                  <li key={h.id} className="flex justify-between text-[11px] mono" style={{ color: c.muted }}>
                    <span className="truncate pr-2">{h.label}</span>
                    <span style={{ color: c.text }}>{h.total}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
