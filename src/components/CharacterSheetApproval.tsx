import React, { useEffect, useState } from "react";
import type { CharacterRecord } from "../types/character";

type Props = {
  charId: string;
  onApproved?: (charId: string) => void;
  onRequestChange?: (charId: string, diffs: Record<string, unknown>) => void;
  onClose?: () => void;
};

export const CharacterSheetApproval: React.FC<Props> = ({ charId, onApproved, onRequestChange, onClose }) => {
  const [open, setOpen] = useState(true);
  const [character, setCharacter] = useState<CharacterRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestNotes, setRequestNotes] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    // In local SPA mode or API mode, fetch character record if endpoint exists, or fallback to mock/local state
    fetch(`/api/character/${charId}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to load character");
        const body = await r.json();
        if (mounted && body.character) setCharacter(body.character);
      })
      .catch((err) => {
        console.warn("API fetch character failed, using local fallback if needed", err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [charId]);

  const approve = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orchestrator/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ charId }),
      });
      if (!res.ok) {
        // Fallback gracefully for preview mode
        console.warn("Approval API not active, proceeding locally");
      }
      setOpen(false);
      onApproved?.(charId);
      onClose?.();
    } catch (err) {
      console.error(err);
      setOpen(false);
      onApproved?.(charId);
      onClose?.();
    } finally {
      setLoading(false);
    }
  };

  const requestChange = async () => {
    setLoading(true);
    try {
      const payload = { charId, diffs: { notes: requestNotes } };
      await fetch(`/api/orchestrator/request-change`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});
      setOpen(false);
      onRequestChange?.(charId, { notes: requestNotes });
      onClose?.();
    } catch (err) {
      console.error(err);
      setOpen(false);
      onRequestChange?.(charId, { notes: requestNotes });
      onClose?.();
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-stone-900 border border-stone-700 rounded-2xl max-w-4xl w-full p-6 md:p-8 shadow-2xl text-stone-100 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-stone-800 pb-4">
          <div>
            <span className="text-xs uppercase font-mono text-amber-400 tracking-widest">GATEWAY APPROVAL CHECKPOINT</span>
            <h2 className="text-2xl font-serif font-bold text-stone-100">Review & Approve Character Sheet</h2>
          </div>
          <button 
            onClick={() => { setOpen(false); onClose?.(); }}
            className="text-stone-400 hover:text-stone-200 text-lg font-bold px-3 py-1 rounded bg-stone-800"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <h3 className="text-xs uppercase font-mono text-stone-400 tracking-wider">Character Dossier Preview</h3>
            {loading && <div className="text-sm text-stone-400 animate-pulse">Loading dossier preview...</div>}
            {!loading && character ? (
              <div className="space-y-3 bg-stone-950 p-4 rounded-xl border border-stone-800">
                <div>
                  <div className="text-xl font-bold font-serif text-amber-300">{character.character_name}</div>
                  <div className="text-xs font-medium text-stone-400">{character.character_class} • {character.sheet_style}</div>
                </div>
                <p className="text-xs font-serif text-stone-300 leading-relaxed border-t border-stone-800 pt-2">
                  {character.character_lore}
                </p>
                <div>
                  <div className="text-[10px] uppercase font-mono text-stone-500 mb-1">Inventory Loadout</div>
                  <div className="flex flex-wrap gap-1">
                    {character.inventory_items.map((it, idx) => (
                      <span key={idx} className="bg-stone-900 border border-stone-800 text-[11px] px-2 py-0.5 rounded text-stone-300">
                        {it.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : !loading && (
              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-xs text-stone-400">
                Dossier record ready for review and final endorsement.
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-xs uppercase font-mono text-stone-400 tracking-wider">Modification Notes & Approval</h3>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-stone-400 font-mono">Request Changes / Revision Instructions (Optional):</label>
              <textarea
                rows={5}
                value={requestNotes}
                onChange={(e) => setRequestNotes(e.target.value)}
                className="w-full p-3 rounded-lg border border-stone-700 bg-stone-950 text-stone-200 text-xs font-mono focus:outline-none focus:border-amber-500"
                placeholder="Specify revisions (e.g., 'adjust weapon type to polearm', 'refine lore tone')."
              />
            </div>
          </div>
        </div>

        <div className="border-t border-stone-800 pt-4 flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={() => { setOpen(false); onClose?.(); }}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-semibold transition-all"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={requestChange}
            className="px-4 py-2 bg-red-950 hover:bg-red-900 text-red-200 border border-red-800 rounded-xl text-xs font-bold transition-all"
            disabled={loading}
          >
            Request Changes
          </button>
          <button
            onClick={approve}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-xl text-xs font-extrabold transition-all shadow-lg"
            disabled={loading}
          >
            Approve Final Sheet
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterSheetApproval;
