import * as THREE from 'three';

export interface MeshTextureSnapshot {
  meshUuid: string;
  imageData: ImageData;
}

export type UndoAction =
  | {
      type: 'stroke';
      description: string;
      before: MeshTextureSnapshot[];
      after: MeshTextureSnapshot[];
    }
  | {
      type: 'fill';
      description: string;
      meshUuid: string;
      before: ImageData;
      after: ImageData;
    }
  | {
      type: 'sticker_add';
      description: string;
      stickerMesh: THREE.Mesh;
    }
  | {
      type: 'sticker_remove';
      description: string;
      stickerMesh: THREE.Mesh;
    }
  | {
      type: 'clear';
      description: string;
      beforeTextures: MeshTextureSnapshot[];
      afterTextures: MeshTextureSnapshot[];
      beforeStickers: THREE.Mesh[];
    };

export class UndoRedoManager {
  private undoStack: UndoAction[] = [];
  private redoStack: UndoAction[] = [];
  private maxHistory: number = 30;

  // Active stroke temporary buffer
  private isStrokeActive: boolean = false;
  private strokeBeforeMap: Map<string, ImageData> = new Map();

  // Change listener
  public onChange?: (canUndo: boolean, canRedo: boolean) => void;

  constructor(maxHistory = 30) {
    this.maxHistory = maxHistory;
  }

  public get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public get undoCount(): number {
    return this.undoStack.length;
  }

  public get redoCount(): number {
    return this.redoStack.length;
  }

  private notify() {
    this.onChange?.(this.canUndo, this.canRedo);
  }

  /**
   * Start tracking a user stroke across 3D meshes
   */
  public beginStroke() {
    this.isStrokeActive = true;
    this.strokeBeforeMap.clear();
  }

  /**
   * Capture mesh canvas initial state before it receives any paint during current stroke
   */
  public touchMeshInStroke(meshUuid: string, ctx: CanvasRenderingContext2D, width: number, height: number) {
    if (!this.isStrokeActive) return;
    if (!this.strokeBeforeMap.has(meshUuid)) {
      const img = ctx.getImageData(0, 0, width, height);
      this.strokeBeforeMap.set(meshUuid, img);
    }
  }

  /**
   * Finish stroke and commit changes to undo stack
   */
  public endStroke(getCurrentImageData: (meshUuid: string) => ImageData | null) {
    if (!this.isStrokeActive) return;
    this.isStrokeActive = false;

    if (this.strokeBeforeMap.size === 0) {
      return;
    }

    const beforeSnapshots: MeshTextureSnapshot[] = [];
    const afterSnapshots: MeshTextureSnapshot[] = [];

    this.strokeBeforeMap.forEach((beforeImg, meshUuid) => {
      const afterImg = getCurrentImageData(meshUuid);
      if (afterImg) {
        beforeSnapshots.push({ meshUuid, imageData: beforeImg });
        afterSnapshots.push({ meshUuid, imageData: afterImg });
      }
    });

    this.strokeBeforeMap.clear();

    if (beforeSnapshots.length > 0) {
      this.pushAction({
        type: 'stroke',
        description: 'Brush Stroke',
        before: beforeSnapshots,
        after: afterSnapshots,
      });
    }
  }

  /**
   * Push an action into the undo stack and clear redo stack
   */
  public pushAction(action: UndoAction) {
    this.undoStack.push(action);
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
    this.redoStack = [];
    this.notify();
  }

  /**
   * Record a flood fill on a single mesh
   */
  public recordFill(meshUuid: string, before: ImageData, after: ImageData) {
    this.pushAction({
      type: 'fill',
      description: 'Flood Fill',
      meshUuid,
      before,
      after,
    });
  }

  /**
   * Record a sticker placed on the model
   */
  public recordStickerAdd(stickerMesh: THREE.Mesh) {
    this.pushAction({
      type: 'sticker_add',
      description: 'Add Sticker',
      stickerMesh,
    });
  }

  /**
   * Record a sticker removed by eraser
   */
  public recordStickerRemove(stickerMesh: THREE.Mesh) {
    this.pushAction({
      type: 'sticker_remove',
      description: 'Remove Sticker',
      stickerMesh,
    });
  }

  /**
   * Record a complete canvas and sticker wipe
   */
  public recordClear(
    beforeTextures: MeshTextureSnapshot[],
    afterTextures: MeshTextureSnapshot[],
    beforeStickers: THREE.Mesh[]
  ) {
    this.pushAction({
      type: 'clear',
      description: 'Clear Paint',
      beforeTextures,
      afterTextures,
      beforeStickers,
    });
  }

  /**
   * Perform Undo
   */
  public undo(handlers: {
    restoreTexture: (meshUuid: string, imageData: ImageData) => void;
    addSticker: (mesh: THREE.Mesh) => void;
    removeSticker: (mesh: THREE.Mesh) => void;
    clearStickers: () => void;
  }): boolean {
    if (this.undoStack.length === 0) return false;

    const action = this.undoStack.pop()!;
    this.redoStack.push(action);

    switch (action.type) {
      case 'stroke':
        for (const snap of action.before) {
          handlers.restoreTexture(snap.meshUuid, snap.imageData);
        }
        break;

      case 'fill':
        handlers.restoreTexture(action.meshUuid, action.before);
        break;

      case 'sticker_add':
        handlers.removeSticker(action.stickerMesh);
        break;

      case 'sticker_remove':
        handlers.addSticker(action.stickerMesh);
        break;

      case 'clear':
        for (const snap of action.beforeTextures) {
          handlers.restoreTexture(snap.meshUuid, snap.imageData);
        }
        handlers.clearStickers();
        for (const sticker of action.beforeStickers) {
          handlers.addSticker(sticker);
        }
        break;
    }

    this.notify();
    return true;
  }

  /**
   * Perform Redo
   */
  public redo(handlers: {
    restoreTexture: (meshUuid: string, imageData: ImageData) => void;
    addSticker: (mesh: THREE.Mesh) => void;
    removeSticker: (mesh: THREE.Mesh) => void;
    clearStickers: () => void;
  }): boolean {
    if (this.redoStack.length === 0) return false;

    const action = this.redoStack.pop()!;
    this.undoStack.push(action);

    switch (action.type) {
      case 'stroke':
        for (const snap of action.after) {
          handlers.restoreTexture(snap.meshUuid, snap.imageData);
        }
        break;

      case 'fill':
        handlers.restoreTexture(action.meshUuid, action.after);
        break;

      case 'sticker_add':
        handlers.addSticker(action.stickerMesh);
        break;

      case 'sticker_remove':
        handlers.removeSticker(action.stickerMesh);
        break;

      case 'clear':
        for (const snap of action.afterTextures) {
          handlers.restoreTexture(snap.meshUuid, snap.imageData);
        }
        handlers.clearStickers();
        break;
    }

    this.notify();
    return true;
  }

  /**
   * Clear all history (e.g. on new model load)
   */
  public reset() {
    this.undoStack = [];
    this.redoStack = [];
    this.isStrokeActive = false;
    this.strokeBeforeMap.clear();
    this.notify();
  }
}
