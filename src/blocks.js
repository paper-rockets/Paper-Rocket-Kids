import * as THREE from 'three';

// Procedural Minecraft Pixel Textures
function createBlockTexture(type) {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function fillNoise(baseR, baseG, baseB, variance = 15) {
    const imgData = ctx.createImageData(16, 16);
    const d = imgData.data;
    for (let i = 0; i < 16 * 16 * 4; i += 4) {
      const v = rand(-variance, variance);
      d[i] = Math.min(255, Math.max(0, baseR + v));
      d[i + 1] = Math.min(255, Math.max(0, baseG + v));
      d[i + 2] = Math.min(255, Math.max(0, baseB + v));
      d[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
  }

  switch (type) {
    case 'grass_top':
      fillNoise(86, 172, 56, 20);
      break;

    case 'grass_side':
      fillNoise(134, 96, 67, 18);
      // Top grass fringe
      ctx.fillStyle = '#56ac38';
      for (let x = 0; x < 16; x++) {
        const h = (x % 2 === 0) ? 4 : (x % 3 === 0 ? 5 : 3);
        ctx.fillRect(x, 0, 1, h);
      }
      break;

    case 'dirt':
      fillNoise(134, 96, 67, 20);
      break;

    case 'stone':
      fillNoise(125, 125, 125, 20);
      // stone specks
      ctx.fillStyle = '#555555';
      for (let i = 0; i < 8; i++) ctx.fillRect(rand(0, 15), rand(0, 15), 1, 1);
      break;

    case 'cobblestone':
      fillNoise(110, 110, 110, 25);
      ctx.strokeStyle = '#444444';
      ctx.lineWidth = 1;
      ctx.strokeRect(1, 1, 6, 6);
      ctx.strokeRect(8, 2, 7, 5);
      ctx.strokeRect(2, 9, 6, 6);
      ctx.strokeRect(9, 8, 6, 7);
      break;

    case 'sand':
      fillNoise(219, 206, 152, 14);
      break;

    case 'water':
      fillNoise(44, 116, 222, 25);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(2, 4, 5, 2);
      ctx.fillRect(9, 10, 5, 2);
      break;

    case 'lava':
      fillNoise(225, 90, 15, 30);
      ctx.fillStyle = '#ffea00';
      ctx.fillRect(3, 3, 4, 3);
      ctx.fillRect(10, 9, 3, 4);
      break;

    case 'wood_log_side':
      fillNoise(103, 76, 44, 15);
      // vertical bark stripes
      ctx.fillStyle = '#4a331c';
      ctx.fillRect(3, 0, 2, 16);
      ctx.fillRect(9, 0, 2, 16);
      ctx.fillRect(14, 0, 1, 16);
      break;

    case 'wood_log_top':
      fillNoise(165, 128, 77, 12);
      ctx.strokeStyle = '#6e4f2b';
      ctx.lineWidth = 1;
      ctx.strokeRect(3, 3, 10, 10);
      ctx.strokeRect(6, 6, 4, 4);
      break;

    case 'wood_planks':
      fillNoise(165, 128, 77, 15);
      ctx.fillStyle = '#553c1d';
      ctx.fillRect(0, 3, 16, 1);
      ctx.fillRect(0, 7, 16, 1);
      ctx.fillRect(0, 11, 16, 1);
      ctx.fillRect(0, 15, 16, 1);
      ctx.fillRect(6, 0, 1, 3);
      ctx.fillRect(12, 4, 1, 3);
      ctx.fillRect(4, 8, 1, 3);
      ctx.fillRect(10, 12, 1, 3);
      break;

    case 'leaves':
      fillNoise(50, 135, 35, 25);
      ctx.fillStyle = '#1e5f12';
      for (let i = 0; i < 15; i++) ctx.fillRect(rand(0, 15), rand(0, 15), 1, 1);
      break;

    case 'snow':
      fillNoise(240, 245, 255, 10);
      break;

    case 'glass':
      ctx.fillStyle = 'rgba(215, 235, 255, 0.4)';
      ctx.fillRect(0, 0, 16, 16);
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(0, 0, 16, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(2, 2, 4, 1);
      ctx.fillRect(2, 3, 1, 3);
      break;

    case 'gold':
      fillNoise(245, 215, 45, 20);
      ctx.strokeStyle = '#b89415';
      ctx.strokeRect(1, 1, 14, 14);
      ctx.fillStyle = '#fff59d';
      ctx.fillRect(3, 3, 3, 3);
      break;

    case 'diamond':
      fillNoise(90, 225, 220, 20);
      ctx.strokeStyle = '#278b87';
      ctx.strokeRect(1, 1, 14, 14);
      ctx.fillStyle = '#e0ffff';
      ctx.fillRect(3, 3, 3, 3);
      break;

    case 'brick':
      fillNoise(155, 65, 50, 20);
      ctx.fillStyle = '#dfd3c3';
      ctx.fillRect(0, 3, 16, 1);
      ctx.fillRect(0, 7, 16, 1);
      ctx.fillRect(0, 11, 16, 1);
      ctx.fillRect(0, 15, 16, 1);
      ctx.fillRect(7, 0, 1, 3);
      ctx.fillRect(3, 4, 1, 3);
      ctx.fillRect(11, 4, 1, 3);
      ctx.fillRect(7, 8, 1, 3);
      ctx.fillRect(3, 12, 1, 3);
      ctx.fillRect(11, 12, 1, 3);
      break;

    case 'glowstone':
      fillNoise(235, 185, 95, 30);
      ctx.fillStyle = '#fff6b0';
      for (let i = 0; i < 12; i++) ctx.fillRect(rand(0, 15), rand(0, 15), 2, 2);
      break;

    case 'tnt':
      fillNoise(215, 55, 35, 20);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 5, 16, 6);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 5px sans-serif';
      ctx.fillText('TNT', 2, 10);
      break;

    default:
      fillNoise(150, 150, 150, 20);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Block registry definitions
export const BLOCKS = {
  AIR: 0,
  GRASS: 1,
  DIRT: 2,
  STONE: 3,
  COBBLESTONE: 4,
  SAND: 5,
  WATER: 6,
  LAVA: 7,
  WOOD_LOG: 8,
  WOOD_PLANKS: 9,
  LEAVES: 10,
  SNOW: 11,
  GLASS: 12,
  GOLD: 13,
  DIAMOND: 14,
  BRICK: 15,
  GLOWSTONE: 16,
  TNT: 17
};

export const BLOCK_DEFS = {
  [BLOCKS.GRASS]: {
    id: BLOCKS.GRASS,
    name: 'Grass',
    bedrockName: 'minecraft:grass_block',
    icon: '🌱',
    color: '#56ac38',
    textures: {
      top: 'grass_top',
      bottom: 'dirt',
      side: 'grass_side'
    }
  },
  [BLOCKS.DIRT]: {
    id: BLOCKS.DIRT,
    name: 'Dirt',
    bedrockName: 'minecraft:dirt',
    icon: '🟫',
    color: '#866043',
    texture: 'dirt'
  },
  [BLOCKS.STONE]: {
    id: BLOCKS.STONE,
    name: 'Stone',
    bedrockName: 'minecraft:stone',
    icon: '🪨',
    color: '#7d7d7d',
    texture: 'stone'
  },
  [BLOCKS.COBBLESTONE]: {
    id: BLOCKS.COBBLESTONE,
    name: 'Cobblestone',
    bedrockName: 'minecraft:cobblestone',
    icon: '🧱',
    color: '#6e6e6e',
    texture: 'cobblestone'
  },
  [BLOCKS.SAND]: {
    id: BLOCKS.SAND,
    name: 'Sand',
    bedrockName: 'minecraft:sand',
    icon: '🏖️',
    color: '#dbce98',
    texture: 'sand'
  },
  [BLOCKS.WATER]: {
    id: BLOCKS.WATER,
    name: 'Water',
    bedrockName: 'minecraft:water',
    icon: '💧',
    color: '#2c74de',
    texture: 'water',
    transparent: true,
    opacity: 0.75
  },
  [BLOCKS.LAVA]: {
    id: BLOCKS.LAVA,
    name: 'Lava',
    bedrockName: 'minecraft:lava',
    icon: '🌋',
    color: '#e15a0f',
    texture: 'lava',
    emissive: '#e15a0f',
    emissiveIntensity: 0.6
  },
  [BLOCKS.WOOD_LOG]: {
    id: BLOCKS.WOOD_LOG,
    name: 'Oak Log',
    bedrockName: 'minecraft:oak_log',
    icon: '🪵',
    color: '#674c2c',
    textures: {
      top: 'wood_log_top',
      bottom: 'wood_log_top',
      side: 'wood_log_side'
    }
  },
  [BLOCKS.WOOD_PLANKS]: {
    id: BLOCKS.WOOD_PLANKS,
    name: 'Wood Planks',
    bedrockName: 'minecraft:planks',
    icon: '📦',
    color: '#a5804d',
    texture: 'wood_planks'
  },
  [BLOCKS.LEAVES]: {
    id: BLOCKS.LEAVES,
    name: 'Leaves',
    bedrockName: 'minecraft:leaves',
    icon: '🍃',
    color: '#328723',
    texture: 'leaves',
    transparent: true,
    opacity: 0.95
  },
  [BLOCKS.SNOW]: {
    id: BLOCKS.SNOW,
    name: 'Snow',
    bedrockName: 'minecraft:snow',
    icon: '❄️',
    color: '#f0f5ff',
    texture: 'snow'
  },
  [BLOCKS.GLASS]: {
    id: BLOCKS.GLASS,
    name: 'Glass',
    bedrockName: 'minecraft:glass',
    icon: '🪟',
    color: '#d7ebff',
    texture: 'glass',
    transparent: true,
    opacity: 0.4
  },
  [BLOCKS.GOLD]: {
    id: BLOCKS.GOLD,
    name: 'Gold',
    bedrockName: 'minecraft:gold_block',
    icon: '🪙',
    color: '#f5d72d',
    texture: 'gold'
  },
  [BLOCKS.DIAMOND]: {
    id: BLOCKS.DIAMOND,
    name: 'Diamond',
    bedrockName: 'minecraft:diamond_block',
    icon: '💎',
    color: '#5ae1dc',
    texture: 'diamond'
  },
  [BLOCKS.BRICK]: {
    id: BLOCKS.BRICK,
    name: 'Red Brick',
    bedrockName: 'minecraft:brick_block',
    icon: '🧱',
    color: '#9b4132',
    texture: 'brick'
  },
  [BLOCKS.GLOWSTONE]: {
    id: BLOCKS.GLOWSTONE,
    name: 'Glowstone',
    bedrockName: 'minecraft:glowstone',
    icon: '✨',
    color: '#ebb95f',
    texture: 'glowstone',
    emissive: '#ebb95f',
    emissiveIntensity: 0.8
  },
  [BLOCKS.TNT]: {
    id: BLOCKS.TNT,
    name: 'TNT',
    bedrockName: 'minecraft:tnt',
    icon: '🧨',
    color: '#d73723',
    texture: 'tnt'
  }
};

// Generate isometric 3D block thumbnail for Minecraft UI palette
export function getBlockIconDataUrl(blockId) {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const def = BLOCK_DEFS[blockId];
  if (!def) return '';

  const topTexKey = def.textures?.top || def.texture || 'stone';
  const sideTexKey = def.textures?.side || def.texture || 'stone';

  const topCanvas = createBlockTexture(topTexKey).image;
  const sideCanvas = createBlockTexture(sideTexKey).image;

  // Draw 2D textured block with border for crisp Minecraft inventory look
  ctx.drawImage(sideCanvas, 2, 2, 28, 28);

  // If grass, draw top fringe
  if (blockId === BLOCKS.GRASS) {
    ctx.fillStyle = '#56ac38';
    ctx.fillRect(2, 2, 28, 8);
  }

  return canvas.toDataURL();
}

const materialCache = {};
const textureCache = {};

export function getBlockMaterial(blockId, faceName = 'side') {
  const def = BLOCK_DEFS[blockId];
  if (!def) return null;

  let texKey = def.texture;
  if (def.textures) {
    if (faceName === 'top' && def.textures.top) texKey = def.textures.top;
    else if (faceName === 'bottom' && def.textures.bottom) texKey = def.textures.bottom;
    else texKey = def.textures.side;
  }

  const matKey = `${blockId}_${texKey}_${faceName}`;
  if (materialCache[matKey]) return materialCache[matKey];

  if (!textureCache[texKey]) {
    textureCache[texKey] = createBlockTexture(texKey);
  }

  const matOpts = {
    map: textureCache[texKey],
    roughness: 0.8,
    metalness: (blockId === BLOCKS.GOLD || blockId === BLOCKS.DIAMOND) ? 0.4 : 0.1,
    transparent: !!def.transparent,
    opacity: def.opacity !== undefined ? def.opacity : 1.0,
    depthWrite: def.opacity === undefined || def.opacity > 0.8,
    side: THREE.DoubleSide
  };

  if (def.emissive) {
    matOpts.emissive = new THREE.Color(def.emissive);
    matOpts.emissiveIntensity = def.emissiveIntensity || 0.5;
  }

  const mat = new THREE.MeshStandardMaterial(matOpts);
  materialCache[matKey] = mat;
  return mat;
}
