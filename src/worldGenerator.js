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
      world.clear();
      const sx = world.sizeX, sz = world.sizeZ;
      const cx = Math.floor(sx / 2), cz = Math.floor(sz / 2);

      // Moat and Royal Courtyard
      for (let x = 0; x < sx; x++) {
        for (let z = 0; z < sz; z++) {
          const dist = Math.hypot(x - cx, z - cz);
          let h = 4;
          if (dist > 20) h = 2;
          else if (dist > 15) h = 3; // Moat
          else if (dist < 12) h = 6; // Raised royal courtyard

          for (let y = 0; y <= 5; y++) {
            if (y <= h) {
              world.setBlock(x, y, z, y === h ? BLOCKS.GRASS : BLOCKS.DIRT, false);
            } else if (dist > 15) {
              world.setBlock(x, y, z, BLOCKS.WATER, false);
            }
          }
        }
      }

      // Outer Palace Walls (16 x 16) in Pink Concrete & Quartz
      const r = 8;
      for (let dx = -r; dx <= r; dx++) {
        for (let dz = -r; dz <= r; dz++) {
          const isWall = (Math.abs(dx) === r || Math.abs(dz) === r);
          const isCorner = (Math.abs(dx) >= r - 1 && Math.abs(dz) >= r - 1);
          const x = cx + dx;
          const z = cz + dz;

          // Courtyard floor: quartz pathways and garden
          if (!isWall) {
            if (Math.abs(dx) <= 2 || Math.abs(dz) <= 2) {
              world.setBlock(x, 6, z, BLOCKS.QUARTZ, false);
            } else {
              world.setBlock(x, 6, z, BLOCKS.WOOD_PLANKS, false);
            }
          }

          // Exterior Pink Walls
          if (isWall && !isCorner) {
            for (let y = 7; y <= 11; y++) {
              if ((y === 8 || y === 9) && (Math.abs(dx) % 3 === 0 || Math.abs(dz) % 3 === 0)) {
                world.setBlock(x, y, z, BLOCKS.GLASS, false);
              } else {
                world.setBlock(x, y, z, BLOCKS.PINK_CONCRETE, false);
              }
            }
            if ((dx + dz) % 2 === 0) {
              world.setBlock(x, 12, z, BLOCKS.QUARTZ, false);
            }
          }
        }
      }

      // 4 Pink Grand Spires at corners
      const towerCorners = [
        [cx - r, cz - r],
        [cx + r, cz - r],
        [cx - r, cz + r],
        [cx + r, cz + r]
      ];

      for (const [tx, tz] of towerCorners) {
        // Tower Shaft
        for (let y = 6; y <= 15; y++) {
          for (let dx = -1; dx <= 1; dx++) {
            for (let dz = -1; dz <= 1; dz++) {
              world.setBlock(tx + dx, y, tz + dz, BLOCKS.PINK_CONCRETE, false);
            }
          }
        }
        // Quartz balcony trim
        for (let dx = -2; dx <= 2; dx++) {
          for (let dz = -2; dz <= 2; dz++) {
            if (Math.abs(dx) === 2 || Math.abs(dz) === 2) {
              world.setBlock(tx + dx, 15, tz + dz, BLOCKS.QUARTZ, false);
            }
          }
        }
        world.setBlock(tx, 15, tz, BLOCKS.GLOWSTONE, false);

        // Purple & Gold Conical Spire Roof
        for (let dy = 0; dy <= 4; dy++) {
          const roofR = 2 - Math.floor(dy / 1.5);
          for (let dx = -roofR; dx <= roofR; dx++) {
            for (let dz = -roofR; dz <= roofR; dz++) {
              if (Math.abs(dx) + Math.abs(dz) <= roofR + 1) {
                world.setBlock(tx + dx, 16 + dy, tz + dz, BLOCKS.PURPLE_BLOCK, false);
              }
            }
          }
        }
        world.setBlock(tx, 21, tz, BLOCKS.GOLD, false);
        world.setBlock(tx, 22, tz, BLOCKS.DIAMOND, false);
      }

      // Central Grand Pink Keep & Throne Room
      for (let dx = -4; dx <= 4; dx++) {
        for (let dz = -4; dz <= 4; dz++) {
          for (let y = 7; y <= 15; y++) {
            if (Math.abs(dx) === 4 || Math.abs(dz) === 4) {
              const isWin = (y === 9 || y === 10 || y === 13) && (Math.abs(dx) <= 2 && Math.abs(dz) <= 2);
              world.setBlock(cx + dx, y, cz + dz, isWin ? BLOCKS.GLASS : BLOCKS.PINK_CONCRETE, false);
            }
          }
        }
      }

      // Grand Purple Dome / Conical Roof
      for (let dy = 0; dy <= 4; dy++) {
        const domR = 4 - dy;
        for (let dx = -domR; dx <= domR; dx++) {
          for (let dz = -domR; dz <= domR; dz++) {
            world.setBlock(cx + dx, 16 + dy, cz + dz, BLOCKS.PURPLE_BLOCK, false);
          }
        }
      }
      world.setBlock(cx, 21, cz, BLOCKS.GOLD, false);
      world.setBlock(cx, 22, cz, BLOCKS.GLOWSTONE, false);

      // Royal Princess Throne Room
      for (let dz = -3; dz <= 3; dz++) {
        world.setBlock(cx, 7, cz + dz, BLOCKS.PURPLE_BLOCK, false);
      }
      world.setBlock(cx, 7, cz - 3, BLOCKS.GOLD, false);
      world.setBlock(cx, 8, cz - 3, BLOCKS.GOLD, false);
      world.setBlock(cx - 1, 7, cz - 3, BLOCKS.DIAMOND, false);
      world.setBlock(cx + 1, 7, cz - 3, BLOCKS.DIAMOND, false);
      world.setBlock(cx, 9, cz - 3, BLOCKS.GLOWSTONE, false);

      // Wooden Entrance Bridge across Moat
      for (let dz = r + 1; dz <= 18; dz++) {
        world.setBlock(cx - 1, 5, cz + dz, BLOCKS.WOOD_PLANKS, false);
        world.setBlock(cx, 5, cz + dz, BLOCKS.WOOD_PLANKS, false);
        world.setBlock(cx + 1, 5, cz + dz, BLOCKS.WOOD_PLANKS, false);
      }
      world.setBlock(cx - 1, 7, cz + r, BLOCKS.QUARTZ, false);
      world.setBlock(cx - 1, 8, cz + r, BLOCKS.QUARTZ, false);
      world.setBlock(cx + 1, 7, cz + r, BLOCKS.QUARTZ, false);
      world.setBlock(cx + 1, 8, cz + r, BLOCKS.QUARTZ, false);
      world.setBlock(cx, 9, cz + r, BLOCKS.GLOWSTONE, false);

      // Rose Gardens & Fountains
      world.setBlock(cx - 5, 7, cz + 2, BLOCKS.WATER, false);
      world.setBlock(cx + 5, 7, cz + 2, BLOCKS.WATER, false);
      world.setBlock(cx - 6, 7, cz + 2, BLOCKS.QUARTZ, false);
      world.setBlock(cx + 6, 7, cz + 2, BLOCKS.QUARTZ, false);

      world.setBlock(cx - 5, 7, cz - 5, BLOCKS.LEAVES, false);
      world.setBlock(cx - 5, 8, cz - 5, BLOCKS.PINK_CONCRETE, false);
      world.setBlock(cx + 5, 7, cz - 5, BLOCKS.LEAVES, false);
      world.setBlock(cx + 5, 8, cz - 5, BLOCKS.PINK_CONCRETE, false);

      world.stampStructure(STAMPS.tree_oak, cx - 11, 6, cz - 11);
      world.stampStructure(STAMPS.tree_oak, cx + 9, 6, cz - 11);

      world.rebuildMesh();
    }
  },

  medieval_castle: {
    name: '🏰 Medieval Fortress Castle',
    generate: (world) => {
      world.clear();
      const sx = world.sizeX, sz = world.sizeZ;
      const cx = Math.floor(sx / 2), cz = Math.floor(sz / 2);

      // Hill and Deep Moat
      for (let x = 0; x < sx; x++) {
        for (let z = 0; z < sz; z++) {
          const dist = Math.hypot(x - cx, z - cz);
          let h = 4;
          if (dist > 20) h = 2;
          else if (dist > 15) h = 3; // Moat
          else if (dist < 12) h = 6; // Raised stronghold mound

          for (let y = 0; y <= 5; y++) {
            if (y <= h) {
              world.setBlock(x, y, z, y === h ? BLOCKS.GRASS : (y > 2 ? BLOCKS.DIRT : BLOCKS.STONE), false);
            } else if (dist > 15) {
              world.setBlock(x, y, z, BLOCKS.WATER, false);
            }
          }
        }
      }

      // Heavy Cobblestone Curtain Walls (16x16)
      const r = 8;
      for (let dx = -r; dx <= r; dx++) {
        for (let dz = -r; dz <= r; dz++) {
          const isWall = (Math.abs(dx) === r || Math.abs(dz) === r);
          const isCorner = (Math.abs(dx) >= r - 1 && Math.abs(dz) >= r - 1);
          const x = cx + dx;
          const z = cz + dz;

          if (!isWall) {
            world.setBlock(x, 6, z, (Math.abs(dx) % 2 === 0 && Math.abs(dz) % 2 === 0) ? BLOCKS.STONE : BLOCKS.COBBLESTONE, false);
          }

          if (isWall && !isCorner) {
            for (let y = 7; y <= 11; y++) {
              world.setBlock(x, y, z, BLOCKS.COBBLESTONE, false);
            }
            if ((dx + dz) % 2 === 0) {
              world.setBlock(x, 12, z, BLOCKS.STONE, false);
            }
          }
        }
      }

      // 4 Square Corner Watchtowers
      const towers = [
        [cx - r, cz - r],
        [cx + r, cz - r],
        [cx - r, cz + r],
        [cx + r, cz + r]
      ];

      for (const [tx, tz] of towers) {
        for (let y = 6; y <= 14; y++) {
          for (let dx = -1; dx <= 1; dx++) {
            for (let dz = -1; dz <= 1; dz++) {
              const isCorner = Math.abs(dx) === 1 && Math.abs(dz) === 1;
              world.setBlock(tx + dx, y, tz + dz, isCorner ? BLOCKS.STONE : BLOCKS.COBBLESTONE, false);
            }
          }
        }
        for (let dx = -2; dx <= 2; dx++) {
          for (let dz = -2; dz <= 2; dz++) {
            if (Math.abs(dx) === 2 || Math.abs(dz) === 2) {
              world.setBlock(tx + dx, 15, tz + dz, BLOCKS.STONE, false);
            }
          }
        }
        world.setBlock(tx, 15, tz, BLOCKS.GLOWSTONE, false);
      }

      // High Central Keep (Great Hall)
      for (let dx = -3; dx <= 3; dx++) {
        for (let dz = -3; dz <= 3; dz++) {
          for (let y = 7; y <= 16; y++) {
            if (Math.abs(dx) === 3 || Math.abs(dz) === 3) {
              const isWin = (y === 10 || y === 13) && (Math.abs(dx) === 0 || Math.abs(dz) === 0);
              world.setBlock(cx + dx, y, cz + dz, isWin ? BLOCKS.GLASS : BLOCKS.STONE, false);
            }
          }
        }
      }

      // Wooden Roof on Keep
      for (let dy = 0; dy <= 3; dy++) {
        const roofR = 3 - dy;
        for (let dx = -roofR; dx <= roofR; dx++) {
          for (let dz = -roofR; dz <= roofR; dz++) {
            world.setBlock(cx + dx, 17 + dy, cz + dz, BLOCKS.WOOD_PLANKS, false);
          }
        }
      }
      world.setBlock(cx, 21, cz, BLOCKS.GOLD, false);

      // Wooden Gatehouse Drawbridge
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

      // Courtyard Well
      world.setBlock(cx - 4, 7, cz, BLOCKS.COBBLESTONE, false);
      world.setBlock(cx - 4, 8, cz, BLOCKS.WATER, false);
      world.setBlock(cx + 4, 7, cz, BLOCKS.GOLD, false);

      world.rebuildMesh();
    }
  },

  fantasy_castle: {
    name: '🏔️ Fantasy Mountain Citadel',
    generate: (world) => {
      world.clear();
      const sx = world.sizeX, sz = world.sizeZ;
      const cx = Math.floor(sx / 2), cz = Math.floor(sz / 2);

      // Stepped Mountain Peaks & Valley Lake
      for (let x = 0; x < sx; x++) {
        for (let z = 0; z < sz; z++) {
          const leftPeak = Math.hypot(x - (cx - 10), z - cz);
          const rightPeak = Math.hypot(x - (cx + 10), z - cz);
          const minPeak = Math.min(leftPeak, rightPeak);
          let h = Math.max(3, Math.round(14 - minPeak * 0.8));

          // Valley gorge in the middle
          if (Math.abs(x - cx) < 3 && z > cz - 8 && z < cz + 8) {
            h = 3;
          }

          for (let y = 0; y <= h; y++) {
            let b = BLOCKS.STONE;
            if (y === h) {
              b = h >= 12 ? BLOCKS.SNOW : (h >= 6 ? BLOCKS.GRASS : BLOCKS.SAND);
            } else if (y >= h - 2) {
              b = h >= 12 ? BLOCKS.STONE : BLOCKS.DIRT;
            }
            world.setBlock(x, y, z, b, false);
          }

          // Valley Lake Water
          if (h <= 4) {
            world.setBlock(x, 4, z, BLOCKS.WATER, false);
          }
        }
      }

      // Waterfall flowing from right peak into gorge
      for (let y = 5; y <= 11; y++) {
        world.setBlock(cx + 3, y, cz, BLOCKS.WATER, false);
      }

      // Left Mountain Citadel Tower
      const ltx = cx - 10, ltz = cz;
      for (let y = 12; y <= 20; y++) {
        for (let dx = -2; dx <= 2; dx++) {
          for (let dz = -2; dz <= 2; dz++) {
            if (Math.abs(dx) === 2 || Math.abs(dz) === 2) {
              world.setBlock(ltx + dx, y, ltz + dz, BLOCKS.QUARTZ, false);
            }
          }
        }
      }
      for (let dy = 0; dy <= 4; dy++) {
        const r = 2 - Math.floor(dy / 1.5);
        for (let dx = -r; dx <= r; dx++) {
          for (let dz = -r; dz <= r; dz++) {
            world.setBlock(ltx + dx, 21 + dy, ltz + dz, BLOCKS.PURPLE_BLOCK, false);
          }
        }
      }
      world.setBlock(ltx, 26, ltz, BLOCKS.DIAMOND, false);

      // Right Mountain Citadel Tower
      const rtx = cx + 10, rtz = cz;
      for (let y = 12; y <= 18; y++) {
        for (let dx = -2; dx <= 2; dx++) {
          for (let dz = -2; dz <= 2; dz++) {
            if (Math.abs(dx) === 2 || Math.abs(dz) === 2) {
              world.setBlock(rtx + dx, y, rtz + dz, BLOCKS.QUARTZ, false);
            }
          }
        }
      }
      for (let dy = 0; dy <= 3; dy++) {
        const r = 2 - Math.floor(dy / 1.5);
        for (let dx = -r; dx <= r; dx++) {
          for (let dz = -r; dz <= r; dz++) {
            world.setBlock(rtx + dx, 19 + dy, rtz + dz, BLOCKS.PURPLE_BLOCK, false);
          }
        }
      }
      world.setBlock(rtx, 23, rtz, BLOCKS.GOLD, false);

      // Arched Stone Bridge across the Gorge
      for (let bx = ltx + 2; bx <= rtx - 2; bx++) {
        world.setBlock(bx, 13, cz - 1, BLOCKS.QUARTZ, false);
        world.setBlock(bx, 13, cz, BLOCKS.WOOD_PLANKS, false);
        world.setBlock(bx, 13, cz + 1, BLOCKS.QUARTZ, false);
        world.setBlock(bx, 14, cz - 1, BLOCKS.STONE, false);
        world.setBlock(bx, 14, cz + 1, BLOCKS.STONE, false);
      }
      for (let dy = 1; dy <= 4; dy++) {
        world.setBlock(cx - 4, 13 - dy, cz, BLOCKS.STONE, false);
        world.setBlock(cx + 4, 13 - dy, cz, BLOCKS.STONE, false);
      }
      world.setBlock(cx, 15, cz - 1, BLOCKS.GLOWSTONE, false);
      world.setBlock(cx, 15, cz + 1, BLOCKS.GLOWSTONE, false);

      world.rebuildMesh();
    }
  },

  proj64: {
    name: "🍄 Peach's Castle 64",
    generate: (world) => {
      world.clear();
      const sx = world.sizeX, sz = world.sizeZ;
      const cx = Math.floor(sx / 2), cz = Math.floor(sz / 2);

      // Rolling Green Castle Grounds with Front Moat
      for (let x = 0; x < sx; x++) {
        for (let z = 0; z < sz; z++) {
          let h = 4;
          const isMoat = (z >= cz + 8 && z <= cz + 13);
          if (isMoat) {
            h = 2;
          } else if (z < cz - 5) {
            h = 5;
          }

          for (let y = 0; y <= 5; y++) {
            if (y <= h) {
              world.setBlock(x, y, z, y === h ? BLOCKS.GRASS : BLOCKS.DIRT, false);
            } else if (isMoat && y <= 4) {
              world.setBlock(x, y, z, BLOCKS.WATER, false);
            }
          }
        }
      }

      // Wooden Entrance Bridge over front moat
      for (let z = cz + 7; z <= cz + 14; z++) {
        world.setBlock(cx - 1, 5, z, BLOCKS.WOOD_PLANKS, false);
        world.setBlock(cx, 5, z, BLOCKS.WOOD_PLANKS, false);
        world.setBlock(cx + 1, 5, z, BLOCKS.WOOD_PLANKS, false);
        world.setBlock(cx - 2, 6, z, BLOCKS.WOOD_LOG, false);
        world.setBlock(cx + 2, 6, z, BLOCKS.WOOD_LOG, false);
      }

      // Castle Main White Facade (Quartz)
      for (let dx = -7; dx <= 7; dx++) {
        for (let dz = -5; dz <= 5; dz++) {
          const isOuterWall = (Math.abs(dx) === 7 || Math.abs(dz) === 5);
          if (isOuterWall) {
            for (let y = 5; y <= 11; y++) {
              world.setBlock(cx + dx, y, cz + dz, BLOCKS.QUARTZ, false);
            }
          } else {
            world.setBlock(cx + dx, 5, cz + dz, BLOCKS.WOOD_PLANKS, false);
          }
        }
      }

      // Twin Rounded Entrance Towers
      const entranceTowers = [[cx - 6, cz + 5], [cx + 6, cz + 5]];
      for (const [tx, tz] of entranceTowers) {
        for (let y = 5; y <= 13; y++) {
          for (let dx = -1; dx <= 1; dx++) {
            for (let dz = -1; dz <= 1; dz++) {
              world.setBlock(tx + dx, y, tz + dz, BLOCKS.QUARTZ, false);
            }
          }
        }
        for (let dy = 0; dy <= 3; dy++) {
          const r = 2 - Math.floor(dy / 1.5);
          for (let dx = -r; dx <= r; dx++) {
            for (let dz = -r; dz <= r; dz++) {
              world.setBlock(tx + dx, 14 + dy, tz + dz, BLOCKS.BRICK, false);
            }
          }
        }
        world.setBlock(tx, 18, tz, BLOCKS.GOLD, false);
      }

      // Central Grand Tower
      for (let dx = -3; dx <= 3; dx++) {
        for (let dz = -3; dz <= 3; dz++) {
          for (let y = 11; y <= 17; y++) {
            if (Math.abs(dx) === 3 || Math.abs(dz) === 3) {
              world.setBlock(cx + dx, y, cz + dz, BLOCKS.QUARTZ, false);
            }
          }
        }
      }

      // Princess Peach's Iconic Circular Stained Glass Window
      world.setBlock(cx, 14, cz + 3, BLOCKS.PINK_CONCRETE, false);
      world.setBlock(cx - 1, 14, cz + 3, BLOCKS.GOLD, false);
      world.setBlock(cx + 1, 14, cz + 3, BLOCKS.GOLD, false);
      world.setBlock(cx, 15, cz + 3, BLOCKS.GLOWSTONE, false);
      world.setBlock(cx, 13, cz + 3, BLOCKS.GLASS, false);

      // Main Red Peaked Roof
      for (let dy = 0; dy <= 4; dy++) {
        const r = 4 - dy;
        for (let dx = -r; dx <= r; dx++) {
          for (let dz = -r; dz <= r; dz++) {
            world.setBlock(cx + dx, 18 + dy, cz + dz, BLOCKS.BRICK, false);
          }
        }
      }
      world.setBlock(cx, 23, cz, BLOCKS.GOLD, false);
      world.setBlock(cx, 24, cz, BLOCKS.GOLD, false);
      world.setBlock(cx + 1, 24, cz, BLOCKS.PINK_CONCRETE, false);

      // Castle Oak Trees
      world.stampStructure(STAMPS.tree_oak, cx - 14, 5, cz + 10);
      world.stampStructure(STAMPS.tree_oak, cx + 12, 5, cz + 10);
      world.stampStructure(STAMPS.tree_oak, cx - 13, 5, cz - 10);
      world.stampStructure(STAMPS.tree_oak, cx + 13, 5, cz - 10);

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
