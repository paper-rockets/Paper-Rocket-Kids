import * as THREE from 'three';
import { BLOCKS, BLOCK_DEFS, getBlockMaterial } from './blocks.js';

// Direction offsets and corner vertices for 6 voxel faces (CCW outward winding)
const FACES = [
  { dir: [0, 1, 0], face: 'top', corners: [[0, 1, 1], [1, 1, 1], [0, 1, 0], [1, 1, 0]], normal: [0, 1, 0] },
  { dir: [0, -1, 0], face: 'bottom', corners: [[0, 0, 0], [1, 0, 0], [0, 0, 1], [1, 0, 1]], normal: [0, -1, 0] },
  { dir: [1, 0, 0], face: 'side', corners: [[1, 1, 1], [1, 1, 0], [1, 0, 1], [1, 0, 0]], normal: [1, 0, 0] },
  { dir: [-1, 0, 0], face: 'side', corners: [[0, 1, 0], [0, 1, 1], [0, 0, 0], [0, 0, 1]], normal: [-1, 0, 0] },
  { dir: [0, 0, 1], face: 'side', corners: [[0, 1, 1], [1, 1, 1], [0, 0, 1], [1, 0, 1]], normal: [0, 0, 1] },
  { dir: [0, 0, -1], face: 'side', corners: [[1, 1, 0], [0, 1, 0], [1, 0, 0], [0, 0, 0]], normal: [0, 0, -1] }
];

export class VoxelWorld {
  constructor(sizeX = 48, sizeY = 32, sizeZ = 48) {
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.sizeZ = sizeZ;
    this.blocks = new Uint8Array(sizeX * sizeY * sizeZ);
    this.meshGroup = new THREE.Group();
    this.meshGroup.name = 'VoxelWorld';

    // Highlight wireframe box for cursor
    const boxGeo = new THREE.BoxGeometry(1.02, 1.02, 1.02);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    this.cursorBox = new THREE.Mesh(boxGeo, wireMat);
    this.cursorBox.visible = false;
    this.meshGroup.add(this.cursorBox);

    this.needsRebuild = false;
    this.history = [];
    this.historyIndex = -1;
  }

  getIndex(x, y, z) {
    if (x < 0 || x >= this.sizeX || y < 0 || y >= this.sizeY || z < 0 || z >= this.sizeZ) {
      return -1;
    }
    return x + y * this.sizeX + z * this.sizeX * this.sizeY;
  }

  getBlock(x, y, z) {
    const idx = this.getIndex(x, y, z);
    return idx === -1 ? BLOCKS.AIR : this.blocks[idx];
  }

  setBlock(x, y, z, id, triggerRebuild = true) {
    const idx = this.getIndex(x, y, z);
    if (idx === -1) return false;
    if (this.blocks[idx] === id) return false;
    this.blocks[idx] = id;
    if (triggerRebuild) {
      this.rebuildMesh();
    }
    return true;
  }

  getHighestBlock(x, z) {
    for (let y = this.sizeY - 1; y >= 0; y--) {
      const b = this.getBlock(x, y, z);
      if (b !== BLOCKS.AIR && b !== BLOCKS.WATER) {
        return y;
      }
    }
    return 0;
  }

  clear() {
    this.saveState();
    this.blocks.fill(BLOCKS.AIR);
    this.rebuildMesh();
  }

  saveState() {
    // Keep max 15 undo steps
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    this.history.push(new Uint8Array(this.blocks));
    if (this.history.length > 15) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.blocks.set(this.history[this.historyIndex]);
      this.rebuildMesh();
      return true;
    }
    return false;
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.blocks.set(this.history[this.historyIndex]);
      this.rebuildMesh();
      return true;
    }
    return false;
  }

  // Brush operations
  applyBrush(tool, x, y, z, radius = 2, blockId = BLOCKS.GRASS) {
    this.saveState();
    let changed = false;

    if (tool === 'raise') {
      // Raise a rounded hill using the selected block color
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dz = -radius; dz <= radius; dz++) {
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist <= radius) {
            const h = Math.round(1 + (radius - dist) * 0.8);
            const bx = x + dx;
            const bz = z + dz;
            const curY = this.getHighestBlock(bx, bz);
            for (let dy = 1; dy <= h; dy++) {
              if (curY + dy < this.sizeY) {
                let bType = blockId;
                if (dy < h) {
                  // Subsurface block
                  if (blockId === BLOCKS.GRASS) bType = BLOCKS.DIRT;
                  else if (blockId === BLOCKS.SNOW) bType = BLOCKS.STONE;
                  else if (blockId === BLOCKS.SAND) bType = BLOCKS.SAND;
                  else bType = blockId;
                }
                this.setBlock(bx, curY + dy, bz, bType, false);
                changed = true;
              }
            }
          }
        }
      }
    } else if (tool === 'dig') {
      // Dig out a bowl / lake
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dz = -radius; dz <= radius; dz++) {
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist <= radius) {
            const depth = Math.round(1 + (radius - dist) * 0.8);
            const bx = x + dx;
            const bz = z + dz;
            const curY = this.getHighestBlock(bx, bz);
            for (let dy = 0; dy < depth; dy++) {
              const targetY = curY - dy;
              if (targetY > 0) {
                this.setBlock(bx, targetY, bz, BLOCKS.AIR, false);
                changed = true;
              }
            }
          }
        }
      }
    } else if (tool === 'flatten') {
      const targetHeight = y;
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dz = -radius; dz <= radius; dz++) {
          if (dx * dx + dz * dz <= radius * radius) {
            const bx = x + dx;
            const bz = z + dz;
            const curY = this.getHighestBlock(bx, bz);
            if (curY > targetHeight) {
              for (let ty = targetHeight + 1; ty <= curY; ty++) {
                this.setBlock(bx, ty, bz, BLOCKS.AIR, false);
                changed = true;
              }
            } else if (curY < targetHeight) {
              for (let ty = curY + 1; ty < targetHeight; ty++) {
                const subType = blockId === BLOCKS.GRASS ? BLOCKS.DIRT : blockId;
                this.setBlock(bx, ty, bz, subType, false);
                changed = true;
              }
              this.setBlock(bx, targetHeight, bz, blockId, false);
              changed = true;
            }
          }
        }
      }
    } else if (tool === 'paint') {
      // Paint surface blocks in radius with the chosen block color
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dz = -radius; dz <= radius; dz++) {
          if (dx * dx + dz * dz <= radius * radius) {
            const bx = x + dx;
            const bz = z + dz;
            const topY = this.getHighestBlock(bx, bz);
            if (topY >= 0) {
              this.setBlock(bx, topY, bz, blockId, false);
              changed = true;
            }
          }
        }
      }
    } else if (tool === 'place') {
      // Place a single block of chosen color
      this.setBlock(x, y, z, blockId, false);
      changed = true;
    } else if (tool === 'erase') {
      // Remove a single block
      this.setBlock(x, y, z, BLOCKS.AIR, false);
      changed = true;
    }

    if (changed) {
      this.rebuildMesh();
    }
  }

  // Stamp a pre-made mini structure
  stampStructure(structure, originX, originY, originZ) {
    this.saveState();
    let changed = false;
    for (let dy = 0; dy < structure.sizeY; dy++) {
      for (let dz = 0; dz < structure.sizeZ; dz++) {
        for (let dx = 0; dx < structure.sizeX; dx++) {
          const b = structure.blocks[dx + dy * structure.sizeX + dz * structure.sizeX * structure.sizeY];
          if (b !== BLOCKS.AIR) {
            const tx = originX + dx;
            const ty = originY + dy;
            const tz = originZ + dz;
            this.setBlock(tx, ty, tz, b, false);
            changed = true;
          }
        }
      }
    }
    if (changed) {
      this.rebuildMesh();
    }
  }

  // Optimized Face-Culled Mesh Builder
  rebuildMesh() {
    // Clear old voxel meshes
    for (let i = this.meshGroup.children.length - 1; i >= 0; i--) {
      const child = this.meshGroup.children[i];
      if (child !== this.cursorBox) {
        if (child.geometry) child.geometry.dispose();
        this.meshGroup.remove(child);
      }
    }

    // Group vertices by material
    const matGroups = {};

    const isTransparent = (b) => {
      if (b === BLOCKS.AIR) return true;
      const def = BLOCK_DEFS[b];
      return !!def?.transparent;
    };

    const halfX = this.sizeX / 2;
    const halfZ = this.sizeZ / 2;

    for (let y = 0; y < this.sizeY; y++) {
      for (let z = 0; z < this.sizeZ; z++) {
        for (let x = 0; x < this.sizeX; x++) {
          const blockId = this.getBlock(x, y, z);
          if (blockId === BLOCKS.AIR) continue;

          for (const face of FACES) {
            const nx = x + face.dir[0];
            const ny = y + face.dir[1];
            const nz = z + face.dir[2];

            const neighbor = this.getBlock(nx, ny, nz);

            // Render face if neighbor is air or transparent (and not same transparent type)
            let renderFace = false;
            if (neighbor === BLOCKS.AIR) {
              renderFace = true;
            } else if (isTransparent(neighbor) && !isTransparent(blockId)) {
              renderFace = true;
            } else if (isTransparent(neighbor) && isTransparent(blockId) && neighbor !== blockId) {
              renderFace = true;
            }

            if (renderFace) {
              const matKey = `${blockId}_${face.face}`;
              if (!matGroups[matKey]) {
                matGroups[matKey] = {
                  blockId,
                  faceName: face.face,
                  positions: [],
                  normals: [],
                  uvs: []
                };
              }

              const group = matGroups[matKey];
              const c = face.corners;

              // World position relative to center
              const px = x - halfX;
              const py = y;
              const pz = z - halfZ;

              // 2 Triangles for the quad (c[0], c[1], c[2]) and (c[2], c[1], c[3])
              const p0 = [px + c[0][0], py + c[0][1], pz + c[0][2]];
              const p1 = [px + c[1][0], py + c[1][1], pz + c[1][2]];
              const p2 = [px + c[2][0], py + c[2][1], pz + c[2][2]];
              const p3 = [px + c[3][0], py + c[3][1], pz + c[3][2]];

              group.positions.push(...p0, ...p1, ...p2, ...p2, ...p1, ...p3);
              for (let i = 0; i < 6; i++) {
                group.normals.push(...face.normal);
              }
              group.uvs.push(
                0, 1,
                1, 1,
                0, 0,
                0, 0,
                1, 1,
                1, 0
              );
            }
          }
        }
      }
    }

    // Create meshes from groups
    for (const key in matGroups) {
      const g = matGroups[key];
      if (g.positions.length === 0) continue;

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(g.positions, 3));
      geometry.setAttribute('normal', new THREE.Float32BufferAttribute(g.normals, 3));
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute(g.uvs, 2));

      const material = getBlockMaterial(g.blockId, g.faceName);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { isVoxelMesh: true };
      this.meshGroup.add(mesh);
    }
  }

  // Raycasting helper to find targeted voxel position and surface normal
  raycast(raycaster) {
    const halfX = this.sizeX / 2;
    const halfZ = this.sizeZ / 2;

    const voxelMeshes = this.meshGroup.children.filter((c) => c.userData?.isVoxelMesh);
    const intersects = raycaster.intersectObjects(voxelMeshes, false);

    if (intersects.length > 0) {
      const hit = intersects[0];
      const norm = hit.face.normal;

      // Position inside the clicked block
      const insidePos = hit.point.clone().sub(norm.clone().multiplyScalar(0.01));
      const targetX = Math.floor(insidePos.x + halfX);
      const targetY = Math.floor(insidePos.y);
      const targetZ = Math.floor(insidePos.z + halfZ);

      // Position adjacent to clicked face (for placing)
      const adjacentX = targetX + Math.round(norm.x);
      const adjacentY = targetY + Math.round(norm.y);
      const adjacentZ = targetZ + Math.round(norm.z);

      return {
        hit: true,
        point: hit.point,
        normal: norm,
        target: { x: targetX, y: targetY, z: targetZ },
        adjacent: { x: adjacentX, y: adjacentY, z: adjacentZ }
      };
    }

    // If no mesh hit, check ground plane (Y=0)
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const planeHit = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(plane, planeHit)) {
      const gx = Math.floor(planeHit.x + halfX);
      const gz = Math.floor(planeHit.z + halfZ);
      if (gx >= 0 && gx < this.sizeX && gz >= 0 && gz < this.sizeZ) {
        return {
          hit: true,
          point: planeHit,
          normal: new THREE.Vector3(0, 1, 0),
          target: { x: gx, y: 0, z: gz },
          adjacent: { x: gx, y: 0, z: gz }
        };
      }
    }

    return { hit: false };
  }
}
