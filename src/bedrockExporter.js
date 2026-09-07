import JSZip from 'jszip';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { BLOCKS, BLOCK_DEFS } from './blocks.js';
import { TEMPLATE_WORLD_BASE64 } from './templateWorldData.js';

// Bedrock NBT Tag Type IDs
const TAG_END = 0;
const TAG_BYTE = 1;
const TAG_SHORT = 2;
const TAG_INT = 3;
const TAG_LONG = 4;
const TAG_FLOAT = 5;
const TAG_DOUBLE = 6;
const TAG_BYTE_ARRAY = 7;
const TAG_STRING = 8;
const TAG_LIST = 9;
const TAG_COMPOUND = 10;
const TAG_INT_ARRAY = 11;

// Little-Endian NBT Writer (Minecraft Bedrock standard)
class LittleEndianNBTWriter {
  constructor() {
    this.buffer = [];
  }

  writeByte(val) {
    this.buffer.push(val & 0xff);
  }

  writeShort(val) {
    this.buffer.push(val & 0xff, (val >> 8) & 0xff);
  }

  writeInt(val) {
    this.buffer.push(
      val & 0xff,
      (val >> 8) & 0xff,
      (val >> 16) & 0xff,
      (val >> 24) & 0xff
    );
  }

  writeLong(val) {
    // 64-bit integer
    this.writeInt(val & 0xffffffff);
    this.writeInt(0);
  }

  writeFloat(val) {
    const fArr = new Float32Array([val]);
    const bArr = new Uint8Array(fArr.buffer);
    for (let i = 0; i < 4; i++) this.writeByte(bArr[i]);
  }

  writeString(str) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    this.writeShort(bytes.length);
    for (let i = 0; i < bytes.length; i++) this.writeByte(bytes[i]);
  }

  writeTagHeader(tagType, name) {
    this.writeByte(tagType);
    this.writeString(name);
  }

  writeTagEnd() {
    this.writeByte(TAG_END);
  }

  getUint8Array() {
    return new Uint8Array(this.buffer);
  }
}

// Generate Bedrock .mcstructure Binary Buffer
export function exportMCStructure(world) {
  const sx = world.sizeX;
  const sy = world.sizeY;
  const sz = world.sizeZ;

  // 1. Build unique palette of used blocks
  const palette = ['minecraft:air'];
  const blockToPaletteIdx = { [BLOCKS.AIR]: 0 };

  for (let i = 0; i < world.blocks.length; i++) {
    const b = world.blocks[i];
    if (b !== BLOCKS.AIR && blockToPaletteIdx[b] === undefined) {
      const bDef = BLOCK_DEFS[b];
      const name = bDef ? bDef.bedrockName : 'minecraft:dirt';
      blockToPaletteIdx[b] = palette.length;
      palette.push(name);
    }
  }

  // 2. Build block_indices array [layer 0, layer 1] (size: sx * sy * sz)
  const layer0 = [];
  const layer1 = []; // waterlogged / second layer (-1)

  for (let x = 0; x < sx; x++) {
    for (let y = 0; y < sy; y++) {
      for (let z = 0; z < sz; z++) {
        const b = world.getBlock(x, y, z);
        const pIdx = blockToPaletteIdx[b] !== undefined ? blockToPaletteIdx[b] : 0;
        layer0.push(pIdx);
        layer1.push(-1);
      }
    }
  }

  // 3. Write Bedrock NBT Compound
  const writer = new LittleEndianNBTWriter();

  // Root compound (Bedrock structure files typically have an empty root name)
  writer.writeTagHeader(TAG_COMPOUND, '');

  // format_version: 1 (TAG_INT)
  writer.writeTagHeader(TAG_INT, 'format_version');
  writer.writeInt(1);

  // size: [sx, sy, sz] (TAG_LIST of TAG_INT)
  writer.writeTagHeader(TAG_LIST, 'size');
  writer.writeByte(TAG_INT);
  writer.writeInt(3);
  writer.writeInt(sx);
  writer.writeInt(sy);
  writer.writeInt(sz);

  // structure_world_origin: [0, 0, 0] (TAG_LIST of TAG_INT)
  writer.writeTagHeader(TAG_LIST, 'structure_world_origin');
  writer.writeByte(TAG_INT);
  writer.writeInt(3);
  writer.writeInt(0);
  writer.writeInt(0);
  writer.writeInt(0);

  // structure (TAG_COMPOUND)
  writer.writeTagHeader(TAG_COMPOUND, 'structure');

  // block_indices (TAG_LIST of TAG_LIST of TAG_INT)
  writer.writeTagHeader(TAG_LIST, 'block_indices');
  writer.writeByte(TAG_LIST);
  writer.writeInt(2); // 2 layers

  // Layer 0
  writer.writeByte(TAG_INT);
  writer.writeInt(layer0.length);
  for (let i = 0; i < layer0.length; i++) writer.writeInt(layer0[i]);

  // Layer 1
  writer.writeByte(TAG_INT);
  writer.writeInt(layer1.length);
  for (let i = 0; i < layer1.length; i++) writer.writeInt(layer1[i]);

  // entities: [] (TAG_LIST of TAG_COMPOUND)
  writer.writeTagHeader(TAG_LIST, 'entities');
  writer.writeByte(TAG_COMPOUND);
  writer.writeInt(0);

  // palette (TAG_COMPOUND)
  writer.writeTagHeader(TAG_COMPOUND, 'palette');
  // default (TAG_COMPOUND)
  writer.writeTagHeader(TAG_COMPOUND, 'default');

  // block_palette (TAG_LIST of TAG_COMPOUND)
  writer.writeTagHeader(TAG_LIST, 'block_palette');
  writer.writeByte(TAG_COMPOUND);
  writer.writeInt(palette.length);

  for (let p = 0; p < palette.length; p++) {
    // block entry compound
    writer.writeTagHeader(TAG_STRING, 'name');
    writer.writeString(palette[p]);

    writer.writeTagHeader(TAG_COMPOUND, 'states');
    writer.writeTagEnd(); // empty states compound

    writer.writeTagHeader(TAG_INT, 'version');
    writer.writeInt(17959425); // 1.20+ format version

    writer.writeTagEnd(); // end of block compound
  }

  // Close palette compounds
  writer.writeTagEnd(); // end block_palette
  writer.writeTagEnd(); // end default
  writer.writeTagEnd(); // end palette
  writer.writeTagEnd(); // end structure
  writer.writeTagEnd(); // end root

  return writer.getUint8Array();
}

// Helper: Convert Base64 string to Uint8Array
function base64ToUint8Array(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Generate Bedrock .mcworld Package (100% Valid World for Minecraft Mobile / Bedrock)
export async function exportMCWorld(world, worldName = 'Kid Magic World') {
  // Load the authentic minimal Bedrock world template (includes level.dat and LevelDB db/ folder)
  let zip;
  try {
    const templateBytes = base64ToUint8Array(TEMPLATE_WORLD_BASE64);
    zip = await JSZip.loadAsync(templateBytes);
  } catch (err) {
    console.warn('Could not load base64 template, creating fresh zip:', err);
    zip = new JSZip();
  }

  // 1. Update levelname.txt
  zip.file('levelname.txt', worldName);

  // 2. Patch LevelName inside level.dat and level.dat_old NBT
  try {
    const levelDatFile = zip.file('level.dat');
    if (levelDatFile) {
      const levelDatBuf = await levelDatFile.async('uint8array');
      const target = 'Sample Parkour World';
      const targetBytes = new TextEncoder().encode(target);

      let targetIdx = -1;
      for (let i = 0; i < levelDatBuf.length - targetBytes.length; i++) {
        let match = true;
        for (let j = 0; j < targetBytes.length; j++) {
          if (levelDatBuf[i + j] !== targetBytes[j]) {
            match = false;
            break;
          }
        }
        if (match) {
          targetIdx = i;
          break;
        }
      }

      if (targetIdx !== -1) {
        const newNameBytes = new TextEncoder().encode(worldName);
        const before = levelDatBuf.subarray(0, targetIdx - 2);
        const lenBuf = new Uint8Array([newNameBytes.length & 0xff, (newNameBytes.length >> 8) & 0xff]);
        const after = levelDatBuf.subarray(targetIdx + targetBytes.length);

        const newBuf = new Uint8Array(before.length + lenBuf.length + newNameBytes.length + after.length);
        newBuf.set(before, 0);
        newBuf.set(lenBuf, before.length);
        newBuf.set(newNameBytes, before.length + lenBuf.length);
        newBuf.set(after, before.length + lenBuf.length + newNameBytes.length);

        // Update 32-bit payload length at offset 4
        const payloadLen = newBuf.length - 8;
        newBuf[4] = payloadLen & 0xff;
        newBuf[5] = (payloadLen >> 8) & 0xff;
        newBuf[6] = (payloadLen >> 16) & 0xff;
        newBuf[7] = (payloadLen >> 24) & 0xff;

        zip.file('level.dat', newBuf);
        zip.file('level.dat_old', newBuf);
      }
    }
  } catch (err) {
    console.error('Error patching level.dat:', err);
  }

  // 3. Export custom 3D voxel structure
  const structureBytes = exportMCStructure(world);
  const cleanName = worldName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  zip.file(`structures/${cleanName}.mcstructure`, structureBytes);
  zip.file('structures/magic_terrain.mcstructure', structureBytes);

  // 4. Attach Behavior Pack with auto-loader function
  const bpUuid = '4b6f120e-b830-4e5b-b9f0-54a88f72a912';
  const bpModuleUuid = 'd389a9f2-89b0-466d-9b1b-68e4c027411a';

  zip.file('world_behavior_packs.json', JSON.stringify([
    {
      pack_id: bpUuid,
      version: [1, 0, 0]
    }
  ], null, 2));

  zip.file('behavior_packs/magic_terrain_bp/manifest.json', JSON.stringify({
    format_version: 2,
    header: {
      name: 'Magic Terrain Auto-Loader',
      description: 'Automatically loads your custom 3D terrain into the world',
      uuid: bpUuid,
      version: [1, 0, 0],
      min_engine_version: [1, 20, 0]
    },
    modules: [
      {
        type: 'data',
        uuid: bpModuleUuid,
        version: [1, 0, 0]
      }
    ]
  }, null, 2));

  zip.file('behavior_packs/magic_terrain_bp/structures/magic_terrain.mcstructure', structureBytes);
  zip.file('behavior_packs/magic_terrain_bp/functions/tick.json', JSON.stringify({
    values: ['autoload']
  }, null, 2));

  const safeTitle = worldName.replace(/["\\]/g, '');
  const autoLoadFunction = [
    'execute as @a[tag=!magic_terrain_loaded] at @s run structure load magic_terrain ~-16 ~ ~-16',
    `execute as @a[tag=!magic_terrain_loaded] run title @s title §6§l${safeTitle}`,
    'execute as @a[tag=!magic_terrain_loaded] run title @s subtitle §aTerrain Loaded Successfully!',
    'execute as @a[tag=!magic_terrain_loaded] run gamemode creative @s',
    'tag @a add magic_terrain_loaded'
  ].join('\n');
  zip.file('behavior_packs/magic_terrain_bp/functions/autoload.mcfunction', autoLoadFunction);

  // 5. Instructions
  const instructions = `===========================================
  ${worldName.toUpperCase()} - MINECRAFT BEDROCK (MOBILE / ANDROID / IOS)
===========================================

How to play this world in Minecraft:

1. Tap this downloaded .mcworld file on your phone or tablet.
2. Minecraft will open automatically and display "World import finished successfully".
3. Tap "Play" and select "${worldName}" from your worlds list.
4. When you enter, your custom 3D terrain loads automatically right beneath you!

Optional manual loading with Structure Block:
- In chat, type: /give @p structure_block
- Place it down, switch to "LOAD" mode, type "magic_terrain", and tap LOAD.
`;
  zip.file('HOW_TO_LOAD.txt', instructions);

  // Generate zip as Blob with explicit application/vnd.minecraft.world mime type
  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.minecraft.world'
  });
  return blob;
}

// Export standard .glb 3D Model for Three.js
export function exportGLB(world, filename = 'minecraft_world.glb') {
  const exporter = new GLTFExporter();
  exporter.parse(
    world.meshGroup,
    (gltf) => {
      const blob = new Blob([gltf], { type: 'model/gltf-binary' });
      downloadBlob(blob, filename);
    },
    (error) => {
      console.error('Error exporting GLB:', error);
    },
    { binary: true }
  );
}

// Save Project snapshot as JSON
export function exportJSON(world, filename = 'my_minecraft_world.json') {
  const data = {
    version: 1,
    sizeX: world.sizeX,
    sizeY: world.sizeY,
    sizeZ: world.sizeZ,
    blocks: Array.from(world.blocks)
  };
  const jsonStr = JSON.stringify(data);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  downloadBlob(blob, filename);
}

// Load Project snapshot from JSON
export function loadJSON(world, jsonStr) {
  try {
    const data = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
    if (data && data.blocks && Array.isArray(data.blocks)) {
      world.saveState();
      world.blocks.set(new Uint8Array(data.blocks));
      world.rebuildMesh();
      return true;
    }
  } catch (e) {
    console.error('Failed to load JSON project:', e);
  }
  return false;
}

// Helper to trigger file download in browser
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Export Bedrock .mcpack Skin Pack for 1-tap direct import into Minecraft Android
export async function exportSkinMCPack(skinCanvas, skinName = 'Princess Sparkle', modelType = 'slim') {
  const zip = new JSZip();

  // Convert canvas to binary blob
  const skinBlob = await new Promise((resolve) => skinCanvas.toBlob(resolve, 'image/png'));
  const skinBytes = await skinBlob.arrayBuffer();

  const headerUUID = generateUUID();
  const moduleUUID = generateUUID();

  const manifest = {
    format_version: 2,
    header: {
      name: skinName,
      description: 'Magic Custom Skin Pack',
      uuid: headerUUID,
      version: [1, 0, 0],
      min_engine_version: [1, 16, 0]
    },
    modules: [
      {
        type: 'skin_pack',
        uuid: moduleUUID,
        version: [1, 0, 0]
      }
    ]
  };

  const skinsJson = {
    skins: [
      {
        localization_name: skinName.toLowerCase().replace(/\s+/g, '_'),
        geometry: modelType === 'slim' ? 'geometry.humanoid.customSlim' : 'geometry.humanoid.custom',
        texture: 'skin.png',
        type: 'free'
      }
    ],
    serialize_name: 'magic_skins',
    localization_name: 'magic_skins'
  };

  const textsContent = `skinpack.magic_skins=Magic Skins\nskin.magic_skins.${skinName.toLowerCase().replace(/\s+/g, '_')}=${skinName}\n`;

  zip.file('manifest.json', JSON.stringify(manifest, null, 2));
  zip.file('skins.json', JSON.stringify(skinsJson, null, 2));
  zip.file('skin.png', skinBytes);
  zip.file('texts/en_US.lang', textsContent);

  const blob = await zip.generateAsync({ type: 'blob' });
  return blob;
}

// Helper to trigger direct native Android share (Open in Minecraft) or download
export async function shareOrDownloadFile(fileBlob, filename, mimeType = 'application/octet-stream') {
  try {
    const file = new File([fileBlob], filename, { type: mimeType });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: filename,
        text: 'Open in Minecraft'
      });
      return true;
    }
  } catch (e) {
    if (e.name === 'AbortError') return false;
  }
  downloadBlob(fileBlob, filename);
  return true;
}

