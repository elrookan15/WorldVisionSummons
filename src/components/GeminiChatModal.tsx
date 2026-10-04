import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles, X, Send, Bot, User, Copy, Check, Shield, Activity,
  ChevronDown, BookOpen, Skull, Zap, Crown, Feather, Cog, Terminal,
  Eye, Truck, Sword, Flame, Award, Wand2, ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { FEDEROV_PERSONAS, getPersonaById, type FederovPersona } from "../lib/federovPersonas";
import { parseCharacterProposal, stripProposalBlock, type CharacterProposal } from "../lib/characterProposal";
import { withWvsApiHeaders } from "../lib/apiClientHeaders";

interface Message {
  role: "user" | "model";
  text: string;
  groundingMetadata?: unknown;
}

interface GeminiChatModalProps {
  onClose: () => void;
  characterContext?: Record<string, unknown>;
  onApplyCharacter?: (proposal: CharacterProposal) => void;
}

const PERSONA_ICONS: Record<string, LucideIcon> = {
  BookOpen,
  Shield,
  Skull,
  Zap,
  Crown,
  Feather,
  Cog,
  Terminal,
  Eye,
  Truck,
  Sword,
  Sparkles,
  Flame,
  Activity,
  Award,
};

function personaIcon(iconName: string): LucideIcon {
  return PERSONA_ICONS[iconName] ?? Bot;
}

export default function GeminiChatModal({ onClose, characterContext, onApplyCharacter }: GeminiChatModalProps) {
  const [selectedPersonaId, setSelectedPersonaId] = useState("archivist");
  const [showPersonaDrawer, setShowPersonaDrawer] = useState(false);
  const activePersona = getPersonaById(selectedPersonaId);
  const ActiveIcon = personaIcon(activePersona.avatarIcon);
  const panelRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: `Hail, summoner. I am ${activePersona.name}, ${activePersona.title}.\n\n"${activePersona.speechSample}"\n\nI am versed across all canons of fantasy lore, science fiction, ancient fairy tales, and tabletop D&D. Tell me: what manner of character or backstory shall we forge for your generator?`
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSelectPersona = (persona: FederovPersona) => {
    setSelectedPersonaId(persona.id);
    setShowPersonaDrawer(false);
    setMessages((prev) => [
      ...prev,
      {
        role: "model",
        text: `[RESONATING WITH: ${persona.name.toUpperCase()} — ${persona.genre.toUpperCase()}]\n\n"${persona.speechSample}"\n\nTone: ${persona.tone}\n\nI am now channeling ${persona.name}. What character concept, tactical archetype, or backstory shall I weave for your generator?`
      }
    ]);
  };

  const handleSendText = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg = textToSend.trim();
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", text: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/summons/chat", {
        method: "POST",
        headers: withWvsApiHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          messages: newMessages,
          characterContext,
          personaId: selectedPersonaId,
          stochasticSeed: Math.floor(Math.random() * 1000000)
        })
      });

      const data: unknown = await res.json().catch(() => ({}));
      const payload = data && typeof data === "object" ? data as Record<string, unknown> : {};
      if (!res.ok) {
        const detail = typeof payload.message === "string" && payload.message.trim()
          ? payload.message
          : `Codex link refused (${res.status}).`;
        setMessages([...newMessages, { role: "model", text: detail }]);
        return;
      }
      if (typeof payload.reply === "string" && payload.reply) {
        setMessages([...newMessages, { role: "model", text: payload.reply, groundingMetadata: payload.groundingMetadata }]);
      } else {
        setMessages([...newMessages, { role: "model", text: "The ether is silent at the moment. Repeat your directive." }]);
      }
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: "model", text: "Neural codex disruption. Transmitting fallback persona signal." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendText(input);
  };

  const copyTranscript = () => {
    const transcript = messages
      .map((m) => `[${m.role === "user" ? "SUMMONER" : activePersona.name.toUpperCase()}]: ${m.text}`)
      .join("\n\n");
    const write = async () => {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(transcript);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = transcript;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
    };
    write()
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy transcript:", err));
  };

  const handleApplyToGenerator = (proposal: CharacterProposal) => {
    if (!onApplyCharacter) return;
    onApplyCharacter(proposal);
    setAppliedNotice(`Applied "${proposal.name}" to the generator!`);
    setTimeout(() => setAppliedNotice(null), 3000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Federov AI chat"
        className="bg-stone-950 border border-amber-500/40 rounded-2xl w-full max-w-4xl h-[92vh] max-h-[850px] flex flex-col shadow-[0_0_60px_rgba(245,158,11,0.25)] overflow-hidden relative"
        onClick={(event) => event.stopPropagation()}
      >
        {appliedNotice && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-stone-950 px-4 py-2 rounded-full font-mono text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
            <Check className="w-4 h-4" />
            <span>{appliedNotice}</span>
          </div>
        )}

        <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border-b border-stone-800 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center border shadow-inner shrink-0"
              style={{
                backgroundColor: `${activePersona.themeColor}20`,
                borderColor: `${activePersona.themeColor}60`,
                color: activePersona.themeColor
              }}
            >
              <ActiveIcon className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-mono text-sm font-bold text-stone-100 tracking-wider truncate">
                  {activePersona.name}
                </h3>
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full border truncate"
                  style={{
                    backgroundColor: `${activePersona.themeColor}15`,
                    borderColor: `${activePersona.themeColor}40`,
                    color: activePersona.themeColor
                  }}
                >
                  {activePersona.genre}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-sans truncate max-w-md hidden sm:block mt-0.5">
                {activePersona.title} • <span className="italic opacity-80">{activePersona.tone}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowPersonaDrawer(!showPersonaDrawer)}
              className="px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm hover:scale-105 active:scale-95"
              style={{
                backgroundColor: `${activePersona.themeColor}20`,
                borderColor: `${activePersona.themeColor}70`,
                color: activePersona.themeColor
              }}
              title="Switch between 15 Federov AI Multiverse Personas"
              aria-expanded={showPersonaDrawer}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Personas (15)</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showPersonaDrawer ? "rotate-180" : ""}`} />
            </button>
            <button
              type="button"
              onClick={copyTranscript}
              title="Copy conversation transcript"
              className="p-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-200 transition-colors flex items-center gap-1 text-xs font-mono"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden lg:inline">{copied ? "Copied" : "Transcript"}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 flex items-center justify-center text-stone-400 hover:text-stone-200 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showPersonaDrawer && (
          <div className="bg-stone-900/95 border-b border-stone-800 p-4 max-h-[340px] overflow-y-auto animate-fadeIn shrink-0 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-3 border-b border-stone-800/80 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="font-mono text-xs font-bold text-stone-200 uppercase tracking-wider">
                  Select Federov AI Persona (15 Lore Specialists Available)
                </span>
              </div>
              <span className="text-[11px] font-sans text-stone-400">
                Click any persona to adopt their voice, lore expertise & starter prompts
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {FEDEROV_PERSONAS.map((p) => {
                const isSelected = p.id === selectedPersonaId;
                const PIcon = personaIcon(p.avatarIcon);
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => handleSelectPersona(p)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 group ${
                      isSelected
                        ? "ring-2 ring-offset-1 ring-offset-stone-950 shadow-lg scale-[1.01]"
                        : "hover:bg-stone-800/80 hover:border-stone-700"
                    }`}
                    style={{
                      backgroundColor: isSelected ? `${p.themeColor}18` : "#141416",
                      borderColor: isSelected ? p.themeColor : "#26262a"
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 mt-0.5"
                      style={{
                        backgroundColor: `${p.themeColor}20`,
                        borderColor: `${p.themeColor}50`,
                        color: p.themeColor
                      }}
                    >
                      <PIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-xs font-bold text-stone-100 truncate group-hover:text-amber-300">
                          {p.name}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-black text-amber-400 bg-amber-400/20">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-amber-400/90 font-mono truncate">{p.genre}</div>
                      <div className="text-[10px] text-stone-400 font-sans line-clamp-1 mt-0.5">{p.tagline}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-900/40 via-stone-950 to-stone-950">
          {messages.map((m, idx) => {
            const proposal = m.role === "model" ? parseCharacterProposal(m.text) : null;
            const displayText = stripProposalBlock(m.text);
            return (
              <div
                key={idx}
                className={`flex items-start gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-md ${
                    m.role === "user"
                      ? "bg-amber-600/20 border-amber-500/40 text-amber-300"
                      : "border-stone-700 text-amber-400"
                  }`}
                  style={m.role === "model" ? {
                    backgroundColor: `${activePersona.themeColor}20`,
                    borderColor: `${activePersona.themeColor}50`,
                    color: activePersona.themeColor
                  } : {}}
                >
                  {m.role === "user" ? <User className="w-4 h-4" /> : <ActiveIcon className="w-4 h-4" />}
                </div>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm font-sans ${
                  m.role === "user"
                    ? "bg-amber-600 text-stone-950 font-medium rounded-tr-none shadow-md"
                    : "bg-stone-900/90 border border-stone-800 text-stone-200 rounded-tl-none shadow-xl"
                }`}>
                  <p className="leading-relaxed whitespace-pre-wrap">{displayText}</p>
                  {proposal && (
                    <div className="mt-4 pt-3 border-t border-stone-700/80 bg-stone-950/80 rounded-xl p-3.5 border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Federov Character Blueprint</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {proposal.style}
                        </span>
                      </div>
                      <div className="text-base font-bold text-stone-100 font-serif mb-0.5">
                        {proposal.name}
                      </div>
                      <div className="text-xs font-mono text-amber-400/90 mb-2">
                        Class: {proposal.classRole}
                      </div>
                      {proposal.lore && (
                        <p className="text-xs text-stone-300 leading-relaxed italic mb-2">
                          "{proposal.lore}"
                        </p>
                      )}
                      {proposal.inventory && (
                        <div className="text-[11px] font-mono text-stone-400 mb-3 bg-stone-900/90 p-2 rounded-lg border border-stone-800">
                          <span className="text-stone-300 font-bold uppercase">Gear:</span> {proposal.inventory}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleApplyToGenerator(proposal)}
                        className="w-full py-2 px-3 rounded-lg font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md hover:scale-[1.02] active:scale-98"
                        style={{ backgroundColor: "#c9a227", color: "#181102" }}
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>Apply Blueprint to Worldvision Generator</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  {m.groundingMetadata ? (
                    <div className="mt-3 pt-2 border-t border-stone-800 text-xs font-mono text-amber-400/80">
                      <div className="flex items-center gap-1.5 font-semibold text-[10px] uppercase tracking-wider text-amber-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                        Neural Grounding Verified
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl border flex items-center justify-center"
                style={{
                  backgroundColor: `${activePersona.themeColor}20`,
                  borderColor: `${activePersona.themeColor}50`,
                  color: activePersona.themeColor
                }}
              >
                <Activity className="w-4 h-4 animate-spin" />
              </div>
              <div
                className="bg-stone-900/90 border border-stone-800 rounded-2xl rounded-tl-none px-4 py-3 text-xs font-mono flex items-center gap-2"
                style={{ color: activePersona.themeColor }}
              >
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-3 animate-pulse" style={{ backgroundColor: activePersona.themeColor }}></span>
                  <span className="w-1.5 h-5 animate-pulse delay-75" style={{ backgroundColor: activePersona.themeColor }}></span>
                  <span className="w-1.5 h-2 animate-pulse delay-150" style={{ backgroundColor: activePersona.themeColor }}></span>
                  <span className="w-1.5 h-4 animate-pulse delay-200" style={{ backgroundColor: activePersona.themeColor }}></span>
                </div>
                <span>{activePersona.name} is weaving your character canon...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-4 py-2.5 bg-stone-900/80 border-t border-stone-800 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          <span
            className="text-[10px] font-mono uppercase tracking-wider shrink-0 flex items-center gap-1 font-bold"
            style={{ color: activePersona.themeColor }}
          >
            <Sparkles className="w-3 h-3" /> {activePersona.name}'s Prompts:
          </span>
          {activePersona.starterPills.map((pill) => (
            <button
              type="button"
              key={pill}
              onClick={() => handleSendText(pill)}
              disabled={loading}
              className="px-2.5 py-1 rounded-lg bg-stone-800/90 hover:bg-stone-700 text-stone-300 hover:text-amber-200 text-xs whitespace-nowrap border border-stone-700/60 transition disabled:opacity-50"
            >
              {pill}
            </button>
          ))}
        </div>

        <form onSubmit={handleSend} className="p-3 sm:p-4 bg-stone-950 border-t border-stone-800 flex items-center gap-2 sm:gap-3 shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${activePersona.name} to suggest characters, backstories, or hooks...`}
            className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-200 focus:outline-none focus:border-amber-500 font-sans"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="disabled:opacity-50 disabled:cursor-not-allowed px-5 py-3 rounded-xl font-bold font-mono text-xs flex items-center gap-2 shadow-lg transition-all shrink-0 hover:opacity-90 active:scale-95"
            style={{
              backgroundColor: activePersona.themeColor,
              color: "#0a0a0c"
            }}
          >
            <span>Consult</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
