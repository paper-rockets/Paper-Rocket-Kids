import * as THREE from 'three';
import { createMinecraftBoxGeometry, getMinecraftCuboidUVs } from './skinGeometry.js';

export class SkinModel {
  constructor(texture) {
    this.texture = texture;
    this.group = new THREE.Group();

    // Crisp pixel art filtering
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.generateMipmaps = false;

    this.parts = {};
    this.overlays = {};
    this.pivots = {};
    this.overlayVisible = true;
    this.animationState = 'stand';

    this.initMaterials();
    this.buildModel();
  }

  initMaterials() {
    // Standard Minecraft Lighting (100% accurate to in-game look)
    this.baseMat = new THREE.MeshLambertMaterial({
      map: this.texture,
      transparent: false
    });

    // 3D Outer Layer (Hat, Jacket, Sleeves, Pants - 100% official Minecraft 3D layer)
    this.overMat = new THREE.MeshLambertMaterial({
      map: this.texture,
      transparent: true,
      alphaTest: 0.5,
      side: THREE.FrontSide
    });
  }

  buildModel() {
    const partDefs = {
      head: {
        w: 8, h: 8, d: 8,
        baseUV: { ox: 0, oy: 0 },
        overUV: { ox: 32, oy: 0 },
        pivotPos: [0, 24, 0],
        meshOffset: [0, 4, 0]
      },
      body: {
        w: 8, h: 12, d: 4,
        baseUV: { ox: 16, oy: 16 },
        overUV: { ox: 16, oy: 32 },
        pivotPos: [0, 12, 0],
        meshOffset: [0, 6, 0]
      },
      rightArm: {
        w: 4, h: 12, d: 4,
        baseUV: { ox: 40, oy: 16 },
        overUV: { ox: 40, oy: 32 },
        pivotPos: [-6, 22, 0],
        meshOffset: [0, -4, 0]
      },
      leftArm: {
        w: 4, h: 12, d: 4,
        baseUV: { ox: 32, oy: 48 },
        overUV: { ox: 48, oy: 48 },
        pivotPos: [6, 22, 0],
        meshOffset: [0, -4, 0]
      },
      rightLeg: {
        w: 4, h: 12, d: 4,
        baseUV: { ox: 0, oy: 16 },
        overUV: { ox: 0, oy: 32 },
        pivotPos: [-2, 12, 0],
        meshOffset: [0, -6, 0]
      },
      leftLeg: {
        w: 4, h: 12, d: 4,
        baseUV: { ox: 16, oy: 48 },
        overUV: { ox: 0, oy: 48 },
        pivotPos: [2, 12, 0],
        meshOffset: [0, -6, 0]
      }
    };

    for (const [name, def] of Object.entries(partDefs)) {
      const pivot = new THREE.Group();
      pivot.position.set(...def.pivotPos);
      this.pivots[name] = pivot;
      this.group.add(pivot);

      // Base Mesh
      const baseUVs = getMinecraftCuboidUVs(def.baseUV.ox, def.baseUV.oy, def.w, def.h, def.d);
      const baseGeom = createMinecraftBoxGeometry(def.w, def.h, def.d, baseUVs, 0);
      const baseMesh = new THREE.Mesh(baseGeom, this.baseMat);
      baseMesh.position.set(...def.meshOffset);
      baseMesh.userData = { partName: name, isOverlay: false };

      this.parts[name] = baseMesh;
      pivot.add(baseMesh);

      // 3D Outer Layer (Sticks out 0.5 units in 3D, exactly as in Minecraft Bedrock!)
      const overUVs = getMinecraftCuboidUVs(def.overUV.ox, def.overUV.oy, def.w, def.h, def.d);
      const overGeom = createMinecraftBoxGeometry(def.w, def.h, def.d, overUVs, 0.5);
      const overMesh = new THREE.Mesh(overGeom, this.overMat);
      overMesh.position.set(...def.meshOffset);
      overMesh.userData = { partName: name, isOverlay: true };

      this.overlays[name] = overMesh;
      pivot.add(overMesh);
    }
  }

  setAnimation(anim) {
    this.animationState = anim;
    this.resetPose();
  }

  resetPose() {
    for (const pivot of Object.values(this.pivots)) {
      pivot.rotation.set(0, 0, 0);
    }
    this.group.position.y = 0;
  }

  updateAnimation(time) {
    if (this.animationState === 'walk') {
      const speed = time * 4.5;
      const angle = Math.sin(speed) * 0.6;

      this.pivots.rightArm.rotation.x = angle;
      this.pivots.leftArm.rotation.x = -angle;
      this.pivots.rightLeg.rotation.x = -angle;
      this.pivots.leftLeg.rotation.x = angle;

      this.pivots.head.rotation.y = Math.sin(speed * 0.5) * 0.1;
      this.group.position.y = Math.abs(Math.sin(speed)) * 0.6;
    } else if (this.animationState === 'wave') {
      const waveSpeed = time * 6.5;

      this.pivots.rightArm.rotation.x = -Math.PI * 0.75;
      this.pivots.rightArm.rotation.z = Math.sin(waveSpeed) * 0.35 - 0.2;
      this.pivots.leftArm.rotation.x = 0;
      this.pivots.leftArm.rotation.z = 0;

      this.pivots.rightLeg.rotation.x = 0;
      this.pivots.leftLeg.rotation.x = 0;

      this.pivots.head.rotation.y = -0.2;
      this.pivots.head.rotation.z = Math.sin(waveSpeed * 0.5) * 0.08;
      this.group.position.y = 0;
    }
  }

  setPartVisible(partName, visible) {
    if (this.parts[partName]) {
      this.parts[partName].visible = visible;
    }
    if (this.overlays[partName] && this.overlayVisible) {
      this.overlays[partName].visible = visible;
    }
  }

  setOverlayVisible(visible) {
    this.overlayVisible = visible;
    for (const [name, mesh] of Object.entries(this.overlays)) {
      mesh.visible = visible && this.parts[name].visible;
    }
  }

  getPaintableMeshes() {
    const meshes = [];
    for (const [name, mesh] of Object.entries(this.overlays)) {
      if (mesh.visible && this.overlayVisible) {
        meshes.push(mesh);
      }
    }
    for (const mesh of Object.values(this.parts)) {
      if (mesh.visible) {
        meshes.push(mesh);
      }
    }
    return meshes;
  }
}

