import React, { useMemo, useState } from "react";
import { BookMarked, Copy, Save, Search, Trash2, X } from "lucide-react";
import { CodexEntry } from "../lib/characterCodex";

interface CharacterCodexProps {
  open: boolean;
  onClose: () => void;
  entries: CodexEntry[];
  activeId: string | null;
  c: Record<string, string>;
  fonts: { display: string; body: string; mono: string };
  onSaveCurrent: () => void;
  onSaveAsNew: () => void;
  onLoad: (entry: CodexEntry) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export default function CharacterCodex({
  open,
  onClose,
  entries,
  activeId,
  c,
  fonts,
  onSaveCurrent,
  onSaveAsNew,
  onLoad,
  onDelete,
  onDuplicate
}: CharacterCodexProps) {
  const [query, setQuery] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) =>
      [e.name, e.title, e.classRole, e.sheetStyle].join(" ").toLowerCase().includes(q)
    );
  }, [entries, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm no-print" onClick={onClose}>
      <aside
        className="h-full w-full max-w-md border-l shadow-2xl flex flex-col"
        style={{ backgroundColor: c.bg, borderColor: c.border, color: c.text, fontFamily: fonts.body }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Character Codex"
      >
        <div className="px-5 py-4 border-b flex items-start justify-between gap-3" style={{ borderColor: c.border, backgroundColor: c.card }}>
          <div>
            <div className="mono text-[10px] tracking-[0.18em] uppercase" style={{ color: c.muted }}>
              Local Roster • {entries.length} saved
            </div>
            <h2 className="display text-2xl leading-tight" style={{ fontFamily: fonts.display }}>
              Character Codex
            </h2>
            <p className="text-xs mt-1" style={{ color: c.muted }}>
              Keep a party of summons on this device. Portraits larger than storage quota are dropped automatically.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border grid place-items-center"
            style={{ borderColor: c.border, backgroundColor: c.bg2 }}
            aria-label="Close Codex"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-3 flex gap-2 border-b" style={{ borderColor: c.border }}>
          <button
            onClick={onSaveCurrent}
            className="flex-1 h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
            style={{ backgroundColor: c.accent, color: c.accentText }}
          >
            <Save className="w-3.5 h-3.5" />
            {activeId ? "Update Entry" : "Save to Codex"}
          </button>
          {activeId && (
            <button
              onClick={onSaveAsNew}
              className="h-10 px-3 rounded-xl border text-xs font-semibold"
              style={{ borderColor: c.border, backgroundColor: c.card }}
            >
              Save as New
            </button>
          )}
        </div>

        <div className="px-5 py-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: c.muted }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search saved summons..."
              className="w-full h-10 pl-9 pr-3 rounded-xl border text-sm"
              style={{ backgroundColor: c.card, borderColor: c.border, color: c.text }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border p-6 text-center text-sm" style={{ borderColor: c.border, backgroundColor: c.card, color: c.muted }}>
              <BookMarked className="w-6 h-6 mx-auto mb-2" style={{ color: c.accent }} />
              {entries.length === 0
                ? "The Codex is empty. Summon a character, then save them here to build your campaign roster."
                : "No saved summons match that search."}
            </div>
          ) : (
            filtered.map((entry) => {
              const active = entry.id === activeId;
              return (
                <article
                  key={entry.id}
                  className="rounded-2xl border p-3 flex gap-3"
                  style={{
                    backgroundColor: active ? c.card2 : c.card,
                    borderColor: active ? c.borderStrong : c.border,
                    boxShadow: active ? `0 0 0 1px ${c.borderStrong}` : "none"
                  }}
                >
                  <div className="w-14 h-[4.5rem] rounded-xl overflow-hidden border shrink-0" style={{ borderColor: c.border, backgroundColor: c.bg2 }}>
                    {entry.portraitUrl ? (
                      <img src={entry.portraitUrl} alt="" className="w-full h-full object-cover object-top" />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-[10px] mono" style={{ color: c.muted2 }}>
                        No art
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-sm truncate">{entry.name}</div>
                        <div className="text-[11px] truncate" style={{ color: c.accent }}>{entry.classRole}</div>
                      </div>
                      {active && (
                        <span className="mono text-[9px] px-1.5 py-0.5 rounded border shrink-0" style={{ borderColor: c.borderStrong, color: c.accent }}>
                          LOADED
                        </span>
                      )}
                    </div>
                    <div className="mono text-[10px] mt-1 truncate" style={{ color: c.muted }}>
                      {entry.sheetStyle} • {new Date(entry.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <button
                        onClick={() => onLoad(entry)}
                        className="px-2.5 h-7 rounded-lg text-[10px] font-bold"
                        style={{ backgroundColor: c.accent, color: c.accentText }}
                      >
                        Load
                      </button>
                      <button
                        onClick={() => onDuplicate(entry.id)}
                        className="px-2.5 h-7 rounded-lg border text-[10px] font-semibold flex items-center gap-1"
                        style={{ borderColor: c.border }}
                      >
                        <Copy className="w-3 h-3" /> Duplicate
                      </button>
                      {confirmId === entry.id ? (
                        <button
                          onClick={() => {
                            onDelete(entry.id);
                            setConfirmId(null);
                          }}
                          className="px-2.5 h-7 rounded-lg text-[10px] font-bold bg-rose-700 text-white"
                        >
                          Confirm delete
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirmId(entry.id)}
                          className="px-2.5 h-7 rounded-lg border text-[10px] font-semibold flex items-center gap-1"
                          style={{ borderColor: c.border, color: c.muted }}
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
}
