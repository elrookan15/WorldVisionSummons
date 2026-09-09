import React, { useState, useRef, useEffect } from "react";
import { Sliders, X, Check, RefreshCcw, RotateCw, Sparkles, Upload, ArrowRight, Zap, Image as ImageIcon, ShieldAlert } from "lucide-react";
import { nanoBananaImageAdapter } from "../lib/providers/nanobanana";

interface ImageEditorModalProps {
  imageUrl: string;
  characterName: string;
  sheetStyle?: string;
  onSave: (newImageUrl: string) => void;
  onClose: () => void;
  onGenerateSimilar?: (promptExtension: string, refImage?: string | null) => Promise<void>;
}

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  imageUrl,
  characterName,
  sheetStyle = "Gothic Dark Fantasy",
  onSave,
  onClose,
  onGenerateSimilar
}) => {
  const [activeTab, setActiveTab] = useState<"sideBySide" | "canvasTuning">("sideBySide");

  // Filter Tuning
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [sepia, setSepia] = useState<number>(0);
  const [grayscale, setGrayscale] = useState<number>(0);
  const [blur, setBlur] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [cropAspect, setCropAspect] = useState<"1:1" | "3:4" | "16:9" | "free">("3:4");
  const [filterPreset, setFilterPreset] = useState<string>("normal");

  // AI & Reference Suite
  const [uploadedRefImage, setUploadedRefImage] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("blurry textures, malformed limbs, out of frame");
  const [refStrength, setRefStrength] = useState<number>(0.65);
  const [seed, setSeed] = useState<number>(42);
  const [synthesizedImage, setSynthesizedImage] = useState<string>(imageUrl);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [generationEngine, setGenerationEngine] = useState<string>("NanoBanana Neural V2");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewSrc, setPreviewSrc] = useState<string>(imageUrl);

  // Apply visual adjustments to canvas
  const applyFilters = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = synthesizedImage || imageUrl;
    img.onload = () => {
      let targetW = img.width;
      let targetH = img.height;

      if (cropAspect === "1:1") {
        const minDim = Math.min(targetW, targetH);
        targetW = minDim;
        targetH = minDim;
      } else if (cropAspect === "3:4") {
        targetH = (targetW * 4) / 3;
      } else if (cropAspect === "16:9") {
        targetH = (targetW * 9) / 16;
      }

      canvas.width = targetW;
      canvas.height = targetH;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) sepia(${sepia}%) grayscale(${grayscale}%) blur(${blur}px)`;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
      ctx.restore();

      setPreviewSrc(canvas.toDataURL("image/jpeg", 0.95));
    };
  };

  useEffect(() => {
    applyFilters();
  }, [brightness, contrast, saturation, sepia, grayscale, blur, zoom, rotation, cropAspect, synthesizedImage]);

  const handlePreset = (preset: string) => {
    setFilterPreset(preset);
    if (preset === "normal") {
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
      setSepia(0);
      setGrayscale(0);
      setBlur(0);
    } else if (preset === "gothic") {
      setBrightness(85);
      setContrast(130);
      setSaturation(80);
      setSepia(20);
      setGrayscale(25);
      setBlur(0);
    } else if (preset === "cyberpunk") {
      setBrightness(110);
      setContrast(140);
      setSaturation(160);
      setSepia(0);
      setGrayscale(0);
      setBlur(0);
    } else if (preset === "noir") {
      setBrightness(90);
      setContrast(160);
      setSaturation(0);
      setSepia(0);
      setGrayscale(100);
      setBlur(0);
    } else if (preset === "sepia") {
      setBrightness(95);
      setContrast(110);
      setSaturation(70);
      setSepia(75);
      setGrayscale(0);
      setBlur(0);
    }
  };

  const resetAll = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setSepia(0);
    setGrayscale(0);
    setBlur(0);
    setZoom(1);
    setRotation(0);
    setFilterPreset("normal");
  };

  // Drag and drop handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === "string") {
          setUploadedRefImage(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setUploadedRefImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Synthesize via NanoBanana Adapter
  const handleSynthesizeNanoBanana = async () => {
    setIsSynthesizing(true);
    const start = performance.now();

    try {
      const promptToUse = customPrompt.trim() 
        ? `${characterName}, ${sheetStyle} visual codex portrait, ${customPrompt}`
        : `${characterName}, ${sheetStyle} epic masterwork hero portrait`;

      const result = await nanoBananaImageAdapter.generateImage({
        prompt: promptToUse,
        negativePrompt: negativePrompt,
        style: sheetStyle,
        referenceImage: uploadedRefImage || undefined,
        seed: seed,
        idempotencyKey: `nanobanana_${Date.now()}`
      });

      const latency = Math.round(performance.now() - start);
      setLatencyMs(latency);

      if (result.data?.url) {
        setSynthesizedImage(result.data.url);
        setGenerationEngine(result.data.provider || "NanoBanana Neural Engine");
      }
    } catch (err) {
      console.error("Synthesis failed:", err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleCommitToCodex = () => {
    const canvas = canvasRef.current;
    if (canvas && activeTab === "canvasTuning") {
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      onSave(dataUrl);
    } else {
      onSave(synthesizedImage || previewSrc);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-stone-900 border border-stone-700 rounded-2xl max-w-5xl w-full p-6 shadow-2xl text-stone-100 flex flex-col gap-5 max-h-[94vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-stone-800 text-amber-400 border border-stone-700">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono text-amber-400 tracking-widest">NANOBANANA ASSET ADAPTER // CODEX STUDIO</span>
                {latencyMs !== null && (
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-stone-800 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3" /> {latencyMs}ms Latency
                  </span>
                )}
              </div>
              <h2 className="text-xl font-serif font-bold text-stone-100">Portrait Studio: {characterName}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-stone-950 border border-stone-800 rounded-lg p-0.5 text-xs font-mono">
              <button
                onClick={() => setActiveTab("sideBySide")}
                className={`px-3 py-1 rounded transition ${activeTab === "sideBySide" ? "bg-amber-500 text-stone-950 font-bold" : "text-stone-400 hover:text-stone-200"}`}
              >
                Comparison Pane
              </button>
              <button
                onClick={() => setActiveTab("canvasTuning")}
                className={`px-3 py-1 rounded transition ${activeTab === "canvasTuning" ? "bg-amber-500 text-stone-950 font-bold" : "text-stone-400 hover:text-stone-200"}`}
              >
                Tuning & Filters
              </button>
            </div>

            <button 
              onClick={onClose}
              className="text-stone-400 hover:text-stone-200 p-2 rounded-lg bg-stone-800 border border-stone-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Side-by-Side Comparison & Synthesis Pane */}
        {activeTab === "sideBySide" && (
          <div className="flex flex-col gap-4">
            
            {/* Side-by-Side Visual Stage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Left: Reference Specimen (Drag & Drop) */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
                onDragLeave={() => setIsDraggingOver(false)}
                onDrop={handleDrop}
                className={`bg-stone-950 border rounded-2xl p-4 flex flex-col items-center justify-center min-h-[360px] relative transition-all ${
                  isDraggingOver ? "border-amber-400 bg-amber-500/10" : "border-stone-800"
                }`}
              >
                <div className="absolute top-3 left-3 bg-stone-900/90 border border-stone-700 px-2.5 py-1 rounded text-[10px] font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-3 h-3" />
                  <span>Reference Specimen (Input)</span>
                </div>

                {uploadedRefImage ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-center mt-5">
                    <img 
                      src={uploadedRefImage} 
                      alt="Uploaded Reference" 
                      className="max-h-[300px] w-auto object-contain rounded-xl border border-stone-700 shadow-lg"
                    />
                    <button
                      onClick={() => setUploadedRefImage(null)}
                      className="mt-3 text-[11px] font-mono text-stone-400 hover:text-red-400 transition underline"
                    >
                      Remove Reference
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-6 flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-amber-400 shadow-inner">
                      <Upload className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-sm font-serif font-bold text-stone-200">Drag & Drop Reference Specimen</p>
                      <p className="text-xs text-stone-400 mt-1 max-w-[240px]">
                        Upload an illustration, photograph, or sketch to condition NanoBanana synthesis.
                      </p>
                    </div>
                    <label className="px-4 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 rounded-xl cursor-pointer text-xs font-mono text-stone-300 transition mt-2">
                      Browse Local Files
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                )}
              </div>

              {/* Right: Synthesized Codex Asset */}
              <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[360px] relative">
                <div className="absolute top-3 left-3 bg-stone-900/90 border border-stone-700 px-2.5 py-1 rounded text-[10px] font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Synthesized Codex Asset (Output)</span>
                </div>

                <div className="relative w-full h-full flex flex-col items-center justify-center mt-5">
                  <img 
                    src={synthesizedImage} 
                    alt="Synthesized Codex Asset" 
                    className="max-h-[300px] w-auto object-contain rounded-xl border border-stone-700 shadow-2xl"
                  />
                  <div className="mt-3 text-[11px] font-mono text-stone-400 flex items-center gap-2">
                    <span>Engine: <span className="text-stone-300">{generationEngine}</span></span>
                    <span>•</span>
                    <span>Style: <span className="text-amber-300">{sheetStyle}</span></span>
                  </div>
                </div>
              </div>

            </div>

            {/* AI Control Suite */}
            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 flex flex-col gap-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-stone-400 uppercase mb-1">
                    Prompt Tweaking
                  </label>
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="e.g., Heavy weathered bronze cuirass, glowing sapphire runes, battle-scarred"
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-stone-400 uppercase mb-1 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-red-400" />
                    Negative Prompt Constraints
                  </label>
                  <input
                    type="text"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="e.g., malformed hands, blurry textures, extra limbs, modern artifacts"
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-stone-900 text-xs font-mono">
                <div>
                  <div className="flex justify-between text-stone-400 mb-1">
                    <span>Reference Strength</span>
                    <span className="text-amber-400">{Math.round(refStrength * 100)}%</span>
                  </div>
                  <input 
                    type="range" min="0.1" max="0.9" step="0.05" value={refStrength} 
                    onChange={(e) => setRefStrength(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-stone-400 mb-1">
                    <span>Seed</span>
                    <span className="text-stone-300">{seed}</span>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="number" value={seed} 
                      onChange={(e) => setSeed(Number(e.target.value))}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2 py-1 text-xs text-stone-200 font-mono"
                    />
                    <button
                      onClick={() => setSeed(Math.floor(Math.random() * 999999))}
                      className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg border border-stone-700 text-xs font-mono"
                      title="Randomize Seed"
                    >
                      🎲
                    </button>
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleSynthesizeNanoBanana}
                    disabled={isSynthesizing}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 shadow-lg"
                  >
                    {isSynthesizing ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>Synthesize via NanoBanana</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Canvas Tuning & Filter Controls */}
        {activeTab === "canvasTuning" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Preview Stage */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center bg-stone-950 p-6 rounded-2xl border border-stone-800 relative min-h-[380px]">
              <div className="relative overflow-hidden rounded-xl border border-stone-700 shadow-2xl max-h-[420px] flex items-center justify-center">
                <img 
                  src={previewSrc} 
                  alt="Portrait Preview" 
                  className="object-contain max-h-[400px] rounded-lg transition-all"
                />
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Right Controls Panel */}
            <div className="lg:col-span-6 flex flex-col gap-4 bg-stone-950/60 p-5 rounded-2xl border border-stone-800">
              
              {/* Presets Bar */}
              <div>
                <label className="block text-xs font-mono uppercase text-stone-400 mb-2">Atmospheric Filter Presets</label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: "normal", label: "Normal" },
                    { id: "gothic", label: "Gothic" },
                    { id: "cyberpunk", label: "Cyber" },
                    { id: "noir", label: "Noir" },
                    { id: "sepia", label: "Sepia" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handlePreset(p.id)}
                      className={`py-1.5 px-1 rounded-lg text-xs font-semibold border transition-all ${
                        filterPreset === p.id 
                          ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md' 
                          : 'bg-stone-900 text-stone-300 border-stone-700 hover:bg-stone-800'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-stone-400">
                    <span>Brightness</span>
                    <span className="text-amber-400">{brightness}%</span>
                  </div>
                  <input 
                    type="range" min="50" max="150" value={brightness} 
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-stone-400">
                    <span>Contrast</span>
                    <span className="text-amber-400">{contrast}%</span>
                  </div>
                  <input 
                    type="range" min="50" max="150" value={contrast} 
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-stone-400">
                    <span>Saturation</span>
                    <span className="text-amber-400">{saturation}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="200" value={saturation} 
                    onChange={(e) => setSaturation(Number(e.target.value))}
                    className="accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-stone-400">
                    <span>Sepia Tone</span>
                    <span className="text-amber-400">{sepia}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" value={sepia} 
                    onChange={(e) => setSepia(Number(e.target.value))}
                    className="accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-stone-400">
                    <span>Grayscale</span>
                    <span className="text-amber-400">{grayscale}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" value={grayscale} 
                    onChange={(e) => setGrayscale(Number(e.target.value))}
                    className="accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-stone-400">
                    <span>Blur</span>
                    <span className="text-amber-400">{blur}px</span>
                  </div>
                  <input 
                    type="range" min="0" max="10" value={blur} 
                    onChange={(e) => setBlur(Number(e.target.value))}
                    className="accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Transform Controls */}
              <div className="border-t border-stone-800 pt-3 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-1.5">
                    {(["1:1", "3:4", "16:9", "free"] as const).map((asp) => (
                      <button
                        key={asp}
                        onClick={() => setCropAspect(asp)}
                        className={`px-2.5 py-1 rounded text-xs font-mono border transition-all ${
                          cropAspect === asp ? 'bg-amber-500 text-stone-950 font-bold border-amber-400' : 'bg-stone-900 text-stone-300 border-stone-700'
                        }`}
                      >
                        {asp}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="p-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg border border-stone-700 text-xs flex items-center gap-1"
                      title="Rotate 90deg"
                    >
                      <RotateCw className="w-3 h-3" />
                    </button>
                    <button
                      onClick={resetAll}
                      className="p-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg border border-stone-700 text-xs flex items-center gap-1"
                      title="Reset Filters"
                    >
                      <RefreshCcw className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Footer Actions */}
        <div className="border-t border-stone-800 pt-3 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-semibold transition-all"
          >
            Cancel
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCommitToCodex}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-extrabold transition-all shadow-lg flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Commit to Codex Asset</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ImageEditorModal;
