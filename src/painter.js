import * as THREE from 'three';

export class Painter {
  constructor(domElement, camera, skinModel, textureManager, controls) {
    this.domElement = domElement;
    this.camera = camera;
    this.skinModel = skinModel;
    this.textureManager = textureManager;
    this.controls = controls;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Tools & Modes
    this.mode = 'paint'; // 'paint' or 'rotate'
    this.tool = 'pencil'; // 'pencil', 'eraser', 'picker', 'fill'
    this.currentColor = { r: 0, g: 164, b: 160, a: 255 }; // Default cyan

    this.isPointerDown = false;
    this.activePointerId = null;
    this.pointerCount = 0;
    this.lastPaintedPixel = { x: -1, y: -1 };
    this.strokeModified = false;

    this.onColorPicked = null;

    this.targetLayer = 'auto'; // 'auto', 'base', 'overlay'
    this.setupEvents();
  }

  setTargetLayer(layer) {
    this.targetLayer = layer;
  }

  setMode(mode) {
    this.mode = mode;
    this.controls.enabled = true;
  }

  setTool(tool) {
    this.tool = tool;
  }

  setColor(hexOrRgba) {
    if (typeof hexOrRgba === 'string') {
      const hex = hexOrRgba.replace('#', '');
      const num = parseInt(hex, 16);
      this.currentColor = {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
        a: 255
      };
    } else {
      this.currentColor = hexOrRgba;
    }
  }

  setupEvents() {
    this.domElement.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    window.addEventListener('pointermove', (e) => this.onPointerMove(e));
    window.addEventListener('pointerup', (e) => this.onPointerUp(e));
    window.addEventListener('pointercancel', (e) => this.onPointerUp(e));
  }

  getPointerCoords(e) {
    const rect = this.domElement.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((e.clientY - rect.top) / rect.height) * 2 + 1
    };
  }

  raycast(e) {
    const coords = this.getPointerCoords(e);
    this.mouse.x = coords.x;
    this.mouse.y = coords.y;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshes = this.skinModel.getPaintableMeshes();
    const intersects = this.raycaster.intersectObjects(meshes, false);

    if (intersects.length === 0) return null;

    if (this.targetLayer === 'overlay') {
      const overHit = intersects.find(h => h.object.userData && h.object.userData.isOverlay);
      return overHit || intersects[0];
    }

    if (this.targetLayer === 'base') {
      const baseHit = intersects.find(h => h.object.userData && !h.object.userData.isOverlay);
      return baseHit || intersects[0];
    }

    // 'auto' mode: if hitting overlay, pass through if that pixel is transparent
    for (const hit of intersects) {
      if (hit.object.userData && hit.object.userData.isOverlay) {
        if (!hit.uv) continue;
        let px = Math.floor(hit.uv.x * 64);
        let py = Math.floor((1.0 - hit.uv.y) * 64);
        const pixel = this.textureManager.getPixel(px, py);
        if (pixel.a > 10) {
          return hit; // Hit an active 3D accessory pixel (crown, jacket, etc.)
        }
        // Transparent air: continue to base mesh underneath
        continue;
      }
      return hit;
    }

    return intersects[0];
  }

  onPointerDown(e) {
    this.pointerCount++;

    // Two or more fingers: Always Orbit & Zoom
    if (this.pointerCount > 1) {
      this.controls.enabled = true;
      this.isPointerDown = false;
      return;
    }

    // Right-click: Always Orbit
    if (e.button === 2) {
      this.controls.enabled = true;
      return;
    }

    // Full Orbit Mode: Always Orbit
    if (this.mode === 'rotate') {
      this.controls.enabled = true;
      return;
    }

    // In Paint Mode:
    const hit = this.raycast(e);
    if (hit) {
      // User tapped Steve: Paint & lock orbit
      this.controls.enabled = false;
      this.isPointerDown = true;
      this.activePointerId = e.pointerId;
      this.strokeModified = false;
      this.lastPaintedPixel = { x: -1, y: -1 };
      this.paintAtHit(hit);
    } else {
      // User tapped background: Allow Orbiting around Steve
      this.controls.enabled = true;
      this.isPointerDown = false;
    }
  }

  onPointerMove(e) {
    if (!this.isPointerDown || this.mode !== 'paint') return;
    const hit = this.raycast(e);
    if (hit) {
      this.paintAtHit(hit);
    }
  }

  onPointerUp(e) {
    this.pointerCount = Math.max(0, this.pointerCount - 1);

    if (this.isPointerDown) {
      this.isPointerDown = false;
      if (this.strokeModified) {
        this.textureManager.saveState();
        this.strokeModified = false;
      }
    }

    // Always restore OrbitControls capability on release
    this.controls.enabled = true;
  }

  paintAtHit(hit) {
    if (!hit || !hit.uv) return;

    let px = Math.floor(hit.uv.x * 64);
    let py = Math.floor((1.0 - hit.uv.y) * 64);
    px = Math.max(0, Math.min(63, px));
    py = Math.max(0, Math.min(63, py));

    if (this.tool === 'picker') {
      const pixel = this.textureManager.getPixel(px, py);
      if (pixel.a > 0) {
        this.currentColor = pixel;
        if (this.onColorPicked) {
          this.onColorPicked(pixel);
        }
      }
      return;
    }

    if (this.tool === 'fill') {
      this.textureManager.floodFill(px, py, this.currentColor);
      this.textureManager.saveState();
      return;
    }

    // Pencil or Eraser
    if (this.lastPaintedPixel.x === px && this.lastPaintedPixel.y === py) {
      return;
    }

    this.lastPaintedPixel = { x: px, y: py };

    let targetColor = this.currentColor;
    if (this.tool === 'eraser') {
      if (hit.object.userData && hit.object.userData.isOverlay) {
        targetColor = { r: 0, g: 0, b: 0, a: 0 };
      } else {
        targetColor = { r: 255, g: 255, b: 255, a: 255 };
      }
    }

    this.textureManager.setPixel(px, py, targetColor);
    this.strokeModified = true;
  }
}
