/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { SwarmNode } from "../types";
import { Cpu, Plus, Trash2, Edit3, Settings, AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react";

interface SwarmNodeGridProps {
  nodes: SwarmNode[];
  onUpdateNodes: (nodes: SwarmNode[]) => void;
  onAddLog: (message: string, level: "info" | "success" | "warn" | "error", nodeName: string) => void;
  t: any;
  lang: string;
}

export default function SwarmNodeGrid({ nodes, onUpdateNodes, onAddLog, t, lang }: SwarmNodeGridProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [model, setModel] = useState("gemini-3.5-flash");
  const [directives, setDirectives] = useState("");
  const [selectedNode, setSelectedNode] = useState<SwarmNode | null>(null);

  // Edit states
  const [editDirectives, setEditDirectives] = useState("");

  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;

    const newNode: SwarmNode = {
      id: `node-${Date.now()}`,
      name: name.trim(),
      role: role.trim(),
      model: model,
      status: "idle",
      confidence: parseFloat((Math.random() * (1.0 - 0.8) + 0.8).toFixed(2)),
      useCount: 0,
      directives: directives.trim() || (lang === "ar" ? "في انتظار توجيه أوامر المستخدم وصياغتها." : "Stand by for orchestrating user commands."),
      updatedAt: new Date().toISOString()
    };

    const updated = [newNode, ...nodes];
    onUpdateNodes(updated);
    onAddLog(lang === "ar" ? `تم تحفيز وتوليد عقدة عميل جديدة: "${name}"` : `Self-evolved and integrated new Agent Node: "${name}"`, "success", name);

    // Reset Form
    setName("");
    setRole("");
    setModel("gemini-3.5-flash");
    setDirectives("");
    setShowAddForm(false);
  };

  const handleDeleteNode = (id: string, nodeName: string) => {
    const updated = nodes.filter(n => n.id !== id);
    onUpdateNodes(updated);
    onAddLog(lang === "ar" ? `تم إلغاء تنشيط وحدة السرب: "${nodeName}"` : `Decommissioned Swarm Node: "${nodeName}"`, "warn", "System");
    if (selectedNode?.id === id) {
      setSelectedNode(null);
    }
  };

  const handleRunEvolution = (node: SwarmNode) => {
    const updated = nodes.map(n => {
      if (n.id === node.id) {
        const nextConfidence = Math.min(1.0, parseFloat((n.confidence + 0.02).toFixed(2)));
        onAddLog(
          lang === "ar"
            ? `جاري تحوير طبقات موجهات العقدة. تم رفع مستوى الثقة إلى ${(nextConfidence * 100).toFixed(0)}٪`
            : `Mutating Node prompt layers. Confidence index optimized to ${nextConfidence}`, 
          "success", 
          n.name
        );
        return {
          ...n,
          status: "evolving" as const,
          confidence: nextConfidence,
          useCount: n.useCount + 1,
          updatedAt: new Date().toISOString()
        };
      }
      return n;
    });

    onUpdateNodes(updated);

    // Return status to previous or active shortly after
    setTimeout(() => {
      onUpdateNodes(updated.map(n => n.id === node.id ? { ...n, status: "active" as const } : n));
    }, 1500);
  };

  const handleSaveDirectives = (id: string) => {
    const updated = nodes.map(n => {
      if (n.id === id) {
        onAddLog(lang === "ar" ? `تم تحديث التوجيهات التشغيلية للعقدة "${n.name}".` : `Updated operational directives for node "${n.name}".`, "info", n.name);
        return {
          ...n,
          directives: editDirectives,
          updatedAt: new Date().toISOString()
        };
      }
      return n;
    });
    onUpdateNodes(updated);
    const matched = updated.find(n => n.id === id);
    if (matched) setSelectedNode(matched);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Node Columns List */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-sans font-medium text-white tracking-tight flex items-center gap-2">
              <Cpu className="text-cyan-400 w-5 h-5 animate-pulse" /> {t.workspaceTitle}
            </h2>
            <p className="text-xs text-gray-500 font-mono">{t.workspaceSubtitle}</p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded bg-cyan-950/40 text-cyan-400 border border-cyan-800/60 hover:bg-cyan-900/60 transition"
          >
            <Plus className="w-4 h-4" /> {showAddForm ? t.hideForm : t.appendNode}
          </button>
        </div>

        {/* Add Node Panel */}
        {showAddForm && (
          <form onSubmit={handleAddNode} className="p-4 rounded bg-gray-900 border border-cyan-900/40 space-y-3 animate-fadeIn">
            <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider">{t.spawnTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1">{t.nodeIdentifierName}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CodeOptimist"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full text-xs font-mono bg-[#0c0d12] border border-gray-800 rounded px-2.5 py-2 text-white outline-none focus:border-cyan-500 transition"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1">{t.providerEngine}</label>
                <select
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  className="w-full text-xs font-mono bg-[#0c0d12] border border-gray-800 rounded px-2.5 py-2 text-white outline-none focus:border-cyan-500 transition"
                >
                  <option value="gemini-3.5-flash">gemini-3.5-flash (Standard)</option>
                  <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Advanced)</option>
                  <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet (External Router)</option>
                  <option value="GPT-4o Engine">GPT-4o Engine (External proxy)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-gray-400 mb-1">{t.roleMandate}</label>
              <input
                type="text"
                required
                placeholder="e.g. Parse structural datasets and build semantic graphs"
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full text-xs font-mono bg-[#0c0d12] border border-gray-800 rounded px-2.5 py-2 text-white outline-none focus:border-cyan-500 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-gray-400 mb-1">{t.startingDirectives}</label>
              <textarea
                placeholder="Instruct the node how to specialize inside the system..."
                value={directives}
                onChange={e => setDirectives(e.target.value)}
                rows={2}
                className="w-full text-xs font-mono bg-[#0c0d12] border border-gray-800 rounded px-2.5 py-2 text-white outline-none focus:border-cyan-500 transition resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-xs text-gray-400 font-mono hover:text-white transition"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 text-black font-semibold rounded font-mono transition"
              >
                {t.integrateNode}
              </button>
            </div>
          </form>
        )}

        {/* Nodes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nodes.map(node => (
            <div
              key={node.id}
              onClick={() => {
                setSelectedNode(node);
                setEditDirectives(node.directives);
              }}
              className={`p-4 rounded-lg border text-left cursor-pointer transition ${
                selectedNode?.id === node.id
                  ? "bg-cyan-950/20 border-cyan-500 shadow-md shadow-cyan-950/35"
                  : "bg-[#111318]/90 border-gray-800/80 hover:border-gray-700/80 hover:bg-[#15171e]"
              }`}
            >
              <div className="flex justify-between items-start mb-2 animate-fadeIn">
                <div>
                  <h3 className="text-sm font-sans font-medium text-white tracking-tight flex items-center gap-1.5">
                    {node.name}
                  </h3>
                  <span className="text-[10px] font-mono text-gray-500 block uppercase">{node.model}</span>
                </div>

                {/* Status indicator node */}
                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      node.status === "active"
                        ? "bg-emerald-400 animate-pulse"
                        : node.status === "evolving"
                        ? "bg-amber-400 animate-spin"
                        : node.status === "scanned"
                        ? "bg-cyan-400"
                        : "bg-gray-500"
                    }`}
                  />
                  <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">
                    {lang === "ar" && node.status === "idle" ? "خامل" : 
                     lang === "ar" && node.status === "active" ? "نشط" :
                     lang === "ar" && node.status === "evolving" ? "يتحوّر" : node.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-400 line-clamp-2 h-8 font-mono mb-3 leading-relaxed">
                {node.role}
              </p>

              <div className="flex items-center justify-between pt-2.5 border-t border-gray-800/70 text-[10px] font-mono text-gray-500">
                <span className="flex items-center gap-1">
                  {t.confidence}:{" "}
                  <strong className={node.confidence > 0.95 ? "text-emerald-400" : "text-amber-400"}>
                    {(node.confidence * 100).toFixed(0)}%
                  </strong>
                </span>

                <span className="text-gray-400">{t.calls}: {node.useCount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Node Details side element */}
      <div className="bg-[#111318]/90 border border-gray-800 rounded-lg p-5 flex flex-col justify-between">
        {selectedNode ? (
          <div className="space-y-4 text-left h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start pb-2 border-b border-gray-800">
                <div>
                  <h3 className="text-md font-sans text-white font-medium">{selectedNode.name}</h3>
                  <p className="text-[10px] font-mono text-cyan-400 tracking-wide uppercase font-semibold">
                    {t.nodeDirectiveCore}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteNode(selectedNode.id, selectedNode.name)}
                  className="p-1 px-1.5 rounded bg-red-950/20 border border-red-900/40 text-red-400 hover:bg-red-900/45 transition cursor-pointer"
                  title={t.decommissionAgent}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-mono text-gray-400">
                  <span className="text-gray-500 uppercase block text-[9px] font-semibold">{t.providerEngine}</span>
                  {selectedNode.model}
                </p>
                <p className="text-xs font-mono text-gray-400">
                  <span className="text-gray-500 uppercase block text-[9px] font-semibold">{t.roleMandate}</span>
                  {selectedNode.role}
                </p>
              </div>

              <div className="pt-2">
                <label className="text-gray-500 uppercase block text-[9px] font-mono mb-1 font-semibold">
                  {t.startingDirectives}
                </label>
                <textarea
                  value={editDirectives}
                  onChange={e => setEditDirectives(e.target.value)}
                  rows={4}
                  className="w-full text-xs font-mono bg-[#0a0b0e] border border-gray-800 rounded p-2.5 text-gray-300 outline-none focus:border-cyan-800 transition resize-none"
                />
                <button
                  onClick={() => handleSaveDirectives(selectedNode.id)}
                  className="mt-1.5 w-full py-1 text-center text-[10px] bg-cyan-950/50 border border-cyan-800/40 text-cyan-300 hover:bg-cyan-900/60 font-mono rounded transition cursor-pointer"
                >
                  {t.applyRules}
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800 space-y-2.5">
              <div className="bg-gray-950 p-2.5 rounded border border-gray-900 text-xs font-mono text-gray-400 space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span>{t.lastOptimized}:</span>
                  <span className="text-white">
                    {new Date(selectedNode.updatedAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>{t.workspaceKey}:</span>
                  <span className="text-cyan-400 truncate w-32 text-right">
                    sha256:{selectedNode.id}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleRunEvolution(selectedNode)}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-mono rounded bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 hover:bg-emerald-900/50 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-pulse" /> {t.mutateHeuristics}
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-2 text-gray-500">
            <Cpu className="w-10 h-10 text-gray-700 animate-pulse" />
            <p className="text-xs font-mono">{t.noNodeSelected}</p>
          </div>
        )}
      </div>
    </div>
  );
}
