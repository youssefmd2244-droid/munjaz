/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SwarmState, SwarmNode, SwarmAsset, SwarmLog, SecretKey } from "./types";
import SwarmNodeGrid from "./components/SwarmNodeGrid";
import AssetManager from "./components/AssetManager";
import TerminalConsole from "./components/TerminalConsole";
import SecretsVault from "./components/SecretsVault";
import { translations } from "./translations";
import {
  Cpu,
  FolderOpen,
  Terminal,
  Shield,
  Activity,
  Maximize2,
  RefreshCw,
  Clock,
  HardDrive,
  Globe
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"nodes" | "assets" | "terminal" | "security">("nodes");
  const [syncStatus, setSyncStatus] = useState<"syncing" | "synced" | "offline">("synced");
  const [offlineBackup, setOfflineBackup] = useState(false);
  const [lang, setLang] = useState<"en" | "ar">(() => {
    return (localStorage.getItem("swarm_language") as "en" | "ar") || "en";
  });

  const t = translations[lang];

  // Set RTL direction on doc root
  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    localStorage.setItem("swarm_language", lang);
  }, [lang]);

  // Initialize fully featured fallback state in case API isn't ready
  const [state, setState] = useState<SwarmState>({
    nodes: [],
    assets: [],
    logs: [],
    secrets: [],
    evolutionStatus: {
      generation: 9,
      mutationRate: 0.15,
      lastOptimized: new Date().toISOString(),
      gain: 24.5
    }
  });

  // Read state on boot: Load from LocalStorage first, then merge with API in background
  useEffect(() => {
    const cached = localStorage.getItem("swarm_local_data");
    let hasLoadedCache = false;

    if (cached) {
      try {
        const loaded = JSON.parse(cached);
        if (loaded.nodes && loaded.assets) {
          setState(loaded);
          hasLoadedCache = true;
        }
      } catch (err) {
        console.warn("Local cache corrupt, reading from master DB...");
      }
    }

    const fetchStateFromMaster = async () => {
      setSyncStatus("syncing");
      try {
        const res = await fetch("/api/swarm/state");
        if (!res.ok) throw new Error("API unlinked");
        const data = await res.json();

        if (data && data.nodes) {
          setState((prev) => {
            // Merge logic: favor state on disk if we have newer asset creations offline
            if (hasLoadedCache && prev.assets.length > data.assets.length) {
              // Sync our newer cached state up to the server
              syncStateToMaster(prev);
              return prev;
            }
            // Save server version to storage
            localStorage.setItem("swarm_local_data", JSON.stringify(data));
            return data;
          });
          setSyncStatus("synced");
          setOfflineBackup(false);
        }
      } catch (error) {
        console.warn("Express Server API is currently unreachable. Relying on host local-buffer storage.");
        setSyncStatus("offline");
        setOfflineBackup(true);
      }
    };

    fetchStateFromMaster();
  }, []);

  // Utility to write custom state back to host Express DB
  const syncStateToMaster = async (targetState: SwarmState) => {
    try {
      setSyncStatus("syncing");
      const res = await fetch("/api/swarm/state/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(targetState)
      });
      if (res.ok) {
        setSyncStatus("synced");
      } else {
        setSyncStatus("offline");
      }
    } catch {
      setSyncStatus("offline");
    }
  };

  // State Updates Orchestrator
  const handleUpdate = (updater: Partial<SwarmState>) => {
    setState((prev) => {
      const next = { ...prev, ...updater };
      // Always store locally to meet 'never lost on refresh' criteria
      localStorage.setItem("swarm_local_data", JSON.stringify(next));
      // Background push to node disk database
      syncStateToMaster(next);
      return next;
    });
  };

  // Helper inside client to push logs
  const handleAddLogClient = (
    message: string,
    level: "info" | "success" | "warn" | "error",
    nodeName: string
  ) => {
    const newLog: SwarmLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(4, 9)}`,
      timestamp: new Date().toISOString(),
      level,
      nodeName,
      message
    };
    handleUpdate({ logs: [newLog, ...state.logs] });
  };

  // Mutate node list in parents
  const handleNodesUpdate = (nodes: SwarmNode[]) => {
    handleUpdate({ nodes });
  };

  // Mutate assets list in parents
  const handleAssetsUpdate = (assets: SwarmAsset[]) => {
    handleUpdate({ assets });
  };

  // Mutate secrets in parents
  const handleSecretsUpdate = (secrets: SecretKey[]) => {
    handleUpdate({ secrets });
  };

  // Optimize Global rules and run systems mutate
  const handleOptimizeSystem = () => {
    handleAddLogClient(
      lang === "ar" 
        ? "جاري نشر معزز الخوارزميات الذكية على مؤشرات السرب المستهدف..." 
        : "Deploying AI optimizer over system prompt guidelines metrics...",
      "info",
      "SelfEvolutionEngine"
    );

    setTimeout(() => {
      const currentGen = state.evolutionStatus.generation;
      const nextGen = currentGen + 1;
      const additionalGain = parseFloat((Math.random() * (4.2 - 1.5) + 1.5).toFixed(1));
      const nextGain = state.evolutionStatus.gain + additionalGain;

      handleUpdate({
        evolutionStatus: {
          generation: nextGen,
          mutationRate: parseFloat((Math.random() * (0.22 - 0.10) + 0.10).toFixed(2)),
          lastOptimized: new Date().toISOString(),
          gain: nextGain
        }
      });

      handleAddLogClient(
        lang === "ar"
          ? `تم تحسين موجهات السرب بنجاح! تطور جيل السرب إلى الجيل رقم ${nextGen} بمكاسب إنتاجية إيجابية قدرها +${additionalGain}٪`
          : `Optimized system triggers. Evolution level mutated to Generation ${nextGen}. Performance gain improved by +${additionalGain}%`,
        "success",
        "SelfEvolutionEngine"
      );
    }, 1500);
  };

  const clearAllLogs = () => {
    handleUpdate({
      logs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          level: "info",
          nodeName: "System",
          message: lang === "ar" ? "تم تفريغ سجل وحدة التحكم يدويًا." : "Logs stream purged manually."
        }
      ]
    });
  };

  return (
    <div className="min-h-screen bg-[#06070a] text-gray-100 flex flex-col font-sans antialiased overflow-x-hidden relative selection:bg-cyan-500 selection:text-black">
      {/* Background Cyber Matrix Grid Layer */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111827_1px,transparent_1px),linear-gradient(to_bottom,#111827_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-45" />

      {/* Primary header status and stats */}
      <header className="border-b border-gray-900 bg-[#0a0b10] relative z-10 sticky top-0 py-3 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="bg-gradient-to-tr from-cyan-600 to-emerald-500 p-2.5 rounded-lg border border-cyan-400/20 shadow-md shadow-cyan-950/20 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-black shrink-0 animate-pulse" />
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-[#06070a] animate-ping" />
              </div>

              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h1 className="text-md sm:text-lg font-sans font-medium text-white tracking-tight flex items-center gap-2">
                    {t.title} <span className="text-xs bg-cyan-950/65 text-cyan-400 border border-cyan-800/40 px-2 py-0.5 rounded-full font-mono font-medium lowercase">{t.version}</span>
                  </h1>
                </div>
                <p className="text-[11px] font-mono text-gray-500 tracking-wide">
                  {t.subtitle}
                </p>
              </div>
            </div>

            {/* Micro lang switcher for responsive mobiles */}
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="md:hidden flex items-center gap-1 px-3 py-1 text-xs font-mono rounded border border-gray-800 bg-gray-900 hover:border-gray-750 text-cyan-400 transition ml-2 mr-2"
              title="تغيير اللغة / Switch Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === "en" ? "عربي" : "EN"}</span>
            </button>
          </div>

          {/* Core System stats tickers */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-gray-400 font-mono w-full md:w-auto justify-start md:justify-end">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-950/60 border border-gray-900">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              <span>{t.generation}: <strong className="text-white">v{state.evolutionStatus.generation}</strong></span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-950/60 border border-gray-900">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.yieldGain}: <strong className="text-emerald-400">+{state.evolutionStatus.gain.toFixed(1)}%</strong></span>
            </div>

            {/* Sync Ticker indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-950/60 border border-gray-900">
              <HardDrive className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>
                {t.stateLabel}:{" "}
                <strong
                  className={
                    syncStatus === "synced"
                      ? "text-emerald-400"
                      : "text-amber-400"
                  }
                >
                  {syncStatus === "synced" ? t.stateSynced : t.stateBuffering}
                </strong>
              </span>
            </div>

            {/* English/Arabic Desktop switcher */}
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono rounded bg-cyan-950/40 text-cyan-400 border border-cyan-800/65 hover:bg-cyan-900/60 transition cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === "en" ? "العربية" : "English"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Offline sync backup notification banner */}
      {offlineBackup && (
        <div className="bg-amber-950/30 border-y border-amber-900/40 py-2.5 px-4 text-center text-xs text-amber-300 font-mono animate-fadeIn relative z-10">
          {t.offlineBanner}
        </div>
      )}

      {/* Main Container Layout */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex flex-col gap-6">
        {/* Horizontal Navigation tabs */}
        <div className="flex border-b border-gray-900 justify-start items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab("nodes")}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-mono border-b-2 transition cursor-pointer ${
              activeTab === "nodes"
                ? "border-cyan-400 text-cyan-300 font-semibold"
                : "border-transparent text-gray-500 hover:text-white"
            }`}
          >
            <Cpu className="w-4 h-4 shrink-0" /> {t.nodesTab}
          </button>

          <button
            onClick={() => {
              setActiveTab("assets");
            }}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-mono border-b-2 transition cursor-pointer ${
              activeTab === "assets"
                ? "border-cyan-400 text-cyan-300 font-semibold"
                : "border-transparent text-gray-500 hover:text-white"
            }`}
          >
            <FolderOpen className="w-4 h-4 shrink-0" /> {t.assetsTab}
          </button>

          <button
            onClick={() => setActiveTab("terminal")}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-mono border-b-2 transition cursor-pointer ${
              activeTab === "terminal"
                ? "border-cyan-400 text-cyan-300 font-semibold"
                : "border-transparent text-gray-500 hover:text-white"
            }`}
          >
            <Terminal className="w-4 h-4 shrink-0" /> {t.consoleTab}
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-mono border-b-2 transition cursor-pointer ${
              activeTab === "security"
                ? "border-cyan-400 text-cyan-300 font-semibold"
                : "border-transparent text-gray-500 hover:text-white"
            }`}
          >
            <Shield className="w-4 h-4 shrink-0" /> {t.keysTab}
          </button>
        </div>

        {/* Dynamic Render block wrap with beautiful layout transitions */}
        <div className="flex-grow text-left">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === "nodes" && (
                <SwarmNodeGrid
                  nodes={state.nodes}
                  onUpdateNodes={handleNodesUpdate}
                  onAddLog={handleAddLogClient}
                  t={t}
                  lang={lang}
                />
              )}

              {activeTab === "assets" && (
                <AssetManager
                  assets={state.assets}
                  onUpdateAssets={handleAssetsUpdate}
                  onAddLog={handleAddLogClient}
                  t={t}
                  lang={lang}
                />
              )}

              {activeTab === "terminal" && (
                <TerminalConsole
                  logs={state.logs}
                  onClearLogs={clearAllLogs}
                  onAddLog={handleAddLogClient}
                  evolutionStatus={state.evolutionStatus}
                  onOptimizeSystem={handleOptimizeSystem}
                  t={t}
                  lang={lang}
                />
              )}

              {activeTab === "security" && (
                <SecretsVault
                  secrets={state.secrets}
                  onUpdateSecrets={handleSecretsUpdate}
                  onAddLog={handleAddLogClient}
                  t={t}
                  lang={lang}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Cyberpunk minimal footer with credits */}
      <footer className="border-t border-gray-900 bg-[#07080b] py-4 px-6 mt-12 text-center text-[10px] font-mono text-gray-600">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>{t.footerText}</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" /> {t.footerStatus}
          </span>
        </div>
      </footer>
    </div>
  );
}
