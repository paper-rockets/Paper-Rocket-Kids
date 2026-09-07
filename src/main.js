import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BLOCKS, BLOCK_DEFS, getBlockIconDataUrl } from './blocks.js';
import { VoxelWorld } from './voxelWorld.js';
import { generateTheme, PREMADE_MAPS, STAMPS, loadHeightmapImage } from './worldGenerator.js';
import { exportMCStructure, exportMCWorld, exportGLB, exportJSON, loadJSON, downloadBlob, exportSkinMCPack, shareOrDownloadFile } from './bedrockExporter.js';
import { sounds } from './sounds.js';
import { SkinModel } from './skinModel.js';
import { TextureManager } from './textureManager.js';
import { Painter } from './painter.js';
import { WardrobeEngine, SKIN_TONES, HAIR_COLORS, EYE_COLORS } from './wardrobe.js';

// Application State
const state = {
  activeTool: 'raise', // 'raise', 'dig', 'flatten', 'paint', 'place', 'erase', 'stamp'
  brushSize: 2,        // 1: Small, 2: Medium, 3: Large
  activeBlock: BLOCKS.GRASS,
  activeStamp: 'tree_oak',
  viewMode: 'orbit',   // 'orbit' or 'player'
  soundEnabled: true
};

// =========================================================================
// 🌍 MAIN 3D VOXEL WORLD ENGINE
// =========================================================================
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Sky blue

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(32, 28, 44);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

// Smooth, Non-Jittery Orbit Controls
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.dampingFactor = 0.05; // Gentle, smooth stop
orbitControls.rotateSpeed = 0.55;   // Reduced sensitivity for calm control
orbitControls.zoomSpeed = 0.65;     // Gentle zoom
orbitControls.panSpeed = 0.6;       // Gentle pan
orbitControls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't dip below ground
orbitControls.target.set(0, 10, 0);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xfff4e0, 1.3);
sunLight.position.set(40, 60, 30);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 10;
sunLight.shadow.camera.far = 150;
sunLight.shadow.camera.left = -40;
sunLight.shadow.camera.right = 40;
sunLight.shadow.camera.top = 40;
sunLight.shadow.camera.bottom = -40;
scene.add(sunLight);

// Voxel Clouds in the sky
function createVoxelClouds() {
  const cloudGroup = new THREE.Group();
  const cloudMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.65
  });

  for (let i = 0; i < 8; i++) {
    const w = 12 + Math.random() * 16;
    const l = 16 + Math.random() * 24;
    const cloudGeo = new THREE.BoxGeometry(w, 2, l);
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    cloudMesh.position.set(
      (Math.random() - 0.5) * 160,
      36 + Math.random() * 8,
      (Math.random() - 0.5) * 160
    );
    cloudGroup.add(cloudMesh);
  }
  return cloudGroup;
}
const clouds = createVoxelClouds();
scene.add(clouds);

// Initialize Voxel World (48 x 32 x 48 grid)
const world = new VoxelWorld(48, 32, 48);
scene.add(world.meshGroup);

// Auto-save helper for custom and downloaded maps
let worldSaveTimeout = null;
function autoSaveWorld() {
  if (worldSaveTimeout) clearTimeout(worldSaveTimeout);
  worldSaveTimeout = setTimeout(() => {
    try {
      const data = {
        version: 1,
        sizeX: world.sizeX,
        sizeY: world.sizeY,
        sizeZ: world.sizeZ,
        blocks: Array.from(world.blocks)
      };
      localStorage.setItem('minecraft_world_autosave', JSON.stringify(data));
    } catch (e) {
      // Silently ignore storage quota or private browsing errors
    }
  }, 600);
}

// Auto-load previously saved world, or generate default start world
let restoredWorld = false;
try {
  const savedWorld = localStorage.getItem('minecraft_world_autosave');
  if (savedWorld) {
    restoredWorld = loadJSON(world, savedWorld);
  }
} catch (e) {
  console.warn('Could not restore autosaved world:', e);
}

if (!restoredWorld) {
  generateTheme(world, 'floating_islands', 12345, true);
}

// First-Person Walk Controller
const player = {
  position: new THREE.Vector3(0, 15, 0),
  velocity: new THREE.Vector3(),
  yaw: 0,
  pitch: 0,
  isGrounded: false,
  moveForward: false,
  moveBackward: false,
  moveLeft: false,
  moveRight: false,
  touchMoveX: 0,
  touchMoveZ: 0
};

// Raycasting for sculpting
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let isPointerDown = false;
let pointerDownPos = { x: 0, y: 0 };

// Populate Block Palette UI with Authentic Minecraft Pixel Icons
const paletteEl = document.getElementById('block-palette');
if (paletteEl) {
  Object.values(BLOCK_DEFS).forEach((bDef) => {
    const item = document.createElement('div');
    item.className = `block-item ${bDef.id === state.activeBlock ? 'active' : ''}`;
    item.dataset.blockId = bDef.id;
    item.title = bDef.name;
    const iconUrl = getBlockIconDataUrl(bDef.id);
    item.innerHTML = `
      <img src="${iconUrl}" class="block-img-icon" alt="${bDef.name}" />
      <span class="block-name">${bDef.name}</span>
    `;
    item.addEventListener('click', () => {
      document.querySelectorAll('.block-item').forEach((el) => el.classList.remove('active'));
      item.classList.add('active');
      state.activeBlock = bDef.id;

      // If currently on Erase or Stamp, switch to Paint so clicking immediately colors the world
      if (state.activeTool === 'erase' || state.activeTool === 'stamp') {
        toolBtns.forEach((b) => b.classList.remove('active'));
        const paintBtn = document.querySelector('.tool-btn[data-tool="paint"]');
        if (paintBtn) paintBtn.classList.add('active');
        state.activeTool = 'paint';
        stampDrawer.classList.add('hidden');
      }
      sounds.playPop();
    });
    paletteEl.appendChild(item);
  });
}

// Setup Tool Selection Buttons
const toolBtns = document.querySelectorAll('.tool-btn');
const stampDrawer = document.getElementById('stamp-drawer');

toolBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    toolBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    state.activeTool = btn.dataset.tool;

    if (state.activeTool === 'stamp') {
      stampDrawer.classList.remove('hidden');
    } else {
      stampDrawer.classList.add('hidden');
    }
    sounds.playPop();
  });
});

// Brush Size Buttons
document.querySelectorAll('.size-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.size-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    state.brushSize = parseInt(btn.dataset.size);
    sounds.playPop();
  });
});

// Stamp Selection Buttons
document.querySelectorAll('.stamp-item').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.stamp-item').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    state.activeStamp = btn.dataset.stamp;
    sounds.playPop();
  });
});

// Undo / Redo / Clear
const btnUndo = document.getElementById('btn-undo');
if (btnUndo) {
  btnUndo.addEventListener('click', () => {
    if (world.undo()) {
      sounds.playPop();
      autoSaveWorld();
    }
  });
}

const btnRedo = document.getElementById('btn-redo');
if (btnRedo) {
  btnRedo.addEventListener('click', () => {
    if (world.redo()) {
      sounds.playPop();
      autoSaveWorld();
    }
  });
}

const btnClear = document.getElementById('btn-clear');
if (btnClear) {
  btnClear.addEventListener('click', () => {
    if (confirm('Clear the whole world and start fresh?')) {
      world.clear();
      try {
        localStorage.removeItem('minecraft_world_autosave');
      } catch (e) {}
      sounds.playDig();
    }
  });
}

// View Modes (Orbit vs Walk)
const btnOrbit = document.getElementById('btn-mode-orbit');
const btnPlayer = document.getElementById('btn-mode-player');
const btnExitWalk = document.getElementById('btn-exit-walk');
const btnResetView = document.getElementById('btn-reset-view');
const btnZoomIn = document.getElementById('btn-zoom-in');
const btnZoomOut = document.getElementById('btn-zoom-out');
const playerHints = document.getElementById('player-hints');
const touchControls = document.getElementById('touch-controls');
const topBar = document.querySelector('.top-bar');
const leftToolbar = document.querySelector('.left-toolbar');
const rightToolbar = document.querySelector('.right-toolbar');
const bottomBar = document.querySelector('.bottom-bar');

function resetCameraView() {
  camera.position.set(32, 28, 44);
  orbitControls.target.set(0, 10, 0);
  orbitControls.update();
  sounds.playPop();
}

if (btnResetView) btnResetView.addEventListener('click', resetCameraView);

if (btnZoomIn) {
  btnZoomIn.addEventListener('click', () => {
    const dir = new THREE.Vector3().subVectors(orbitControls.target, camera.position).normalize();
    camera.position.addScaledVector(dir, 6);
    orbitControls.update();
    sounds.playPop();
  });
}

if (btnZoomOut) {
  btnZoomOut.addEventListener('click', () => {
    const dir = new THREE.Vector3().subVectors(camera.position, orbitControls.target).normalize();
    camera.position.addScaledVector(dir, 6);
    orbitControls.update();
    sounds.playPop();
  });
}

function setViewMode(mode) {
  state.viewMode = mode;
  if (mode === 'orbit') {
    if (btnOrbit) btnOrbit.classList.add('active');
    if (btnPlayer) btnPlayer.classList.remove('active');
    if (btnExitWalk) btnExitWalk.classList.add('hidden');
    if (playerHints) playerHints.classList.add('hidden');
    if (touchControls) touchControls.classList.add('hidden');
    if (topBar) topBar.classList.remove('hidden');
    if (leftToolbar) leftToolbar.classList.remove('hidden');
    if (rightToolbar) rightToolbar.classList.remove('hidden');
    if (bottomBar) bottomBar.classList.remove('hidden');

    orbitControls.enabled = true;
    resetCameraView();
  } else {
    if (btnPlayer) btnPlayer.classList.add('active');
    if (btnOrbit) btnOrbit.classList.remove('active');
    if (btnExitWalk) btnExitWalk.classList.remove('hidden');
    if (playerHints) playerHints.classList.remove('hidden');
    if (touchControls) touchControls.classList.remove('hidden');
    if (topBar) topBar.classList.add('hidden');
    if (leftToolbar) leftToolbar.classList.add('hidden');
    if (rightToolbar) rightToolbar.classList.add('hidden');
    if (bottomBar) bottomBar.classList.add('hidden');

    orbitControls.enabled = false;

    // Find highest solid block near center
    let foundX = Math.floor(world.sizeX / 2);
    let foundZ = Math.floor(world.sizeZ / 2);
    let topY = world.getHighestBlock(foundX, foundZ);

    // If center is empty void, search nearby for solid ground
    if (topY <= 0) {
      for (let r = 1; r < 20; r++) {
        for (let dx = -r; dx <= r; dx++) {
          for (let dz = -r; dz <= r; dz++) {
            const ty = world.getHighestBlock(foundX + dx, foundZ + dz);
            if (ty > 0) {
              foundX += dx;
              foundZ += dz;
              topY = ty;
              break;
            }
          }
          if (topY > 0) break;
        }
        if (topY > 0) break;
      }
    }

    const px = foundX - world.sizeX / 2;
    const pz = foundZ - world.sizeZ / 2;
    player.position.set(px, topY + 2.2, pz);
    player.velocity.set(0, 0, 0);
    player.yaw = 0;
    player.pitch = 0;
  }
  sounds.playPop();
}

if (btnOrbit) btnOrbit.addEventListener('click', () => setViewMode('orbit'));
if (btnPlayer) btnPlayer.addEventListener('click', () => setViewMode('player'));
if (btnExitWalk) btnExitWalk.addEventListener('click', () => setViewMode('orbit'));

// Sound Toggle
const btnSound = document.getElementById('btn-sound-toggle');
if (btnSound) {
  btnSound.addEventListener('click', () => {
    const isEnabled = sounds.toggleSound();
    btnSound.textContent = isEnabled ? '🔊' : '🔇';
  });
}

// Robust Modals Management
function setupModal(triggerBtnId, modalId) {
  const trigger = document.getElementById(triggerBtnId);
  const modal = document.getElementById(modalId);
  if (!trigger || !modal) return;
  const closeBtn = modal.querySelector('.btn-close');

  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    modal.classList.remove('hidden');
    sounds.playPop();
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('hidden');
      sounds.playPop();
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  });
}

setupModal('btn-theme-modal', 'modal-themes');
setupModal('btn-maps-modal', 'modal-maps');
setupModal('btn-import-modal', 'modal-import');
setupModal('btn-export-modal', 'modal-export');

// 1-Click Magic Themes Generator (Click anywhere on card)
document.querySelectorAll('.theme-card').forEach((card) => {
  card.style.cursor = 'pointer';
  card.addEventListener('click', (e) => {
    e.preventDefault();
    const theme = card.dataset.theme;
    if (theme) {
      const oreToggle = document.getElementById('toggle-include-ores');
      const includeOres = oreToggle ? oreToggle.checked : true;
      generateTheme(world, theme, Math.floor(Math.random() * 99999), includeOres);
      resetCameraView();
      autoSaveWorld();
      const modal = document.getElementById('modal-themes');
      if (modal) modal.classList.add('hidden');
      sounds.playMagicChime();
    }
  });
});

// Pre-made Adventure Maps Loader (Click anywhere on card)
document.querySelectorAll('.map-card').forEach((card) => {
  card.style.cursor = 'pointer';
  card.addEventListener('click', (e) => {
    e.preventDefault();
    const mapKey = card.dataset.map;
    if (mapKey && PREMADE_MAPS[mapKey]) {
      PREMADE_MAPS[mapKey].generate(world);
      resetCameraView();
      autoSaveWorld();
      const modal = document.getElementById('modal-maps');
      if (modal) modal.classList.add('hidden');
      sounds.playMagicChime();
    }
  });
});

// Real Minecraft Bedrock Castles & Add-ons 1-Tap Download / Open
document.querySelectorAll('.bedrock-card').forEach((card) => {
  card.style.cursor = 'pointer';
  card.addEventListener('click', async (e) => {
    e.preventDefault();
    const filePath = card.dataset.dlFile;
    const filename = card.dataset.dlName;
    const type = card.dataset.dlType;
    if (!filePath || !filename) return;

    sounds.playMagicChime();
    const btn = card.querySelector('.btn-dl-bedrock-asset');
    const originalText = btn ? btn.textContent : '';
    if (btn) btn.textContent = '⏳ Opening in Minecraft...';

    try {
      const resp = await fetch(filePath);
      if (!resp.ok) throw new Error('File not found');
      const blob = await resp.blob();
      const mimeType = type === 'world' ? 'application/vnd.minecraft.world' : 'application/octet-stream';
      await shareOrDownloadFile(blob, filename, mimeType);
    } catch (err) {
      console.error('Failed to open Minecraft asset:', err);
      // Fallback: direct browser navigation to download link
      const a = document.createElement('a');
      a.href = filePath;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      if (btn) btn.textContent = originalText;
    }
  });
});

// Import Heightmap Image
const inputHeightmap = document.getElementById('input-heightmap');
if (inputHeightmap) {
  inputHeightmap.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const img = new Image();
      img.onload = () => {
        loadHeightmapImage(world, img);
        autoSaveWorld();
        const modal = document.getElementById('modal-import');
        if (modal) modal.classList.add('hidden');
        sounds.playMagicChime();
      };
      img.src = URL.createObjectURL(file);
    }
  });
}

// Import JSON Project
const inputJson = document.getElementById('input-json');
if (inputJson) {
  inputJson.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (loadJSON(world, evt.target.result)) {
          autoSaveWorld();
          const modal = document.getElementById('modal-import');
          if (modal) modal.classList.add('hidden');
          sounds.playMagicChime();
        } else {
          alert('Could not open this file.');
        }
      };
      reader.readAsText(file);
    }
  });
}

// Direct Phone to PC Upload Handler
const inputPhoneUpload = document.getElementById('input-phone-upload');
const uploadStatus = document.getElementById('upload-status');
if (inputPhoneUpload && uploadStatus) {
  inputPhoneUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    uploadStatus.style.display = 'block';
    uploadStatus.style.color = '#ffeb3b';
    uploadStatus.textContent = `⏳ Uploading "${file.name}" to PC...`;

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-filename': encodeURIComponent(file.name)
        },
        body: file
      });

      if (response.ok) {
        uploadStatus.style.color = '#4caf50';
        uploadStatus.innerHTML = `✅ <b>"${file.name}"</b> uploaded successfully to your PC!<br><span style="font-size:12px; color:#fff;">I can now inspect this file on your computer and help you open it!</span>`;
        sounds.playMagicChime();
      } else {
        uploadStatus.style.color = '#f44336';
        uploadStatus.textContent = `❌ Upload failed. Please try again.`;
      }
    } catch (err) {
      uploadStatus.style.color = '#f44336';
      uploadStatus.textContent = `❌ Error uploading: ${err.message}`;
    }
  });
}

// Export Handlers
const btnDlMcworld = document.getElementById('btn-dl-mcworld');
if (btnDlMcworld) {
  btnDlMcworld.addEventListener('click', async () => {
    sounds.playMagicChime();
    const blob = await exportMCWorld(world, 'Magic Kid World');
    await shareOrDownloadFile(blob, 'magic_kid_world.mcworld', 'application/vnd.minecraft.world');
  });
}

const btnDlMcstructure = document.getElementById('btn-dl-mcstructure');
if (btnDlMcstructure) {
  btnDlMcstructure.addEventListener('click', async () => {
    sounds.playMagicChime();
    const bytes = exportMCStructure(world);
    const blob = new Blob([bytes], { type: 'application/octet-stream' });
    await shareOrDownloadFile(blob, 'magic_structure.mcstructure', 'application/octet-stream');
  });
}

const btnDlGlb = document.getElementById('btn-dl-glb');
if (btnDlGlb) {
  btnDlGlb.addEventListener('click', () => {
    sounds.playPop();
    exportGLB(world, 'minecraft_world.glb');
  });
}

const btnDlJson = document.getElementById('btn-dl-json');
if (btnDlJson) {
  btnDlJson.addEventListener('click', () => {
    sounds.playPop();
    exportJSON(world, 'minecraft_project.json');
  });
}

// Pointer & Sculpting Interactions
function updateRaycast(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.clientX !== undefined ? e.clientX : (e.touches ? e.touches[0].clientX : 0);
  const clientY = e.clientY !== undefined ? e.clientY : (e.touches ? e.touches[0].clientY : 0);
  mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
}

function handlePointerAction(e) {
  if (state.viewMode !== 'orbit') return;
  updateRaycast(e);
  const res = world.raycast(raycaster);

  if (res.hit) {
    if (state.activeTool === 'stamp') {
      const stampObj = STAMPS[state.activeStamp];
      if (stampObj) {
        const ox = res.adjacent.x - Math.floor(stampObj.sizeX / 2);
        const oy = res.adjacent.y;
        const oz = res.adjacent.z - Math.floor(stampObj.sizeZ / 2);
        world.stampStructure(stampObj, ox, oy, oz);
        sounds.playStamp();
        autoSaveWorld();
      }
    } else if (state.activeTool === 'place') {
      world.applyBrush('place', res.adjacent.x, res.adjacent.y, res.adjacent.z, 1, state.activeBlock);
      sounds.playPop();
      autoSaveWorld();
    } else if (state.activeTool === 'erase') {
      world.applyBrush('erase', res.target.x, res.target.y, res.target.z, 1);
      sounds.playDig();
      autoSaveWorld();
    } else {
      // raise, dig, flatten, paint
      world.applyBrush(
        state.activeTool,
        res.target.x,
        res.target.y,
        res.target.z,
        state.brushSize,
        state.activeBlock
      );
      if (state.activeTool === 'dig') sounds.playDig();
      else sounds.playPop();
      autoSaveWorld();
    }
  }
}

canvas.addEventListener('pointerdown', (e) => {
  if (e.button !== 0) return; // Left click only
  isPointerDown = true;
  pointerDownPos = { x: e.clientX, y: e.clientY };
});

canvas.addEventListener('pointermove', (e) => {
  if (state.viewMode === 'orbit') {
    updateRaycast(e);
    const res = world.raycast(raycaster);
    if (res.hit) {
      const halfX = world.sizeX / 2;
      const halfZ = world.sizeZ / 2;
      const bx = (state.activeTool === 'place' ? res.adjacent.x : res.target.x) - halfX + 0.5;
      const by = (state.activeTool === 'place' ? res.adjacent.y : res.target.y) + 0.5;
      const bz = (state.activeTool === 'place' ? res.adjacent.z : res.target.z) - halfZ + 0.5;
      world.cursorBox.position.set(bx, by, bz);
      world.cursorBox.visible = true;
    } else {
      world.cursorBox.visible = false;
    }
  } else if (state.viewMode === 'player' && isPointerDown) {
    // First-person mouse look
    const deltaX = e.movementX || (e.clientX - pointerDownPos.x);
    const deltaY = e.movementY || (e.clientY - pointerDownPos.y);
    player.yaw -= deltaX * 0.003;
    player.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, player.pitch - deltaY * 0.003));
    pointerDownPos = { x: e.clientX, y: e.clientY };
  }
});

canvas.addEventListener('pointerup', (e) => {
  if (!isPointerDown) return;
  const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
  if (dist < 6) {
    // Treat as click/tap action
    handlePointerAction(e);
  }
  isPointerDown = false;
});

// Keyboard Controls for First-Person Walk
window.addEventListener('keydown', (e) => {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) return;
  if (state.viewMode !== 'player') return;
  if (e.code === 'KeyW' || e.code === 'ArrowUp') player.moveForward = true;
  if (e.code === 'KeyS' || e.code === 'ArrowDown') player.moveBackward = true;
  if (e.code === 'KeyA' || e.code === 'ArrowLeft') player.moveLeft = true;
  if (e.code === 'KeyD' || e.code === 'ArrowRight') player.moveRight = true;
  if (e.code === 'Space' && player.isGrounded) {
    player.velocity.y = 8.5; // Jump
    player.isGrounded = false;
    sounds.playPop();
  }
  if (e.code === 'Escape') {
    setViewMode('orbit');
  }
});

window.addEventListener('keyup', (e) => {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) return;
  if (e.code === 'KeyW' || e.code === 'ArrowUp') player.moveForward = false;
  if (e.code === 'KeyS' || e.code === 'ArrowDown') player.moveBackward = false;
  if (e.code === 'KeyA' || e.code === 'ArrowLeft') player.moveLeft = false;
  if (e.code === 'KeyD' || e.code === 'ArrowRight') player.moveRight = false;
});

// Mobile Touch Joystick Handling
const joyZone = document.getElementById('joystick-zone');
const joyKnob = document.getElementById('joystick-knob');
let joyTouchId = null;

if (joyZone && joyKnob) {
  joyZone.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    joyTouchId = touch.identifier;
    updateJoystick(touch);
  });

  joyZone.addEventListener('touchmove', (e) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joyTouchId) {
        updateJoystick(e.changedTouches[i]);
        break;
      }
    }
  });

  function resetJoystick() {
    joyKnob.style.transform = `translate(0px, 0px)`;
    player.touchMoveX = 0;
    player.touchMoveZ = 0;
  }

  joyZone.addEventListener('touchend', (e) => {
    e.preventDefault();
    resetJoystick();
    joyTouchId = null;
  });

  function updateJoystick(touch) {
    const rect = joyZone.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const maxR = rect.width / 2 - 10;

    if (dist > maxR) {
      dx = (dx / dist) * maxR;
      dy = (dy / dist) * maxR;
    }

    joyKnob.style.transform = `translate(${dx}px, ${dy}px)`;
    player.touchMoveX = dx / maxR;
    player.touchMoveZ = dy / maxR;
  }
}

const btnTouchJump = document.getElementById('btn-touch-jump');
if (btnTouchJump) {
  btnTouchJump.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (player.isGrounded) {
      player.velocity.y = 8.5;
      player.isGrounded = false;
      sounds.playPop();
    }
  });
}

// Touch Drag for First-Person Look (Right half of screen)
let lookTouchId = null;
let lookTouchPos = { x: 0, y: 0 };

window.addEventListener('touchstart', (e) => {
  if (state.viewMode !== 'player') return;
  for (let i = 0; i < e.changedTouches.length; i++) {
    const t = e.changedTouches[i];
    // Right half of screen for looking around
    if (t.clientX > window.innerWidth * 0.4 && lookTouchId === null) {
      lookTouchId = t.identifier;
      lookTouchPos = { x: t.clientX, y: t.clientY };
    }
  }
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  if (state.viewMode !== 'player') return;
  for (let i = 0; i < e.changedTouches.length; i++) {
    const t = e.changedTouches[i];
    if (t.identifier === lookTouchId) {
      const dx = t.clientX - lookTouchPos.x;
      const dy = t.clientY - lookTouchPos.y;
      player.yaw -= dx * 0.004;
      player.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, player.pitch - dy * 0.004));
      lookTouchPos = { x: t.clientX, y: t.clientY };
      break;
    }
  }
}, { passive: true });

window.addEventListener('touchend', (e) => {
  for (let i = 0; i < e.changedTouches.length; i++) {
    if (e.changedTouches[i].identifier === lookTouchId) {
      lookTouchId = null;
      break;
    }
  }
});

// Resize Handler
function handleWindowResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener('resize', handleWindowResize);
handleWindowResize();

// Main Animation Loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  if (document.hidden) return;
  const viewWorldMaker = document.getElementById('view-world-maker');
  if (viewWorldMaker && viewWorldMaker.classList.contains('hidden')) return;
  const delta = Math.min(clock.getDelta(), 0.1);

  // Slowly drift clouds
  clouds.children.forEach((c) => {
    c.position.x += delta * 1.2;
    if (c.position.x > 80) c.position.x = -80;
  });

  if (state.viewMode === 'orbit') {
    orbitControls.update();
  } else {
    // First Person Player Physics & Movement
    const speed = 7.5;
    const moveDir = new THREE.Vector3();

    if (player.moveForward) moveDir.z -= 1;
    if (player.moveBackward) moveDir.z += 1;
    if (player.moveLeft) moveDir.x -= 1;
    if (player.moveRight) moveDir.x += 1;

    // Add touch joystick input
    moveDir.x += player.touchMoveX;
    moveDir.z += player.touchMoveZ;

    if (moveDir.lengthSq() > 0.01) {
      moveDir.normalize();
      moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.yaw);

      const targetPosX = player.position.x + moveDir.x * speed * delta;
      const targetPosZ = player.position.z + moveDir.z * speed * delta;

      // Auto-step climbing check
      const halfX = world.sizeX / 2;
      const halfZ = world.sizeZ / 2;
      const curGround = world.getHighestBlock(Math.floor(player.position.x + halfX), Math.floor(player.position.z + halfZ)) + 1.8;
      const nextGround = world.getHighestBlock(Math.floor(targetPosX + halfX), Math.floor(targetPosZ + halfZ)) + 1.8;

      // If step is 1 block or less, auto-step up smoothly
      if (nextGround - curGround <= 1.2) {
        player.position.x = targetPosX;
        player.position.z = targetPosZ;
        if (nextGround > player.position.y) {
          player.position.y = nextGround;
          player.velocity.y = 0;
          player.isGrounded = true;
        }
      } else {
        // Obstructed by high wall
        player.position.x = targetPosX;
        player.position.z = targetPosZ;
      }
    }

    // Gravity
    player.velocity.y -= 22.0 * delta;
    player.position.y += player.velocity.y * delta;

    // Ground Collision Detection with Voxel World
    const halfX = world.sizeX / 2;
    const halfZ = world.sizeZ / 2;
    const px = Math.floor(player.position.x + halfX);
    const pz = Math.floor(player.position.z + halfZ);
    const groundHeight = world.getHighestBlock(px, pz) + 1.8;

    if (player.position.y <= groundHeight) {
      player.position.y = groundHeight;
      player.velocity.y = 0;
      player.isGrounded = true;
    }

    // Update Camera to Player Head
    camera.position.copy(player.position);
    camera.rotation.order = 'YXZ';
    camera.rotation.y = player.yaw;
    camera.rotation.x = player.pitch;
  }

  renderer.render(scene, camera);
}

animate();

// =========================================================================
// 👑 100% AUTHENTIC MINECRAFT 3D SKIN STUDIO CONTROLLER
// =========================================================================

function initSkinStudio() {
  const viewSkinStudio = document.getElementById('view-skin-studio');
  const viewWorldMaker = document.getElementById('view-world-maker');
  const viewAddonsStudio = document.getElementById('view-addons-studio');
  const btnSwitchSkin = document.getElementById('btn-switch-skin');
  const btnSwitchWorld = document.getElementById('btn-switch-world');
  const btnSwitchAddons = document.getElementById('btn-switch-addons');
  const skinTopActions = document.getElementById('skin-top-actions');
  const worldTopActions = document.getElementById('world-top-actions');
  const addonsTopActions = document.getElementById('addons-top-actions');
  const skinCanvas = document.getElementById('skin-canvas');

  if (!viewSkinStudio || !skinCanvas) return;

  let skinScene, skinCamera, skinRenderer, skinControls, skinModel, textureMgr, painter;
  let isStudioInitialized = false;

  function resizeSkinCanvas() {
    if (!skinCanvas || !skinRenderer || !skinCamera) return;
    const wrapper = skinCanvas.parentElement;
    const w = wrapper ? wrapper.clientWidth : skinCanvas.clientWidth;
    const h = wrapper ? wrapper.clientHeight : skinCanvas.clientHeight;
    if (w > 0 && h > 0) {
      const aspect = w / h;
      skinCamera.aspect = aspect;

      // Minecraft character is 32 units tall (y = 0 to 32)
      // Hair, ears, space buns extend up to y = 35. Pedestal is at y = 0.
      // Desired vertical height in view: ~44 units, centered at y = 16.
      const vFovRad = (skinCamera.fov * Math.PI) / 180;
      let targetDist = 44 / (2 * Math.tan(vFovRad / 2));

      // When viewport is portrait / narrow (aspect < 1), scale distance so width also fits
      if (aspect < 1) {
        const requiredHorizDist = 24 / (2 * Math.tan(vFovRad / 2) * aspect);
        targetDist = Math.max(targetDist, requiredHorizDist);
      }

      // Add extra breathing room so space buns / crowns never clip the top
      targetDist = Math.max(54, Math.min(targetDist * 1.06, 82));

      skinCamera.position.set(0, 16, targetDist);
      if (skinControls) {
        skinControls.target.set(0, 16, 0);
        skinControls.update();
      }
      skinCamera.updateProjectionMatrix();
      skinRenderer.setSize(w, h);
    }
  }

  function setupSkin3D() {
    if (isStudioInitialized) return;
    isStudioInitialized = true;

    // 1. Texture Manager
    textureMgr = new TextureManager();

    // 2. Three.js Scene, Camera, Renderer for Skin Studio
    skinScene = new THREE.Scene();
    skinScene.background = new THREE.Color(0x0e1015);

    const wrapper = skinCanvas.parentElement;
    const width = wrapper ? wrapper.clientWidth : 400;
    const height = wrapper ? wrapper.clientHeight : 360;

    skinCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 150);
    skinCamera.position.set(0, 16, 56);

    skinRenderer = new THREE.WebGLRenderer({ canvas: skinCanvas, antialias: true, preserveDrawingBuffer: true });
    skinRenderer.setSize(width, height);
    skinRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    skinRenderer.toneMapping = THREE.ACESFilmicToneMapping;

    // Orbit Controls
    skinControls = new OrbitControls(skinCamera, skinCanvas);
    skinControls.enableDamping = true;
    skinControls.dampingFactor = 0.08;
    skinControls.target.set(0, 16, 0);
    skinCamera.lookAt(0, 16, 0);
    skinControls.update();

    // Balanced 3-Point Studio Lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 0.9);
    skinScene.add(ambLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.25);
    keyLight.position.set(20, 32, 28);
    skinScene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x94a3b8, 0.55);
    fillLight.position.set(-20, 16, -15);
    skinScene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffeedd, 0.45);
    rimLight.position.set(0, 26, -26);
    skinScene.add(rimLight);

    // Studio Pedestal with subtle rim
    const pedestalGeo = new THREE.CylinderGeometry(8.5, 9.0, 0.6, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x181a22,
      roughness: 0.6,
      metalness: 0.2
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.3;
    skinScene.add(pedestal);

    const ringGeo = new THREE.RingGeometry(9.0, 9.3, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x282c38, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    skinScene.add(ring);

    // 3. Official 2-Layer Minecraft Skin Model
    skinModel = new SkinModel(textureMgr.texture);
    skinScene.add(skinModel.group);

    // Auto-load previously saved skin, or fallback to default preset (Afro Beauty)
    textureMgr.loadFromLocalStorage().then((loaded) => {
      if (!loaded) {
        return textureMgr.loadFromUrl('./presets/afro_beauty.png');
      }
    }).catch(() => {
      const wardrobe = new WardrobeEngine();
      wardrobe.compose(textureMgr.ctx);
      textureMgr.update();
    });

    // 4. Painter Engine
    painter = new Painter(skinCanvas, skinCamera, skinModel, textureMgr, skinControls);
    painter.setColor('#ec4899');
    painter.onColorPicked = (rgba) => {
      const hex = '#' + [rgba.r, rgba.g, rgba.b].map(x => x.toString(16).padStart(2, '0')).join('');
      const pickerEl = document.getElementById('skin-color-picker');
      if (pickerEl) pickerEl.value = hex;
      painter.setColor(hex);
      sounds.playPop();
    };

    // 5. Wire UI Controls

    // Mode Toggle (Paint vs Orbit)
    const btnModePaint = document.getElementById('btn-skin-mode-paint');
    const btnModeOrbit = document.getElementById('btn-skin-mode-orbit');

    if (btnModePaint) {
      btnModePaint.addEventListener('click', () => {
        btnModePaint.classList.add('active');
        if (btnModeOrbit) btnModeOrbit.classList.remove('active');
        painter.setMode('paint');
        sounds.playPop();
      });
    }

    if (btnModeOrbit) {
      btnModeOrbit.addEventListener('click', () => {
        btnModeOrbit.classList.add('active');
        if (btnModePaint) btnModePaint.classList.remove('active');
        painter.setMode('rotate');
        sounds.playPop();
      });
    }

    // Pose Selector
    const selectAnim = document.getElementById('select-skin-anim');
    if (selectAnim) {
      selectAnim.addEventListener('change', (e) => {
        skinModel.setAnimation(e.target.value);
        sounds.playPop();
      });
    }

    // Paint Tools
    viewSkinStudio.querySelectorAll('.skin-tool-btn[data-tool]').forEach((btn) => {
      btn.addEventListener('click', () => {
        viewSkinStudio.querySelectorAll('.skin-tool-btn[data-tool]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        painter.setTool(btn.dataset.tool);
        sounds.playPop();
      });
    });

    // Undo / Redo
    const btnSkinUndo = document.getElementById('btn-skin-undo');
    if (btnSkinUndo) {
      btnSkinUndo.addEventListener('click', () => {
        textureMgr.undo();
        sounds.playPop();
      });
    }
    const btnSkinRedo = document.getElementById('btn-skin-redo');
    if (btnSkinRedo) {
      btnSkinRedo.addEventListener('click', () => {
        textureMgr.redo();
        sounds.playPop();
      });
    }

    // Color Picker & Quick Dots
    const colorPicker = document.getElementById('skin-color-picker');
    if (colorPicker) {
      colorPicker.addEventListener('input', (e) => {
        painter.setColor(e.target.value);
      });
    }

    viewSkinStudio.querySelectorAll('.color-dot').forEach((dot) => {
      dot.addEventListener('click', () => {
        const c = dot.dataset.color;
        if (colorPicker) colorPicker.value = c;
        painter.setColor(c);
        sounds.playPop();
      });
    });

    // Studio Tabs (Presets / 3D Layers)
    viewSkinStudio.querySelectorAll('.studio-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        viewSkinStudio.querySelectorAll('.studio-tab-btn').forEach((b) => b.classList.remove('active'));
        viewSkinStudio.querySelectorAll('.studio-tab-content').forEach((c) => c.classList.remove('active'));
        btn.classList.add('active');
        const targetContent = document.getElementById(`tab-${btn.dataset.tab}`);
        if (targetContent) targetContent.classList.add('active');
        sounds.playPop();
      });
    });

    // Wardrobe Interactive Controls:
    const wardrobe = textureMgr.wardrobe;
    const activeToneLabel = document.getElementById('active-tone-label');

    // 1. Skin Tone Buttons
    viewSkinStudio.querySelectorAll('.skin-tone-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        viewSkinStudio.querySelectorAll('.skin-tone-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        wardrobe.set('skinTone', btn.dataset.tone);
        const toneObj = SKIN_TONES.find((t) => t.id === btn.dataset.tone);
        if (activeToneLabel && toneObj) {
          activeToneLabel.textContent = `Skin: ${toneObj.name}`;
        }
        wardrobe.compose(textureMgr.ctx);
        textureMgr.update();
        textureMgr.saveState();
        sounds.playPop();
      });
    });

    // 2. Hairstyle Buttons
    viewSkinStudio.querySelectorAll('.wardrobe-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        const val = btn.dataset.val;
        const parent = btn.parentElement;
        if (parent) {
          parent.querySelectorAll('.wardrobe-btn').forEach((b) => b.classList.remove('active'));
        }
        btn.classList.add('active');
        wardrobe.set(type, val);
        wardrobe.compose(textureMgr.ctx);
        textureMgr.update();
        textureMgr.saveState();
        sounds.playPop();
      });
    });

    // 3. Complete Outfits Carousel Arrows
    const trackOutfits = document.getElementById('track-complete-outfits');
    const btnOutfitsPrev = document.getElementById('btn-outfits-prev');
    const btnOutfitsNext = document.getElementById('btn-outfits-next');

    if (btnOutfitsPrev && trackOutfits) {
      btnOutfitsPrev.addEventListener('click', () => {
        trackOutfits.scrollBy({ left: -180, behavior: 'smooth' });
        sounds.playPop();
      });
    }

    if (btnOutfitsNext && trackOutfits) {
      btnOutfitsNext.addEventListener('click', () => {
        trackOutfits.scrollBy({ left: 180, behavior: 'smooth' });
        sounds.playPop();
      });
    }

    // 4. Complete Outfits Card Click (1-Tap Full Outfit)
    viewSkinStudio.querySelectorAll('.outfit-card').forEach((card) => {
      card.addEventListener('click', () => {
        viewSkinStudio.querySelectorAll('.outfit-card').forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
        const outfitId = card.dataset.outfit;
        const success = wardrobe.setOutfit(outfitId);
        if (success) {
          // Sync chips in individual tracks
          const current = wardrobe.current;
          ['top', 'bottom', 'shoes', 'accessory'].forEach((type) => {
            const trackId = `track-${type === 'top' ? 'tops' : type === 'bottom' ? 'bottoms' : type === 'accessory' ? 'accessories' : 'shoes'}`;
            const track = document.getElementById(trackId);
            if (track) {
              track.querySelectorAll('.wardrobe-chip').forEach((chip) => {
                chip.classList.toggle('active', chip.dataset.val === current[type]);
              });
            }
          });
          wardrobe.compose(textureMgr.ctx);
          textureMgr.update();
          textureMgr.saveState();
          sounds.playPop();
        }
      });
    });

    // 5. Wardrobe Chips (Tops, Bottoms, Shoes, Accessories)
    viewSkinStudio.querySelectorAll('.wardrobe-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const type = chip.dataset.type;
        const val = chip.dataset.val;
        const parent = chip.parentElement;
        if (parent) {
          parent.querySelectorAll('.wardrobe-chip').forEach((c) => c.classList.remove('active'));
        }
        chip.classList.add('active');
        // Clear active complete outfit card since user is mixing custom pieces
        viewSkinStudio.querySelectorAll('.outfit-card').forEach((c) => c.classList.remove('active'));
        wardrobe.set(type, val);
        wardrobe.compose(textureMgr.ctx);
        textureMgr.update();
        textureMgr.saveState();
        sounds.playPop();
      });
    });

    // 3. Hair Color Swatches
    viewSkinStudio.querySelectorAll('.hair-color-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        viewSkinStudio.querySelectorAll('.hair-color-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        wardrobe.set('hairColor', btn.dataset.color);
        wardrobe.compose(textureMgr.ctx);
        textureMgr.update();
        textureMgr.saveState();
        sounds.playPop();
      });
    });

    // 4. Eye Color Swatches
    viewSkinStudio.querySelectorAll('.eye-color-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        viewSkinStudio.querySelectorAll('.eye-color-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        wardrobe.set('eyeColor', btn.dataset.color);
        wardrobe.compose(textureMgr.ctx);
        textureMgr.update();
        textureMgr.saveState();
        sounds.playPop();
      });
    });

    // 5. Wardrobe Export Button
    const btnWardrobeExport = document.getElementById('btn-wardrobe-export-png');
    if (btnWardrobeExport) {
      btnWardrobeExport.addEventListener('click', () => {
        textureMgr.downloadPNG();
        sounds.playSuccess();
      });
    }

    // Top 30 Downloaded Professional Minecraft Skins & NameMC Capybaras
    viewSkinStudio.querySelectorAll('.preset-skin-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        viewSkinStudio.querySelectorAll('.preset-skin-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const skinId = btn.dataset.skin;
        const skinUrl = `./presets/${skinId}.png`;
        try {
          await textureMgr.loadFromUrl(skinUrl);
          sounds.playPop();
        } catch (err) {
          console.error('Failed loading preset skin', skinId, err);
        }
      });
    });

    // NameMC Capybara Sub-page Switcher
    viewSkinStudio.querySelectorAll('.namemc-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        viewSkinStudio.querySelectorAll('.namemc-tab-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const pageNum = btn.dataset.page;
        viewSkinStudio.querySelectorAll('.namemc-page-view').forEach((view) => {
          view.classList.add('hidden');
        });
        const target = document.getElementById(`namemc-page-${pageNum}`);
        if (target) target.classList.remove('hidden');
        sounds.playPop();
      });
    });

    // Toggle 3D Outer Clothes Layer
    let overlayOn = true;
    const btnToggleOverlay = document.getElementById('btn-toggle-overlay');
    if (btnToggleOverlay) {
      btnToggleOverlay.addEventListener('click', () => {
        overlayOn = !overlayOn;
        skinModel.setOverlayVisible(overlayOn);
        btnToggleOverlay.textContent = overlayOn
          ? '👁️ 3D Outer Clothes Layer: ON'
          : '🕶️ 3D Outer Clothes Layer: OFF';
        sounds.playPop();
      });
    }

    // Body Part Isolator Buttons
    const partStates = { head: true, body: true, leftArm: true, rightArm: true, leftLeg: true, rightLeg: true };
    viewSkinStudio.querySelectorAll('.part-toggle-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const part = btn.dataset.part;
        partStates[part] = !partStates[part];
        skinModel.setPartVisible(part, partStates[part]);
        if (partStates[part]) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
        sounds.playPop();
      });
    });

    // Search Username
    const inputUsername = document.getElementById('input-skin-username');
    const btnLoadUser = document.getElementById('btn-load-username');
    if (btnLoadUser && inputUsername) {
      btnLoadUser.addEventListener('click', async () => {
        const u = inputUsername.value.trim();
        if (!u) return;
        btnLoadUser.textContent = 'Loading...';
        try {
          await textureMgr.loadByUsername(u);
          sounds.playSuccess();
        } catch (err) {
          alert(err.message || 'Could not find skin');
        } finally {
          btnLoadUser.textContent = 'Load';
        }
      });
    }

    // Custom PNG Upload
    const inputSkinFile = document.getElementById('input-skin-file');
    if (inputSkinFile) {
      inputSkinFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          await textureMgr.loadPNG(file);
          sounds.playSuccess();
        }
      });
    }

    // 1-Tap Export Button (64x64 PNG - 100% Minecraft Bedrock Compatible)
    const handleSkinExport = () => {
      textureMgr.downloadPNG();
      sounds.playSuccess();
    };

    const btnExportPNG = document.getElementById('btn-skin-export-png');
    if (btnExportPNG) btnExportPNG.addEventListener('click', handleSkinExport);

    const btnTopExportSkin = document.getElementById('btn-top-export-skin');
    if (btnTopExportSkin) btnTopExportSkin.addEventListener('click', handleSkinExport);

    // Handle Window Resize
    window.addEventListener('resize', () => {
      if (!viewSkinStudio.classList.contains('hidden')) {
        resizeSkinCanvas();
      }
    });

    // Animation Loop for Skin Studio
    const skinClock = new THREE.Clock();
    function animateSkin() {
      requestAnimationFrame(animateSkin);
      if (document.hidden) return;
      if (!viewSkinStudio.classList.contains('hidden')) {
        const elapsed = skinClock.getElapsedTime();
        if (skinModel) {
          skinModel.updateAnimation(elapsed);
        }
        if (skinControls) {
          skinControls.update();
        }
        if (skinRenderer && skinScene && skinCamera) {
          skinRenderer.render(skinScene, skinCamera);
        }
      }
    }
    animateSkin();
  }

  // 3-Way Switcher Handlers (Skin, World, Addons)
  function switchView(target) {
    if (btnSwitchSkin) btnSwitchSkin.classList.toggle('active', target === 'skin');
    if (btnSwitchWorld) btnSwitchWorld.classList.toggle('active', target === 'world');
    if (btnSwitchAddons) btnSwitchAddons.classList.toggle('active', target === 'addons');

    if (viewSkinStudio) viewSkinStudio.classList.toggle('hidden', target !== 'skin');
    if (viewWorldMaker) viewWorldMaker.classList.toggle('hidden', target !== 'world');
    if (viewAddonsStudio) viewAddonsStudio.classList.toggle('hidden', target !== 'addons');

    if (skinTopActions) skinTopActions.classList.toggle('hidden', target !== 'skin');
    if (worldTopActions) worldTopActions.classList.toggle('hidden', target !== 'world');
    if (addonsTopActions) addonsTopActions.classList.toggle('hidden', target !== 'addons');

    sounds.playPop();

    if (target === 'skin') {
      setTimeout(resizeSkinCanvas, 30);
    } else if (target === 'world') {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  if (btnSwitchSkin) btnSwitchSkin.addEventListener('click', () => switchView('skin'));
  if (btnSwitchWorld) btnSwitchWorld.addEventListener('click', () => switchView('world'));
  if (btnSwitchAddons) btnSwitchAddons.addEventListener('click', () => switchView('addons'));

  // Category filter tabs for Add-ons Studio
  const filterBtns = document.querySelectorAll('.addon-filter-btn');
  const addonCards = document.querySelectorAll('#view-addons-studio .bedrock-card');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      sounds.playPop();

      addonCards.forEach((card) => {
        if (cat === 'all' || card.dataset.category === cat) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Immediately initialize Skin 3D
  setupSkin3D();
  setTimeout(resizeSkinCanvas, 50);
  setTimeout(resizeSkinCanvas, 200);
}

initSkinStudio();

// =========================================================================
// 📲 PROGRESSIVE WEB APP (PWA) CONTROLLER & AUTO-UPDATER
// =========================================================================

function initPWA() {
  const btnInstallPWA = document.getElementById('btn-install-pwa');
  const pwaUpdateBanner = document.getElementById('pwa-update-banner');
  const btnPwaRefresh = document.getElementById('btn-pwa-refresh');

  let deferredPrompt = null;

  // 1. Listen for Android "Add to Home Screen" install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (btnInstallPWA) {
      btnInstallPWA.classList.remove('hidden');
    }
  });

  if (btnInstallPWA) {
    btnInstallPWA.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      sounds.playPop();
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        btnInstallPWA.classList.add('hidden');
      }
      deferredPrompt = null;
    });
  }

  // 2. Register Service Worker and manage updates
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const reg = await navigator.serviceWorker.register('./sw.js');

        // Check for updates periodically every 60 seconds and on tab focus
        setInterval(() => reg.update(), 60000);
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') reg.update();
        });

        // If a new service worker is waiting, show the update banner
        function promptUserToRefresh(worker) {
          if (pwaUpdateBanner) {
            pwaUpdateBanner.classList.remove('hidden');
          }
          if (btnPwaRefresh) {
            btnPwaRefresh.addEventListener('click', () => {
              worker.postMessage({ type: 'SKIP_WAITING' });
            });
          }
        }

        if (reg.waiting) {
          promptUserToRefresh(reg.waiting);
        }

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              promptUserToRefresh(newWorker);
            }
          });
        });

        // When the new service worker activates, reload the page automatically
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshing) return;
          refreshing = true;
          window.location.reload();
        });
      } catch (err) {
        console.warn('PWA service worker registration failed:', err);
      }
    });
  }
}

initPWA();

