import React, { useState } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip
} from "recharts";
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Scale
} from "lucide-react";
import { SheetPreset } from "../types";
import { getArchetypeBaseline, StatBaseline, StatComparisonItem } from "../lib/statBaselines";

interface StatsRadarComparisonProps {
  currentStats: { key: string; label: string; value: number; desc?: string }[];
  activePresetName: string;
  allPresets: SheetPreset[];
  c: any;
  currentTheme: any;
  isOpen: boolean;
  onToggle: () => void;
  onApplyBaselineToSheet?: (baseline: StatBaseline) => void;
}

export default function StatsRadarComparison({
  currentStats,
  activePresetName,
  allPresets,
  c,
  currentTheme,
  isOpen,
  onToggle,
  onApplyBaselineToSheet
}: StatsRadarComparisonProps) {
  const [selectedPresetName, setSelectedPresetName] = useState<string>(activePresetName);

  // Sync selectedPresetName if activePresetName changes externally
  React.useEffect(() => {
    if (activePresetName) {
      setSelectedPresetName(activePresetName);
    }
  }, [activePresetName]);

  const activePreset = allPresets.find(p => p.name === selectedPresetName) || allPresets[0];
  const baselineStats = getArchetypeBaseline(
    activePreset ? activePreset.name : selectedPresetName,
    activePreset ? activePreset.category : ""
  );

  // Prepare radar chart data
  const statKeys = ["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const;
  const statLabels: Record<string, string> = {
    STR: "Strength",
    DEX: "Dexterity",
    CON: "Constitution",
    INT: "Intelligence",
    WIS: "Wisdom",
    CHA: "Charisma"
  };

  const comparisonData: StatComparisonItem[] = statKeys.map(k => {
    const curStat = currentStats.find(s => s.key === k);
    const curVal = curStat ? curStat.value : 10;
    const baseVal = baselineStats[k] ?? 10;
    return {
      stat: k,
      label: statLabels[k] || k,
      current: curVal,
      baseline: baseVal,
      diff: curVal - baseVal
    };
  });

  // Calculate similarity / alignment score
  const totalVariance = comparisonData.reduce((acc, item) => acc + Math.abs(item.diff), 0);
  const maxPossibleVariance = 6 * 24;
  const alignmentPercent = Math.max(0, Math.min(100, Math.round(100 - (totalVariance / 48) * 100)));

  // Identify highest strengths & deficits
  const topStrengths = comparisonData.filter(d => d.diff > 0).sort((a, b) => b.diff - a.diff);
  const topDeficits = comparisonData.filter(d => d.diff < 0).sort((a, b) => a.diff - b.diff);

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: StatComparisonItem = payload[0].payload;
      return (
        <div
          className="p-3 rounded-xl border shadow-xl backdrop-blur-md mono text-xs z-50 pointer-events-none"
          style={{
            backgroundColor: `${c.card}F5`,
            borderColor: c.borderStrong || c.border,
            color: c.text
          }}
        >
          <div className="font-bold text-sm mb-1.5 flex items-center justify-between gap-4">
            <span style={{ color: c.accent }}>{data.stat} ({data.label})</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                data.diff > 0
                  ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/30"
                  : data.diff < 0
                  ? "text-rose-400 bg-rose-400/10 border border-rose-400/30"
                  : "text-neutral-400 bg-neutral-400/10"
              }`}
            >
              {data.diff > 0 ? `+${data.diff}` : data.diff < 0 ? `${data.diff}` : "MATCH"}
            </span>
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.accent }} />
                <span>Current Sheet:</span>
              </span>
              <span className="font-bold">{data.current} / 24</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border" style={{ borderColor: c.accent2 || "#38bdf8", backgroundColor: "transparent" }} />
                <span>Archetype Baseline:</span>
              </span>
              <span className="font-bold opacity-80">{data.baseline} / 24</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mb-6">
      {/* Trigger & Toggle Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-[18px] border mb-3 transition" style={{ backgroundColor: c.card2, borderColor: c.border }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl grid place-items-center transition shadow-sm"
            style={{
              backgroundColor: isOpen ? c.accent : c.bg2,
              color: isOpen ? c.accentText : c.accent
            }}
          >
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="mono text-xs font-bold uppercase tracking-wider" style={{ color: c.text }}>
                Archetype Radar Overlay
              </span>
              <span
                className={`mono text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
                  isOpen
                    ? "bg-emerald-400/15 text-emerald-400 border border-emerald-400/30"
                    : "bg-neutral-500/15 text-neutral-400 border border-neutral-500/20"
                }`}
              >
                {isOpen ? "Active" : "Hidden"}
              </span>
            </div>
            <p className="text-[11px] leading-tight" style={{ color: c.muted }}>
              Overlay 6-axis polygonal radar comparing your attributes against {activePreset?.name || "Archetype"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOpen && (
            <div className="flex items-center gap-1.5 mr-1">
              <span className="mono text-[10px] hidden sm:inline" style={{ color: c.muted2 }}>Compare to:</span>
              <div className="relative">
                <select
                  value={selectedPresetName}
                  onChange={(e) => setSelectedPresetName(e.target.value)}
                  className="mono text-xs py-1.5 pl-2.5 pr-7 rounded-lg border appearance-none cursor-pointer focus:outline-none max-w-[200px] truncate"
                  style={{
                    backgroundColor: c.card,
                    borderColor: c.border,
                    color: c.text
                  }}
                  title="Select archetype preset to compare against"
                  aria-label="Select Archetype Baseline"
                >
                  {allPresets.map((preset, idx) => (
                    <option key={idx} value={preset.name}>
                      {preset.name} ({preset.charClass})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-2.5 pointer-events-none opacity-60" style={{ color: c.text }} />
              </div>
            </div>
          )}

          <button
            type="button"
            id="toggle-radar-chart-btn"
            onClick={onToggle}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold mono transition hover:scale-[1.02] active:scale-95 shadow-sm"
            style={{
              backgroundColor: isOpen ? c.accent : c.card,
              borderColor: isOpen ? c.borderStrong : c.border,
              color: isOpen ? c.accentText : c.text
            }}
            aria-expanded={isOpen}
            aria-controls="radar-chart-overlay-panel"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isOpen ? "Hide Radar Chart" : "Overlay Radar Chart"}</span>
          </button>
        </div>
      </div>

      {/* Expandable Radar Chart & Comparative Matrix */}
      {isOpen && (
        <div
          id="radar-chart-overlay-panel"
          className="rounded-[22px] border p-5 md:p-6 transition-all duration-300 relative overflow-hidden"
          style={{
            backgroundColor: c.card,
            borderColor: c.borderStrong || c.border,
            boxShadow: `0 10px 30px ${c.shadow || "rgba(0,0,0,0.2)"}`
          }}
        >
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Radar Chart Display */}
            <div className="w-full lg:w-3/5 h-[320px] md:h-[350px] relative flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  data={comparisonData}
                  cx="50%"
                  cy="50%"
                  outerRadius="72%"
                  margin={{ top: 10, right: 25, bottom: 10, left: 25 }}
                >
                  <PolarGrid stroke={c.border} strokeDasharray="3 3" />
                  <PolarAngleAxis
                    dataKey="stat"
                    tick={{
                      fill: c.text,
                      fontSize: 12,
                      fontFamily: currentTheme?.fonts?.mono || "monospace",
                      fontWeight: 700
                    }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 24]}
                    tick={{
                      fill: c.muted2 || c.muted,
                      fontSize: 9,
                      fontFamily: "monospace"
                    }}
                    stroke={c.border}
                  />
                  <Radar
                    name="Current Character Stats"
                    dataKey="current"
                    stroke={c.accent}
                    fill={c.accent}
                    fillOpacity={0.42}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: c.accent, strokeWidth: 1, stroke: c.text }}
                  />
                  <Radar
                    name={`${activePreset?.name || "Archetype"} Baseline`}
                    dataKey="baseline"
                    stroke={c.accent2 || "#38bdf8"}
                    fill={c.accent2 || "#38bdf8"}
                    fillOpacity={0.12}
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    dot={{ r: 3, fill: c.accent2 || "#38bdf8", strokeWidth: 1 }}
                  />
                  <Tooltip content={customTooltip} />
                  <Legend
                    wrapperStyle={{
                      paddingTop: "12px",
                      fontSize: "11px",
                      fontFamily: currentTheme?.fonts?.mono || "monospace"
                    }}
                    formatter={(value) => (
                      <span className="font-semibold" style={{ color: c.text }}>
                        {value}
                      </span>
                    )}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Analytical Comparison Breakdown Panel */}
            <div className="w-full lg:w-2/5 flex flex-col justify-between self-stretch border-t lg:border-t-0 lg:border-l pt-5 lg:pt-0 lg:pl-6" style={{ borderColor: c.border }}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="mono text-[10px] uppercase font-bold tracking-wider" style={{ color: c.accent }}>
                    BASELINE ARCHETYPE
                  </div>
                  <div className="mono text-[10px] px-2 py-0.5 rounded-full border" style={{ borderColor: c.border, color: c.muted, backgroundColor: c.bg2 }}>
                    {activePreset?.category || "Core"}
                  </div>
                </div>

                <div className="display text-lg font-bold leading-snug mb-1" style={{ color: c.text }}>
                  {activePreset?.name || selectedPresetName}
                </div>
                <div className="text-xs mb-4 font-medium" style={{ color: c.accent }}>
                  {activePreset?.charClass || "Custom Character Class"}
                </div>

                {/* Alignment Score Meter */}
                <div className="p-3.5 rounded-xl border mb-4" style={{ backgroundColor: c.bg2, borderColor: c.border }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="mono text-[11px] font-semibold" style={{ color: c.text }}>
                      Archetype Affinity Index
                    </span>
                    <span className="mono text-xs font-bold" style={{ color: alignmentPercent > 75 ? "#10b981" : alignmentPercent > 50 ? "#f59e0b" : "#f43f5e" }}>
                      {alignmentPercent}% Match
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden bg-neutral-800">
                    <div
                      className="h-full transition-all duration-500 rounded-full"
                      style={{
                        width: `${alignmentPercent}%`,
                        backgroundColor: alignmentPercent > 75 ? "#10b981" : alignmentPercent > 50 ? "#f59e0b" : "#f43f5e"
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2 mono text-[9px]" style={{ color: c.muted2 }}>
                    <span>Divergent</span>
                    <span>Hybrid</span>
                    <span>Canon Baseline</span>
                  </div>
                </div>

                {/* 6-Axis Stat-by-Stat Delta Grid */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {comparisonData.map(d => {
                    const isPositive = d.diff > 0;
                    const isNegative = d.diff < 0;
                    return (
                      <div
                        key={d.stat}
                        className="p-2 rounded-lg border text-center flex flex-col justify-between"
                        style={{ backgroundColor: c.card2, borderColor: c.border }}
                      >
                        <div className="mono text-[9px] font-bold" style={{ color: c.muted }}>
                          {d.stat}
                        </div>
                        <div className="flex items-center justify-center gap-1 my-0.5">
                          <span className="font-bold text-sm" style={{ color: c.text }}>
                            {d.current}
                          </span>
                          <span className="text-[10px] opacity-40">/</span>
                          <span className="text-[10px] opacity-70" style={{ color: c.muted }}>
                            {d.baseline}
                          </span>
                        </div>
                        <div className="flex items-center justify-center text-[10px] mono font-bold">
                          {isPositive ? (
                            <span className="text-emerald-400 flex items-center">
                              <ArrowUpRight className="w-3 h-3" />+{d.diff}
                            </span>
                          ) : isNegative ? (
                            <span className="text-rose-400 flex items-center">
                              <ArrowDownRight className="w-3 h-3" />{d.diff}
                            </span>
                          ) : (
                            <span className="text-neutral-400 flex items-center">
                              <Minus className="w-2.5 h-2.5" />0
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tactical Variance Analysis */}
                <div className="text-[11px] leading-relaxed mb-4 p-3 rounded-xl border mono" style={{ backgroundColor: c.bg, borderColor: c.border, color: c.muted }}>
                  {topStrengths.length > 0 ? (
                    <div className="flex items-start gap-1.5 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-emerald-400">Strength Bias:</strong> Above baseline in {topStrengths.map(s => `${s.stat} (+${s.diff})`).join(", ")}
                      </span>
                    </div>
                  ) : (
                    <div>No positive stat divergence from archetype baseline.</div>
                  )}
                  {topDeficits.length > 0 && (
                    <div className="flex items-start gap-1.5 mt-1">
                      <Scale className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-rose-400">Deficit Bias:</strong> Below baseline in {topDeficits.map(s => `${s.stat} (${s.diff})`).join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Bar */}
              {onApplyBaselineToSheet && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onApplyBaselineToSheet(baselineStats)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border mono text-xs font-semibold transition hover:scale-[1.01] active:scale-98"
                    style={{
                      backgroundColor: c.bg2,
                      borderColor: c.borderStrong || c.border,
                      color: c.text
                    }}
                    title="Adopt this archetype's baseline attributes into the active character sheet"
                  >
                    <RotateCcw className="w-3.5 h-3.5" style={{ color: c.accent }} />
                    <span>Adopt Archetype Baseline Stats</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
