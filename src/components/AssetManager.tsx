/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { SwarmAsset } from "../types";
import {
  Folder,
  FileCode,
  FileText,
  Table,
  Sparkles,
  Download,
  Trash2,
  ChevronRight,
  Send,
  Loader2,
  Eye,
  Check,
  Music,
  Maximize2,
  Play,
  Pause,
  RotateCcw,
  Film,
  Volume2
} from "lucide-react";

interface AssetManagerProps {
  assets: SwarmAsset[];
  onUpdateAssets: (assets: SwarmAsset[]) => void;
  onAddLog: (message: string, level: "info" | "success" | "warn" | "error", nodeName: string) => void;
  t: any;
  lang: string;
}

export default function AssetManager({ assets, onUpdateAssets, onAddLog, t, lang }: AssetManagerProps) {
  const [selectedAsset, setSelectedAsset] = useState<SwarmAsset | null>(assets[0] || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState<"code" | "document" | "spreadsheet" | "vector" | "audio" | "video">("code");
  const [fileName, setFileName] = useState("");

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [isSavedText, setIsSavedText] = useState(false);

  // Live video player simulation state
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(false);

  React.useEffect(() => {
    let interval: any = null;
    if (videoPlaying && selectedAsset && selectedAsset.category === "video") {
      try {
        const data = JSON.parse(selectedAsset.content);
        const scenes = data.scenes || [];
        if (scenes.length > 0) {
          interval = setInterval(() => {
            setCurrentSceneIndex((prev) => {
              if (prev >= scenes.length - 1) {
                return 0;
              }
              return prev + 1;
            });

            if (audioEnabled) {
              const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
              if (AudioContextClass) {
                const audioCtx = new AudioContextClass();
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);

                const notes = [130.81, 146.83, 164.81, 196.00, 220.00, 261.63];
                const note = notes[Math.floor(Math.random() * notes.length)];
                osc.frequency.setValueAtTime(note, audioCtx.currentTime);

                gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);

                osc.start();
                osc.stop(audioCtx.currentTime + 1.2);
              }
            }
          }, 4000);
        }
      } catch (e) {
        // Invalid JSON storyboard structure
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [videoPlaying, selectedAsset, audioEnabled]);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "code":
        return <FileCode className="text-cyan-400 w-4 h-4" />;
      case "spreadsheet":
        return <Table className="text-emerald-400 w-4 h-4" />;
      case "pdf":
      case "document":
        return <FileText className="text-violet-400 w-4 h-4" />;
      case "vector":
        return <Sparkles className="text-pink-400 w-4 h-4" />;
      case "audio":
        return <Music className="text-amber-400 w-4 h-4" />;
      case "video":
        return <Film className="text-rose-400 w-4 h-4" />;
      default:
        return <Folder className="text-gray-400 w-4 h-4" />;
    }
  };

  const triggerSearchRefinePlaceholder = () => {
    if (category === "code" && !fileName) {
      setFileName(`swarm_script_${Date.now().toString().slice(-4)}.py`);
    } else if (category === "spreadsheet" && !fileName) {
      setFileName(`operations_${Date.now().toString().slice(-4)}.csv`);
    } else if (category === "document" && !fileName) {
      setFileName(`handbook_${Date.now().toString().slice(-4)}.md`);
    } else if (category === "vector" && !fileName) {
      setFileName(`logo_${Date.now().toString().slice(-4)}.svg`);
    } else if (category === "audio" && !fileName) {
      setFileName(`synth_layout_${Date.now().toString().slice(-4)}.midi`);
    } else if (category === "video" && !fileName) {
      setFileName(`video_storyboard_${Date.now().toString().slice(-4)}.json`);
    }
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    let nameOfFile = fileName.trim();
    if (!nameOfFile) {
      const ext =
        category === "code"
          ? "py"
          : category === "spreadsheet"
          ? "csv"
          : category === "document"
          ? "md"
          : category === "vector"
          ? "svg"
          : category === "video"
          ? "json"
          : "midi";
      nameOfFile = `swarm_node_${Math.floor(Math.random() * 900 + 100)}.${ext}`;
    }

    onAddLog(
      lang === "ar"
        ? `جاري شحن أوامر التوليد للأصل "${nameOfFile}" إلى مصفوفة السرب...`
        : `Dispatched generation directives for "${nameOfFile}" to Swarm Core...`,
      "info",
      "ModelMother"
    );

    try {
      const response = await fetch("/api/swarm/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          category: category,
          fileName: nameOfFile
        })
      });

      const data = await response.json();
      if (data.success) {
        onUpdateAssets(data.state.assets);
        onAddLog(
          lang === "ar"
            ? `تم بنجاح تجميع وحفظ الحالة للأصل "${nameOfFile}"!`
            : `Successfully compiled and stored state for "${nameOfFile}"!`,
          "success",
          "SelfEvolutionEngine"
        );
        setSelectedAsset(data.asset);
        setEditText(data.asset.content);

        // Reset
        setPrompt("");
        setFileName("");
      } else {
        throw new Error(data.error || "Generation mismatch");
      }
    } catch (err: any) {
      onAddLog(
        lang === "ar"
          ? `فشل التجميع الأساسي: ${err.message || "خطأ مصفوفة الخادم"}`
          : `Failed core compile: ${err.message || "Endpoint error fallback"}`,
        "error",
        "ModelMother"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteAsset = (id: string, name: string) => {
    const updated = assets.filter(a => a.id !== id);
    onUpdateAssets(updated);
    onAddLog(
      lang === "ar"
        ? `تم مسح ملف الأصل الرقمي: "${name}"`
        : `Purged digital resource file: "${name}"`,
      "warn",
      "System"
    );
    if (selectedAsset?.id === id) {
      setSelectedAsset(updated[0] || null);
    }
  };

  const handleDownloadAsset = (asset: SwarmAsset) => {
    const blob = new Blob([asset.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = asset.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onAddLog(
      lang === "ar"
        ? `تم تنزيل حمولة الملف "${asset.fileName}" بنجاح على جهاز المستخدم.`
        : `Downloaded payload for "${asset.fileName}" directly to user download tree.`,
      "success",
      "System"
    );
  };

  const handleSaveEdit = () => {
    if (!selectedAsset) return;
    const updated = assets.map(a => {
      if (a.id === selectedAsset.id) {
        return {
          ...a,
          content: editText,
          fileSize: `${(new Blob([editText]).size / 1024).toFixed(1)} KB`
        };
      }
      return a;
    });
    onUpdateAssets(updated);
    const matched = updated.find(a => a.id === selectedAsset.id);
    if (matched) setSelectedAsset(matched);

    setIsSavedText(true);
    setTimeout(() => setIsSavedText(false), 2000);
    onAddLog(
      lang === "ar"
        ? `تم دمج وحفظ التعديلات اليدوية لـ "${selectedAsset.fileName}" على القرص.`
        : `Committed manual text revisions to disk for "${selectedAsset.fileName}".`,
      "info",
      "System"
    );
  };

  const renderContentPreview = () => {
    if (!selectedAsset) return null;

    if (selectedAsset.category === "vector") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
          {/* SVG Visual Render in realtime */}
          <div className="bg-gray-950 rounded border border-gray-900 flex flex-col items-center justify-center p-4 min-h-[300px]">
            <span className="text-[10px] font-mono text-gray-500 mb-2 uppercase select-none tracking-widest">Interactive Vector Canvas Frame</span>
            <div
              className="w-full max-w-[280px] aspect-square flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: selectedAsset.content }}
            />
          </div>

          {/* SVG Code Editor Node */}
          <div className="flex flex-col h-full">
            <span className="text-[10px] font-mono text-gray-500 mb-1.5 block">Vector Source (XML Elements)</span>
            <textarea
              className="w-full flex-grow text-xs font-mono bg-gray-950 border border-gray-900 rounded p-3 text-cyan-400 outline-none focus:border-cyan-800 transition resize-none h-64 md:h-full"
              value={isEditing ? editText : selectedAsset.content}
              onChange={(e) => {
                setIsEditing(true);
                setEditText(e.target.value);
              }}
            />
          </div>
        </div>
      );
    }

    if (selectedAsset.category === "spreadsheet") {
      const rows = selectedAsset.content.trim().split("\n");
      const tableData = rows.map((r) => r.split(","));
      const headers = tableData[0] || [];
      const cells = tableData.slice(1);

      return (
        <div className="space-y-4">
          <div className="bg-gray-950 border border-gray-900 rounded-lg overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-gray-900/60 border-b border-gray-800">
                  {headers.map((h, idx) => (
                    <th key={idx} className="p-2.5 text-gray-400 font-semibold border-r border-gray-800/60 font-mono">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cells.map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-b border-gray-800/40 hover:bg-gray-905">
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="p-2 border-r border-gray-800/40 text-gray-300">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-gray-500 mb-1">CSV Source Grid</span>
            <textarea
              className="w-full text-xs font-mono bg-gray-950 border border-gray-950 rounded p-3 text-emerald-400 outline-none focus:border-emerald-800 transition resize-none h-32"
              value={isEditing ? editText : selectedAsset.content}
              onChange={(e) => {
                setIsEditing(true);
                setEditText(e.target.value);
              }}
            />
          </div>
        </div>
      );
    }

    if (selectedAsset.category === "video") {
      let videoData: any = { title: "Synthetic Video Board", scenes: [] };
      try {
        videoData = JSON.parse(selectedAsset.content);
      } catch (err) {
        // Fallback or parsing error
      }

      const scenes = videoData.scenes || [];
      const currentScene = scenes[currentSceneIndex] || scenes[0] || {
        text: "Video Scene Placeholder",
        subtitle: "Awaiting synthesis configuration...",
        backdrop: "linear-gradient(135deg, #0f172a, #111827)",
        accentColor: "#06b6d4"
      };

      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Realtime high-performance Video Canvas Simulation Frame */}
            <div className="md:col-span-2 flex flex-col space-y-3">
              <div 
                style={{ background: currentScene.backdrop || "linear-gradient(135deg, #0f172a, #191f35)" }}
                className="w-full aspect-[16/9] rounded-lg border border-gray-800 flex flex-col items-center justify-between p-6 relative overflow-hidden shadow-2xl transition-all duration-700 select-none"
              >
                {/* Tech info watermark */}
                <div className="w-full flex justify-between items-center text-[9px] font-mono text-gray-500/80 uppercase">
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" /> 
                    {lang === "ar" ? "معاينة الفيديو الاصطناعي" : "Synthetic Video Monitor"}
                  </span>
                  <span>{currentSceneIndex + 1} / {scenes.length || 1} • {currentScene.style || "ambient"}</span>
                </div>

                {/* Central main typography display */}
                <div className="text-center my-auto px-4 z-10">
                  <h1 
                    style={{ color: currentScene.accentColor || "#fff" }}
                    className="text-lg md:text-2xl font-sans tracking-tight font-extrabold drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
                  >
                    {currentScene.text}
                  </h1>
                </div>

                {/* Subtitle Teletext strip */}
                <div className="w-full bg-black/85 border border-white/5 p-3 rounded text-center z-10">
                  <p className="text-xs font-sans text-gray-300 font-normal leading-normal">
                    {currentScene.subtitle}
                  </p>
                </div>

                {/* Grid scan visual overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.4))] pointer-events-none" />
              </div>

              {/* Player deck controls bar */}
              <div className="flex justify-between items-center p-3.5 bg-gray-950 rounded-lg border border-gray-900">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setVideoPlaying(!videoPlaying)}
                    className="p-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-black font-semibold transition cursor-pointer flex items-center justify-center shadow-lg"
                    title={videoPlaying ? "Pause Playback" : "Start Playback"}
                  >
                    {videoPlaying ? <Pause className="w-4 h-4 text-black font-bold" /> : <Play className="w-4 h-4 text-black font-bold" />}
                  </button>

                  <button
                    onClick={() => {
                      setVideoPlaying(false);
                      setCurrentSceneIndex(0);
                    }}
                    className="p-2.5 rounded-full bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition cursor-pointer"
                    title="Rewind Timeline"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className={`p-2.5 rounded-full border transition cursor-pointer ${
                      audioEnabled 
                        ? "bg-rose-950/40 border-rose-800 text-rose-400" 
                        : "bg-gray-900 border-gray-800 text-gray-500 hover:text-gray-300"
                    }`}
                    title={audioEnabled ? "Disable Swarm Synth Audio" : "Play MIDI Synth Stream Ambient Track"}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2.5 font-mono text-xs text-gray-500">
                  <span>Scene {currentSceneIndex + 1}</span>
                  <div className="w-24 bg-gray-900 h-1.5 rounded-full overflow-hidden border border-gray-850">
                    <div 
                      style={{ width: `${((currentSceneIndex + 1) / (scenes.length || 1)) * 100}%` }}
                      className="bg-rose-500 h-full transition-all duration-500"
                    />
                  </div>
                  <span>{videoPlaying ? "PLAYING" : "PAUSED"}</span>
                </div>
              </div>
            </div>

            {/* Video scene selector deck side card */}
            <div className="bg-[#0b0c10] rounded-lg border border-gray-900 p-4 space-y-3.5 text-left flex flex-col h-[270px] md:h-auto overflow-y-auto">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block border-b border-gray-900 pb-2">
                Storyboard Scene Matrix ({scenes.length || 0} clips)
              </span>

              <div className="space-y-2 overflow-y-auto flex-grow pr-1">
                {scenes.map((sc: any, index: number) => (
                  <div
                    key={index}
                    onClick={() => {
                      setCurrentSceneIndex(index);
                      setVideoPlaying(false);
                    }}
                    style={{ borderLeftColor: currentSceneIndex === index ? sc.accentColor : "transparent" }}
                    className={`p-2.5 rounded border border-l-4 text-left cursor-pointer transition ${
                      currentSceneIndex === index 
                        ? "bg-rose-950/15 border-rose-900 text-rose-400 font-bold" 
                        : "bg-gray-950/75 border-gray-900 text-gray-400 hover:bg-gray-900 hover:border-gray-800"
                    }`}
                  >
                    <p className="text-[11px] font-mono font-bold text-white truncate">{sc.text}</p>
                    <p className="text-[9.5px] font-sans text-gray-500 truncate mt-0.5">{sc.subtitle}</p>
                    <p className="text-[8.5px] font-mono text-gray-500 mt-1">{sc.duration}s • {sc.style.toUpperCase()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col text-left">
            <span className="text-[10px] font-mono text-gray-500 mb-1">Storyboard JSON Configuration mapping</span>
            <textarea
              className="w-full text-xs font-mono bg-gray-950 border border-gray-900 rounded p-3 text-rose-400 outline-none focus:border-rose-900 transition resize-none h-32"
              value={isEditing ? editText : selectedAsset.content}
              onChange={(e) => {
                setIsEditing(true);
                setEditText(e.target.value);
              }}
            />
          </div>
        </div>
      );
    }

    return (
      <textarea
        className="w-full h-[360px] text-xs font-mono bg-gray-950 border border-gray-900 rounded-lg p-3.5 text-gray-300 outline-none focus:border-cyan-800 transition"
        value={isEditing ? editText : selectedAsset.content}
        onChange={(e) => {
          setIsEditing(true);
          setEditText(e.target.value);
        }}
      />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-2 border-b border-gray-805">
        <div>
          <h2 className="text-lg font-sans font-medium text-white tracking-tight flex items-center gap-2">
            <Folder className="text-yellow-500 w-5 h-5 animate-pulse" /> {t.assetVaultTitle}
          </h2>
          <p className="text-xs text-gray-500 font-mono">{t.assetVaultSubtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Swarm Asset Factory Generator and File list Side panel */}
        <div className="space-y-6 lg:col-span-1 border-r border-transparent">
          {/* Factory Form */}
          <div className="bg-[#111318]/90 border border-gray-800 rounded-lg p-5 space-y-4 text-left">
            <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" /> {t.factoryTitle}
            </h3>

            <form onSubmit={handleCreateAsset} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-mono text-gray-400 mb-1">{t.generationGoal}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  onClick={triggerSearchRefinePlaceholder}
                  className="w-full text-xs font-mono bg-[#0c0d12] border border-gray-800 rounded px-2.5 py-2 text-white outline-none focus:border-cyan-500 transition"
                >
                  <option value="code">{t.executableScript}</option>
                  <option value="spreadsheet">{t.budgetCSV}</option>
                  <option value="document">{t.reportHandbook}</option>
                  <option value="vector">{t.scalableSvg}</option>
                  <option value="audio">{t.midisAmbient}</option>
                  <option value="video">{lang === "ar" ? "مؤشر حبل فيديو اصطناعي (.mp4 / .json)" : "Synthetic Video Layout (.mp4)"}</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-400 mb-1">{t.fileDesignation}</label>
                <input
                  type="text"
                  placeholder={lang === "ar" ? "مثال: movie.json (سيتم الإنشاء تلقائيًا إن ترك فارغًا)" : "e.g. movie.json (Auto-fallback if empty)"}
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full text-xs font-mono bg-[#0c0d12] border border-gray-800 rounded px-2.5 py-2 text-white outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-400 mb-1">{t.promptDirectives}</label>
                <textarea
                  required
                  rows={3}
                  placeholder={
                    category === "code"
                      ? "Create an automated logger database schema backup task..."
                      : category === "spreadsheet"
                      ? "Make a tabular cost projections for AI hardware nodes and cloud storage..."
                      : category === "video"
                      ? (lang === "ar" ? "صمم مقطورة مذهلة لفيلم خيال علمي قصير يستعرض السرب الذاتي التطور..." : "Design a cinematic intro trailer storyboard for the self-evolving swarm...")
                      : "Provide a detailed system handbook directive list for security operators..."
                  }
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full text-xs font-mono bg-[#0c0d12] border border-gray-800 rounded px-2.5 py-2 text-white outline-none focus:border-cyan-500 transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-900 disabled:text-gray-600 border border-cyan-400/20 text-black font-semibold font-mono rounded transition cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> {t.compilingMatrix}
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> {t.launchCompiler}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Asset List */}
          <div className="bg-[#111318]/90 border border-gray-800 rounded-lg p-4 space-y-3 text-left">
            <h4 className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">{t.documentIndex} ({assets.length})</h4>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => {
                    setSelectedAsset(asset);
                    setEditText(asset.content);
                    setIsEditing(false);
                  }}
                  className={`flex items-center justify-between p-2.5 rounded border text-left cursor-pointer transition ${
                    selectedAsset?.id === asset.id
                      ? "bg-cyan-950/25 border-cyan-800"
                      : "bg-[#0c0d12]/60 border-gray-800/80 hover:bg-gray-900 hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {getCategoryIcon(asset.category)}
                    <div className="min-w-0">
                      <span className="text-xs font-mono text-white truncate block">{asset.fileName}</span>
                      <span className="text-[9px] font-mono text-gray-500 tracking-wider">
                        {asset.fileSize} • {asset.category.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Central File contents Panel */}
        <div className="lg:col-span-2 bg-[#111318]/90 border border-gray-800 rounded-lg p-5 flex flex-col justify-between">
          {selectedAsset ? (
            <div className="h-full flex flex-col justify-between space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-3 border-b border-gray-850 gap-2 text-left">
                <div className="flex items-center gap-3">
                  <div className="bg-cyan-950/40 p-2 rounded border border-cyan-800/40">
                    {getCategoryIcon(selectedAsset.category)}
                  </div>
                  <div>
                    <h3 className="text-sm font-mono text-white flex items-center gap-2 font-medium">
                      {selectedAsset.fileName}
                    </h3>
                    <p className="text-[10.5px] text-gray-400 font-mono mt-0.5 leading-relaxed">
                      {selectedAsset.description || (lang === "ar" ? "مخطط عمل مجمع للسرب الرقمي." : "Synthesised workflow blueprint.")}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto justify-end">
                  <button
                    onClick={() => handleDeleteAsset(selectedAsset.id, selectedAsset.fileName)}
                    className="p-1 px-2 text-[10px] rounded bg-red-950/20 border border-red-900/30 text-red-400 hover:bg-red-900/45 font-mono flex items-center gap-1 transition cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> {t.delete}
                  </button>

                  <button
                    onClick={() => handleDownloadAsset(selectedAsset)}
                    className="p-1 px-2.5 text-[10px] rounded bg-cyan-950/45 border border-cyan-800 text-cyan-300 hover:bg-cyan-900 font-mono flex items-center gap-1 transition cursor-pointer"
                  >
                    <Download className="w-3 h-3" /> {t.fetchPayload}
                  </button>
                </div>
              </div>

              {/* Central render */}
              <div className="flex-grow min-h-[300px] text-left">
                {renderContentPreview()}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-855">
                <span className="text-[10px] font-mono text-gray-500">
                  {lang === "ar" ? "تم تجميعه في" : "Compiled on"} {new Date(selectedAsset.createdAt).toLocaleDateString()} {lang === "ar" ? "الساعة" : "at"} {new Date(selectedAsset.createdAt).toLocaleTimeString()}
                </span>

                <div className="flex items-center gap-2">
                  {isEditing && (
                    <button
                      onClick={() => {
                        setEditText(selectedAsset.content);
                        setIsEditing(false);
                      }}
                      className="px-3 py-1 text-[11px] font-mono text-gray-500 hover:text-white transition cursor-pointer"
                    >
                      {t.revertChange}
                    </button>
                  )}

                  <button
                    onClick={handleSaveEdit}
                    disabled={!isEditing}
                    className="flex items-center gap-1 px-4 py-1.5 text-xs font-mono font-semibold rounded bg-cyan-500 disabled:bg-gray-900 disabled:text-gray-600 disabled:border-transparent text-black border border-cyan-400/20 transition hover:bg-cyan-400 cursor-pointer"
                  >
                    {isSavedText ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-black" /> {t.stateSyncedBtn}
                      </>
                    ) : (
                      <>{t.commitRevisions}</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center p-12 space-y-4 text-gray-500">
              <Folder className="w-12 h-12 text-gray-700 animate-pulse" />
              <div>
                <p className="text-sm font-mono text-white">{t.workspaceEmpty}</p>
                <p className="text-xs font-mono text-gray-500 mt-1 max-w-sm">{t.workspaceEmptyDesc}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
