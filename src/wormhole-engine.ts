/**
 * 🌀 Wormhole Engine
 * Finds semantic bridges between code souls
 * Using eigenvalue similarity in high-dimensional space
 */

import { ProteinHasher, ProteinHashResult } from '@soul-forge/protein-hash';
import { Vector } from 'vectorious';

export interface WormholeConnection {
  from: CodeSoul;
  to: CodeSoul;
  similarity: number;      // 0-1, where 1 = identical
  distance: number;         // Euclidean distance in eigenspace
  energy: number;          // Energy required to traverse
  stability: number;       // How stable is this wormhole
  resonance: number;       // Harmonic resonance (432Hz based)
}

export interface CodeSoul {
  id: string;
  code: string;
  hash: string;
  eigenvalues: number[];
  vector: Vector;          // High-dimensional representation
  timestamp: Date;
  source?: string;         // Repository/file origin
}

export class WormholeEngine {
  private hasher: ProteinHasher;
  private souls: Map<string, CodeSoul>;
  private connections: Map<string, WormholeConnection[]>;
  private dimensionality: number = 10; // Eigenvalue dimensions
  
  constructor() {
    this.hasher = new ProteinHasher();
    this.souls = new Map();
    this.connections = new Map();
  }
  
  /**
   * Add code to the multiverse
   */
  async addCodeSoul(code: string, id?: string, source?: string): Promise<CodeSoul> {
    const result = this.hasher.computeHash(code);
    const soulId = id || result.phash;
    
    // Pad or truncate eigenvalues to fixed dimensionality
    const eigenvalues = this.normalizeEigenvalues(result.eigenTop);
    
    // Create high-dimensional vector
    const vector = new Vector(eigenvalues);
    
    const soul: CodeSoul = {
      id: soulId,
      code,
      hash: result.phash,
      eigenvalues,
      vector,
      timestamp: new Date(),
      source
    };
    
    this.souls.set(soulId, soul);
    
    // Find wormholes to existing souls
    this.findWormholes(soul);
    
    return soul;
  }
  
  /**
   * Normalize eigenvalues to fixed dimensions
   */
  private normalizeEigenvalues(eigenvalues: number[]): number[] {
    const normalized = new Array(this.dimensionality).fill(0);
    
    for (let i = 0; i < Math.min(eigenvalues.length, this.dimensionality); i++) {
      normalized[i] = eigenvalues[i];
    }
    
    return normalized;
  }
  
  /**
   * Find wormhole connections for a soul
   */
  private findWormholes(soul: CodeSoul): WormholeConnection[] {
    const connections: WormholeConnection[] = [];
    
    for (const [otherId, otherSoul] of this.souls) {
      if (otherId === soul.id) continue;
      
      // Calculate similarity metrics
      const distance = this.euclideanDistance(soul.vector, otherSoul.vector);
      const similarity = this.cosineSimilarity(soul.vector, otherSoul.vector);
      const energy = this.wormholeEnergy(distance, similarity);
      const stability = this.wormholeStability(similarity);
      const resonance = this.harmonicResonance(soul.eigenvalues, otherSoul.eigenvalues);
      
      // Only create wormhole if similarity is high enough
      if (similarity > 0.7) {
        const connection: WormholeConnection = {
          from: soul,
          to: otherSoul,
          similarity,
          distance,
          energy,
          stability,
          resonance
        };
        
        connections.push(connection);
      }
    }
    
    // Sort by similarity (strongest connections first)
    connections.sort((a, b) => b.similarity - a.similarity);
    
    this.connections.set(soul.id, connections);
    
    return connections;
  }
  
  /**
   * Euclidean distance between vectors
   */
  private euclideanDistance(v1: Vector, v2: Vector): number {
    return v1.subtract(v2).norm();
  }
  
  /**
   * Cosine similarity between vectors
   */
  private cosineSimilarity(v1: Vector, v2: Vector): number {
    const dot = v1.dot(v2);
    const norm1 = v1.norm();
    const norm2 = v2.norm();
    
    if (norm1 === 0 || norm2 === 0) return 0;
    
    return dot / (norm1 * norm2);
  }
  
  /**
   * Calculate energy required to traverse wormhole
   * Lower similarity = higher energy required
   */
  private wormholeEnergy(distance: number, similarity: number): number {
    // E = d² / s (simplified model)
    if (similarity === 0) return Infinity;
    return (distance * distance) / similarity;
  }
  
  /**
   * Calculate wormhole stability
   * High similarity = stable, low = unstable/collapsing
   */
  private wormholeStability(similarity: number): number {
    // Sigmoid function for smooth transition
    const k = 10; // Steepness
    const x0 = 0.8; // Midpoint
    return 1 / (1 + Math.exp(-k * (similarity - x0)));
  }
  
  /**
   * Calculate harmonic resonance at 432Hz
   */
  private harmonicResonance(eigen1: number[], eigen2: number[]): number {
    const baseFreq = 432;
    let resonanceSum = 0;
    
    for (let i = 0; i < Math.min(eigen1.length, eigen2.length); i++) {
      const freq1 = baseFreq * eigen1[i];
      const freq2 = baseFreq * eigen2[i];
      
      // Check for harmonic relationships (octaves, fifths, etc.)
      const ratio = freq2 / freq1;
      
      // Perfect resonance at harmonic ratios
      const harmonicRatios = [1, 2, 0.5, 1.5, 0.667, 1.333]; // Unison, octave, fifth, fourth
      
      let maxResonance = 0;
      for (const harmonic of harmonicRatios) {
        const resonance = Math.exp(-Math.pow(ratio - harmonic, 2));
        maxResonance = Math.max(maxResonance, resonance);
      }
      
      resonanceSum += maxResonance;
    }
    
    return resonanceSum / Math.min(eigen1.length, eigen2.length);
  }
  
  /**
   * Get nearest neighbors (most similar code)
   */
  getNearestNeighbors(soulId: string, k: number = 5): WormholeConnection[] {
    const connections = this.connections.get(soulId) || [];
    return connections.slice(0, k);
  }
  
  /**
   * Find all wormholes above threshold
   */
  getStableWormholes(minStability: number = 0.8): WormholeConnection[] {
    const allConnections: WormholeConnection[] = [];
    
    for (const connections of this.connections.values()) {
      allConnections.push(...connections.filter(c => c.stability >= minStability));
    }
    
    return allConnections;
  }
  
  /**
   * Find resonant pairs (harmonically related)
   */
  getResonantPairs(minResonance: number = 0.7): WormholeConnection[] {
    const allConnections: WormholeConnection[] = [];
    
    for (const connections of this.connections.values()) {
      allConnections.push(...connections.filter(c => c.resonance >= minResonance));
    }
    
    return allConnections;
  }
  
  /**
   * Traverse a wormhole (transform code)
   */
  traverseWormhole(connection: WormholeConnection): {
    transformedCode: string;
    energyCost: number;
    traversalTime: number;
  } {
    // Simplified transformation - in reality would use AST morphing
    const fromLines = connection.from.code.split('\n');
    const toLines = connection.to.code.split('\n');
    
    // Blend based on similarity
    const blendFactor = connection.similarity;
    const transformedLines: string[] = [];
    
    for (let i = 0; i < Math.max(fromLines.length, toLines.length); i++) {
      const fromLine = fromLines[i] || '';
      const toLine = toLines[i] || '';
      
      // Simple blend (in reality: semantic blending)
      if (Math.random() < blendFactor) {
        transformedLines.push(toLine);
      } else {
        transformedLines.push(fromLine);
      }
    }
    
    return {
      transformedCode: transformedLines.join('\n'),
      energyCost: connection.energy,
      traversalTime: connection.distance / connection.stability
    };
  }
  
  /**
   * Get multiverse statistics
   */
  getMultiverseStats() {
    const totalSouls = this.souls.size;
    let totalConnections = 0;
    let avgSimilarity = 0;
    let maxSimilarity = 0;
    let stableCount = 0;
    let resonantCount = 0;
    
    for (const connections of this.connections.values()) {
      totalConnections += connections.length;
      
      for (const conn of connections) {
        avgSimilarity += conn.similarity;
        maxSimilarity = Math.max(maxSimilarity, conn.similarity);
        
        if (conn.stability > 0.8) stableCount++;
        if (conn.resonance > 0.7) resonantCount++;
      }
    }
    
    if (totalConnections > 0) {
      avgSimilarity /= totalConnections;
    }
    
    return {
      totalSouls,
      totalWormholes: totalConnections,
      averageSimilarity: avgSimilarity,
      maxSimilarity,
      stableWormholes: stableCount,
      resonantPairs: resonantCount,
      connectionDensity: totalConnections / Math.max(1, totalSouls * (totalSouls - 1) / 2)
    };
  }
  
  /**
   * Export wormhole network for visualization
   */
  exportNetwork() {
    const nodes = Array.from(this.souls.values()).map(soul => ({
      id: soul.id,
      hash: soul.hash,
      eigenvalues: soul.eigenvalues,
      source: soul.source
    }));
    
    const edges: any[] = [];
    for (const [fromId, connections] of this.connections) {
      for (const conn of connections) {
        edges.push({
          source: fromId,
          target: conn.to.id,
          similarity: conn.similarity,
          distance: conn.distance,
          energy: conn.energy,
          stability: conn.stability,
          resonance: conn.resonance
        });
      }
    }
    
    return { nodes, edges };
  }
}