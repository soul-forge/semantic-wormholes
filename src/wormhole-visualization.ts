/**
 * 🌀 Wormhole Visualization
 * WebGL rendering of semantic bridges between code
 */

import * as THREE from 'three';
import { WormholeConnection } from './wormhole-engine';

export class WormholeVisualization {
  private scene: THREE.Scene;
  private wormholes: Map<string, THREE.Object3D>;
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.wormholes = new Map();
  }
  
  /**
   * Create wormhole visual between two points
   */
  createWormhole(
    connection: WormholeConnection,
    fromPos: THREE.Vector3,
    toPos: THREE.Vector3
  ): THREE.Object3D {
    const group = new THREE.Group();
    
    // Create spiraling tube geometry for wormhole
    const path = this.createSpiralPath(fromPos, toPos, connection.stability);
    const geometry = new THREE.TubeGeometry(
      path,
      64,  // Segments
      0.01 * (1 + connection.similarity), // Radius based on similarity
      8,   // Radial segments
      false
    );
    
    // Material based on stability and resonance
    const material = new THREE.MeshPhongMaterial({
      color: this.getWormholeColor(connection),
      emissive: this.getWormholeColor(connection),
      emissiveIntensity: connection.resonance,
      transparent: true,
      opacity: 0.3 + connection.stability * 0.5,
      side: THREE.DoubleSide
    });
    
    const tube = new THREE.Mesh(geometry, material);
    group.add(tube);
    
    // Add particle flow through wormhole
    const particles = this.createParticleFlow(path, connection);
    group.add(particles);
    
    // Add entry/exit portals
    const portals = this.createPortals(fromPos, toPos, connection);
    group.add(portals);
    
    // Store for later updates
    const id = `${connection.from.id}-${connection.to.id}`;
    this.wormholes.set(id, group);
    
    this.scene.add(group);
    return group;
  }
  
  /**
   * Create spiral path for wormhole
   */
  private createSpiralPath(
    from: THREE.Vector3,
    to: THREE.Vector3,
    stability: number
  ): THREE.CatmullRomCurve3 {
    const points: THREE.Vector3[] = [];
    const segments = 20;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      
      // Linear interpolation
      const x = from.x + (to.x - from.x) * t;
      const y = from.y + (to.y - from.y) * t;
      const z = from.z + (to.z - from.z) * t;
      
      // Add spiral based on instability
      const spiralRadius = (1 - stability) * 0.05;
      const spiralAngle = t * Math.PI * 4;
      
      const point = new THREE.Vector3(
        x + Math.cos(spiralAngle) * spiralRadius,
        y + Math.sin(spiralAngle) * spiralRadius,
        z
      );
      
      points.push(point);
    }
    
    return new THREE.CatmullRomCurve3(points);
  }
  
  /**
   * Get color based on wormhole properties
   */
  private getWormholeColor(connection: WormholeConnection): THREE.Color {
    // Hue based on resonance (432Hz = green/cyan)
    const hue = 0.5 - (1 - connection.resonance) * 0.3;
    
    // Saturation based on stability
    const saturation = connection.stability;
    
    // Lightness based on similarity
    const lightness = 0.3 + connection.similarity * 0.4;
    
    return new THREE.Color().setHSL(hue, saturation, lightness);
  }
  
  /**
   * Create particle flow through wormhole
   */
  private createParticleFlow(
    path: THREE.CatmullRomCurve3,
    connection: WormholeConnection
  ): THREE.Points {
    const particleCount = Math.floor(20 * connection.stability);
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    // Initialize particles along path
    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      const point = path.getPoint(t);
      
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      color: this.getWormholeColor(connection),
      size: 0.002,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    return new THREE.Points(geometry, material);
  }
  
  /**
   * Create entry/exit portals
   */
  private createPortals(
    from: THREE.Vector3,
    to: THREE.Vector3,
    connection: WormholeConnection
  ): THREE.Group {
    const group = new THREE.Group();
    
    // Portal geometry (torus)
    const geometry = new THREE.TorusGeometry(
      0.02 * (1 + connection.similarity),
      0.002,
      8,
      32
    );
    
    const material = new THREE.MeshPhongMaterial({
      color: this.getWormholeColor(connection),
      emissive: this.getWormholeColor(connection),
      emissiveIntensity: 1
    });
    
    // Entry portal
    const entryPortal = new THREE.Mesh(geometry, material);
    entryPortal.position.copy(from);
    group.add(entryPortal);
    
    // Exit portal
    const exitPortal = new THREE.Mesh(geometry, material.clone());
    exitPortal.position.copy(to);
    group.add(exitPortal);
    
    return group;
  }
  
  /**
   * Animate wormholes
   */
  animate(time: number) {
    this.wormholes.forEach((wormhole, id) => {
      // Rotate portals
      wormhole.children.forEach(child => {
        if (child instanceof THREE.Group) {
          child.children.forEach(portal => {
            if (portal instanceof THREE.Mesh) {
              portal.rotation.z = time * 2;
            }
          });
        }
      });
      
      // Animate particles (would need more complex logic for flow)
      // This is simplified - in production would move particles along path
    });
  }
  
  /**
   * Remove wormhole
   */
  removeWormhole(fromId: string, toId: string) {
    const id = `${fromId}-${toId}`;
    const wormhole = this.wormholes.get(id);
    
    if (wormhole) {
      this.scene.remove(wormhole);
      this.wormholes.delete(id);
    }
  }
  
  /**
   * Clear all wormholes
   */
  clear() {
    this.wormholes.forEach(wormhole => {
      this.scene.remove(wormhole);
    });
    this.wormholes.clear();
  }
}