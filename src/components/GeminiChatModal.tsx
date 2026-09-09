import React, { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Bot, User, Copy, Check, Shield, Activity } from "lucide-react";

interface Message {
  role: "user" | "model";
  text: string;
  groundingMetadata?: any;
}

interface GeminiChatModalProps {
  onClose: () => void;
  characterContext?: any;
}

export default function GeminiChatModal({ onClose, characterContext }: GeminiChatModalProps) {
  const charName = characterContext?.name || characterContext?.character_name || "The Summoned Entity";
  const charClass = characterContext?.overview?.classRole || characterContext?.character_class || "Operative";
  const sheetStyle = characterContext?.sheet_style || "Gothic Dark Fantasy";
  const avatarUrl = characterContext?.imageUrl;
  const oath = characterContext?.lore?.motivations || characterContext?.signature_attributes?.virtue || characterContext?.personality?.ideals || "Unyielding guardian of the borderlands";

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: `Hail, traveler. I am ${charName}, ${charClass}. The veil of ${sheetStyle} is heavy upon us, but my oath remains unbroken. What counsel or tactical directive do you seek?`
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          characterContext,
          stochasticSeed: Math.floor(Math.random() * 1000000)
        })
      });

      const data = await res.json();
      if (data.reply) {
        setMessages([...newMessages, { role: "model", text: data.reply, groundingMetadata: data.groundingMetadata }]);
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
      .map((m) => `[${m.role === "user" ? "SUMMONER" : charName.toUpperCase()}]: ${m.text}`)
      .join("\n\n");
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Quick prompt pills specified in C-TRACES-GOAL specification
  const quickPromptPills = [
    "What is your active oath?",
    "How do you handle an ambush in this sector?",
    "What is your primary vice?",
    "Explain the relics in your pack"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-stone-950 border border-amber-500/40 rounded-2xl w-full max-w-2xl h-[640px] flex flex-col shadow-[0_0_50px_rgba(245,158,11,0.2)] overflow-hidden">
        
        {/* Tactical Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border-b border-stone-800 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={charName} 
                className="w-11 h-11 rounded-xl object-cover border border-amber-500/40 shadow-inner"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner relative">
                <Shield className="w-5 h-5 animate-pulse" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-sm font-bold text-stone-100 tracking-wider uppercase">{charName}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                  {charClass}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-stone-400 font-sans truncate max-w-[280px]">
                  Oath: <span className="text-amber-200/90 italic">{oath}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyTranscript}
              title="Copy conversation transcript"
              className="p-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-200 transition-colors flex items-center gap-1 text-xs font-mono"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? "Copied" : "Transcript"}</span>
            </button>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 flex items-center justify-center text-stone-400 hover:text-stone-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-900/40 via-stone-950 to-stone-950">
          {messages.map((m, idx) => (
            <div 
              key={idx} 
              className={`flex items-start gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                m.role === "user" 
                  ? "bg-amber-600/20 border-amber-500/40 text-amber-300" 
                  : "bg-stone-900 border-stone-700 text-amber-400 shadow-lg"
              }`}>
                {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm font-sans ${
                m.role === "user"
                  ? "bg-amber-600 text-stone-950 font-medium rounded-tr-none shadow-md"
                  : "bg-stone-900/90 border border-stone-800 text-stone-200 rounded-tl-none shadow-lg"
              }`}>
                <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                {m.groundingMetadata && (
                  <div className="mt-3 pt-2.5 border-t border-stone-800 text-xs font-mono text-amber-400/80">
                    <div className="flex items-center gap-1.5 mb-1 font-semibold text-[10px] uppercase tracking-wider text-amber-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                      Neural Research Grounded
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-700 flex items-center justify-center text-amber-400">
                <Activity className="w-4 h-4 animate-spin text-amber-400" />
              </div>
              <div className="bg-stone-900/90 border border-stone-800 rounded-2xl rounded-tl-none px-4 py-3 text-xs font-mono text-amber-400/80 flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-3 bg-amber-400 animate-pulse"></span>
                  <span className="w-1.5 h-5 bg-amber-400 animate-pulse delay-75"></span>
                  <span className="w-1.5 h-2 bg-amber-400 animate-pulse delay-150"></span>
                  <span className="w-1.5 h-4 bg-amber-400 animate-pulse delay-200"></span>
                </div>
                <span>{charName} is weighing their oath and steel...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompt Pills */}
        <div className="px-4 py-2.5 bg-stone-900/70 border-t border-stone-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-mono text-amber-400/80 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Quick Prompts:
          </span>
          {quickPromptPills.map((p, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handleSendText(p)}
              disabled={loading}
              className="px-2.5 py-1 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-amber-200 text-xs whitespace-nowrap border border-stone-700/60 transition disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-4 bg-stone-950 border-t border-stone-800 flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Converse with ${charName} (lore, tactics, vice, or relics)...`}
            className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-200 focus:outline-none focus:border-amber-500 font-sans"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-stone-950 px-5 py-3 rounded-xl font-bold font-mono text-xs flex items-center gap-2 shadow-lg transition-all"
          >
            <span>Transmit</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
}
