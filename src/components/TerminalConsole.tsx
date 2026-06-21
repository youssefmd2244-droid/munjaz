/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { SwarmLog } from "../types";
import { Terminal, Search, Trash2, ArrowRightLeft, Cpu, Settings } from "lucide-react";

interface TerminalConsoleProps {
  logs: SwarmLog[];
  onClearLogs: () => void;
  onAddLog: (message: string, level: "info" | "success" | "warn" | "error", nodeName: string) => void;
  evolutionStatus: {
    generation: number;
    mutationRate: number;
    lastOptimized: string;
    gain: number;
  };
  onOptimizeSystem: () => void;
  t: any;
  lang: string;
}

export default function TerminalConsole({
  logs,
  onClearLogs,
  onAddLog,
  evolutionStatus,
  onOptimizeSystem,
  t,
  lang
}: TerminalConsoleProps) {
  const [query, setQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom when logs receive updates
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const handleBrowserSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsScanning(true);
    onAddLog(
      lang === "ar"
        ? "جاري تهيئة سياق خيط زاحف ويب المتصفح الخفي..."
        : "Initializing StealthBrowser crawler thread context...",
      "info",
      "StealthBrowser"
    );

    setTimeout(() => {
      onAddLog(
        lang === "ar"
          ? `جاري تشغيل عملية كروميوم فرعية متخفية للاستعلام: "${query}"`
          : `Spawning incognito Chromium sub-process for query: "${query}"`,
        "info",
        "StealthBrowser"
      );
    }, 400);

    setTimeout(() => {
      onAddLog(
        lang === "ar"
          ? "تم الاستعلام بنجاح عن المصادر: [بحث جوجل، ويكيبيديا، بروكسي جيت هاب]"
          : "Successfully queried sources: [Google Search, Wikipedia, Github REST-Proxy]",
        "success",
        "StealthBrowser"
      );
    }, 1200);

    setTimeout(() => {
      const confidence = (Math.random() * (0.98 - 0.90) + 0.90).toFixed(4);
      onAddLog(
        lang === "ar"
          ? `تم جلب 12 إطارًا من البيانات الخام. تم فك التشفير والتوليف داخل ذاكرة SecretKeeper. مؤشر الثقة: ${confidence}`
          : `Retrieved 12 raw data frames. Decrypted and synthesized inside SecretKeeper memory. Confidence Index: ${confidence}`,
        "success",
        "ModelMother"
      );
      setIsScanning(false);
      setQuery("");
    }, 2200);
  };

  const getRandomCommandPlaceholder = () => {
    const suggestions = [
      "quantum encryption routines",
      "Vite full-stack bundler optimization",
      "ModelMother proxy parameters",
      "decentralized matrix ledger protocols",
      "self-evolution mutate thresholds"
    ];
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-2 border-b border-gray-850">
        <div>
          <h2 className="text-lg font-sans font-medium text-white tracking-tight flex items-center gap-2">
            <Terminal className="text-cyan-400 w-5 h-5 animate-pulse" /> {t.terminalTitle}
          </h2>
          <p className="text-xs text-gray-500 font-mono">{t.terminalSubtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Terminal log panel */}
        <div className="lg:col-span-2 flex flex-col space-y-3">
          <div className="flex justify-between items-center px-4 py-2 border border-gray-800 bg-gray-950/70 rounded-t-lg">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" /> {t.terminalStream}
            </span>

            <button
              onClick={onClearLogs}
              title={lang === "ar" ? "مسح سجلات الطرفية" : "Purge Stream Logs"}
              className="text-gray-500 hover:text-white flex items-center gap-1 text-[10px] font-mono cursor-pointer transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> {t.directPurge}
            </button>
          </div>

          <div className="bg-[#07080b] border border-t-0 border-gray-850 p-4 h-[350px] overflow-y-auto rounded-b-lg font-mono text-xs space-y-2 text-left scrollbar-thin select-all">
            {logs.map((log) => {
              const colorClass =
                log.level === "success"
                  ? "text-emerald-400"
                  : log.level === "warn"
                  ? "text-rose-400"
                  : log.level === "error"
                  ? "text-red-500 font-semibold"
                  : "text-cyan-300";

              return (
                <div key={log.id} className="leading-relaxed hover:bg-gray-900/40 p-1 rounded transition">
                  <span className="text-gray-600 block sm:inline mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className="text-gray-500 font-semibold uppercase tracking-wider mr-1.5">[{log.nodeName}]</span>
                  <span className={colorClass}>{log.message}</span>
                </div>
              );
            })}
            <div ref={terminalEndRef} />
          </div>
        </div>

        {/* Autonomous Crawler and Evolution Settings */}
        <div className="space-y-6">
          {/* Stealth crawler form */}
          <div className="bg-[#111318]/90 border border-gray-800 rounded-lg p-5 space-y-4 text-left">
            <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" /> {t.stealthController}
            </h3>

            <p className="text-xs text-gray-400 leading-relaxed font-sans font-normal">
              {t.stealthDesc}
            </p>

            <form onSubmit={handleBrowserSearch} className="space-y-3">
              <input
                type="text"
                required
                disabled={isScanning}
                placeholder={lang === "ar" ? `طلب فحص: "${getRandomCommandPlaceholder()}"` : `Search query: "${getRandomCommandPlaceholder()}"`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full text-xs font-mono bg-[#0c0d12] border border-gray-800 rounded px-2.5 py-2 text-white outline-none focus:border-cyan-500 transition"
              />

              <button
                type="submit"
                disabled={isScanning || !query.trim()}
                className="w-full py-2 bg-cyan-500 hover:bg-cyan-455 text-black font-semibold font-mono text-xs rounded transition flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-gray-900 disabled:text-gray-600"
              >
                {isScanning ? (
                  <>
                    <Terminal className="w-3.5 h-3.5 animate-spin" /> {t.executingScan}
                  </>
                ) : (
                  <>{t.spawnStealth}</>
                )}
              </button>
            </form>
          </div>

          {/* Self-Evolve metrics block */}
          <div className="bg-[#111318]/90 border border-gray-800 rounded-lg p-5 space-y-4 text-left">
            <h3 className="text-xs font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400 animate-pulse" /> {t.swarmMutationStatus}
            </h3>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex justify-between border-b border-gray-850 pb-1">
                <span className="text-gray-500">{t.nodeGeneration}</span>
                <span className="text-white">v{evolutionStatus.generation}.0 ({lang === "ar" ? "غير محدود" : "Unbounded"})</span>
              </div>
              <div className="flex justify-between border-b border-gray-850 pb-1">
                <span className="text-gray-500">{t.mutationRate}</span>
                <span className="text-white">{(evolutionStatus.mutationRate * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between border-b border-gray-850 pb-1">
                <span className="text-gray-500">{t.performanceGain}</span>
                <span className="text-emerald-400 font-semibold">+{evolutionStatus.gain.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-[11px] pt-1">
                <span className="text-gray-500">{t.lastMutated}</span>
                <span className="text-white truncate max-w-32">{new Date(evolutionStatus.lastOptimized).toLocaleTimeString()}</span>
              </div>
            </div>

            <button
              onClick={onOptimizeSystem}
              className="w-full py-2 border border-emerald-800/60 bg-emerald-950/25 text-emerald-400 text-xs font-mono rounded hover:bg-emerald-900/40 transition cursor-pointer"
            >
              {t.optimizeBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
