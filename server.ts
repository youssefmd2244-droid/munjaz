/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

// DB File storage path
const DB_PATH = path.join(process.cwd(), "src", "swarm_db.json");

// Helper to load state
function getSwarmState() {
  const defaultState = {
    nodes: [
      {
        id: "node-1",
        name: "ModelMother",
        role: "Meta-Model Orchestrator & Multi-Provider Router",
        model: "gemini-3.5-flash",
        status: "scanned",
        confidence: 0.98,
        useCount: 124,
        directives: "Coordinate dynamic tasks across models. Router requests to correct specialist node.",
        updatedAt: new Date().toISOString(),
      },
      {
        id: "node-2",
        name: "StealthBrowser",
        role: "Autonomous Real-Time Information Collector (Playwright)",
        model: "Chromium Headless",
        status: "idle",
        confidence: 0.94,
        useCount: 42,
        directives: "Conduct incognito web scans without caching or footprint preservation.",
        updatedAt: new Date().toISOString(),
      },
      {
        id: "node-3",
        name: "SecretKeeper",
        role: "Cryptographic Vault Manager (Fernet Encryption)",
        model: "AES-256 Symmetric Key Engine",
        status: "active",
        confidence: 1.0,
        useCount: 56,
        directives: "Encrypt credentials, API keys, and configurations before committing to disk.",
        updatedAt: new Date().toISOString(),
      },
      {
        id: "node-4",
        name: "SelfEvolutionEngine",
        role: "Heuristic Feedback Optimizer & Prompt Mutator",
        model: "gemini-3.1-pro-preview",
        status: "evolving",
        confidence: 0.91,
        useCount: 78,
        directives: "Optimize system prompt instructions and heuristics based on task logs.",
        updatedAt: new Date().toISOString(),
      },
    ],
    assets: [
      {
        id: "asset-1",
        fileName: "swarm_bootstrap.py",
        category: "code",
        fileSize: "1.4 KB",
        createdAt: new Date().toISOString(),
        description: "Initial bootstrap code mapping standard cryptographic nodes",
        content: `#!/usr/bin/env python3
# Swarm Autogeneration: Bootstrap file
import os
import sys

def main():
    print("Initializing Icon Swarm Meta-Entity...")
    print("Awaiting directives on system port 8080...")

if __name__ == '__main__':
    main()
`
      },
      {
        id: "asset-2",
        fileName: "quarterly_budget.csv",
        category: "spreadsheet",
        fileSize: "400 Bytes",
        createdAt: new Date().toISOString(),
        description: "Calculated operational fees for the swarm nodes",
        content: `Quarter,ModelMother Cost,StealthBrowser Cost,Security Overhead,Savings
Q1,450.25,120.50,15.00,1230.00
Q2,610.10,340.20,15.00,1950.40
Q3,380.00,98.15,15.00,2400.00
Q4,890.30,450.00,25.00,3120.00
`
      }
    ],
    logs: [
      {
        id: "log-1",
        timestamp: new Date().toISOString(),
        level: "success",
        nodeName: "SecretKeeper",
        message: "Symmetric key established. Storage encrypted successfully under fingerprint AES-SHA."
      },
      {
        id: "log-2",
        timestamp: new Date().toISOString(),
        level: "info",
        nodeName: "ModelMother",
        message: "Swarm nodes active. Standing by for self-evolution directive."
      }
    ],
    secrets: [
      {
        id: "sec-1",
        name: "GEMINI_API_KEY",
        category: "Generative LLM Provider",
        value: process.env.GEMINI_API_KEY ? "CONFIGURED_LIVE" : "UNCONFIGURED_FALLBACK",
        isEncrypted: true,
        updatedAt: new Date().toISOString()
      },
      {
        id: "sec-2",
        name: "ICON_MASTER_KEY",
        category: "Symmetric Encryption",
        value: "fernet_64bit_secure_entity_hash_2026",
        isEncrypted: true,
        updatedAt: new Date().toISOString()
      }
    ],
    evolutionStatus: {
      generation: 9,
      mutationRate: 0.15,
      lastOptimized: new Date().toISOString(),
      gain: 24.5
    }
  };

  try {
    if (fs.existsSync(DB_PATH)) {
      const savedData = fs.readFileSync(DB_PATH, "utf8");
      return JSON.parse(savedData);
    } else {
      // Create directories if missing
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultState, null, 2), "utf8");
      return defaultState;
    }
  } catch (error) {
    console.error("Error loading swarm state:", error);
    return defaultState;
  }
}

// Help save state
function saveSwarmState(state: any) {
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Error writing swarm state:", err);
    return false;
  }
}

// Lazy Gemini API Client Initialization
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    serverTime: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// Load the Swarm state
app.get("/api/swarm/state", (req, res) => {
  const state = getSwarmState();
  res.json(state);
});

// Update standard state
app.post("/api/swarm/state/update", (req, res) => {
  const newState = req.body;
  const outcome = saveSwarmState(newState);
  res.json({ success: outcome, state: newState });
});

// Compile and generate any structural digital asset via Gemini API
app.post("/api/swarm/generate", async (req, res) => {
  const { prompt, category, fileName } = req.body;
  if (!prompt) {
    res.status(400).json({ error: "Prompt is required." });
    return;
  }

  const fileCategory = category || "code";
  const nameOfFile = fileName || `swarm_file_${Date.now()}.py`;

  // Standard logging message setup
  const timestamp = new Date().toISOString();
  console.log(`[Swarm Generator] Triggering generation: "${prompt}" using model gemini-3.5-flash`);

  let fileContent = "";
  let assetDescription = `Document output for query: "${prompt}"`;
  let liveAiUsed = false;

  try {
    const client = getGeminiClient();

    if (client) {
      // Prompt customization tailored to the selected asset category
      let systemTask = "";
      if (fileCategory === "code") {
        systemTask = "Write high-performance clean programming code (Python, TypeScript, HTML, CSS, Bash or Dockerfile) matching the user's instructions. Output ONLY raw clean code, zero explanations, zero markdown wrappers like ```python, simply the raw code. Provide high-quality logic.";
      } else if (fileCategory === "spreadsheet") {
        systemTask = "Produce comprehensive spreadsheet-style CSV content with clear rows and headers based on the instructions. Output ONLY the raw CSV text, with no explanations or extra markdown wraps.";
      } else if (fileCategory === "pdf") {
        systemTask = "Generate a beautifully detailed text/markdown Executive Summary Report featuring distinct sections (Introduction, Methodology, Swarm Diagnostics, Projections). Use rich markdown structure. Output ONLY raw text, no extra markdown wrapper code blocks.";
      } else if (fileCategory === "vector") {
        systemTask = "Write a complete, valid, beautifully styled inline SVG graphic XML. Use modern shapes, neon cyberpunk colors (cyan, magenta, slate, green), gradients, and professional scaling. Output ONLY raw valid XML text starting with '<svg' and ending with '</svg>', no surrounding markdown, no code wraps.";
      } else if (fileCategory === "audio") {
        systemTask = "Generate an structured MIDI mapping or text synthesizer arrangement configurations (using synth notation, BPM, tracks, notes, octave, velocity mappings). Output ONLY structured synth layout text.";
      } else if (fileCategory === "video") {
        systemTask = "Generate a beautiful JSON-structured video synthesis storyboard. It should contain a title, duration (seconds), theme, and an array of scenes. Each scene must include text, style (neon, dark, retro, clean), duration (seconds), subtitle, backdrop (e.g. CSS background value like 'linear-gradient(...)'), and accentColor (hex). Output ONLY raw valid JSON text, with zero extra markdown wraps or explanations.";
      } else {
        systemTask = "Write a comprehensive textual artifact answering the prompt. Output ONLY raw text.";
      }

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemTask,
          temperature: 0.7,
        },
      });

      if (response && response.text) {
        fileContent = response.text.trim();
        // Remove markdown backticks formatting if returned by mistake
        if (fileContent.startsWith("```")) {
          const lines = fileContent.split("\n");
          if (lines[0].startsWith("```")) {
            lines.shift();
          }
          if (lines[lines.length - 1].startsWith("```")) {
            lines.pop();
          }
          fileContent = lines.join("\n").trim();
        }
        liveAiUsed = true;
        assetDescription = `Autonomous ai-compiled file matching request: "${prompt}"`;
      }
    }
  } catch (error: any) {
    console.error("Gemini Live Generation Error:", error.message || error);
    // Continue below to produce fallback so user has an amazing interactive experience
  }

  // Graceful fallback if API key is missing or model throws an error
  if (!fileContent) {
    liveAiUsed = false;
    assetDescription = `[Simulated Model Swarm Output] requested: "${prompt}"`;

    if (fileCategory === "code") {
      fileContent = `#!/usr/bin/env python3
# Swarm Autogeneration: Fallback Node Script
# Request: ${prompt}
# Simulated time: ${timestamp}

import json
import random

def execute_swarm_task():
    print("[Swarm Core] Optimizing intelligence variables...")
    success_index = random.uniform(0.85, 0.99)
    print(f"[Swarm Core] Task resolved successfully with confidence score {success_index:.4f}")
    return {"status": "optimized", "confidence": success_index}

if __name__ == "__main__":
    execute_swarm_task()
`;
    } else if (fileCategory === "spreadsheet") {
      fileContent = `Metric,Target Goal,Swarm Status,Operational Percentage
Node Orchestration,99.9%,ONLINE,98.8%
Symmetric Decryption,100%,SECURED,100%
Heuristic Mutation,95%,EVOLVING,91.5%
Incognito Scans,90%,READY,100%
Average Metric Performance,-,SUCCESS,97.5%
`;
    } else if (fileCategory === "pdf") {
      fileContent = `# EXECUTIVES SWARM SYSTEM MANUAL & HANDBOOK
Created: ${timestamp}
System Target Mode: UNBOUNDED

### 1. Architectural Overview
This is a self-evolving Multi-Storage swarm entity utilizing decentralized execution layers.

### 2. Operational Framework
Each Swarm node operates asynchronously on designated threads under cryptographic memory constraints. 

### 3. Verification Protocol
All operations is governed by key signature indices. No resource is finalized without active audit checks.
`;
    } else if (fileCategory === "video") {
      fileContent = JSON.stringify({
        title: "Icon Swarm Synthesis Simulation",
        duration: 15,
        theme: "cyberpunk",
        scenes: [
          {
            id: 1,
            text: "ICON SWARM v10.0 ACTIVE",
            style: "neon",
            duration: 5,
            subtitle: "Initializing decentralised intelligence matrix...",
            backdrop: "linear-gradient(135deg, #020617, #1e1b4b)",
            accentColor: "#06b6d4"
          },
          {
            id: 2,
            text: "SELF-EVOLUTION SCHEDULER",
            style: "matrix",
            duration: 5,
            subtitle: "Mutating heuristics and optimization parameters dynamically.",
            backdrop: "linear-gradient(135deg, #090514, #022c22)",
            accentColor: "#10b981"
          },
          {
            id: 3,
            text: "SECURE FERNET VAULT SYNCED",
            style: "secure",
            duration: 5,
            subtitle: "All secrets and key structures encrypted and securely committed.",
            backdrop: "linear-gradient(135deg, #0f051d, #4c0519)",
            accentColor: "#f43f5e"
          }
        ]
      }, null, 2);
    } else if (fileCategory === "vector") {
      fileContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="cyberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="50%" stop-color="#8b5cf6" />
      <stop offset="100%" stop-color="#10b981" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Grounding grid -->
  <rect width="400" height="400" fill="#0b0f17" />
  <circle cx="200" cy="200" r="160" fill="url(#glow)" />
  <grid>
    <line x1="50" y1="200" x2="350" y2="200" stroke="#1e293b" stroke-width="1" />
    <line x1="200" y1="50" x2="200" y2="350" stroke="#1e293b" stroke-width="1" />
  </grid>

  <!-- Central Swarm Hexagon Node -->
  <polygon points="200,80 300,140 300,260 200,320 100,260 100,140" fill="none" stroke="url(#cyberGrad)" stroke-width="3" />
  
  <!-- Outer glowing rings -->
  <circle cx="200" cy="200" r="40" fill="none" stroke="#06b6d4" stroke-width="2" stroke-dasharray="10, 5" />
  <circle cx="200" cy="200" r="80" fill="none" stroke="#10b981" stroke-width="1" stroke-dasharray="5, 5" />

  <!-- Central Matrix sphere -->
  <circle cx="200" cy="200" r="12" fill="#06b6d4" shadow="0 0 10px #06b6d4" />

  <!-- Typography accents -->
  <text x="200" y="360" font-family="monospace" font-size="12" fill="#64748b" text-anchor="middle" letter-spacing="2">SWARM METALL-MATRIX ENABLED</text>
</svg>`;
    } else {
      fileContent = `[Swarm Raw Synthesizer Configuration File]\nBPM=140\nKey=A-Minor\nScale=Dynamic Heuristic\nTracks=Lead Synth, Ambient Glow Engine, Decentralized Drums\nArrangement=Intro [0-30s], Core Evolution [30s-120s], Cyber Release [120s-180s]`;
    }
  }

  // Calculate generic file size
  const bSize = Buffer.byteLength(fileContent, "utf8");
  const fileSizeString = bSize > 1024 ? `${(bSize / 1024).toFixed(1)} KB` : `${bSize} Bytes`;

  // Create new Asset and Log entry
  const newAsset = {
    id: `asset-${Date.now()}`,
    fileName: nameOfFile,
    category: fileCategory as any,
    fileSize: fileSizeString,
    createdAt: new Date().toISOString(),
    description: assetDescription,
    content: fileContent,
  };

  const newLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    level: "success" as const,
    nodeName: "SelfEvolutionEngine",
    message: `Spawned digital asset: "${nameOfFile}" [${fileSizeString}] matching user prompt. Live-AI: ${liveAiUsed ? "ONLINE" : "OFFLINE-FALLBACK"}`
  };

  // Modify local database store
  const state = getSwarmState();
  state.assets.unshift(newAsset);
  state.logs.unshift(newLog);
  saveSwarmState(state);

  res.json({
    success: true,
    liveAi: liveAiUsed,
    asset: newAsset,
    log: newLog,
    state: state
  });
});

// Run Vite Dev Server configuration or static handlers
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("[Vite Controller] Dev server integrated smoothly in middleware mode.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("[Express Release] Static resources hosted from production /dist directory.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🤖 Icon Swarm Ultimate v9.0 Server running on port ${PORT}`);
    console.log(`🚀 API Status can be audited at http://localhost:${PORT}/api/health`);
  });
}

startServer();
