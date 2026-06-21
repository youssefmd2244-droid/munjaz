/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SwarmNode {
  id: string;
  name: string;
  role: string;
  model: string;
  status: 'idle' | 'active' | 'evolving' | 'scanned';
  confidence: number;
  useCount: number;
  directives: string;
  updatedAt: string;
}

export interface SwarmAsset {
  id: string;
  fileName: string;
  category: 'code' | 'document' | 'spreadsheet' | 'pdf' | 'vector' | 'audio' | 'video' | 'raw';
  fileSize: string;
  content: string;
  createdAt: string;
  description?: string;
}

export interface SwarmLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'success' | 'error';
  nodeName: string;
  message: string;
}

export interface SecretKey {
  id: string;
  name: string;
  category: string;
  value: string;
  isEncrypted: boolean;
  updatedAt: string;
}

export interface SwarmState {
  nodes: SwarmNode[];
  assets: SwarmAsset[];
  logs: SwarmLog[];
  secrets: SecretKey[];
  evolutionStatus: {
    generation: number;
    mutationRate: number;
    lastOptimized: string;
    gain: number;
  };
}
