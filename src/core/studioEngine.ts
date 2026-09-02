import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import confetti from 'canvas-confetti';
import { BrushType, PaintedStroke, PlacedSticker, ShaderPreset, ToyModelInfo } from '../types';
import { SHADER_PRESETS, createMagicShaderMaterial } from './animatedShaders';
import { TOYBOX_MODELS, buildToyModelGroup } from './sampleModels';
import { ProceduralSkyEngine } from './proceduralSky';
import { UndoRedoManager, MeshTextureSnapshot } from './undoRedoManager';
import { soundEngine } from '../utils/audio';
import { resolveAssetUrl } from '../utils/assetUrl';

export interface StudioEngineOptions {
  canvas: HTMLCanvasElement;
  onStrokeStart?: () => void;
  onStrokeEnd?: (stroke: PaintedStroke) => void;
  onModelLoaded?: (model: ToyModelInfo) => void;
  onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
}

interface MeshPaintData {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
  baseColor: string;
  lastUV: THREE.Vector2 | null;
  history: ImageData[];
}

/**
 * Generates continuous, non-overlapping triplanar cubic UVs across all 3D mesh triangles
 * completely eliminating texture tiling, UV mirroring, and checkerboard artifacts.
 */
function generateUniqueBoxUVs(geometry: THREE.BufferGeometry) {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox || new THREE.Box3();
  const size = new THREE.Vector3();
  box.getSize(size);
  const min = box.min;

  const pos = geometry.attributes.position;
  if (!pos) return;

  if (!geometry.attributes.normal) {
    geometry.computeVertexNormals();
  }
  const norm = geometry.attributes.normal;
  const count = pos.count;
  const uvs = new Float32Array(count * 2);

  const dx = Math.max(0.001, size.x);
  const dy = Math.max(0.001, size.y);
  const dz = Math.max(0.001, size.z);

  for (let i = 0; i < count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    const nx = Math.abs(norm.getX(i));
    const ny = Math.abs(norm.getY(i));
    const nz = Math.abs(norm.getZ(i));

    let u = 0;
    let v = 0;
    let col = 0;
    let row = 0;

    if (ny >= nx && ny >= nz) {
      // Y-dominant (Top / Bottom)
      if (norm.getY(i) > 0) {
        u = (x - min.x) / dx;
        v = (z - min.z) / dz;
        col = 1;
        row = 1;
      } else {
        u = (x - min.x) / dx;
        v = (z - min.z) / dz;
        col = 2;
        row = 1;
      }
    } else if (nx >= ny && nx >= nz) {
      // X-dominant (Right / Left)
      if (norm.getX(i) > 0) {
        u = (z - min.z) / dz;
        v = (y - min.y) / dy;
        col = 2;
        row = 0;
      } else {
        u = (z - min.z) / dz;
        v = (y - min.y) / dy;
        col = 0;
        row = 1;
      }
    } else {
      // Z-dominant (Front / Back)
      if (norm.getZ(i) > 0) {
        u = (x - min.x) / dx;
        v = (y - min.y) / dy;
        col = 0;
        row = 0;
      } else {
        u = (x - min.x) / dx;
        v = (y - min.y) / dy;
        col = 1;
        row = 0;
      }
    }

    u = Math.min(0.98, Math.max(0.02, u));
    v = Math.min(0.98, Math.max(0.02, v));

    uvs[i * 2] = (col + u) / 3.0;
    uvs[i * 2 + 1] = (row + v) / 2.0;
  }

  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.attributes.uv.needsUpdate = true;
}

export class StudioEngine {
  public canvas: HTMLCanvasElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public sky: ProceduralSkyEngine;
  public undoManager: UndoRedoManager = new UndoRedoManager();

  // Loaders
  private dracoLoader: DRACOLoader;
  private gltfLoader: GLTFLoader;

  // Geometry holders
  public currentToyGroup: THREE.Group | null = null;
  public stickersGroup: THREE.Group;
  public currentModelInfo: ToyModelInfo = TOYBOX_MODELS[0];

  // Map of mesh UUID to its paint canvas & context
  private meshPaintData: Map<string, MeshPaintData> = new Map();

  // Active Painting State
  public brushType: BrushType = 'flat_paint';
  public brushColor: string = '#FF2A6D';
  public brushRadius: number = 0.03;
  public activeShader: ShaderPreset = SHADER_PRESETS[0];
  public symmetryCount: number = 1; // 1, 2, 4, 6, 8
  public activeStickerEmoji: string = '⭐';

  // Shader Uniform Remixer state
  public remixColorA: string = '#FF5376';
  public remixColorB: string = '#FFE600';
  public remixGlow: number = 0.5;
  public remixSpeed: number = 1.0;

  // Animation & Boing Physics State
  public isAnimationPlaying: boolean = true;
  public isTurntableActive: boolean = false;
  public turntableSpeed: number = 0.35;
  public isBoingActive: boolean = false;
  public boingTime: number = 0;

  // Camera & OrbitControls State
  public controls: OrbitControls;
  public cameraAzimuth: number = 0.6;
  public cameraElevation: number = 0.35;
  public cameraDistance: number = 4.8;
  private targetLookAt: THREE.Vector3 = new THREE.Vector3(0, 0.85, 0);

  // Active Stroke Drawing State
  private isDrawing: boolean = false;
  private isStylusActive: boolean = false;
  private lastStylusTime: number = 0;
  private activeStrokePoints: { x: number; y: number; z: number; pressure: number; time: number }[] = [];
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private mousePos: THREE.Vector2 = new THREE.Vector2();

  // Callbacks
  private onStrokeStart?: () => void;
  private onStrokeEnd?: (stroke: PaintedStroke) => void;
  private onModelLoaded?: (model: ToyModelInfo) => void;
  private onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;

  // Key event reference for cleanup
  private handleKeyDown?: (e: KeyboardEvent) => void;

  private clock: THREE.Clock = new THREE.Clock();
  private animFrameId: number | null = null;

  constructor(options: StudioEngineOptions) {
    this.canvas = options.canvas;
    this.onStrokeStart = options.onStrokeStart;
    this.onStrokeEnd = options.onStrokeEnd;
    this.onModelLoaded = options.onModelLoaded;
    this.onHistoryChange = options.onHistoryChange;

    this.undoManager.onChange = (canUndo, canRedo) => {
      this.onHistoryChange?.(canUndo, canRedo);
    };

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(
      42,
      this.canvas.clientWidth / (this.canvas.clientHeight || 1),
      0.1,
      1000
    );
    this.camera.position.set(2.4, 2.0, 4.2);
    this.camera.lookAt(this.targetLookAt);

    // 2b. Native Canvas OrbitControls (Touch & Mouse Gestures - Calibrated for smooth tracking)
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.rotateSpeed = 0.45;
    this.controls.zoomSpeed = 0.55;
    this.controls.panSpeed = 0.45;
    this.controls.target.copy(this.targetLookAt);
    this.controls.minDistance = 2.0;
    this.controls.maxDistance = 12.0;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.35;
    this.controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };

    // 3. Renderer with antialiasing, high DPI, soft shadows
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // 4. Loaders Setup (Draco & GLTF)
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    this.dracoLoader.setDecoderConfig({ type: 'js' });
    this.dracoLoader.preload();

    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.setDRACOLoader(this.dracoLoader);

    // 5. Groups
    this.stickersGroup = new THREE.Group();
    this.scene.add(this.stickersGroup);

    // 6. Sky Engine
    this.sky = new ProceduralSkyEngine(this.scene);

    // 7. Ground Studio Disc with shadow reception & neo-pop circular styling
    const groundGeo = new THREE.CylinderGeometry(5.2, 5.2, 0.05, 48);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xf4f6fc,
      roughness: 0.85,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.025;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // 8. Initial Toy Model
    this.loadToyModel(this.currentModelInfo);

    // 8. Bind event handlers
    this.bindEvents();

    // 9. Start render loop
    this.renderLoop = this.renderLoop.bind(this);
    this.renderLoop();
  }

  /**
   * Initializes dynamic paint textures on every mesh in the model group (Uniform Flat Grey Base + Seam-Free UVs)
   */
  private initMeshPaintingTextures(group: THREE.Group) {
    this.meshPaintData.clear();

    // Clean neutral flat light-grey coloring base for all models
    const uniformBaseColor = '#DFE3EB';

    group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (!mesh.geometry) return;

        // Preserve alpha cutout / transparency (e.g. Sailor Moon hair bangs, eyes, decals)
        let isAlphaCutout = false;
        if (mesh.material) {
          const originalMat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
          if (originalMat.transparent || (originalMat as THREE.Material & { alphaTest?: number }).alphaTest > 0) {
            isAlphaCutout = true;
          }
        }

        // Convert to non-indexed geometry to prevent UV seam interpolation artifacts
        if (mesh.geometry.index) {
          mesh.geometry = mesh.geometry.toNonIndexed();
        }

        // Strip vertex colors that cause dark patches
        if (mesh.geometry.attributes.color) {
          mesh.geometry.deleteAttribute('color');
        }

        // Generate non-overlapping continuous UV mapping
        generateUniqueBoxUVs(mesh.geometry);

        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        // Fill canvas with uniform flat light-grey
        ctx.fillStyle = uniformBaseColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Create Canvas Texture
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;

        // Assign clean standard material
        const standardMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          map: texture,
          roughness: 0.45,
          metalness: 0.05,
          side: THREE.DoubleSide,
          transparent: isAlphaCutout,
          alphaTest: isAlphaCutout ? 0.4 : 0.0,
        });
        mesh.material = standardMat;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Save initial state for undo
        const initialImg = ctx.getImageData(0, 0, canvas.width, canvas.height);

        this.meshPaintData.set(mesh.uuid, {
          canvas,
          ctx,
          texture,
          baseColor: uniformBaseColor,
          lastUV: null,
          history: [initialImg],
        });
      }
    });
  }

  /**
   * Load any 3D toybox model (GLB or procedural fallback)
   */
  public async loadToyModel(modelInfo: ToyModelInfo) {
    if (this.currentToyGroup) {
      this.scene.remove(this.currentToyGroup);
      this.currentToyGroup.traverse((child) => {
        if ((child as THREE.Mesh).geometry) {
          (child as THREE.Mesh).geometry.dispose();
        }
      });
    }

    this.clearStickers();
    this.undoManager.reset();
    this.currentModelInfo = modelInfo;

    // Check if model has a static .glb file
    if (modelInfo.file) {
      try {
        const fileUrl = resolveAssetUrl(modelInfo.file);
        const gltf = await this.gltfLoader.loadAsync(fileUrl);
        const rootGroup = new THREE.Group();
        rootGroup.name = modelInfo.name;
        rootGroup.add(gltf.scene);

        // Normalize bounding box & center
        const box = new THREE.Box3().setFromObject(rootGroup);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const targetScale = (modelInfo.scale || 1.2) * (2.2 / maxDim);

        rootGroup.scale.set(targetScale, targetScale, targetScale);
        rootGroup.position.x = -center.x * targetScale;
        rootGroup.position.y = -box.min.y * targetScale + 0.02;
        rootGroup.position.z = -center.z * targetScale;

        // Apply rotation if defined
        if (modelInfo.rotation) {
          rootGroup.rotation.set(
            THREE.MathUtils.degToRad(modelInfo.rotation.x || 0),
            THREE.MathUtils.degToRad(modelInfo.rotation.y || 0),
            THREE.MathUtils.degToRad(modelInfo.rotation.z || 0)
          );
        }

        // Center camera look target on the model's vertical center
        this.targetLookAt.set(0, Math.max(0.4, (size.y * targetScale) * 0.5), 0);
        this.updateCameraTransform();

        this.currentToyGroup = rootGroup;
        this.initMeshPaintingTextures(this.currentToyGroup);
        this.scene.add(this.currentToyGroup);
        this.onModelLoaded?.(modelInfo);
        return;
      } catch (err) {
        console.warn('GLB load notice for ' + modelInfo.name + ', falling back to procedural:', err);
      }
    }

    // Procedural 3D model fallback
    this.currentToyGroup = buildToyModelGroup(modelInfo);
    this.targetLookAt.set(0, 0.85, 0);
    this.updateCameraTransform();
    this.initMeshPaintingTextures(this.currentToyGroup);
    this.scene.add(this.currentToyGroup);
    this.onModelLoaded?.(modelInfo);
  }

  /**
   * 3D Model Upload Support (.glb, .gltf, .obj, .stl)
   */
  public async loadCustomModelFile(file: File): Promise<ToyModelInfo> {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const arrayBuffer = await file.arrayBuffer();

    let loadedObject: THREE.Object3D | null = null;

    if (ext === 'glb' || ext === 'gltf') {
      const gltfLoader = new GLTFLoader();
      const gltf = await gltfLoader.parseAsync(arrayBuffer, '');
      loadedObject = gltf.scene;
    } else if (ext === 'obj') {
      const text = new TextDecoder().decode(arrayBuffer);
      const objLoader = new OBJLoader();
      loadedObject = objLoader.parse(text);
    } else if (ext === 'stl') {
      const stlLoader = new STLLoader();
      const geometry = stlLoader.parse(arrayBuffer);
      const material = new THREE.MeshStandardMaterial({ color: 0x90a4ae, roughness: 0.4 });
      loadedObject = new THREE.Mesh(geometry, material);
    } else {
      throw new Error('Unsupported 3D file format. Please upload .glb, .gltf, .obj, or .stl.');
    }

    if (!loadedObject) {
      throw new Error('Failed to parse 3D model.');
    }

    // Clean previous toy
    if (this.currentToyGroup) {
      this.scene.remove(this.currentToyGroup);
      this.currentToyGroup.traverse((child) => {
        if ((child as THREE.Mesh).geometry) {
          (child as THREE.Mesh).geometry.dispose();
        }
      });
    }
    this.clearStickers();
    this.undoManager.reset();

    // Group wrapper
    const rootGroup = new THREE.Group();
    rootGroup.name = file.name;
    rootGroup.add(loadedObject);

    // Compute bounding box and normalize scale & center origin
    const box = new THREE.Box3().setFromObject(rootGroup);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const targetScale = 2.4 / maxDim;

    rootGroup.scale.set(targetScale, targetScale, targetScale);
    // Center at Y = 0.85
    rootGroup.position.x = -center.x * targetScale;
    rootGroup.position.y = -box.min.y * targetScale + 0.05;
    rootGroup.position.z = -center.z * targetScale;

    // Count vertices & subparts
    let polyCount = 0;
    const subParts: string[] = [];
    rootGroup.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) {
          polyCount += mesh.geometry.attributes.position ? mesh.geometry.attributes.position.count : 0;
        }
        subParts.push(mesh.name || `Part ${subParts.length + 1}`);
      }
    });

    const customModelInfo: ToyModelInfo = {
      id: `custom_${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      category: 'shapes',
      categoryName: 'Uploaded 3D Models',
      icon: '📦',
      description: `Uploaded 3D model: ${file.name} (${Math.round(file.size / 1024)} KB)`,
      subParts: subParts.length > 0 ? subParts : ['Main Body'],
      scale: 1.0,
      polyCount: polyCount || 1500,
      tags: ['upload', 'custom', ext],
    };

    this.currentModelInfo = customModelInfo;
    this.currentToyGroup = rootGroup;
    this.initMeshPaintingTextures(this.currentToyGroup);
    this.scene.add(this.currentToyGroup);

    this.onModelLoaded?.(customModelInfo);
    return customModelInfo;
  }

  public clearStickers() {
    while (this.stickersGroup.children.length > 0) {
      const obj = this.stickersGroup.children[0];
      this.stickersGroup.remove(obj);
      if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
    }
  }

  /**
   * Reset paint on all subparts of current toy (tracked for Undo/Redo)
   */
  public clearAllPaint() {
    const beforeTextures: MeshTextureSnapshot[] = [];
    const afterTextures: MeshTextureSnapshot[] = [];
    const beforeStickers = [...this.stickersGroup.children] as THREE.Mesh[];

    this.meshPaintData.forEach((data, uuid) => {
      beforeTextures.push({
        meshUuid: uuid,
        imageData: data.ctx.getImageData(0, 0, data.canvas.width, data.canvas.height),
      });

      data.ctx.fillStyle = data.baseColor;
      data.ctx.fillRect(0, 0, data.canvas.width, data.canvas.height);
      data.texture.needsUpdate = true;

      afterTextures.push({
        meshUuid: uuid,
        imageData: data.ctx.getImageData(0, 0, data.canvas.width, data.canvas.height),
      });
    });

    this.clearStickers();
    this.undoManager.recordClear(beforeTextures, afterTextures, beforeStickers);
    soundEngine.playEraserWhoosh();
  }

  /**
   * Undo/Redo accessors and controls
   */
  public get canUndo(): boolean {
    return this.undoManager.canUndo;
  }

  public get canRedo(): boolean {
    return this.undoManager.canRedo;
  }

  public undo(): boolean {
    const success = this.undoManager.undo({
      restoreTexture: (meshUuid, imageData) => {
        const paintData = this.meshPaintData.get(meshUuid);
        if (paintData) {
          paintData.ctx.putImageData(imageData, 0, 0);
          paintData.texture.needsUpdate = true;
          if (this.currentToyGroup) {
            this.currentToyGroup.traverse((child) => {
              if ((child as THREE.Mesh).isMesh && child.uuid === meshUuid) {
                const m = child as THREE.Mesh;
                if (m.material instanceof THREE.ShaderMaterial) {
                  const sm = m.material as THREE.ShaderMaterial;
                  if (sm.uniforms.uPaintMap) sm.uniforms.uPaintMap.value = paintData.texture;
                  if (sm.uniforms.uUsePaintMap) sm.uniforms.uUsePaintMap.value = true;
                } else if (
                  !(m.material instanceof THREE.MeshStandardMaterial) ||
                  (m.material as THREE.MeshStandardMaterial).map !== paintData.texture
                ) {
                  m.material = new THREE.MeshStandardMaterial({
                    map: paintData.texture,
                    roughness: 0.45,
                    metalness: 0.05,
                    side: THREE.DoubleSide,
                  });
                }
              }
            });
          }
        }
      },
      addSticker: (mesh) => {
        if (!this.stickersGroup.children.includes(mesh)) {
          this.stickersGroup.add(mesh);
        }
      },
      removeSticker: (mesh) => {
        if (this.stickersGroup.children.includes(mesh)) {
          this.stickersGroup.remove(mesh);
        }
      },
      clearStickers: () => {
        this.clearStickers();
      },
    });

    if (success) {
      soundEngine.playEraserWhoosh();
    }
    return success;
  }

  public redo(): boolean {
    const success = this.undoManager.redo({
      restoreTexture: (meshUuid, imageData) => {
        const paintData = this.meshPaintData.get(meshUuid);
        if (paintData) {
          paintData.ctx.putImageData(imageData, 0, 0);
          paintData.texture.needsUpdate = true;
          if (this.currentToyGroup) {
            this.currentToyGroup.traverse((child) => {
              if ((child as THREE.Mesh).isMesh && child.uuid === meshUuid) {
                const m = child as THREE.Mesh;
                if (m.material instanceof THREE.ShaderMaterial) {
                  const sm = m.material as THREE.ShaderMaterial;
                  if (sm.uniforms.uPaintMap) sm.uniforms.uPaintMap.value = paintData.texture;
                  if (sm.uniforms.uUsePaintMap) sm.uniforms.uUsePaintMap.value = true;
                } else if (
                  !(m.material instanceof THREE.MeshStandardMaterial) ||
                  (m.material as THREE.MeshStandardMaterial).map !== paintData.texture
                ) {
                  m.material = new THREE.MeshStandardMaterial({
                    map: paintData.texture,
                    roughness: 0.45,
                    metalness: 0.05,
                    side: THREE.DoubleSide,
                  });
                }
              }
            });
          }
        }
      },
      addSticker: (mesh) => {
        if (!this.stickersGroup.children.includes(mesh)) {
          this.stickersGroup.add(mesh);
        }
      },
      removeSticker: (mesh) => {
        if (this.stickersGroup.children.includes(mesh)) {
          this.stickersGroup.remove(mesh);
        }
      },
      clearStickers: () => {
        this.clearStickers();
      },
    });

    if (success) {
      soundEngine.playBubblePop(1.2);
    }
    return success;
  }

  /**
   * Apply animated magic shader to the whole model or active mesh (Preserves Paint Layer)
   */
  public applyShaderToModel(shader: ShaderPreset) {
    this.activeShader = shader;
    this.remixColorA = shader.colorA;
    this.remixColorB = shader.colorB;
    this.remixGlow = shader.glow;
    this.remixSpeed = shader.speed;

    if (!this.currentToyGroup) return;

    if (shader.id === 'none') {
      this.currentToyGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const paintData = this.meshPaintData.get(mesh.uuid);
          if (paintData) {
            mesh.material = new THREE.MeshStandardMaterial({
              map: paintData.texture,
              roughness: 0.45,
              metalness: 0.05,
              side: THREE.DoubleSide,
            });
          }
        }
      });
      soundEngine.playBucketFill();
      return;
    }

    this.currentToyGroup.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const paintData = this.meshPaintData.get(mesh.uuid);
        const shaderMat = createMagicShaderMaterial(
          shader,
          paintData?.texture || null
        );
        mesh.material = shaderMat;
      }
    });

    soundEngine.playBucketFill();
  }

  /**
   * 1-Tap Paint Bucket Sub-Mesh Flood Fill with Current Active Color
   */
  public floodFillPartAtPointer(clientX: number, clientY: number) {
    if (!this.currentToyGroup) return;

    const rect = this.canvas.getBoundingClientRect();
    this.mousePos.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mousePos.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mousePos, this.camera);
    const intersects = this.raycaster.intersectObjects(this.currentToyGroup.children, true);

    if (intersects.length > 0) {
      const hit = intersects[0];
      const targetMesh = hit.object as THREE.Mesh;
      if (targetMesh) {
        soundEngine.playBucketFill();
        const paintData = this.meshPaintData.get(targetMesh.uuid);

        if (paintData) {
          const beforeImg = paintData.ctx.getImageData(0, 0, paintData.canvas.width, paintData.canvas.height);

          // Fill canvas with active brush color
          paintData.ctx.fillStyle = this.brushColor;
          paintData.ctx.fillRect(0, 0, paintData.canvas.width, paintData.canvas.height);
          paintData.texture.needsUpdate = true;

          // If mesh is using shader material, activate its paint map
          if (targetMesh.material instanceof THREE.ShaderMaterial) {
            const mat = targetMesh.material as THREE.ShaderMaterial;
            if (mat.uniforms.uPaintMap) mat.uniforms.uPaintMap.value = paintData.texture;
            if (mat.uniforms.uUsePaintMap) mat.uniforms.uUsePaintMap.value = true;
          } else if (
            !(targetMesh.material instanceof THREE.MeshStandardMaterial) ||
            (targetMesh.material as THREE.MeshStandardMaterial).map !== paintData.texture
          ) {
            targetMesh.material = new THREE.MeshStandardMaterial({
              map: paintData.texture,
              roughness: 0.45,
              metalness: 0.05,
              side: THREE.DoubleSide,
            });
          }

          const afterImg = paintData.ctx.getImageData(0, 0, paintData.canvas.width, paintData.canvas.height);
          this.undoManager.recordFill(targetMesh.uuid, beforeImg, afterImg);
        }
      }
    }
  }

  /**
   * Paint Flat Color / Texture directly on Model Surface at UV coordinate (Composites on top of Shaders)
   */
  private paintFlatOnModelAtUV(mesh: THREE.Mesh, uv: THREE.Vector2, isFirstPoint: boolean) {
    const paintData = this.meshPaintData.get(mesh.uuid);
    if (!paintData) return;

    this.undoManager.touchMeshInStroke(mesh.uuid, paintData.ctx, paintData.canvas.width, paintData.canvas.height);

    const { canvas, ctx, texture, lastUV } = paintData;
    const px = uv.x * canvas.width;
    const py = (1 - uv.y) * canvas.height;
    const radiusPx = Math.max(1.2, this.brushRadius * 110);

    // If mesh is currently using a ShaderMaterial, keep the shader and composite paint on top!
    if (mesh.material instanceof THREE.ShaderMaterial) {
      const mat = mesh.material as THREE.ShaderMaterial;
      if (mat.uniforms.uPaintMap) mat.uniforms.uPaintMap.value = texture;
      if (mat.uniforms.uUsePaintMap) mat.uniforms.uUsePaintMap.value = true;
    } else if (
      !(mesh.material instanceof THREE.MeshStandardMaterial) ||
      (mesh.material as THREE.MeshStandardMaterial).map !== texture
    ) {
      mesh.material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.45,
        metalness: 0.05,
        side: THREE.DoubleSide,
      });
    }

    if (this.brushType === 'eraser') {
      ctx.save();
      ctx.fillStyle = paintData.baseColor;
      ctx.beginPath();
      ctx.arc(px, py, radiusPx * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      texture.needsUpdate = true;
      paintData.lastUV = uv.clone();
      return;
    }

    if (this.brushType === 'stardust') {
      ctx.save();
      const sparkles = 8;
      for (let i = 0; i < sparkles; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * radiusPx * 2.0;
        const sx = px + Math.cos(angle) * dist;
        const sy = py + Math.sin(angle) * dist;
        const size = Math.random() * 3 + 1.5;

        ctx.fillStyle = i % 2 === 0 ? this.brushColor : this.remixColorB;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      texture.needsUpdate = true;
      paintData.lastUV = uv.clone();
      return;
    }

    if (this.brushType === 'magic_wand') {
      // Magic Glow: Vibrant Neon Core + Luminous Bloom
      ctx.save();
      ctx.shadowColor = this.brushColor;
      ctx.shadowBlur = radiusPx * 2.5;
      ctx.fillStyle = this.brushColor;
      ctx.beginPath();
      ctx.arc(px, py, radiusPx * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // White-hot luminous inner core
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(px, py, radiusPx * 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      texture.needsUpdate = true;
      paintData.lastUV = uv.clone();
      return;
    }

    // Default: 'flat_paint' (Ultra-smooth flat paint stroke)
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = this.brushColor;
    ctx.fillStyle = this.brushColor;
    ctx.lineWidth = radiusPx * 2;

    if (!isFirstPoint && lastUV) {
      const lastPx = lastUV.x * canvas.width;
      const lastPy = (1 - lastUV.y) * canvas.height;
      const dist = Math.hypot(px - lastPx, py - lastPy);

      // Only connect if on same UV island / reasonable distance
      if (dist < canvas.width * 0.25) {
        ctx.beginPath();
        ctx.moveTo(lastPx, lastPy);
        ctx.lineTo(px, py);
        ctx.stroke();
      }
    }

    // Draw circular brush stamp
    ctx.beginPath();
    ctx.arc(px, py, radiusPx, 0, Math.PI * 2);
    ctx.fill();

    // Symmetrical painting if symmetry count > 1
    if (this.symmetryCount > 1) {
      const symmetries = this.symmetryCount;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const relX = px - cx;
      const relY = py - cy;

      for (let s = 1; s < symmetries; s++) {
        const angle = (s / symmetries) * Math.PI * 2;
        const rotX = cx + relX * Math.cos(angle) - relY * Math.sin(angle);
        const rotY = cy + relX * Math.sin(angle) + relY * Math.cos(angle);

        ctx.beginPath();
        ctx.arc(rotX, rotY, radiusPx, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
    texture.needsUpdate = true;
    paintData.lastUV = uv.clone();
  }

  /**
   * Slap Sticker onto 3D Model Surface (Proper outward orientation + No sinking)
   */
  public placeStickerAtPointer(clientX: number, clientY: number, emoji: string) {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePos.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mousePos.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mousePos, this.camera);
    const targets = this.currentToyGroup ? this.currentToyGroup.children : [];
    const intersects = this.raycaster.intersectObjects(targets, true);

    if (intersects.length > 0) {
      const hit = intersects[0];
      const pos = hit.point;
      const worldNormal = hit.face
        ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld).normalize()
        : hit.point.clone().sub(this.targetLookAt).normalize();

      soundEngine.playStickerSlap();

      // Create emoji sticker canvas texture
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.font = '84px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, 64, 68);
      }
      const texture = new THREE.CanvasTexture(canvas);

      const stickerGeo = new THREE.PlaneGeometry(0.38, 0.38);
      const stickerMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4,
      });

      const stickerMesh = new THREE.Mesh(stickerGeo, stickerMat);
      stickerMesh.position.copy(pos.clone().add(worldNormal.clone().multiplyScalar(0.04)));
      stickerMesh.lookAt(pos.clone().add(worldNormal));
      stickerMesh.rotateZ((Math.random() - 0.5) * 0.3);

      this.stickersGroup.add(stickerMesh);
      this.undoManager.recordStickerAdd(stickerMesh);
    }
  }

  /**
   * Super Zap Vacuum Eraser: deletes closest intersecting sticker or clears paint under cursor
   */
  public superZapAtPointer(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePos.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mousePos.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mousePos, this.camera);
    const intersects = this.raycaster.intersectObjects(this.stickersGroup.children, true);

    if (intersects.length > 0) {
      const hit = intersects[0].object as THREE.Mesh;
      soundEngine.playEraserWhoosh();
      this.stickersGroup.remove(hit);
      this.undoManager.recordStickerRemove(hit);
    }
  }

  /**
   * Trigger the "Jelly Boing!" elastic wobble
   */
  public triggerJellyBoing() {
    this.isBoingActive = true;
    this.boingTime = 0;
    soundEngine.playBoing();
    this.triggerCelebrationConfetti();
  }

  /**
   * Confetti celebration on achievements / stroke completion
   */
  public triggerCelebrationConfetti() {
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#FF2A6D', '#FFE600', '#00F0FF', '#75F0C2', '#B042FF'],
    });
  }

  /**
   * Update live uniform colors and bloom on the current active shader
   */
  public updateShaderUniforms(colorA: string | THREE.Color, colorB: string | THREE.Color, glow: number, speed: number) {
    const colA = typeof colorA === 'string' ? new THREE.Color(colorA) : colorA;
    const colB = typeof colorB === 'string' ? new THREE.Color(colorB) : colorB;
    this.updateShaderRemixUniforms(colA, colB, glow, speed);
  }

  public updateShaderRemixUniforms(colA: THREE.Color, colB: THREE.Color, glow: number, speed: number) {
    this.remixColorA = '#' + colA.getHexString();
    this.remixColorB = '#' + colB.getHexString();
    this.remixGlow = glow;
    this.remixSpeed = speed;

    if (this.currentToyGroup) {
      this.currentToyGroup.traverse((child) => {
        if ((child as THREE.Mesh).material) {
          const mat = (child as THREE.Mesh).material as THREE.ShaderMaterial;
          if (mat.uniforms) {
            if (mat.uniforms.uColorA) mat.uniforms.uColorA.value = colA;
            if (mat.uniforms.uColorB) mat.uniforms.uColorB.value = colB;
            if (mat.uniforms.uEmissiveIntensity) mat.uniforms.uEmissiveIntensity.value = glow;
            if (mat.uniforms.uTimeSpeed) mat.uniforms.uTimeSpeed.value = speed;
          }
        }
      });
    }
  }

  /**
   * Navigation camera controls & delta helpers (Works directly with OrbitControls)
   */
  public orbitAzimuth(deltaAngle: number) {
    if (this.controls) {
      this.controls.rotateLeft(deltaAngle);
    } else {
      this.cameraAzimuth += deltaAngle;
      this.updateCameraTransform();
    }
  }

  public orbitElevation(deltaElevation: number) {
    if (this.controls) {
      this.controls.rotateUp(deltaElevation);
    } else {
      this.cameraElevation = Math.max(-0.2, Math.min(1.4, this.cameraElevation + deltaElevation));
      this.updateCameraTransform();
    }
  }

  public zoomDelta(deltaDist: number) {
    if (this.controls) {
      if (deltaDist < 0) {
        this.controls.dollyIn(1.15);
      } else {
        this.controls.dollyOut(1.15);
      }
    } else {
      this.cameraDistance = Math.max(2.2, Math.min(9.5, this.cameraDistance + deltaDist));
      this.updateCameraTransform();
    }
  }

  public setCameraAzimuth(angleRad: number) {
    this.cameraAzimuth = angleRad;
    this.updateCameraTransform();
  }

  public setCameraElevation(angleRad: number) {
    this.cameraElevation = Math.max(-0.2, Math.min(1.4, angleRad));
    this.updateCameraTransform();
  }

  public setCameraDistance(dist: number) {
    this.cameraDistance = Math.max(2.2, Math.min(9.5, dist));
    this.updateCameraTransform();
  }

  public resetCamera() {
    this.cameraAzimuth = 0.6;
    this.cameraElevation = 0.35;
    this.cameraDistance = 4.8;
    this.targetLookAt.set(0, 0.85, 0);

    if (this.controls) {
      this.controls.target.copy(this.targetLookAt);
      this.camera.position.set(2.4, 2.0, 4.2);
      this.camera.lookAt(this.targetLookAt);
      this.controls.update();
    } else {
      this.updateCameraTransform();
    }
    soundEngine.playDialClick();
  }

  public updateCameraTransform() {
    const x = this.targetLookAt.x + this.cameraDistance * Math.cos(this.cameraElevation) * Math.sin(this.cameraAzimuth);
    const y = this.targetLookAt.y + this.cameraDistance * Math.sin(this.cameraElevation);
    const z = this.targetLookAt.z + this.cameraDistance * Math.cos(this.cameraElevation) * Math.cos(this.cameraAzimuth);

    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.targetLookAt);
    if (this.controls) {
      this.controls.target.copy(this.targetLookAt);
    }
  }

  private bindEvents() {
    let lastDrawX = 0;
    let lastDrawY = 0;

    const handlePointerDown = (e: PointerEvent) => {
      lastDrawX = e.clientX;
      lastDrawY = e.clientY;

      const isPen = e.pointerType === 'pen';
      const isTouch = e.pointerType === 'touch';

      if (isPen) {
        this.isStylusActive = true;
        this.lastStylusTime = Date.now();
        this.controls.enabled = false; // Hard lock: Stylus never orbits
      } else if (isTouch) {
        // Hardware Palm Rejection: If pen is active or recently used, ignore touch completely
        if (this.isStylusActive || Date.now() - this.lastStylusTime < 500) {
          return;
        }
      }

      if (this.brushType === 'bucket') {
        this.floodFillPartAtPointer(e.clientX, e.clientY);
        return;
      }

      if (this.brushType === 'sticker') {
        this.placeStickerAtPointer(e.clientX, e.clientY, this.activeStickerEmoji);
        return;
      }

      // Check if clicking on model surface for flat paint
      const rect = this.canvas.getBoundingClientRect();
      this.mousePos.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mousePos.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mousePos, this.camera);
      const targets = this.currentToyGroup ? this.currentToyGroup.children : [];
      const intersects = this.raycaster.intersectObjects(targets, true);

      if (intersects.length > 0) {
        const hit = intersects[0];
        const mesh = hit.object as THREE.Mesh;
        if (hit.uv && mesh) {
          this.isDrawing = true;
          this.controls.enabled = false;
          this.activeStrokePoints = [];
          this.undoManager.beginStroke();
          this.paintFlatOnModelAtUV(mesh, hit.uv, true);
          soundEngine.playChimeStroke(0.5, 1.0);
          this.onStrokeStart?.();
          return;
        }
      }

      // If Stylus tapped empty space: do NOT rotate camera
      if (isPen) {
        this.controls.enabled = false;
        return;
      }

      // Empty space tapped with touch/mouse -> OrbitControls is active for orbit & pinch
      this.controls.enabled = true;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const isPen = e.pointerType === 'pen';
      const isTouch = e.pointerType === 'touch';

      if (isPen) {
        this.lastStylusTime = Date.now();
        this.isStylusActive = true;
        this.controls.enabled = false; // Hard lock
      } else if (isTouch) {
        // Hardware Palm Rejection
        if (this.isStylusActive || Date.now() - this.lastStylusTime < 500) {
          return;
        }
      }

      if (this.isDrawing && this.currentToyGroup) {
        const rect = this.canvas.getBoundingClientRect();
        const distPx = Math.hypot(e.clientX - lastDrawX, e.clientY - lastDrawY);
        // Fast swipe interpolation to prevent dropping stroke points
        const steps = Math.max(1, Math.min(8, Math.ceil(distPx / 6)));

        for (let s = 1; s <= steps; s++) {
          const interpX = lastDrawX + (e.clientX - lastDrawX) * (s / steps);
          const interpY = lastDrawY + (e.clientY - lastDrawY) * (s / steps);

          this.mousePos.x = ((interpX - rect.left) / rect.width) * 2 - 1;
          this.mousePos.y = -((interpY - rect.top) / rect.height) * 2 + 1;

          this.raycaster.setFromCamera(this.mousePos, this.camera);
          const intersects = this.raycaster.intersectObjects(this.currentToyGroup.children, true);

          if (intersects.length > 0) {
            const hit = intersects[0];
            const mesh = hit.object as THREE.Mesh;
            if (hit.uv && mesh) {
              this.paintFlatOnModelAtUV(mesh, hit.uv, false);
            }
          }
        }

        lastDrawX = e.clientX;
        lastDrawY = e.clientY;
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      const isPen = e.pointerType === 'pen';

      if (isPen) {
        this.lastStylusTime = Date.now();
        this.isStylusActive = false;
        this.controls.enabled = false;
      } else {
        this.controls.enabled = true;
      }

      if (this.isDrawing) {
        this.isDrawing = false;
        // Reset lastUV on all meshes
        this.meshPaintData.forEach((data) => {
          data.lastUV = null;
        });

        this.undoManager.endStroke((uuid) => {
          const data = this.meshPaintData.get(uuid);
          return data ? data.ctx.getImageData(0, 0, data.canvas.width, data.canvas.height) : null;
        });

        const strokeRecord: PaintedStroke = {
          id: `stroke_${Date.now()}`,
          points: [...this.activeStrokePoints],
          brushType: this.brushType,
          color: this.brushColor,
          radius: this.brushRadius,
          shaderId: this.activeShader.id,
          symmetryCount: this.symmetryCount,
        };

        this.onStrokeEnd?.(strokeRecord);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      this.cameraDistance += e.deltaY * 0.004;
      this.cameraDistance = Math.max(2.2, Math.min(9.5, this.cameraDistance));
      this.updateCameraTransform();
    };

    this.handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger undo/redo if user is typing into an input field or textarea
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          this.redo();
        } else {
          this.undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        this.redo();
      }
    };

    this.canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    this.canvas.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', this.handleKeyDown);
  }

  public handleResize() {
    if (!this.canvas) return;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight || 1;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  public captureSnapshotDataURL(): string {
    this.renderer.render(this.scene, this.camera);
    return this.canvas.toDataURL('image/png');
  }

  private renderLoop() {
    this.animFrameId = requestAnimationFrame(this.renderLoop);

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // OrbitControls & Turntable auto-rotate
    if (this.controls) {
      if (this.isTurntableActive) {
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = this.turntableSpeed * 6.0;
      } else {
        this.controls.autoRotate = false;
      }
      this.controls.update();
    }

    // Sky update
    this.sky.update(delta);

    // Boing physics wobble update
    if (this.isBoingActive) {
      this.boingTime += delta;
      if (this.boingTime > 2.5) {
        this.isBoingActive = false;
        this.boingTime = 0;
      }
    }

    // Update animated shader materials with time & jelly wobble uniforms
    if (this.currentToyGroup) {
      this.currentToyGroup.traverse((child) => {
        if ((child as THREE.Mesh).material) {
          const mat = (child as THREE.Mesh).material as THREE.ShaderMaterial;
          if (mat.uniforms) {
            if (mat.uniforms.uTime && this.isAnimationPlaying) {
              mat.uniforms.uTime.value = elapsedTime;
            }
            if (mat.uniforms.uWobbleAmount) {
              mat.uniforms.uWobbleAmount.value = this.isBoingActive ? 1.0 : 0.0;
            }
            if (mat.uniforms.uWobbleTime) {
              mat.uniforms.uWobbleTime.value = this.boingTime;
            }
          }
        }
      });
    }

    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    if (this.handleKeyDown) {
      window.removeEventListener('keydown', this.handleKeyDown);
    }
    this.renderer.dispose();
  }
}
