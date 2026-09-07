import * as THREE from 'three';
import { WardrobeEngine } from './wardrobe.js';

export class TextureManager {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 64;
    this.canvas.height = 64;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

    // Clear with transparent black
    this.ctx.clearRect(0, 0, 64, 64);

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.generateMipmaps = false;

    // Wardrobe Engine for professional pixel art generation
    this.wardrobe = new WardrobeEngine();

    // Undo / Redo history
    this.undoStack = [];
    this.redoStack = [];
    this.maxHistory = 30;

    // Compose default character
    this.wardrobe.compose(this.ctx);
    this.saveState();
  }

  loadSpaceBuns() {
    this.wardrobe.set('skinTone', 'caramel_bronze');
    this.wardrobe.set('hairStyle', 'afro_puffs');
    this.wardrobe.set('hairColor', 'natural_black');
    this.wardrobe.set('eyeColor', 'deep_brown');
    this.wardrobe.set('top', 'hoodie_pink');
    this.wardrobe.set('bottom', 'jeans_blue');
    this.wardrobe.set('shoes', 'sneakers_white');
    this.wardrobe.set('accessory', 'cat_headphones');
    this.wardrobe.compose(this.ctx);
    this.update();
    this.saveState();
  }

  loadHoneyBraids() {
    this.wardrobe.set('skinTone', 'warm_espresso');
    this.wardrobe.set('hairStyle', 'box_braids');
    this.wardrobe.set('hairColor', 'dark_chocolate');
    this.wardrobe.set('eyeColor', 'hazel_amber');
    this.wardrobe.set('top', 'hoodie_pink');
    this.wardrobe.set('bottom', 'jeans_blue');
    this.wardrobe.set('shoes', 'sneakers_white');
    this.wardrobe.set('accessory', 'none');
    this.wardrobe.compose(this.ctx);
    this.update();
    this.saveState();
  }

  update() {
    this.texture.needsUpdate = true;
    if (this.onUpdateCallback) {
      this.onUpdateCallback();
    }
    this.debounceAutoSave();
  }

  debounceAutoSave() {
    if (this._saveTimeout) clearTimeout(this._saveTimeout);
    this._saveTimeout = setTimeout(() => {
      try {
        const dataUrl = this.canvas.toDataURL('image/png');
        localStorage.setItem('minecraft_skin_autosave', dataUrl);
      } catch (e) {
        // Silently ignore storage quota or private browsing errors
      }
    }, 600);
  }

  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('minecraft_skin_autosave');
      if (saved && saved.startsWith('data:image/png')) {
        return this.loadFromUrl(saved);
      }
    } catch (e) {
      // Silently ignore
    }
    return Promise.resolve(false);
  }

  saveState() {
    const imgData = this.ctx.getImageData(0, 0, 64, 64);
    this.undoStack.push(imgData);
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
    this.redoStack = [];
  }

  undo() {
    if (this.undoStack.length <= 1) return false;
    const current = this.undoStack.pop();
    this.redoStack.push(current);
    const prev = this.undoStack[this.undoStack.length - 1];
    this.ctx.putImageData(prev, 0, 0);
    this.update();
    return true;
  }

  redo() {
    if (this.redoStack.length === 0) return false;
    const next = this.redoStack.pop();
    this.undoStack.push(next);
    this.ctx.putImageData(next, 0, 0);
    this.update();
    return true;
  }

  getPixel(x, y) {
    if (x < 0 || x >= 64 || y < 0 || y >= 64) return { r: 0, g: 0, b: 0, a: 0 };
    const p = this.ctx.getImageData(x, y, 1, 1).data;
    return { r: p[0], g: p[1], b: p[2], a: p[3] };
  }

  setPixel(x, y, colorRgba) {
    if (x < 0 || x >= 64 || y < 0 || y >= 64) return;
    const imgData = this.ctx.createImageData(1, 1);
    imgData.data[0] = colorRgba.r;
    imgData.data[1] = colorRgba.g;
    imgData.data[2] = colorRgba.b;
    imgData.data[3] = colorRgba.a;
    this.ctx.putImageData(imgData, x, y);
    this.update();
  }

  floodFill(startX, startY, targetRgba) {
    if (startX < 0 || startX >= 64 || startY < 0 || startY >= 64) return;

    const imgData = this.ctx.getImageData(0, 0, 64, 64);
    const data = imgData.data;

    const startIndex = (startY * 64 + startX) * 4;
    const startR = data[startIndex];
    const startG = data[startIndex + 1];
    const startB = data[startIndex + 2];
    const startA = data[startIndex + 3];

    if (
      startR === targetRgba.r &&
      startG === targetRgba.g &&
      startB === targetRgba.b &&
      startA === targetRgba.a
    ) {
      return;
    }

    const queue = [[startX, startY]];
    const visited = new Uint8Array(64 * 64);

    while (queue.length > 0) {
      const [x, y] = queue.pop();
      const idx = y * 64 + x;
      if (visited[idx]) continue;
      visited[idx] = 1;

      const pIdx = idx * 4;
      if (
        data[pIdx] === startR &&
        data[pIdx + 1] === startG &&
        data[pIdx + 2] === startB &&
        data[pIdx + 3] === startA
      ) {
        data[pIdx] = targetRgba.r;
        data[pIdx + 1] = targetRgba.g;
        data[pIdx + 2] = targetRgba.b;
        data[pIdx + 3] = targetRgba.a;

        if (x > 0) queue.push([x - 1, y]);
        if (x < 63) queue.push([x + 1, y]);
        if (y > 0) queue.push([x, y - 1]);
        if (y < 63) queue.push([x, y + 1]);
      }
    }

    this.ctx.putImageData(imgData, 0, 0);
    this.update();
  }

  _fillBox(x, y, w, h, hex) {
    this.ctx.fillStyle = hex;
    this.ctx.fillRect(x, y, w, h);
  }

  loadDefaultSteve() {
    this.ctx.clearRect(0, 0, 64, 64);

    // Head
    this._fillBox(0, 0, 32, 16, '#462713'); // Hair
    this._fillBox(8, 8, 8, 8, '#C68A6B');  // Face
    this._fillBox(8, 8, 8, 2, '#462713');  // Bangs
    this._fillBox(8, 12, 1, 1, '#FFFFFF');
    this._fillBox(9, 12, 1, 1, '#2E3BB8');
    this._fillBox(15, 12, 1, 1, '#FFFFFF');
    this._fillBox(14, 12, 1, 1, '#2E3BB8');
    this._fillBox(11, 13, 2, 1, '#A86A4C'); // Nose
    this._fillBox(10, 14, 4, 1, '#462713'); // Mouth
    this._fillBox(11, 15, 2, 1, '#704225');

    // Torso (Cyan Shirt)
    this._fillBox(16, 16, 24, 16, '#00A4A0');
    this._fillBox(22, 20, 4, 2, '#C68A6B'); // Neck

    // Arms
    this._fillBox(40, 16, 16, 8, '#00A4A0');
    this._fillBox(40, 24, 16, 8, '#C68A6B');

    this._fillBox(32, 48, 16, 8, '#00A4A0');
    this._fillBox(32, 56, 16, 8, '#C68A6B');

    // Legs
    this._fillBox(0, 16, 16, 12, '#2C3579');
    this._fillBox(0, 28, 16, 4, '#484848');

    this._fillBox(16, 48, 16, 12, '#2C3579');
    this._fillBox(16, 60, 16, 4, '#484848');

    this.update();
  }

  loadDefaultAlex() {
    this.ctx.clearRect(0, 0, 64, 64);

    this._fillBox(0, 0, 32, 16, '#B65A28'); // Orange Hair
    this._fillBox(8, 8, 8, 8, '#E2A98C');  // Face
    this._fillBox(8, 8, 8, 2, '#B65A28');
    this._fillBox(8, 12, 1, 1, '#FFFFFF');
    this._fillBox(9, 12, 1, 1, '#2E8B57');
    this._fillBox(15, 12, 1, 1, '#FFFFFF');
    this._fillBox(14, 12, 1, 1, '#2E8B57');
    this._fillBox(11, 14, 2, 1, '#C77556');

    // Torso (Green Tunic)
    this._fillBox(16, 16, 24, 16, '#557A3E');
    this._fillBox(22, 20, 4, 2, '#E2A98C');

    // Arms
    this._fillBox(40, 16, 16, 6, '#557A3E');
    this._fillBox(40, 22, 16, 10, '#E2A98C');

    this._fillBox(32, 48, 16, 6, '#557A3E');
    this._fillBox(32, 54, 16, 10, '#E2A98C');

    // Legs
    this._fillBox(0, 16, 16, 12, '#4E3A2F');
    this._fillBox(0, 28, 16, 4, '#383838');

    this._fillBox(16, 48, 16, 12, '#4E3A2F');
    this._fillBox(16, 60, 16, 4, '#383838');

    this.update();
    this.saveState();
  }

  loadCapybara() {
    this.ctx.clearRect(0, 0, 64, 64);

    // --- Capybara Head (Warm Fur: #8D6E63, #6D4C41) ---
    this._fillBox(0, 0, 32, 16, '#8D6E63');
    this._fillBox(8, 8, 8, 8, '#8D6E63'); // Face
    // Dark blunt snout
    this._fillBox(10, 12, 4, 4, '#4E342E');
    this._fillBox(11, 13, 2, 1, '#2A1B17'); // Nostrils
    // Cute black eyes with white shine
    this._fillBox(8, 11, 2, 1, '#1A1A1A');
    this._fillBox(9, 11, 1, 1, '#FFFFFF');
    this._fillBox(14, 11, 2, 1, '#1A1A1A');
    this._fillBox(14, 11, 1, 1, '#FFFFFF');
    // Ears on head
    this._fillBox(8, 8, 2, 2, '#5D4037');
    this._fillBox(14, 8, 2, 2, '#5D4037');

    // Cute Orange / Yuzu on Head Overlay (32, 0 to 64, 16)
    this._fillBox(41, 1, 6, 6, '#F97316'); // Orange top
    this._fillBox(43, 0, 2, 1, '#22C55E'); // Green leaf

    // --- Torso (Capybara Fur & Cozy Belly) ---
    this._fillBox(16, 16, 24, 16, '#795548'); // Fluffy brown fur
    this._fillBox(21, 20, 6, 10, '#BCAAA4'); // Cream belly fur

    // --- Arms (Brown Fur with Paws) ---
    this._fillBox(40, 16, 16, 12, '#795548');
    this._fillBox(40, 28, 16, 4, '#4E342E'); // Dark paws

    this._fillBox(32, 48, 16, 12, '#795548');
    this._fillBox(32, 60, 16, 4, '#4E342E');

    // --- Legs (Short Brown Paws) ---
    this._fillBox(0, 16, 16, 12, '#6D4C41');
    this._fillBox(0, 28, 16, 4, '#3E2723'); // Dark feet

    this._fillBox(16, 48, 16, 12, '#6D4C41');
    this._fillBox(16, 60, 16, 4, '#3E2723');

    this.update();
    this.saveState();
  }

  loadZombie() {
    this.ctx.clearRect(0, 0, 64, 64);

    // Head (Green)
    this._fillBox(0, 0, 32, 16, '#568243');
    this._fillBox(8, 8, 8, 8, '#568243');
    this._fillBox(8, 11, 2, 2, '#283C1F');
    this._fillBox(14, 11, 2, 2, '#283C1F');
    this._fillBox(9, 12, 1, 1, '#1A2914');
    this._fillBox(14, 12, 1, 1, '#1A2914');
    this._fillBox(11, 13, 2, 1, '#3B572E');
    this._fillBox(10, 14, 4, 1, '#283C1F');

    // Torso (Cyan Shirt)
    this._fillBox(16, 16, 24, 16, '#008C89');
    this._fillBox(22, 20, 4, 2, '#568243');

    // Arms
    this._fillBox(40, 16, 16, 8, '#008C89');
    this._fillBox(40, 24, 16, 8, '#568243');

    this._fillBox(32, 48, 16, 8, '#008C89');
    this._fillBox(32, 56, 16, 8, '#568243');

    // Legs
    this._fillBox(0, 16, 16, 12, '#2C3579');
    this._fillBox(0, 28, 16, 4, '#383838');

    this._fillBox(16, 48, 16, 12, '#2C3579');
    this._fillBox(16, 60, 16, 4, '#383838');

    this.update();
    this.saveState();
  }

  loadCreeper() {
    this.ctx.clearRect(0, 0, 64, 64);

    this._fillBox(0, 0, 32, 16, '#5E7C16');
    this._fillBox(9, 10, 2, 2, '#18181B');
    this._fillBox(13, 10, 2, 2, '#18181B');
    this._fillBox(11, 12, 2, 3, '#18181B');
    this._fillBox(10, 13, 4, 2, '#18181B');
    this._fillBox(10, 15, 1, 1, '#18181B');
    this._fillBox(13, 15, 1, 1, '#18181B');

    // Torso
    this._fillBox(16, 16, 24, 16, '#4E6B12');
    this._fillBox(20, 20, 8, 12, '#5E7C16');
    this._fillBox(22, 24, 4, 4, '#18181B');

    // Arms
    this._fillBox(40, 16, 16, 16, '#4E6B12');
    this._fillBox(32, 48, 16, 16, '#4E6B12');

    // Legs
    this._fillBox(0, 16, 16, 12, '#3E550E');
    this._fillBox(0, 28, 16, 4, '#2A3B09');

    this._fillBox(16, 48, 16, 12, '#3E550E');
    this._fillBox(16, 60, 16, 4, '#2A3B09');

    this.update();
    this.saveState();
  }

  loadSkeleton() {
    this.ctx.clearRect(0, 0, 64, 64);

    this._fillBox(0, 0, 32, 16, '#CCCCCC');
    this._fillBox(9, 10, 2, 2, '#1E1E1E');
    this._fillBox(13, 10, 2, 2, '#1E1E1E');
    this._fillBox(11, 12, 2, 1, '#1E1E1E');
    this._fillBox(10, 14, 4, 1, '#1E1E1E');
    this._fillBox(11, 15, 2, 1, '#1E1E1E');

    // Torso
    this._fillBox(16, 16, 24, 16, '#1E1E1E');
    this._fillBox(20, 20, 8, 2, '#CCCCCC');
    this._fillBox(20, 24, 8, 2, '#CCCCCC');
    this._fillBox(20, 28, 8, 2, '#CCCCCC');
    this._fillBox(23, 18, 2, 14, '#CCCCCC');

    // Arms & Legs
    this._fillBox(40, 16, 16, 16, '#AAAAAA');
    this._fillBox(32, 48, 16, 16, '#AAAAAA');
    this._fillBox(0, 16, 16, 16, '#AAAAAA');
    this._fillBox(16, 48, 16, 16, '#AAAAAA');

    this.update();
    this.saveState();
  }

  loadKnight() {
    this.ctx.clearRect(0, 0, 64, 64);
    this.loadDefaultSteve();

    // Diamond Armor
    this._fillBox(32, 0, 32, 8, '#3AB3DA');
    this._fillBox(40, 8, 8, 4, '#3AB3DA');
    this._fillBox(40, 12, 2, 4, '#3AB3DA');
    this._fillBox(46, 12, 2, 4, '#3AB3DA');

    this._fillBox(16, 32, 24, 16, '#3AB3DA');
    this._fillBox(22, 34, 4, 4, '#2486A6');

    this._fillBox(40, 32, 16, 12, '#3AB3DA');
    this._fillBox(48, 48, 16, 12, '#3AB3DA');

    this._fillBox(0, 32, 16, 12, '#3AB3DA');
    this._fillBox(0, 48, 16, 12, '#3AB3DA');

    this.update();
    this.saveState();
  }

  loadEnderman() {
    this.ctx.clearRect(0, 0, 64, 64);
    this._fillBox(0, 0, 64, 64, '#141416');

    // Eyes
    this._fillBox(8, 11, 3, 1, '#CC44FF');
    this._fillBox(9, 11, 1, 1, '#FFFFFF');
    this._fillBox(13, 11, 3, 1, '#CC44FF');
    this._fillBox(14, 11, 1, 1, '#FFFFFF');

    this.update();
    this.saveState();
  }

  loadAstronaut() {
    this.ctx.clearRect(0, 0, 64, 64);
    this._fillBox(0, 0, 64, 64, '#EAEAEA');

    // Visor
    this._fillBox(9, 10, 6, 4, '#18181B');
    this._fillBox(10, 10, 2, 1, '#60A5FA');

    this._fillBox(22, 22, 4, 4, '#DC2626');
    this._fillBox(20, 28, 8, 2, '#3B82F6');
    this._fillBox(0, 28, 16, 4, '#71717A');
    this._fillBox(16, 60, 16, 4, '#71717A');

    this.update();
    this.saveState();
  }

  loadPrincess() {
    this.ctx.clearRect(0, 0, 64, 64);
    // Skin Tone
    this._fillBox(0, 0, 32, 16, '#F8D3B4');
    // Golden Blonde Hair
    this._fillBox(0, 0, 32, 6, '#FCD34D');
    this._fillBox(0, 6, 8, 10, '#FCD34D');
    this._fillBox(24, 6, 8, 10, '#FCD34D');
    this._fillBox(16, 6, 8, 10, '#FCD34D');
    // Blue Sparkle Eyes & Rosy Cheeks
    this._fillBox(9, 10, 2, 2, '#38BDF8');
    this._fillBox(9, 10, 1, 1, '#FFFFFF');
    this._fillBox(13, 10, 2, 2, '#38BDF8');
    this._fillBox(13, 10, 1, 1, '#FFFFFF');
    this._fillBox(8, 12, 1, 1, '#F472B6');
    this._fillBox(15, 12, 1, 1, '#F472B6');
    this._fillBox(11, 13, 2, 1, '#FB7185');

    // 3D Tiara Outer Layer
    this._fillBox(32, 0, 32, 4, '#FBBF24');
    this._fillBox(41, 2, 2, 2, '#F43F5E');

    // Pink Royal Gown & Torso
    this._fillBox(16, 16, 24, 16, '#F472B6');
    this._fillBox(20, 16, 8, 3, '#F8D3B4');
    this._fillBox(21, 19, 6, 9, '#F43F5E');
    this._fillBox(20, 28, 8, 4, '#FB7185');

    // White Satin Gloves & Arms
    this._fillBox(40, 16, 16, 6, '#F8D3B4');
    this._fillBox(40, 22, 16, 10, '#FFFFFF');
    this._fillBox(32, 48, 16, 6, '#F8D3B4');
    this._fillBox(32, 54, 16, 10, '#FFFFFF');

    // Royal Gown Legs & Slippers
    this._fillBox(0, 16, 16, 14, '#EC4899');
    this._fillBox(0, 30, 16, 2, '#F43F5E');
    this._fillBox(16, 48, 16, 14, '#EC4899');
    this._fillBox(16, 62, 16, 2, '#F43F5E');

    this.update();
    this.saveState();
  }

  loadPikachu() {
    this.ctx.clearRect(0, 0, 64, 64);
    // Pikachu Yellow Head
    this._fillBox(0, 0, 32, 16, '#FACC15');
    // Eyes
    this._fillBox(9, 10, 2, 2, '#18181B');
    this._fillBox(9, 10, 1, 1, '#FFFFFF');
    this._fillBox(13, 10, 2, 2, '#18181B');
    this._fillBox(13, 10, 1, 1, '#FFFFFF');
    // Cute Nose & Mouth
    this._fillBox(11, 12, 2, 1, '#713F12');
    this._fillBox(11, 13, 2, 1, '#EF4444');
    // Rosy Red Cheeks
    this._fillBox(8, 11, 2, 2, '#EF4444');
    this._fillBox(14, 11, 2, 2, '#EF4444');

    // Pikachu Hoodie Outer Layer
    this._fillBox(32, 0, 32, 16, '#EAB308');
    this._fillBox(40, 0, 8, 4, '#18181B');

    // Yellow Torso with Brown Back Stripes
    this._fillBox(16, 16, 24, 16, '#FACC15');
    this._fillBox(24, 20, 8, 2, '#713F12');
    this._fillBox(24, 25, 8, 2, '#713F12');

    // Arms
    this._fillBox(40, 16, 16, 16, '#FACC15');
    this._fillBox(32, 48, 16, 16, '#FACC15');

    // Legs & Cute Brown Shoes
    this._fillBox(0, 16, 16, 12, '#FACC15');
    this._fillBox(0, 28, 16, 4, '#713F12');
    this._fillBox(16, 48, 16, 12, '#FACC15');
    this._fillBox(16, 60, 16, 4, '#713F12');

    this.update();
    this.saveState();
  }

  loadEevee() {
    this.ctx.clearRect(0, 0, 64, 64);
    // Eevee Warm Brown Head
    this._fillBox(0, 0, 32, 16, '#A16207');
    // Eyes & Sparkle
    this._fillBox(9, 10, 2, 2, '#451A03');
    this._fillBox(9, 10, 1, 1, '#FFFFFF');
    this._fillBox(13, 10, 2, 2, '#451A03');
    this._fillBox(13, 10, 1, 1, '#FFFFFF');
    this._fillBox(11, 12, 2, 1, '#1C1917');
    // Fluffy Cream Collar (Torso & Outer Layer)
    this._fillBox(16, 16, 24, 6, '#FEF08A');
    this._fillBox(16, 22, 24, 10, '#854D0E');

    // Fluff Overlay
    this._fillBox(16, 32, 24, 8, '#FEF08A');

    // Arms & Legs
    this._fillBox(40, 16, 16, 16, '#A16207');
    this._fillBox(32, 48, 16, 16, '#A16207');
    this._fillBox(0, 16, 16, 16, '#854D0E');
    this._fillBox(16, 48, 16, 16, '#854D0E');

    this.update();
    this.saveState();
  }

  loadFairy() {
    this.ctx.clearRect(0, 0, 64, 64);
    // Skin Tone
    this._fillBox(0, 0, 32, 16, '#FDE68A');
    // Lilac Pastel Hair
    this._fillBox(0, 0, 32, 6, '#C084FC');
    this._fillBox(0, 6, 8, 10, '#C084FC');
    this._fillBox(24, 6, 8, 10, '#C084FC');
    // Emerald Eyes
    this._fillBox(9, 10, 2, 2, '#10B981');
    this._fillBox(9, 10, 1, 1, '#FFFFFF');
    this._fillBox(13, 10, 2, 2, '#10B981');
    this._fillBox(13, 10, 1, 1, '#FFFFFF');
    // Flower Crown Outer Layer
    this._fillBox(32, 0, 32, 3, '#34D399');
    this._fillBox(40, 2, 2, 2, '#F472B6');
    this._fillBox(44, 2, 2, 2, '#FBBF24');
    this._fillBox(48, 2, 2, 2, '#818CF8');

    // Mint & Lilac Fairy Dress
    this._fillBox(16, 16, 24, 16, '#6EE7B7');
    this._fillBox(20, 16, 8, 3, '#FDE68A');
    this._fillBox(20, 24, 8, 8, '#A7F3D0');

    // Fairy Arms & Legs
    this._fillBox(40, 16, 16, 16, '#FDE68A');
    this._fillBox(32, 48, 16, 16, '#FDE68A');
    this._fillBox(0, 16, 16, 12, '#6EE7B7');
    this._fillBox(0, 28, 16, 4, '#34D399');
    this._fillBox(16, 48, 16, 12, '#6EE7B7');
    this._fillBox(16, 60, 16, 4, '#34D399');

    this.update();
    this.saveState();
  }

  loadCapybara() {
    this.ctx.clearRect(0, 0, 64, 64);
    // Warm Capybara Brown
    this._fillBox(0, 0, 32, 16, '#8D5B4C');
    this._fillBox(8, 8, 8, 8, '#704235');
    // Chill Sleepy Eyes
    this._fillBox(9, 10, 2, 1, '#1C1917');
    this._fillBox(13, 10, 2, 1, '#1C1917');
    this._fillBox(10, 13, 4, 2, '#3E2723');

    // Orange on top of head (Outer layer)
    this._fillBox(32, 0, 32, 16, '#00000000');
    this._fillBox(42, 0, 4, 4, '#F97316');
    this._fillBox(43, 0, 2, 1, '#15803D');

    // Body & Cozy Sweater
    this._fillBox(16, 16, 24, 16, '#8D5B4C');
    this._fillBox(20, 20, 8, 8, '#F59E0B');

    // Paws & Legs
    this._fillBox(40, 16, 16, 16, '#8D5B4C');
    this._fillBox(32, 48, 16, 16, '#8D5B4C');
    this._fillBox(0, 16, 16, 16, '#704235');
    this._fillBox(16, 48, 16, 16, '#704235');

    this.update();
    this.saveState();
  }

  loadBlank() {
    this.ctx.clearRect(0, 0, 64, 64);
    this._fillBox(0, 0, 64, 64, '#D4D4D8');
    this.update();
    this.saveState();
  }

  downloadPNG() {
    this.canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'minecraft_skin_64x64.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png');
  }

  loadFromUrl(url) {
    return new Promise((resolve, reject) => {
      const tryLoad = (srcPath) => {
        const img = new Image();
        if (srcPath.startsWith('http://') || srcPath.startsWith('https://')) {
          img.crossOrigin = 'Anonymous';
        }
        img.onload = () => {
          this.ctx.clearRect(0, 0, 64, 64);
          this.ctx.drawImage(img, 0, 0, 64, 64);
          this.update();
          this.saveState();
          resolve(true);
        };
        img.onerror = () => {
          // Automatic fallback for GitHub Pages or static host directory differences
          if (srcPath.includes('/presets/') && !srcPath.includes('/public/presets/')) {
            tryLoad(srcPath.replace('/presets/', '/public/presets/'));
          } else if (srcPath.includes('/public/presets/')) {
            tryLoad(srcPath.replace('/public/presets/', '/presets/'));
          } else {
            reject(new Error('Failed to load skin image'));
          }
        };
        img.src = srcPath;
      };
      tryLoad(url);
    });
  }

  loadPNG(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          this.ctx.clearRect(0, 0, 64, 64);
          this.ctx.drawImage(img, 0, 0, 64, 64);
          this.update();
          this.saveState();
          resolve(true);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  loadByUsername(username) {
    const cleanName = username.trim();
    if (!cleanName) return Promise.reject(new Error("Please enter a username"));

    const primaryUrl = `https://minotar.net/skin/${encodeURIComponent(cleanName)}`;
    const fallbackUrl = `https://crafthead.net/skin/${encodeURIComponent(cleanName)}`;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';

      img.onload = () => {
        this.ctx.clearRect(0, 0, 64, 64);
        this.ctx.drawImage(img, 0, 0, 64, 64);
        this.update();
        this.saveState();
        resolve(true);
      };

      img.onerror = () => {
        const fallbackImg = new Image();
        fallbackImg.crossOrigin = 'Anonymous';
        fallbackImg.onload = () => {
          this.ctx.clearRect(0, 0, 64, 64);
          this.ctx.drawImage(fallbackImg, 0, 0, 64, 64);
          this.update();
          this.saveState();
          resolve(true);
        };
        fallbackImg.onerror = () => reject(new Error(`Could not find skin for "${cleanName}". Check spelling.`));
        fallbackImg.src = fallbackUrl;
      };

      img.src = primaryUrl;
    });
  }
}
