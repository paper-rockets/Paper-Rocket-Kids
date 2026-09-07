import { BLOCKS } from './blocks.js';

// Simple pseudo-random Perlin / Simplex noise approximation
class SimpleNoise {
  constructor(seed = 12345) {
    this.seed = seed;
  }

  // 2D pseudo random noise [0, 1]
  noise2D(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233 + this.seed) * 43758.5453;
    return n - Math.floor(n);
  }

  // Smooth interpolated noise
  smoothNoise(x, y) {
    const iX = Math.floor(x);
    const iY = Math.floor(y);
    const fX = x - iX;
    const fY = y - iY;

    // Smoothstep interpolation
    const u = fX * fX * (3 - 2 * fX);
    const v = fY * fY * (3 - 2 * fY);

    const n00 = this.noise2D(iX, iY);
    const n10 = this.noise2D(iX + 1, iY);
    const n01 = this.noise2D(iX, iY + 1);
    const n11 = this.noise2D(iX + 1, iY + 1);

    const nx0 = n00 * (1 - u) + n10 * u;
    const nx1 = n01 * (1 - u) + n11 * u;

    return nx0 * (1 - v) + nx1 * v;
  }

  // Octave fractal noise
  fractal(x, y, octaves = 3, persistence = 0.5) {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;
    for (let i = 0; i < octaves; i++) {
      total += this.smoothNoise(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }
    return total / maxValue;
  }
}

// Stamps / Structures Definition
export const STAMPS = {
  tree_oak: {
    name: '🌳 Oak Tree',
    sizeX: 5,
    sizeY: 7,
    sizeZ: 5,
    blocks: createOakTreeBlocks()
  },
  tree_pine: {
    name: '🌲 Pine Tree',
    sizeX: 5,
    sizeY: 8,
    sizeZ: 5,
    blocks: createPineTreeBlocks()
  },
  tree_palm: {
    name: '🌴 Palm Tree',
    sizeX: 5,
    sizeY: 7,
    sizeZ: 5,
    blocks: createPalmTreeBlocks()
  },
  tower: {
    name: '🏰 Castle Tower',
    sizeX: 5,
    sizeY: 9,
    sizeZ: 5,
    blocks: createTowerBlocks()
  },
  cottage: {
    name: '🏠 Cozy Cottage',
    sizeX: 6,
    sizeY: 6,
    sizeZ: 6,
    blocks: createCottageBlocks()
  },
  volcano_mini: {
    name: '🌋 Mini Volcano',
    sizeX: 7,
    sizeY: 6,
    sizeZ: 7,
    blocks: createMiniVolcanoBlocks()
  },
  treasure: {
    name: '💎 Treasure Vault',
    sizeX: 3,
    sizeY: 3,
    sizeZ: 3,
    blocks: createTreasureVaultBlocks()
  }
};

function createOakTreeBlocks() {
  const sx = 5, sy = 7, sz = 5;
  const b = new Uint8Array(sx * sy * sz);
  const set = (x, y, z, id) => {
    if (x >= 0 && x < sx && y >= 0 && y < sy && z >= 0 && z < sz) {
      b[x + y * sx + z * sx * sy] = id;
    }
  };

  // Trunk
  for (let y = 0; y < 5; y++) set(2, y, 2, BLOCKS.WOOD_LOG);

  // Leaves
  for (let ly = 3; ly <= 4; ly++) {
    for (let lx = 0; lx < 5; lx++) {
      for (let lz = 0; lz < 5; lz++) {
        if (Math.abs(lx - 2) + Math.abs(lz - 2) <= 3) {
          if (lx !== 2 || lz !== 2 || ly > 4) set(lx, ly, lz, BLOCKS.LEAVES);
        }
      }
    }
  }
  for (let lx = 1; lx <= 3; lx++) {
    for (let lz = 1; lz <= 3; lz++) {
      set(lx, 5, lz, BLOCKS.LEAVES);
    }
  }
  set(2, 6, 2, BLOCKS.LEAVES);
  return b;
}

function createPineTreeBlocks() {
  const sx = 5, sy = 8, sz = 5;
  const b = new Uint8Array(sx * sy * sz);
  const set = (x, y, z, id) => {
    if (x >= 0 && x < sx && y >= 0 && y < sy && z >= 0 && z < sz) {
      b[x + y * sx + z * sx * sy] = id;
    }
  };

  for (let y = 0; y < 7; y++) set(2, y, 2, BLOCKS.WOOD_LOG);

  // Layer 1
  for (let x = 0; x < 5; x++) {
    for (let z = 0; z < 5; z++) {
      if (Math.abs(x - 2) + Math.abs(z - 2) <= 2) set(x, 3, z, BLOCKS.LEAVES);
    }
  }
  // Layer 2
  for (let x = 1; x <= 3; x++) {
    for (let z = 1; z <= 3; z++) {
      set(x, 5, z, BLOCKS.LEAVES);
    }
  }
  set(2, 6, 2, BLOCKS.LEAVES);
  set(2, 7, 2, BLOCKS.SNOW);
  return b;
}

function createPalmTreeBlocks() {
  const sx = 5, sy = 7, sz = 5;
  const b = new Uint8Array(sx * sy * sz);
  const set = (x, y, z, id) => {
    if (x >= 0 && x < sx && y >= 0 && y < sy && z >= 0 && z < sz) {
      b[x + y * sx + z * sx * sy] = id;
    }
  };

  set(2, 0, 2, BLOCKS.WOOD_LOG);
  set(2, 1, 2, BLOCKS.WOOD_LOG);
  set(2, 2, 2, BLOCKS.WOOD_LOG);
  set(3, 3, 2, BLOCKS.WOOD_LOG);
  set(3, 4, 2, BLOCKS.WOOD_LOG);
  set(3, 5, 2, BLOCKS.WOOD_LOG);

  // Fronds
  set(3, 6, 2, BLOCKS.LEAVES);
  set(2, 5, 2, BLOCKS.LEAVES);
  set(1, 4, 2, BLOCKS.LEAVES);
  set(4, 5, 2, BLOCKS.LEAVES);
  set(5, 4, 2, BLOCKS.LEAVES);
  set(3, 5, 1, BLOCKS.LEAVES);
  set(3, 4, 0, BLOCKS.LEAVES);
  set(3, 5, 3, BLOCKS.LEAVES);
  set(3, 4, 4, BLOCKS.LEAVES);
  return b;
}

function createTowerBlocks() {
  const sx = 5, sy = 9, sz = 5;
  const b = new Uint8Array(sx * sy * sz);
  const set = (x, y, z, id) => {
    if (x >= 0 && x < sx && y >= 0 && y < sy && z >= 0 && z < sz) {
      b[x + y * sx + z * sx * sy] = id;
    }
  };

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 5; x++) {
      for (let z = 0; z < 5; z++) {
        const isWall = x === 0 || x === 4 || z === 0 || z === 4;
        if (isWall) {
          set(x, y, z, (x + y + z) % 4 === 0 ? BLOCKS.COBBLESTONE : BLOCKS.STONE);
        } else if (y === 0 || y === 7) {
          set(x, y, z, BLOCKS.WOOD_PLANKS);
        }
      }
    }
  }

  // Door
  set(2, 1, 0, BLOCKS.AIR);
  set(2, 2, 0, BLOCKS.AIR);

  // Battlements / Crenellations
  for (let x = 0; x < 5; x++) {
    for (let z = 0; z < 5; z++) {
      if ((x === 0 || x === 4 || z === 0 || z === 4) && (x + z) % 2 === 0) {
        set(x, 8, z, BLOCKS.COBBLESTONE);
      }
    }
  }

  // Lantern inside
  set(2, 6, 2, BLOCKS.GLOWSTONE);
  return b;
}

function createCottageBlocks() {
  const sx = 6, sy = 6, sz = 6;
  const b = new Uint8Array(sx * sy * sz);
  const set = (x, y, z, id) => {
    if (x >= 0 && x < sx && y >= 0 && y < sy && z >= 0 && z < sz) {
      b[x + y * sx + z * sx * sy] = id;
    }
  };

  // Floor & Walls
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 6; x++) {
      for (let z = 0; z < 6; z++) {
        const isCorner = (x === 0 || x === 5) && (z === 0 || z === 5);
        const isWall = x === 0 || x === 5 || z === 0 || z === 5;
        if (isCorner) {
          set(x, y, z, BLOCKS.WOOD_LOG);
        } else if (isWall) {
          set(x, y, z, BLOCKS.WOOD_PLANKS);
        } else if (y === 0) {
          set(x, y, z, BLOCKS.COBBLESTONE);
        }
      }
    }
  }

  // Door and windows
  set(2, 1, 0, BLOCKS.AIR);
  set(2, 2, 0, BLOCKS.AIR);
  set(4, 2, 0, BLOCKS.GLASS);
  set(0, 2, 3, BLOCKS.GLASS);
  set(5, 2, 3, BLOCKS.GLASS);

  // Pitched Roof
  for (let z = 0; z < 6; z++) {
    set(0, 3, z, BLOCKS.BRICK);
    set(1, 4, z, BLOCKS.BRICK);
    set(2, 5, z, BLOCKS.BRICK);
    set(3, 5, z, BLOCKS.BRICK);
    set(4, 4, z, BLOCKS.BRICK);
    set(5, 3, z, BLOCKS.BRICK);
  }

  // Lantern
  set(2, 3, 2, BLOCKS.GLOWSTONE);
  return b;
}

function createMiniVolcanoBlocks() {
  const sx = 7, sy = 6, sz = 7;
  const b = new Uint8Array(sx * sy * sz);
  const set = (x, y, z, id) => {
    if (x >= 0 && x < sx && y >= 0 && y < sy && z >= 0 && z < sz) {
      b[x + y * sx + z * sx * sy] = id;
    }
  };

  for (let y = 0; y < 6; y++) {
    const radius = 3.5 - y * 0.45;
    for (let x = 0; x < 7; x++) {
      for (let z = 0; z < 7; z++) {
        const dist = Math.sqrt((x - 3) * (x - 3) + (z - 3) * (z - 3));
        if (dist <= radius) {
          if (dist <= 1.2 && y >= 4) {
            set(x, y, z, BLOCKS.LAVA);
          } else {
            set(x, y, z, (x + y + z) % 3 === 0 ? BLOCKS.COBBLESTONE : BLOCKS.STONE);
          }
        }
      }
    }
  }
  return b;
}

function createTreasureVaultBlocks() {
  const sx = 3, sy = 3, sz = 3;
  const b = new Uint8Array(sx * sy * sz);
  const set = (x, y, z, id) => {
    if (x >= 0 && x < sx && y >= 0 && y < sy && z >= 0 && z < sz) {
      b[x + y * sx + z * sx * sy] = id;
    }
  };

  for (let x = 0; x < 3; x++) {
    for (let z = 0; z < 3; z++) {
      set(x, 0, z, BLOCKS.GOLD);
    }
  }
  set(1, 1, 1, BLOCKS.DIAMOND);
  set(1, 2, 1, BLOCKS.GLOWSTONE);
  set(0, 1, 1, BLOCKS.GLASS);
  set(2, 1, 1, BLOCKS.GLASS);
  set(1, 1, 0, BLOCKS.GLASS);
  set(1, 1, 2, BLOCKS.GLASS);
  return b;
}

// Scatter underground precious ore veins (Gold and Diamonds) inside stone layers
export function addUndergroundOreVeins(world, seed = 12345) {
  const sx = world.sizeX;
  const sz = world.sizeZ;

  let s = seed;
  function rnd() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  }

  // Find candidate underground stone blocks
  const stonePositions = [];
  for (let x = 1; x < sx - 1; x++) {
    for (let z = 1; z < sz - 1; z++) {
      const highest = world.getHighestBlock(x, z);
      // Place ores at least 2 blocks below the surface
      for (let y = 1; y <= highest - 2; y++) {
        if (world.getBlock(x, y, z) === BLOCKS.STONE) {
          stonePositions.push({ x, y, z });
        }
      }
    }
  }

  if (stonePositions.length === 0) return;

  // 1. Gold Veins: clusters of 2-4 gold blocks
  const numGoldVeins = Math.min(8, Math.max(3, Math.floor(stonePositions.length / 80)));
  for (let v = 0; v < numGoldVeins; v++) {
    const origin = stonePositions[Math.floor(rnd() * stonePositions.length)];
    if (!origin) continue;
    const clusterSize = 2 + Math.floor(rnd() * 3);
    for (let c = 0; c < clusterSize; c++) {
      const ox = origin.x + (rnd() > 0.5 ? 1 : (rnd() > 0.5 ? -1 : 0));
      const oy = origin.y + (rnd() > 0.5 ? 1 : (rnd() > 0.5 ? -1 : 0));
      const oz = origin.z + (rnd() > 0.5 ? 1 : (rnd() > 0.5 ? -1 : 0));
      if (world.getBlock(ox, oy, oz) === BLOCKS.STONE) {
        world.setBlock(ox, oy, oz, BLOCKS.GOLD, false);
      }
    }
  }

  // 2. Diamond Veins: deep clusters of 2-3 diamond blocks
  const numDiamondVeins = Math.min(5, Math.max(2, Math.floor(stonePositions.length / 140)));
  for (let v = 0; v < numDiamondVeins; v++) {
    const origin = stonePositions[Math.floor(rnd() * stonePositions.length)];
    if (!origin) continue;
    const clusterSize = 2 + Math.floor(rnd() * 2);
    for (let c = 0; c < clusterSize; c++) {
      const ox = origin.x + (rnd() > 0.5 ? 1 : 0);
      const oy = origin.y + (rnd() > 0.5 ? 1 : (rnd() > 0.5 ? -1 : 0));
      const oz = origin.z + (rnd() > 0.5 ? 1 : 0);
      if (world.getBlock(ox, oy, oz) === BLOCKS.STONE) {
        world.setBlock(ox, oy, oz, BLOCKS.DIAMOND, false);
      }
    }
  }
}

// 5 Magic Theme Generators
export function generateTheme(world, themeName, seed = Math.floor(Math.random() * 99999), includeOres = true) {
  world.clear();
  const noise = new SimpleNoise(seed);
  const sx = world.sizeX;
  const sy = world.sizeY;
  const sz = world.sizeZ;
  const centerX = sx / 2;
  const centerZ = sz / 2;

  switch (themeName) {
    case 'floating_islands': {
      // Multiple floating islands
      for (let x = 0; x < sx; x++) {
        for (let z = 0; z < sz; z++) {
          // Main center island
          const d1 = Math.hypot(x - centerX * 0.8, z - centerZ * 0.9) / 14;
          const h1 = 16 + Math.round(noise.fractal(x * 0.08, z * 0.08) * 4);
          const t1 = Math.max(0, 1 - d1);

          // Higher East island
          const d2 = Math.hypot(x - centerX * 1.35, z - centerZ * 1.25) / 10;
          const h2 = 20 + Math.round(noise.fractal(x * 0.12, z * 0.12) * 3);
          const t2 = Math.max(0, 1 - d2);

          // Small South island
          const d3 = Math.hypot(x - centerX * 1.3, z - centerZ * 0.45) / 7.5;
          const h3 = 13 + Math.round(noise.fractal(x * 0.15, z * 0.15) * 3);
          const t3 = Math.max(0, 1 - d3);

          const islands = [
            { t: t1, topY: h1, depth: 8 },
            { t: t2, topY: h2, depth: 7 },
            { t: t3, topY: h3, depth: 6 }
          ];

          for (const isl of islands) {
            if (isl.t > 0.05) {
              const bottomDepth = Math.max(2, Math.round(isl.depth * Math.pow(isl.t, 1.2)));
              const topY = isl.topY;
              const botY = Math.max(1, topY - bottomDepth);

              for (let y = botY; y <= topY; y++) {
                let block = BLOCKS.STONE;
                if (y === topY) block = BLOCKS.GRASS;
                else if (y >= topY - 2) block = BLOCKS.DIRT;
                world.setBlock(x, y, z, block, false);
              }
            }
          }
        }
      }

      // Add wooden suspension bridge between island 1 and 2
      for (let i = 0; i <= 9; i++) {
        const bx = Math.round(centerX * 0.8 + i * (centerX * 0.55) / 9);
        const bz = Math.round(centerZ * 0.9 + i * (centerZ * 0.35) / 9);
        const by = Math.round(16 + i * 0.45);
        world.setBlock(bx, by, bz, BLOCKS.WOOD_PLANKS, false);
      }

      // Add Trees & Waterfalls
      world.stampStructure(STAMPS.tree_oak, Math.floor(centerX * 0.7), 17, Math.floor(centerZ * 0.8));
      world.stampStructure(STAMPS.treasure, Math.floor(centerX * 1.35), 21, Math.floor(centerZ * 1.25));

      // Waterfall spilling into void
      const wfx = Math.floor(centerX * 0.9);
      const wfz = Math.floor(centerZ * 0.95);
      for (let wy = 16; wy >= 3; wy--) {
        world.setBlock(wfx, wy, wfz, BLOCKS.WATER, false);
      }
      break;
    }

    case 'volcano': {
      const craterRadius = 4;
      const volcanoRadius = 18;

      for (let x = 0; x < sx; x++) {
        for (let z = 0; z < sz; z++) {
          const dist = Math.hypot(x - centerX, z - centerZ);
          let height = 3 + Math.round(noise.fractal(x * 0.08, z * 0.08) * 3);

          if (dist < volcanoRadius) {
            const slope = (volcanoRadius - dist) / volcanoRadius;
            height += Math.round(slope * 16);

            // Crater depression
            if (dist < craterRadius) {
              const craterDepth = Math.round((craterRadius - dist) * 2);
              height = Math.max(6, height - craterDepth);
            }
          }

          for (let y = 0; y <= height; y++) {
            let block = BLOCKS.STONE;
            if (dist < craterRadius && y === height) {
              block = BLOCKS.LAVA;
            } else if (dist < volcanoRadius && y === height) {
              block = (x + y + z) % 4 === 0 ? BLOCKS.COBBLESTONE : BLOCKS.STONE;
            } else if (y === height) {
              block = BLOCKS.GRASS;
            } else if (y >= height - 2) {
              block = BLOCKS.DIRT;
            }
            world.setBlock(x, y, z, block, false);
          }
        }
      }

      // Lava River flowing down
      for (let step = 0; step < 14; step++) {
        const lx = Math.floor(centerX + step * 0.9);
        const lz = Math.floor(centerZ + Math.sin(step * 0.6) * 4);
        const ly = world.getHighestBlock(lx, lz);
        world.setBlock(lx, ly, lz, BLOCKS.LAVA, false);
        world.setBlock(lx + 1, ly, lz, BLOCKS.COBBLESTONE, false);
        world.setBlock(lx - 1, ly, lz, BLOCKS.COBBLESTONE, false);
      }
      break;
    }

    case 'enchanted_forest': {
      const waterLevel = 6;
      for (let x = 0; x < sx; x++) {
        for (let z = 0; z < sz; z++) {
          const baseHeight = 5 + Math.round(noise.fractal(x * 0.06, z * 0.06, 4) * 8);

          // River meander
          const riverZ = centerZ + Math.sin(x * 0.15) * 6;
          const distToRiver = Math.abs(z - riverZ);
          let height = baseHeight;

          if (distToRiver < 3.5) {
            height = Math.min(height, waterLevel - 1 + Math.floor(distToRiver));
          }

          for (let y = 0; y <= Math.max(height, waterLevel); y++) {
            if (y <= height) {
              let block = BLOCKS.STONE;
              if (y === height) {
                block = distToRiver < 4.5 ? BLOCKS.SAND : BLOCKS.GRASS;
              } else if (y >= height - 2) {
                block = BLOCKS.DIRT;
              }
              world.setBlock(x, y, z, block, false);
            } else if (y <= waterLevel) {
              world.setBlock(x, y, z, BLOCKS.WATER, false);
            }
          }
        }
      }

      // Scatter oak trees & flowers/glowstones
      const treePositions = [
        [centerX - 8, centerZ - 8],
        [centerX - 12, centerZ + 6],
        [centerX + 8, centerZ + 10],
        [centerX + 12, centerZ - 8],
        [centerX - 5, centerZ + 12],
        [centerX + 14, centerZ + 4]
      ];

      for (const [tx, tz] of treePositions) {
        const ty = world.getHighestBlock(tx, tz);
        if (ty >= waterLevel && world.getBlock(tx, ty, tz) === BLOCKS.GRASS) {
          world.stampStructure(STAMPS.tree_oak, tx - 2, ty + 1, tz - 2);
        }
      }

      // Cozy Cottage in the forest
      const cotX = Math.floor(centerX - 4);
      const cotZ = Math.floor(centerZ - 10);
      const cotY = world.getHighestBlock(cotX, cotZ);
      world.stampStructure(STAMPS.cottage, cotX - 3, cotY + 1, cotZ - 3);
      break;
    }

    case 'snowy_ice_realm': {
      const waterLevel = 5;
      for (let x = 0; x < sx; x++) {
        for (let z = 0; z < sz; z++) {
          const height = 4 + Math.round(noise.fractal(x * 0.08, z * 0.08, 4) * 14);

          for (let y = 0; y <= Math.max(height, waterLevel); y++) {
            if (y <= height) {
              let block = BLOCKS.STONE;
              if (y === height) {
                block = y >= 10 ? BLOCKS.SNOW : (y >= 6 ? BLOCKS.DIRT : BLOCKS.COBBLESTONE);
              }
              world.setBlock(x, y, z, block, false);
            } else if (y <= waterLevel) {
              world.setBlock(x, y, z, BLOCKS.GLASS, false); // Frozen ice
            }
          }
        }
      }

      // Add Pine Trees and Castle Tower on mountain
      const pinePositions = [
        [centerX - 6, centerZ - 6],
        [centerX + 8, centerZ - 10],
        [centerX - 10, centerZ + 8],
        [centerX + 6, centerZ + 8]
      ];
      for (const [px, pz] of pinePositions) {
        const py = world.getHighestBlock(px, pz);
        if (py >= waterLevel) {
          world.stampStructure(STAMPS.tree_pine, px - 2, py + 1, pz - 2);
        }
      }

      // Tower atop highest mountain
      const towX = Math.floor(centerX);
      const towZ = Math.floor(centerZ);
      const towY = world.getHighestBlock(towX, towZ);
      world.stampStructure(STAMPS.tower, towX - 2, towY + 1, towZ - 2);
      break;
    }

    case 'desert_oasis': {
      const waterLevel = 5;
      for (let x = 0; x < sx; x++) {
        for (let z = 0; z < sz; z++) {
          const duneHeight = 5 + Math.round(noise.fractal(x * 0.05, z * 0.05) * 8);

          // Oasis pool in center
          const distToCenter = Math.hypot(x - centerX, z - centerZ);
          let height = duneHeight;
          if (distToCenter < 6) {
            height = waterLevel - 2 + Math.round(distToCenter * 0.5);
          }

          for (let y = 0; y <= Math.max(height, waterLevel); y++) {
            if (y <= height) {
              const block = y === height ? BLOCKS.SAND : (y >= height - 3 ? BLOCKS.SAND : BLOCKS.STONE);
              world.setBlock(x, y, z, block, false);
            } else if (y <= waterLevel && distToCenter < 6) {
              world.setBlock(x, y, z, BLOCKS.WATER, false);
            }
          }
        }
      }

      // Palm trees around oasis
      const palmPositions = [
        [centerX - 5, centerZ - 3],
        [centerX + 4, centerZ + 4],
        [centerX - 3, centerZ + 5]
      ];
      for (const [px, pz] of palmPositions) {
        const py = world.getHighestBlock(px, pz);
        world.stampStructure(STAMPS.tree_palm, px - 2, py + 1, pz - 2);
      }

      // Ancient Sandstone Pyramid
      const pyrX = Math.floor(centerX + 10);
      const pyrZ = Math.floor(centerZ - 10);
      const pyrY = world.getHighestBlock(pyrX, pyrZ);
      for (let level = 0; level < 5; level++) {
        const r = 4 - level;
        for (let dx = -r; dx <= r; dx++) {
          for (let dz = -r; dz <= r; dz++) {
            world.setBlock(pyrX + dx, pyrY + 1 + level, pyrZ + dz, BLOCKS.SAND, false);
          }
        }
      }
      world.setBlock(pyrX, pyrY + 6, pyrZ, BLOCKS.GOLD, false);
      break;
    }
  }

  if (includeOres) {
    addUndergroundOreVeins(world, seed);
  }

  world.rebuildMesh();
}

// Pre-made Adventure Maps
export const PREMADE_MAPS = {
  fairy_castle: {
    name: '👑 Fairy Princess Palace',
    generate: (world) => {
      world.clear();
      const sx = world.sizeX, sz = world.sizeZ;
      const cx = Math.floor(sx / 2), cz = Math.floor(sz / 2);

      // 1. Lush Royal Garden Island with Moat
      for (let x = 0; x < sx; x++) {
        for (let z = 0; z < sz; z++) {
          const dist = Math.hypot(x - cx, z - cz);
          let h = 4;
          if (dist > 20) h = 2; // Deep outer water
          else if (dist > 16) h = 3; // Moat
          else if (dist < 12) h = 6; // Raised royal terrace

          for (let y = 0; y <= 5; y++) {
            if (y <= h) {
              world.setBlock(x, y, z, y === h ? BLOCKS.GRASS : BLOCKS.DIRT, false);
            } else if (dist > 16) {
              world.setBlock(x, y, z, BLOCKS.WATER, false);
            }
          }
        }
      }

      // 2. Marble & Brick Palace Base Walls (14 x 14)
      const r = 7;
      for (let dx = -r; dx <= r; dx++) {
        for (let dz = -r; dz <= r; dz++) {
          const isWall = (Math.abs(dx) === r || Math.abs(dz) === r);
          const isCorner = (Math.abs(dx) >= r - 1 && Math.abs(dz) >= r - 1);
          const x = cx + dx;
          const z = cz + dz;

          // Interior Floor
          if (!isWall) {
            world.setBlock(x, 6, z, (Math.abs(dx) <= 1) ? BLOCKS.BRICK : BLOCKS.WOOD_PLANKS, false);
          }

          // Exterior walls
          if (isWall && !isCorner) {
            for (let y = 7; y <= 11; y++) {
              if ((y === 8 || y === 9) && (Math.abs(dx) % 3 === 0 || Math.abs(dz) % 3 === 0)) {
                world.setBlock(x, y, z, BLOCKS.GLASS, false);
              } else {
                world.setBlock(x, y, z, BLOCKS.BRICK, false);
              }
            }
            if ((dx + dz) % 2 === 0) {
              world.setBlock(x, 12, z, BLOCKS.COBBLESTONE, false);
            }
          }
        }
      }

      // 3. Four Grand Princess Towers with Golden Conical Roofs
      const towerCorners = [
        [cx - r, cz - r],
        [cx + r, cz - r],
        [cx - r, cz + r],
        [cx + r, cz + r]
      ];

      for (const [tx, tz] of towerCorners) {
        // Tower Shaft
        for (let y = 6; y <= 14; y++) {
          for (let dx = -1; dx <= 1; dx++) {
            for (let dz = -1; dz <= 1; dz++) {
              world.setBlock(tx + dx, y, tz + dz, BLOCKS.COBBLESTONE, false);
            }
          }
        }
        world.setBlock(tx, 14, tz, BLOCKS.GLOWSTONE, false);

        // Golden Roof Cone
        for (let dy = 0; dy <= 3; dy++) {
          const roofR = 2 - Math.floor(dy / 1.5);
          for (let dx = -roofR; dx <= roofR; dx++) {
            for (let dz = -roofR; dz <= roofR; dz++) {
              if (Math.abs(dx) + Math.abs(dz) <= roofR + 1) {
                world.setBlock(tx + dx, 15 + dy, tz + dz, BLOCKS.GOLD, false);
              }
            }
          }
        }
        world.setBlock(tx, 19, tz, BLOCKS.DIAMOND, false);
      }

      // 4. Grand Central Keep & Royal Throne
      for (let dx = -3; dx <= 3; dx++) {
        for (let dz = -3; dz <= 3; dz++) {
          for (let y = 7; y <= 14; y++) {
            if (Math.abs(dx) === 3 || Math.abs(dz) === 3) {
              world.setBlock(cx + dx, y, cz + dz, BLOCKS.BRICK, false);
            }
          }
        }
      }

      for (let dy = 0; dy <= 3; dy++) {
        const domR = 3 - dy;
        for (let dx = -domR; dx <= domR; dx++) {
          for (let dz = -domR; dz <= domR; dz++) {
            world.setBlock(cx + dx, 15 + dy, cz + dz, BLOCKS.GOLD, false);
          }
        }
      }
      world.setBlock(cx, 19, cz, BLOCKS.DIAMOND, false);

      // Royal Throne
      world.setBlock(cx, 7, cz - 2, BLOCKS.GOLD, false);
      world.setBlock(cx, 8, cz - 2, BLOCKS.GOLD, false);
      world.setBlock(cx - 1, 7, cz - 2, BLOCKS.DIAMOND, false);
      world.setBlock(cx + 1, 7, cz - 2, BLOCKS.DIAMOND, false);
      world.setBlock(cx, 9, cz - 2, BLOCKS.GLOWSTONE, false);

      // 5. Grand Castle Gate & Drawbridge across Moat
      for (let dz = r + 1; dz <= 18; dz++) {
        world.setBlock(cx - 1, 5, cz + dz, BLOCKS.WOOD_PLANKS, false);
        world.setBlock(cx, 5, cz + dz, BLOCKS.WOOD_PLANKS, false);
        world.setBlock(cx + 1, 5, cz + dz, BLOCKS.WOOD_PLANKS, false);
      }
      world.setBlock(cx - 1, 7, cz + r, BLOCKS.COBBLESTONE, false);
      world.setBlock(cx - 1, 8, cz + r, BLOCKS.COBBLESTONE, false);
      world.setBlock(cx + 1, 7, cz + r, BLOCKS.COBBLESTONE, false);
      world.setBlock(cx + 1, 8, cz + r, BLOCKS.COBBLESTONE, false);
      world.setBlock(cx, 9, cz + r, BLOCKS.GLOWSTONE, false);

      // 6. Courtyard Fountains & Gardens
      world.setBlock(cx - 4, 7, cz + 2, BLOCKS.WATER, false);
      world.setBlock(cx + 4, 7, cz + 2, BLOCKS.WATER, false);
      world.stampStructure(STAMPS.tree_oak, cx - 11, 6, cz - 11);
      world.stampStructure(STAMPS.tree_oak, cx + 9, 6, cz - 11);

      world.rebuildMesh();
    }
  },

  castle_kingdom: {
    name: '🏰 Castle Kingdom Island',
    generate: (world) => {
      world.clear();
      const sx = world.sizeX, sz = world.sizeZ;
      const cx = Math.floor(sx / 2), cz = Math.floor(sz / 2);

      // Moat and Island
      for (let x = 0; x < sx; x++) {
        for (let z = 0; z < sz; z++) {
          const dist = Math.hypot(x - cx, z - cz);
          let h = 4;
          if (dist > 18) h = 2; // Water moat
          else if (dist < 14) h = 6; // Inner courtyard

          for (let y = 0; y <= 4; y++) {
            if (y <= h) {
              world.setBlock(x, y, z, y === h ? BLOCKS.GRASS : BLOCKS.DIRT, false);
            } else if (dist > 18) {
              world.setBlock(x, y, z, BLOCKS.WATER, false);
            }
          }
        }
      }

      // 4 Castle Corner Towers
      const offsets = [[-8, -8], [8, -8], [-8, 8], [8, 8]];
      for (const [ox, oz] of offsets) {
        world.stampStructure(STAMPS.tower, cx + ox - 2, 7, cz + oz - 2);
      }

      // Connecting Walls
      for (let i = -6; i <= 6; i++) {
        for (let y = 7; y <= 9; y++) {
          world.setBlock(cx + i, y, cz - 8, BLOCKS.COBBLESTONE, false);
          world.setBlock(cx + i, y, cz + 8, BLOCKS.COBBLESTONE, false);
          world.setBlock(cx - 8, y, cz + i, BLOCKS.COBBLESTONE, false);
          world.setBlock(cx + 8, y, cz + i, BLOCKS.COBBLESTONE, false);
        }
      }

      // Central King's Gold Vault & Lanterns
      world.stampStructure(STAMPS.treasure, cx - 1, 7, cz - 1);
      world.rebuildMesh();
    }
  },

  pirate_cove: {
    name: '🏴‍☠️ Pirate Cove & Ship',
    generate: (world) => {
      world.clear();
      const sx = world.sizeX, sz = world.sizeZ;
      const cx = Math.floor(sx / 2), cz = Math.floor(sz / 2);

      // Horseshoe Island with Lagoon
      for (let x = 0; x < sx; x++) {
        for (let z = 0; z < sz; z++) {
          const dist = Math.hypot(x - cx, z - cz);
          const angle = Math.atan2(z - cz, x - cx);
          let h = 4;

          // Open mouth to lagoon on south
          if (dist < 16 && (angle < -0.4 || angle > 2.0 || dist > 8)) {
            h = 5 + Math.round(Math.sin(dist * 0.5) * 2);
          } else {
            h = 2; // Water
          }

          for (let y = 0; y <= 4; y++) {
            if (y <= h) {
              world.setBlock(x, y, z, h <= 3 ? BLOCKS.SAND : BLOCKS.GRASS, false);
            } else if (y <= 4) {
              world.setBlock(x, y, z, BLOCKS.WATER, false);
            }
          }
        }
      }

      // Voxel Pirate Ship in lagoon
      const shipX = cx - 3;
      const shipZ = cz + 3;
      // Hull
      for (let l = 0; l < 8; l++) {
        for (let w = 0; w < 3; w++) {
          world.setBlock(shipX + w, 4, shipZ + l, BLOCKS.WOOD_PLANKS, false);
          world.setBlock(shipX + w, 5, shipZ + l, (w === 0 || w === 2 || l === 0 || l === 7) ? BLOCKS.WOOD_PLANKS : BLOCKS.AIR, false);
        }
      }
      // Mast & Sail
      for (let my = 5; my <= 11; my++) {
        world.setBlock(shipX + 1, my, shipZ + 4, BLOCKS.WOOD_LOG, false);
      }
      for (let sy = 8; sy <= 10; sy++) {
        for (let sx = -1; sx <= 3; sx++) {
          world.setBlock(shipX + sx, sy, shipZ + 4, BLOCKS.SNOW, false);
        }
      }

      // Palm trees & treasure
      world.stampStructure(STAMPS.tree_palm, cx + 8, 6, cz - 4);
      world.stampStructure(STAMPS.tree_palm, cx - 10, 6, cz - 6);
      world.stampStructure(STAMPS.treasure, cx - 8, 6, cz + 2);

      world.rebuildMesh();
    }
  },

  cozy_village: {
    name: '🏡 Cozy Farming Village',
    generate: (world) => {
      world.clear();
      const sx = world.sizeX, sz = world.sizeZ;
      const cx = Math.floor(sx / 2), cz = Math.floor(sz / 2);

      // Flat grass plain with river
      for (let x = 0; x < sx; x++) {
        for (let z = 0; z < sz; z++) {
          const riverX = cx + Math.sin(z * 0.2) * 4;
          const distToRiver = Math.abs(x - riverX);
          const h = distToRiver < 3 ? 3 : 5;

          for (let y = 0; y <= 5; y++) {
            if (y <= h) {
              world.setBlock(x, y, z, distToRiver < 3.5 ? BLOCKS.SAND : BLOCKS.GRASS, false);
            } else if (y <= 4) {
              world.setBlock(x, y, z, BLOCKS.WATER, false);
            }
          }
        }
      }

      // 3 Cottages
      world.stampStructure(STAMPS.cottage, cx - 14, 6, cz - 8);
      world.stampStructure(STAMPS.cottage, cx - 12, 6, cz + 6);
      world.stampStructure(STAMPS.cottage, cx + 8, 6, cz - 6);

      // Farm wheat plots
      for (let fx = 0; fx < 5; fx++) {
        for (let fz = 0; fz < 4; fz++) {
          world.setBlock(cx + 8 + fx, 5, cz + 4 + fz, BLOCKS.DIRT, false);
          world.setBlock(cx + 8 + fx, 6, cz + 4 + fz, BLOCKS.GOLD, false); // Crop
        }
      }

      // Trees
      world.stampStructure(STAMPS.tree_oak, cx - 16, 6, cz - 16);
      world.stampStructure(STAMPS.tree_oak, cx + 14, 6, cz + 12);
      world.rebuildMesh();
    }
  },

  pink_castle: {
    name: '🌸 Pink Fairytale Castle',
    generate: (world) => {
      world.resize(72, 48, 72);
      world.clear();
      const sx = world.sizeX, sz = world.sizeZ;
      const cx = Math.floor(sx / 2), cz = Math.floor(sz / 2);

      // 1. Crystal Lagoon, Sandy Beaches, and Cliff Promontory
      for (let x = 0; x < sx; x++) {
        for (let z = 0; z < sz; z++) {
          const isFrontWater = (z >= cz + 6);
          const isLeftCliff = (x < cx - 14 && z >= cz - 4);
          let h = 6;

          if (isLeftCliff) {
            // Natural rocky sea cliffs
            const cDist = Math.hypot(x - (cx - 24), z - (cz + 14));
            h = Math.max(7, Math.round(15 - cDist * 0.4));
          } else if (isFrontWater) {
            // Lagoon channel
            const shoreDist = z - (cz + 6);
            h = shoreDist <= 2 ? 5 : (shoreDist <= 4 ? 4 : 2);
          } else {
            // Palace elevated royal garden terrace
            const pDist = Math.hypot(x - cx, z - (cz - 6));
            h = pDist < 18 ? 8 : 7;
          }

          for (let y = 0; y <= h; y++) {
            let b = BLOCKS.STONE;
            if (y === h) {
              if (isLeftCliff) b = BLOCKS.STONE;
              else if (isFrontWater && h <= 3) b = BLOCKS.SAND;
              else if (isFrontWater && h <= 5) b = BLOCKS.SAND;
              else b = BLOCKS.GRASS;
            } else if (y >= h - 2 && !isLeftCliff) {
              b = (h <= 5) ? BLOCKS.SAND : BLOCKS.DIRT;
            }
            world.setBlock(x, y, z, b, false);
          }

          // Fill lagoon water
          if (isFrontWater && h < 5) {
            for (let y = h + 1; y <= 5; y++) {
              world.setBlock(x, y, z, BLOCKS.WATER, false);
            }
          }
        }
      }

      // Natural Sea Cave Arch under the left cliff
      for (let x = cx - 26; x <= cx - 18; x++) {
        for (let z = cz + 10; z <= cz + 20; z++) {
          for (let y = 1; y <= 7; y++) {
            if (Math.hypot(x - (cx - 22), y - 2) < 4.5) {
              world.setBlock(x, y, z, (y <= 5) ? BLOCKS.WATER : BLOCKS.AIR, false);
            }
          }
        }
      }

      // Wooden Marina Boardwalk & Dock
      for (let z = cz + 6; z <= cz + 26; z++) {
        for (let dx = -1; dx <= 1; dx++) {
          const x = cx + 8 + dx;
          world.setBlock(x, 6, z, BLOCKS.WOOD_PLANKS, false);
        }
        if (z % 5 === 0) {
          world.setBlock(cx + 7, 7, z, BLOCKS.WOOD_LOG, false);
          world.setBlock(cx + 9, 7, z, BLOCKS.WOOD_LOG, false);
          world.setBlock(cx + 7, 8, z, BLOCKS.GLOWSTONE, false);
        }
      }
      for (let x = cx + 5; x <= cx + 12; x++) {
        for (let z = cz + 24; z <= cz + 27; z++) {
          world.setBlock(x, 6, z, BLOCKS.WOOD_PLANKS, false);
        }
      }

      // 2. Palace Main Structure (Quartz & Pink Concrete)
      const pw = 18, pd = 12;
      for (let dx = -pw; dx <= pw; dx++) {
        for (let dz = -pd; dz <= pd; dz++) {
          const x = cx + dx;
          const z = cz - 4 + dz;
          const isOuter = (Math.abs(dx) === pw || Math.abs(dz) === pd);
          const isCorner = (Math.abs(dx) >= pw - 2 && Math.abs(dz) >= pd - 2);

          // Courtyard floor
          world.setBlock(x, 8, z, (Math.abs(dx) % 3 === 0 || Math.abs(dz) % 3 === 0) ? BLOCKS.QUARTZ : BLOCKS.PINK_CONCRETE, false);

          if (isOuter && !isCorner) {
            // Main Palace Walls
            for (let y = 9; y <= 19; y++) {
              const isWindow = (y >= 12 && y <= 15) && (Math.abs(dx) % 4 === 0 || Math.abs(dz) % 4 === 0);
              const isPillar = (Math.abs(dx) % 4 === 2 || Math.abs(dz) % 4 === 2);
              let b = BLOCKS.PINK_CONCRETE;
              if (isWindow) b = BLOCKS.GLASS;
              else if (isPillar || y === 9 || y === 19) b = BLOCKS.QUARTZ;
              world.setBlock(x, y, z, b, false);
            }
            // Quartz balustrade on roof
            world.setBlock(x, 20, z, (Math.abs(dx + dz) % 2 === 0) ? BLOCKS.QUARTZ : BLOCKS.AIR, false);
          }
        }
      }

      // Grand Entrance Portico & Staircase
      for (let st = 0; st <= 3; st++) {
        for (let dx = -4; dx <= 4; dx++) {
          world.setBlock(cx + dx, 5 + st, cz + 8 - st, BLOCKS.QUARTZ, false);
        }
      }
      for (let y = 9; y <= 16; y++) {
        world.setBlock(cx - 3, y, cz + 8, BLOCKS.QUARTZ, false);
        world.setBlock(cx + 3, y, cz + 8, BLOCKS.QUARTZ, false);
      }
      for (let dx = -3; dx <= 3; dx++) {
        world.setBlock(cx + dx, 16, cz + 8, BLOCKS.GOLD, false);
      }

      // 3. 4 Soaring Corner Palace Spires
      const spires = [
        [cx - pw, cz - 4 - pd],
        [cx + pw, cz - 4 - pd],
        [cx - pw, cz - 4 + pd],
        [cx + pw, cz - 4 + pd]
      ];

      for (const [tx, tz] of spires) {
        // Tower Shaft
        for (let y = 8; y <= 27; y++) {
          for (let dx = -2; dx <= 2; dx++) {
            for (let dz = -2; dz <= 2; dz++) {
              const dist = Math.hypot(dx, dz);
              if (dist <= 2.6) {
                const isTrim = (y === 8 || y === 17 || y === 27 || dist > 2.1);
                world.setBlock(tx + dx, y, tz + dz, isTrim ? BLOCKS.QUARTZ : BLOCKS.PINK_CONCRETE, false);
              }
            }
          }
          if (y === 14 || y === 22) {
            world.setBlock(tx, y, tz + 2, BLOCKS.GLASS, false);
            world.setBlock(tx, y, tz - 2, BLOCKS.GLASS, false);
            world.setBlock(tx + 2, y, tz, BLOCKS.GLASS, false);
            world.setBlock(tx - 2, y, tz, BLOCKS.GLASS, false);
          }
        }

        // Flaring Balcony
        for (let dx = -3; dx <= 3; dx++) {
          for (let dz = -3; dz <= 3; dz++) {
            if (Math.hypot(dx, dz) <= 3.4) {
              world.setBlock(tx + dx, 27, tz + dz, BLOCKS.QUARTZ, false);
              if (Math.hypot(dx, dz) > 2.4) {
                world.setBlock(tx + dx, 28, tz + dz, BLOCKS.GOLD, false);
              }
            }
          }
        }
        world.setBlock(tx, 28, tz, BLOCKS.GLOWSTONE, false);

        // Conical Purple & Magenta Spire Roof
        for (let dy = 0; dy <= 10; dy++) {
          const r = Math.max(0, 3 - Math.floor(dy / 2.5));
          for (let dx = -r; dx <= r; dx++) {
            for (let dz = -r; dz <= r; dz++) {
              if (Math.hypot(dx, dz) <= r + 0.3) {
                world.setBlock(tx + dx, 29 + dy, tz + dz, BLOCKS.PURPLE_BLOCK, false);
              }
            }
          }
        }
        world.setBlock(tx, 40, tz, BLOCKS.GOLD, false);
        world.setBlock(tx, 41, tz, BLOCKS.DIAMOND, false);
      }

      // 4. Central Grand Royal Keep & Crown Spire
      for (let dx = -7; dx <= 7; dx++) {
        for (let dz = -7; dz <= 7; dz++) {
          const dist = Math.hypot(dx, dz);
          if (dist <= 7.2) {
            for (let y = 9; y <= 27; y++) {
              let b = (dist > 6.2) ? BLOCKS.QUARTZ : BLOCKS.PINK_CONCRETE;
              if (dist > 6.2 && (y === 15 || y === 16 || y === 23 || y === 24) && (Math.abs(dx) <= 2 || Math.abs(dz) <= 2)) {
                b = BLOCKS.GLASS;
              }
              world.setBlock(cx + dx, y, cz - 4 + dz, b, false);
            }
          }
        }
      }

      // Central Royal Dome & Golden Crown
      for (let dy = 0; dy <= 8; dy++) {
        const r = Math.max(0, 6 - dy);
        for (let dx = -r; dx <= r; dx++) {
          for (let dz = -r; dz <= r; dz++) {
            if (Math.hypot(dx, dz) <= r + 0.3) {
              world.setBlock(cx + dx, 28 + dy, cz - 4 + dz, (dy % 2 === 0) ? BLOCKS.PURPLE_BLOCK : BLOCKS.PINK_CONCRETE, false);
            }
          }
        }
      }
      for (let y = 37; y <= 44; y++) {
        world.setBlock(cx, y, cz - 4, BLOCKS.GOLD, false);
        if (y === 42) {
          world.setBlock(cx - 1, y, cz - 4, BLOCKS.GOLD, false);
          world.setBlock(cx + 1, y, cz - 4, BLOCKS.GOLD, false);
          world.setBlock(cx, y, cz - 4 - 1, BLOCKS.GOLD, false);
          world.setBlock(cx, y, cz - 4 + 1, BLOCKS.GOLD, false);
        }
      }
      world.setBlock(cx, 45, cz - 4, BLOCKS.DIAMOND, false);

      // 5. Cherry Blossom Trees
      const treeLocs = [
        [cx - 24, cz + 6],
        [cx - 18, cz + 16],
        [cx - 28, cz + 18],
        [cx + 18, cz + 10],
        [cx + 24, cz + 16],
        [cx + 22, cz - 8],
        [cx - 22, cz - 12]
      ];

      for (const [tx, tz] of treeLocs) {
        const groundY = world.getHighestBlock(tx, tz);
        if (groundY <= 4) continue;
        // Curved dark wood trunk
        for (let y = 1; y <= 5; y++) {
          world.setBlock(tx, groundY + y, tz, BLOCKS.WOOD_LOG, false);
        }
        world.setBlock(tx + 1, groundY + 5, tz, BLOCKS.WOOD_LOG, false);
        world.setBlock(tx - 1, groundY + 5, tz + 1, BLOCKS.WOOD_LOG, false);

        // Fluffy Pink Cherry Foliage
        for (let dx = -3; dx <= 3; dx++) {
          for (let dz = -3; dz <= 3; dz++) {
            for (let dy = 0; dy <= 3; dy++) {
              if (Math.hypot(dx, dy * 0.8, dz) <= 2.8) {
                world.setBlock(tx + dx, groundY + 5 + dy, tz + dz, BLOCKS.CHERRY_LEAVES, false);
              }
            }
          }
        }
      }

      world.rebuildMesh();
    }
  },

  medieval_castle: {
    name: '🏰 Medieval Fortress Castle',
    generate: (world) => {
      world.resize(72, 48, 72);
      world.clear();
      const sx = world.sizeX, sz = world.sizeZ;
      const cx = Math.floor(sx / 2), cz = Math.floor(sz / 2);

      // 1. Terrain & Deep Surrounding Moat
      for (let x = 0; x < sx; x++) {
        for (let z = 0; z < sz; z++) {
          const dist = Math.hypot(x - cx, z - cz);
          let h = 6;
          const isMoat = (dist >= 21 && dist <= 27);
          const isOuter = (dist > 27);

          if (isMoat) {
            h = 2; // Deep moat trench
          } else if (isOuter) {
            h = 5;
          } else {
            // Rugged stone fortress plateau
            h = 8;
          }

          for (let y = 0; y <= h; y++) {
            let b = BLOCKS.STONE;
            if (y === h) {
              b = isOuter ? BLOCKS.GRASS : (isMoat ? BLOCKS.DIRT : BLOCKS.COBBLESTONE);
            } else if (y >= h - 2 && !isMoat) {
              b = BLOCKS.STONE;
            }
            world.setBlock(x, y, z, b, false);
          }

          // Fill moat water
          if (isMoat) {
            for (let y = 3; y <= 5; y++) {
              world.setBlock(x, y, z, BLOCKS.WATER, false);
            }
          }
        }
      }

      // Wooden Drawbridge over front moat
      for (let z = cz + 19; z <= cz + 29; z++) {
        for (let dx = -2; dx <= 2; dx++) {
          world.setBlock(cx + dx, 7, z, BLOCKS.DARK_OAK, false);
        }
        world.setBlock(cx - 2, 8, z, BLOCKS.WOOD_LOG, false);
        world.setBlock(cx + 2, 8, z, BLOCKS.WOOD_LOG, false);
      }
      // Stone bridge support piers in moat
      for (let y = 3; y <= 6; y++) {
        world.setBlock(cx - 2, y, cz + 24, BLOCKS.STONE_BRICK, false);
        world.setBlock(cx + 2, y, cz + 24, BLOCKS.STONE_BRICK, false);
      }

      // 2. Heavy Stone Curtain Walls (Width 36 x 36)
      const r = 18;
      for (let dx = -r; dx <= r; dx++) {
        for (let dz = -r; dz <= r; dz++) {
          const x = cx + dx;
          const z = cz + dz;
          const isWall = (Math.abs(dx) === r || Math.abs(dz) === r);
          const isCorner = (Math.abs(dx) >= r - 3 && Math.abs(dz) >= r - 3);

          if (!isWall && !isCorner) {
            // Cobblestone & Gravel courtyard
            world.setBlock(x, 8, z, (Math.abs(dx) % 2 === 0 && Math.abs(dz) % 2 === 0) ? BLOCKS.STONE_BRICK : BLOCKS.COBBLESTONE, false);
          }

          if (isWall && !isCorner) {
            // Skip entrance gate portal at front
            if (dz === r && Math.abs(dx) <= 3) {
              // Gatehouse Arch
              for (let y = 9; y <= 18; y++) {
                if (Math.abs(dx) === 3) {
                  world.setBlock(x, y, z, BLOCKS.STONE_BRICK, false);
                } else if (y === 14) {
                  world.setBlock(x, y, z, BLOCKS.DARK_OAK, false); // Portcullis beam
                } else if (y >= 15) {
                  world.setBlock(x, y, z, BLOCKS.STONE_BRICK, false);
                }
              }
            } else {
              // Heavy Fortress Curtain Wall
              for (let y = 9; y <= 16; y++) {
                world.setBlock(x, y, z, (y <= 11) ? BLOCKS.COBBLESTONE : BLOCKS.STONE_BRICK, false);
              }
              // Crenellated battlements
              world.setBlock(x, 17, z, (Math.abs(dx + dz) % 2 === 0) ? BLOCKS.STONE_BRICK : BLOCKS.AIR, false);
            }
          }
        }
      }

      // 3. 4 Massive Corner Bastion Towers
      const bastions = [
        [cx - r, cz - r],
        [cx + r, cz - r],
        [cx - r, cz + r],
        [cx + r, cz + r]
      ];

      for (const [bx, bz] of bastions) {
        for (let y = 8; y <= 22; y++) {
          for (let dx = -3; dx <= 3; dx++) {
            for (let dz = -3; dz <= 3; dz++) {
              if (Math.hypot(dx, dz) <= 3.4) {
                const isOuterEdge = Math.hypot(dx, dz) > 2.2;
                world.setBlock(bx + dx, y, bz + dz, isOuterEdge ? BLOCKS.STONE_BRICK : BLOCKS.COBBLESTONE, false);
              }
            }
          }
          // Arrow slits
          if (y === 13 || y === 18) {
            world.setBlock(bx, y, bz + 3, BLOCKS.AIR, false);
            world.setBlock(bx, y, bz - 3, BLOCKS.AIR, false);
            world.setBlock(bx + 3, y, bz, BLOCKS.AIR, false);
            world.setBlock(bx - 3, y, bz, BLOCKS.AIR, false);
          }
        }

        // Overhanging machicolations & battlements
        for (let dx = -4; dx <= 4; dx++) {
          for (let dz = -4; dz <= 4; dz++) {
            if (Math.hypot(dx, dz) <= 4.3) {
              world.setBlock(bx + dx, 22, bz + dz, BLOCKS.STONE_BRICK, false);
              if (Math.hypot(dx, dz) > 3.3) {
                world.setBlock(bx + dx, 23, bz + dz, (Math.abs(dx + dz) % 2 === 0) ? BLOCKS.STONE_BRICK : BLOCKS.AIR, false);
              }
            }
          }
        }

        // Conical Dark Timber Roof
        for (let dy = 0; dy <= 6; dy++) {
          const cr = Math.max(0, 3 - Math.floor(dy / 2));
          for (let dx = -cr; dx <= cr; dx++) {
            for (let dz = -cr; dz <= cr; dz++) {
              if (Math.hypot(dx, dz) <= cr + 0.3) {
                world.setBlock(bx + dx, 24 + dy, bz + dz, BLOCKS.DARK_OAK, false);
              }
            }
          }
        }
        world.setBlock(bx, 31, bz, BLOCKS.GOLD, false);
      }

      // 4. Grand Central Keep & Wizard's High Spire
      for (let dx = -6; dx <= 6; dx++) {
        for (let dz = -6; dz <= 6; dz++) {
          for (let y = 9; y <= 24; y++) {
            const isWall = (Math.abs(dx) === 6 || Math.abs(dz) === 6);
            if (isWall) {
              world.setBlock(cx + dx, y, cz + dz, BLOCKS.STONE_BRICK, false);
            }
          }
        }
      }

      // Soaring Wizard's High Spire Tower
      const wx = cx, wz = cz - 2;
      for (let y = 24; y <= 38; y++) {
        for (let dx = -3; dx <= 3; dx++) {
          for (let dz = -3; dz <= 3; dz++) {
            if (Math.hypot(dx, dz) <= 3.3) {
              world.setBlock(wx + dx, y, wz + dz, BLOCKS.STONE_BRICK, false);
            }
          }
        }
        if (y === 28 || y === 34) {
          world.setBlock(wx, y, wz + 3, BLOCKS.GLASS, false);
          world.setBlock(wx, y, wz - 3, BLOCKS.GLASS, false);
          world.setBlock(wx + 3, y, wz, BLOCKS.GLASS, false);
          world.setBlock(wx - 3, y, wz, BLOCKS.GLASS, false);
        }
      }

      // Cantilevered Observation Balcony
      for (let dx = -4; dx <= 4; dx++) {
        for (let dz = -4; dz <= 4; dz++) {
          if (Math.hypot(dx, dz) <= 4.4) {
            world.setBlock(wx + dx, 38, wz + dz, BLOCKS.DARK_OAK, false);
            if (Math.hypot(dx, dz) > 3.4) {
              world.setBlock(wx + dx, 39, wz + dz, BLOCKS.WOOD_LOG, false);
            }
          }
        }
      }
      world.setBlock(wx, 39, wz, BLOCKS.GLOWSTONE, false);

      // Steep Conical Slate Spire Roof
      for (let dy = 0; dy <= 9; dy++) {
        const sr = Math.max(0, 3 - Math.floor(dy / 2.5));
        for (let dx = -sr; dx <= sr; dx++) {
          for (let dz = -sr; dz <= sr; dz++) {
            if (Math.hypot(dx, dz) <= sr + 0.2) {
              world.setBlock(wx + dx, 40 + dy, wz + dz, BLOCKS.DARK_OAK, false);
            }
          }
        }
      }
      world.setBlock(wx, 50, wz, BLOCKS.GOLD, false);

      // Courtyard Well & Weapons Forge
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          world.setBlock(cx + 8 + dx, 9, cz + 8 + dz, (dx === 0 && dz === 0) ? BLOCKS.WATER : BLOCKS.STONE_BRICK, false);
        }
      }
      world.setBlock(cx + 7, 10, cz + 8, BLOCKS.DARK_OAK, false);
      world.setBlock(cx + 9, 10, cz + 8, BLOCKS.DARK_OAK, false);
      world.setBlock(cx + 8, 11, cz + 8, BLOCKS.DARK_OAK, false);

      // Surrounding Pine Trees
      const pines = [
        [cx - 28, cz - 20],
        [cx - 26, cz + 22],
        [cx + 26, cz - 24],
        [cx + 28, cz + 20],
        [cx + 24, cz + 26]
      ];
      for (const [px, pz] of pines) {
        for (let y = 6; y <= 11; y++) {
          world.setBlock(px, y, pz, BLOCKS.WOOD_LOG, false);
        }
        for (let dy = 0; dy <= 4; dy++) {
          const pr = 3 - dy;
          for (let dx = -pr; dx <= pr; dx++) {
            for (let dz = -pr; dz <= pr; dz++) {
              world.setBlock(px + dx, 10 + dy, pz + dz, BLOCKS.LEAVES, false);
            }
          }
        }
      }

      world.rebuildMesh();
    }
  },

  fantasy_castle: {
    name: '🏔️ Fantasy Mountain Citadel',
    generate: (world) => {
      world.resize(72, 48, 72);
      world.clear();
      const sx = world.sizeX, sz = world.sizeZ;
      const cx = Math.floor(sx / 2), cz = Math.floor(sz / 2);

      // 1. Dual Alpine Mountain Peaks & Deep Canyon
      const leftPeakX = cx - 18, rightPeakX = cx + 18;
      for (let x = 0; x < sx; x++) {
        for (let z = 0; z < sz; z++) {
          const dl = Math.hypot(x - leftPeakX, z - cz);
          const dr = Math.hypot(x - rightPeakX, z - cz);

          const hLeft = Math.max(3, Math.round(24 - dl * 0.95));
          const hRight = Math.max(3, Math.round(22 - dr * 0.92));
          let h = Math.max(hLeft, hRight);

          // Deep chasm in the middle
          const canyonDist = Math.abs(x - cx);
          if (canyonDist < 8) {
            h = Math.min(h, 4 + Math.round(canyonDist * 0.8));
          }

          for (let y = 0; y <= h; y++) {
            let b = BLOCKS.STONE;
            if (y === h) {
              if (h >= 20) b = BLOCKS.SNOW;
              else if (h >= 8) b = BLOCKS.GRASS;
              else b = BLOCKS.DIRT;
            } else if (y >= h - 2) {
              b = (h >= 20) ? BLOCKS.STONE : BLOCKS.DIRT;
            }
            world.setBlock(x, y, z, b, false);
          }

          // Turquoise alpine lake at bottom of chasm
          if (h <= 4) {
            for (let y = h + 1; y <= 5; y++) {
              world.setBlock(x, y, z, BLOCKS.WATER, false);
            }
          }
        }
      }

      // Cascading Waterfalls from peaks into canyon lake
      for (let y = 6; y <= 21; y++) {
        world.setBlock(cx - 9, y, cz, BLOCKS.WATER, false);
        world.setBlock(cx + 9, y, cz, BLOCKS.WATER, false);
      }

      // 2. West Mountain Citadel (High Keep & Crystal Spire)
      for (let dx = -5; dx <= 5; dx++) {
        for (let dz = -5; dz <= 5; dz++) {
          if (Math.hypot(dx, dz) <= 5.4) {
            for (let y = 24; y <= 35; y++) {
              const isOuter = Math.hypot(dx, dz) > 4.2;
              let b = isOuter ? BLOCKS.QUARTZ : BLOCKS.STONE_BRICK;
              if (isOuter && (y === 28 || y === 32) && (Math.abs(dx) <= 1 || Math.abs(dz) <= 1)) {
                b = BLOCKS.GLASS;
              }
              world.setBlock(leftPeakX + dx, y, cz + dz, b, false);
            }
          }
        }
      }

      // Soaring Prismarine & Purple Crystal Spire
      for (let dy = 0; dy <= 10; dy++) {
        const r = Math.max(0, 4 - Math.floor(dy / 2.2));
        for (let dx = -r; dx <= r; dx++) {
          for (let dz = -r; dz <= r; dz++) {
            if (Math.hypot(dx, dz) <= r + 0.3) {
              world.setBlock(leftPeakX + dx, 36 + dy, cz + dz, (dy % 2 === 0) ? BLOCKS.PRISMARINE : BLOCKS.PURPLE_BLOCK, false);
            }
          }
        }
      }
      world.setBlock(leftPeakX, 47, cz, BLOCKS.DIAMOND, false);

      // 3. East Mountain Citadel (Crystal Observatory)
      for (let dx = -4; dx <= 4; dx++) {
        for (let dz = -4; dz <= 4; dz++) {
          if (Math.hypot(dx, dz) <= 4.4) {
            for (let y = 22; y <= 33; y++) {
              const isOuter = Math.hypot(dx, dz) > 3.2;
              world.setBlock(rightPeakX + dx, y, cz + dz, isOuter ? BLOCKS.QUARTZ : BLOCKS.STONE_BRICK, false);
            }
          }
        }
      }
      // Glass observation dome
      for (let dy = 0; dy <= 4; dy++) {
        const r = 3 - Math.floor(dy / 1.5);
        for (let dx = -r; dx <= r; dx++) {
          for (let dz = -r; dz <= r; dz++) {
            world.setBlock(rightPeakX + dx, 34 + dy, cz + dz, (dy === 4) ? BLOCKS.GOLD : BLOCKS.GLASS, false);
          }
        }
      }
      world.setBlock(rightPeakX, 39, cz, BLOCKS.GLOWSTONE, false);
      world.setBlock(rightPeakX, 40, cz, BLOCKS.DIAMOND, false);

      // 4. The Grand High Mountain Arched Bridge
      for (let bx = leftPeakX + 4; bx <= rightPeakX - 4; bx++) {
        for (let bz = -2; bz <= 2; bz++) {
          // Dark oak deck
          world.setBlock(bx, 25, cz + bz, BLOCKS.DARK_OAK, false);
          // Quartz railings
          if (Math.abs(bz) === 2) {
            world.setBlock(bx, 26, cz + bz, BLOCKS.QUARTZ, false);
          }
        }
        // Lantern posts
        if (Math.abs(bx - cx) % 5 === 0) {
          world.setBlock(bx, 27, cz - 2, BLOCKS.STONE_BRICK, false);
          world.setBlock(bx, 28, cz - 2, BLOCKS.GLOWSTONE, false);
          world.setBlock(bx, 27, cz + 2, BLOCKS.STONE_BRICK, false);
          world.setBlock(bx, 28, cz + 2, BLOCKS.GLOWSTONE, false);
        }
      }

      // Massive Supporting Stone Arches into Canyon
      for (let dy = 1; dy <= 12; dy++) {
        const spanLeft = cx - 7 + Math.floor(dy * 0.6);
        const spanRight = cx + 7 - Math.floor(dy * 0.6);
        if (spanLeft <= cx - 1) {
          world.setBlock(spanLeft, 25 - dy, cz - 1, BLOCKS.STONE_BRICK, false);
          world.setBlock(spanLeft, 25 - dy, cz + 1, BLOCKS.STONE_BRICK, false);
        }
        if (spanRight >= cx + 1) {
          world.setBlock(spanRight, 25 - dy, cz - 1, BLOCKS.STONE_BRICK, false);
          world.setBlock(spanRight, 25 - dy, cz + 1, BLOCKS.STONE_BRICK, false);
        }
      }

      // Central Balcony Lookout cantilevered over the canyon
      for (let dz = -4; dz <= 4; dz++) {
        world.setBlock(cx, 25, cz + dz, BLOCKS.DARK_OAK, false);
        world.setBlock(cx - 1, 25, cz + dz, BLOCKS.DARK_OAK, false);
        world.setBlock(cx + 1, 25, cz + dz, BLOCKS.DARK_OAK, false);
        if (Math.abs(dz) === 4) {
          world.setBlock(cx, 26, cz + dz, BLOCKS.QUARTZ, false);
          world.setBlock(cx, 27, cz + dz, BLOCKS.GLOWSTONE, false);
        }
      }

      world.rebuildMesh();
    }
  },

  proj64: {
    name: "🍄 Peach's Castle 64",
    generate: (world) => {
      world.resize(72, 48, 72);
      world.clear();
      const sx = world.sizeX, sz = world.sizeZ;
      const cx = Math.floor(sx / 2), cz = Math.floor(sz / 2);

      // 1. Rolling Green Lawns & Front Moat (Water Canal)
      for (let x = 0; x < sx; x++) {
        for (let z = 0; z < sz; z++) {
          const isMoat = (z >= cz + 12 && z <= cz + 20);
          const isFrontLawn = (z > cz + 20);
          let h = 6;

          if (isMoat) {
            h = 2; // Moat canal depth
          } else if (isFrontLawn) {
            h = 5;
          } else {
            // Rising grassy hill around castle
            const dCenter = Math.hypot(x - cx, z - (cz - 2));
            h = Math.max(6, Math.round(9 - dCenter * 0.12));
          }

          for (let y = 0; y <= h; y++) {
            let b = BLOCKS.STONE;
            if (y === h) {
              b = isMoat ? BLOCKS.SAND : BLOCKS.GRASS;
            } else if (y >= h - 2) {
              b = isMoat ? BLOCKS.SAND : BLOCKS.DIRT;
            }
            world.setBlock(x, y, z, b, false);
          }

          // Moat Water
          if (isMoat) {
            for (let y = 3; y <= 5; y++) {
              world.setBlock(x, y, z, BLOCKS.WATER, false);
            }
          }
        }
      }

      // 2. Iconic Wooden Entrance Bridge across the Moat
      for (let z = cz + 10; z <= cz + 22; z++) {
        for (let dx = -2; dx <= 2; dx++) {
          world.setBlock(cx + dx, 6, z, BLOCKS.DARK_OAK, false);
        }
        // Side railings & posts
        world.setBlock(cx - 2, 7, z, BLOCKS.WOOD_LOG, false);
        world.setBlock(cx + 2, 7, z, BLOCKS.WOOD_LOG, false);
      }
      // Stone bridge support arches under water
      for (let y = 2; y <= 5; y++) {
        world.setBlock(cx - 2, y, cz + 16, BLOCKS.STONE_BRICK, false);
        world.setBlock(cx + 2, y, cz + 16, BLOCKS.STONE_BRICK, false);
      }

      // Stone Path & Grand Staircase to Castle Doors
      for (let z = cz + 5; z <= cz + 10; z++) {
        const stepY = (z <= cz + 7) ? 8 : 7;
        for (let dx = -3; dx <= 3; dx++) {
          world.setBlock(cx + dx, stepY, z, BLOCKS.STONE_BRICK, false);
        }
      }

      // 3. Castle Main White Facade (Quartz & Stone Bricks)
      const cw = 16, cd = 10;
      for (let dx = -cw; dx <= cw; dx++) {
        for (let dz = -cd; dz <= cd; dz++) {
          const x = cx + dx;
          const z = cz - 2 + dz;
          const isOuter = (Math.abs(dx) === cw || Math.abs(dz) === cd);
          const isCorner = (Math.abs(dx) >= cw - 2 && Math.abs(dz) >= cd - 2);

          // Interior wooden floor
          world.setBlock(x, 8, z, BLOCKS.WOOD_PLANKS, false);

          if (isOuter && !isCorner) {
            for (let y = 9; y <= 18; y++) {
              // Base trim in stone brick, upper in white quartz
              let b = (y <= 10) ? BLOCKS.STONE_BRICK : BLOCKS.QUARTZ;
              // Windows on sides
              if (y >= 13 && y <= 15 && Math.abs(dx) % 5 === 0) {
                b = BLOCKS.GLASS;
              }
              world.setBlock(x, y, z, b, false);
            }
          }
        }
      }

      // Grand Arched Entrance & Double Wooden Doors
      for (let y = 9; y <= 15; y++) {
        for (let dx = -3; dx <= 3; dx++) {
          if (Math.abs(dx) === 3 || y === 15) {
            world.setBlock(cx + dx, y, cz + cd - 2, BLOCKS.QUARTZ, false);
          } else if (y <= 13) {
            world.setBlock(cx + dx, y, cz + cd - 3, BLOCKS.DARK_OAK, false); // Wooden doors
            world.setBlock(cx + dx, y, cz + cd - 2, BLOCKS.AIR, false);
          }
        }
      }
      world.setBlock(cx - 1, 11, cz + cd - 3, BLOCKS.GOLD, false); // Door handles
      world.setBlock(cx + 1, 11, cz + cd - 3, BLOCKS.GOLD, false);

      // Princess Peach Iconic Stained Glass Portrait Window
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = 0; dy <= 2; dy++) {
          world.setBlock(cx + dx, 16 + dy, cz + cd - 2, BLOCKS.PEACH_WINDOW, false);
          world.setBlock(cx + dx, 16 + dy, cz + cd - 3, BLOCKS.GLOWSTONE, false);
        }
      }
      // Quartz ornamental arch framing Princess Peach
      for (let dx = -2; dx <= 2; dx++) {
        world.setBlock(cx + dx, 19, cz + cd - 2, BLOCKS.GOLD, false);
        world.setBlock(cx + dx, 20, cz + cd - 2, BLOCKS.QUARTZ, false);
      }
      world.setBlock(cx - 2, 16, cz + cd - 2, BLOCKS.QUARTZ, false);
      world.setBlock(cx - 2, 17, cz + cd - 2, BLOCKS.QUARTZ, false);
      world.setBlock(cx - 2, 18, cz + cd - 2, BLOCKS.QUARTZ, false);
      world.setBlock(cx + 2, 16, cz + cd - 2, BLOCKS.QUARTZ, false);
      world.setBlock(cx + 2, 17, cz + cd - 2, BLOCKS.QUARTZ, false);
      world.setBlock(cx + 2, 18, cz + cd - 2, BLOCKS.QUARTZ, false);

      // 4. Sloped Red Tiled Roof on Castle Wings
      for (let dx = -cw; dx <= cw; dx++) {
        for (let dz = -cd; dz <= cd; dz++) {
          if (Math.abs(dx) > 6) {
            // Slope inwards
            const distFromEdge = cw - Math.abs(dx);
            const roofY = 18 + Math.floor(distFromEdge * 0.5);
            world.setBlock(cx + dx, roofY, cz - 2 + dz, BLOCKS.RED_ROOF, false);
          }
        }
      }

      // 5. Twin Front Flanking Towers
      const frontTowers = [
        [cx - cw, cz + cd - 2],
        [cx + cw, cz + cd - 2]
      ];

      for (const [tx, tz] of frontTowers) {
        // Octagonal Tower Shaft
        for (let y = 8; y <= 22; y++) {
          for (let dx = -3; dx <= 3; dx++) {
            for (let dz = -3; dz <= 3; dz++) {
              if (Math.hypot(dx, dz) <= 3.3) {
                world.setBlock(tx + dx, y, tz + dz, BLOCKS.QUARTZ, false);
              }
            }
          }
          if (y === 14 || y === 18) {
            world.setBlock(tx, y, tz + 3, BLOCKS.GLASS, false);
          }
        }

        // Balcony Trim
        for (let dx = -4; dx <= 4; dx++) {
          for (let dz = -4; dz <= 4; dz++) {
            if (Math.hypot(dx, dz) <= 4.2) {
              world.setBlock(tx + dx, 22, tz + dz, BLOCKS.QUARTZ, false);
            }
          }
        }

        // Conical Red Tile Roof
        for (let dy = 0; dy <= 7; dy++) {
          const r = Math.max(0, 3 - Math.floor(dy / 2));
          for (let dx = -r; dx <= r; dx++) {
            for (let dz = -r; dz <= r; dz++) {
              if (Math.hypot(dx, dz) <= r + 0.2) {
                world.setBlock(tx + dx, 23 + dy, tz + dz, BLOCKS.RED_ROOF, false);
              }
            }
          }
        }
        world.setBlock(tx, 31, tz, BLOCKS.GOLD, false);
        // Red Flag on tower
        world.setBlock(tx, 32, tz, BLOCKS.RED_ROOF, false);
        world.setBlock(tx + 1, 32, tz, BLOCKS.RED_ROOF, false);
      }

      // Rear Corner Towers
      const rearTowers = [
        [cx - cw, cz - cd - 2],
        [cx + cw, cz - cd - 2]
      ];
      for (const [tx, tz] of rearTowers) {
        for (let y = 8; y <= 21; y++) {
          for (let dx = -2; dx <= 2; dx++) {
            for (let dz = -2; dz <= 2; dz++) {
              world.setBlock(tx + dx, y, tz + dz, BLOCKS.QUARTZ, false);
            }
          }
        }
        for (let dy = 0; dy <= 5; dy++) {
          const r = Math.max(0, 2 - Math.floor(dy / 2));
          for (let dx = -r; dx <= r; dx++) {
            for (let dz = -r; dz <= r; dz++) {
              world.setBlock(tx + dx, 22 + dy, tz + dz, BLOCKS.RED_ROOF, false);
            }
          }
        }
      }

      // 6. Central Grand Octagonal Spire Tower (Iconic Nintendo 64 Silhouette)
      // Tier 1: Lower Octagonal Keep
      for (let y = 17; y <= 28; y++) {
        for (let dx = -6; dx <= 6; dx++) {
          for (let dz = -6; dz <= 6; dz++) {
            if (Math.hypot(dx, dz) <= 6.3) {
              let b = BLOCKS.QUARTZ;
              if (y >= 21 && y <= 24 && (Math.abs(dx) === 6 || Math.abs(dz) === 6)) {
                b = BLOCKS.GLASS;
              }
              world.setBlock(cx + dx, y, cz - 2 + dz, b, false);
            }
          }
        }
      }

      // Sloped Red Apron Roof around Tier 1
      for (let dx = -7; dx <= 7; dx++) {
        for (let dz = -7; dz <= 7; dz++) {
          const d = Math.hypot(dx, dz);
          if (d >= 5.5 && d <= 7.4) {
            world.setBlock(cx + dx, 28, cz - 2 + dz, BLOCKS.RED_ROOF, false);
          }
        }
      }

      // Tier 2: Upper Octagonal Spire Tower
      for (let y = 29; y <= 37; y++) {
        for (let dx = -4; dx <= 4; dx++) {
          for (let dz = -4; dz <= 4; dz++) {
            if (Math.hypot(dx, dz) <= 4.2) {
              world.setBlock(cx + dx, y, cz - 2 + dz, BLOCKS.QUARTZ, false);
            }
          }
        }
        if (y === 33) {
          world.setBlock(cx, y, cz - 2 + 4, BLOCKS.GLASS, false);
          world.setBlock(cx, y, cz - 2 - 4, BLOCKS.GLASS, false);
          world.setBlock(cx + 4, y, cz - 2, BLOCKS.GLASS, false);
          world.setBlock(cx - 4, y, cz - 2, BLOCKS.GLASS, false);
        }
      }

      // Tier 3: Steep Red Conical Spire Roof
      for (let dy = 0; dy <= 8; dy++) {
        const sr = Math.max(0, 4 - Math.floor(dy / 1.8));
        for (let dx = -sr; dx <= sr; dx++) {
          for (let dz = -sr; dz <= sr; dz++) {
            if (Math.hypot(dx, dz) <= sr + 0.2) {
              world.setBlock(cx + dx, 38 + dy, cz - 2 + dz, BLOCKS.RED_ROOF, false);
            }
          }
        }
      }

      // Central Spire Flagpole & Flying Red Mario Flag
      for (let y = 44; y <= 48; y++) {
        world.setBlock(cx, y, cz - 2, BLOCKS.QUARTZ, false);
      }
      world.setBlock(cx, 49, cz - 2, BLOCKS.GOLD, false);
      // Red fluttering banner
      world.setBlock(cx + 1, 47, cz - 2, BLOCKS.RED_ROOF, false);
      world.setBlock(cx + 2, 47, cz - 2, BLOCKS.RED_ROOF, false);
      world.setBlock(cx + 3, 47, cz - 2, BLOCKS.RED_ROOF, false);
      world.setBlock(cx + 1, 48, cz - 2, BLOCKS.RED_ROOF, false);
      world.setBlock(cx + 2, 48, cz - 2, BLOCKS.RED_ROOF, false);

      // 7. Lush Oak Trees on Castle Grounds
      const treeSpots = [
        [cx - 24, cz + 18],
        [cx - 20, cz + 24],
        [cx + 22, cz + 20],
        [cx + 26, cz + 14],
        [cx - 22, cz - 16],
        [cx + 22, cz - 16]
      ];

      for (const [tx, tz] of treeSpots) {
        for (let y = 5; y <= 10; y++) {
          world.setBlock(tx, y, tz, BLOCKS.WOOD_LOG, false);
        }
        for (let dx = -2; dx <= 2; dx++) {
          for (let dz = -2; dz <= 2; dz++) {
            for (let dy = 0; dy <= 2; dy++) {
              if (Math.hypot(dx, dy, dz) <= 2.2) {
                world.setBlock(tx + dx, 10 + dy, tz + dz, BLOCKS.LEAVES, false);
              }
            }
          }
        }
      }

      world.rebuildMesh();
    }
  }
};

// Import custom image heightmap
export function loadHeightmapImage(world, imageElement) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = world.sizeX;
  canvas.height = world.sizeZ;
  ctx.drawImage(imageElement, 0, 0, world.sizeX, world.sizeZ);
  const imgData = ctx.getImageData(0, 0, world.sizeX, world.sizeZ).data;

  world.clear();
  const maxH = world.sizeY - 4;

  for (let z = 0; z < world.sizeZ; z++) {
    for (let x = 0; x < world.sizeX; x++) {
      const idx = (x + z * world.sizeX) * 4;
      const r = imgData[idx];
      const g = imgData[idx + 1];
      const b = imgData[idx + 2];
      const brightness = (r + g + b) / 3;

      const height = Math.max(1, Math.round((brightness / 255) * maxH));

      for (let y = 0; y <= height; y++) {
        let blockId = BLOCKS.STONE;
        if (y === height) {
          if (height > 18) blockId = BLOCKS.SNOW;
          else if (height > 6) blockId = BLOCKS.GRASS;
          else blockId = BLOCKS.SAND;
        } else if (y >= height - 2) {
          blockId = BLOCKS.DIRT;
        }
        world.setBlock(x, y, z, blockId, false);
      }
    }
  }

  world.rebuildMesh();
}
