import * as THREE from 'three';
import { SkyPreset } from '../types';
import { SKY_PRESETS } from '../constants/presets';

export class ProceduralSkyEngine {
  private scene: THREE.Scene;
  private skyMesh: THREE.Mesh | null = null;
  private sunLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;
  private hemiLight: THREE.HemisphereLight;
  private starParticles: THREE.Points | null = null;
  private cloudsGroup: THREE.Group | null = null;
  private currentPreset: SkyPreset = SKY_PRESETS[0];

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // Sunlight
    this.sunLight = new THREE.DirectionalLight(0xfff5e6, 1.6);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.bias = -0.0001;
    this.scene.add(this.sunLight);

    // Ambient & Hemisphere
    this.ambientLight = new THREE.AmbientLight(0xddeeff, 0.9);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x334466, 0.7);
    this.scene.add(this.hemiLight);

    this.initSkyDome();
    this.initStars();
    this.initFluffyClouds();
    this.applyPreset(this.currentPreset);
  }

  private initSkyDome() {
    const vertexShader = `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform vec3 uSkyTop;
      uniform vec3 uSkyBottom;
      uniform vec3 uSunPosition;
      uniform vec3 uSunColor;
      varying vec3 vWorldPosition;

      void main() {
        vec3 point = normalize(vWorldPosition);
        float h = max(0.0, point.y);
        vec3 sky = mix(uSkyBottom, uSkyTop, pow(h, 0.7));

        // Sun disc + flare
        float sunDot = max(0.0, dot(point, normalize(uSunPosition)));
        float sunDisc = smoothstep(0.995, 0.999, sunDot) * 2.0;
        float sunGlow = pow(sunDot, 12.0) * 0.45;

        sky += (sunDisc + sunGlow) * uSunColor;
        gl_FragColor = vec4(sky, 1.0);
      }
    `;

    const uniforms = {
      uSkyTop: { value: new THREE.Color('#4B88FF') },
      uSkyBottom: { value: new THREE.Color('#CBE4FF') },
      uSunPosition: { value: new THREE.Vector3(5, 10, 5) },
      uSunColor: { value: new THREE.Color('#FFF4D0') },
    };

    const skyGeo = new THREE.SphereGeometry(150, 32, 24);
    const skyMat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      side: THREE.BackSide,
      depthWrite: false,
    });

    this.skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(this.skyMesh);
  }

  private initStars() {
    const starCount = 600;
    const starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 140;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 10;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.2,
      transparent: true,
      opacity: 0.0,
    });

    this.starParticles = new THREE.Points(starGeo, starMat);
    this.scene.add(this.starParticles);
  }

  private initFluffyClouds() {
    this.cloudsGroup = new THREE.Group();
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.0,
      transparent: true,
      opacity: 0.85,
    });

    for (let i = 0; i < 8; i++) {
      const puffCluster = new THREE.Group();
      const numPuffs = 4 + Math.floor(Math.random() * 4);
      for (let j = 0; j < numPuffs; j++) {
        const puffGeo = new THREE.SphereGeometry(1.5 + Math.random() * 1.5, 12, 10);
        const puff = new THREE.Mesh(puffGeo, cloudMat);
        puff.position.set((j - numPuffs / 2) * 1.8, Math.sin(j) * 0.8, (Math.random() - 0.5) * 2.0);
        puffCluster.add(puff);
      }
      const angle = (i / 8) * Math.PI * 2;
      const dist = 35 + Math.random() * 15;
      puffCluster.position.set(Math.cos(angle) * dist, 12 + Math.random() * 8, Math.sin(angle) * dist);
      this.cloudsGroup.add(puffCluster);
    }
    this.scene.add(this.cloudsGroup);
  }

  public setTimeOfDay(ratio: number) {
    // 0 = midnight, 0.25 = sunrise, 0.5 = midday, 0.75 = sunset, 1.0 = midnight
    const angle = ratio * Math.PI * 2 - Math.PI / 2;
    const sunDist = 30;
    const sunX = Math.cos(angle) * sunDist;
    const sunY = Math.sin(angle) * sunDist;
    const sunZ = 12;

    this.sunLight.position.set(sunX, Math.max(sunY, -5), sunZ);

    if (this.skyMesh) {
      const mat = this.skyMesh.material as THREE.ShaderMaterial;
      if (mat.uniforms && mat.uniforms.uSunPosition) {
        mat.uniforms.uSunPosition.value.set(sunX, sunY, sunZ);
      }
    }

    // Dynamic star visibility
    if (this.starParticles) {
      const isNight = ratio < 0.2 || ratio > 0.82;
      const starOpacity = isNight ? (ratio < 0.2 ? 1 - ratio * 4 : (ratio - 0.82) * 5) : 0;
      (this.starParticles.material as THREE.PointsMaterial).opacity = Math.max(0, Math.min(0.9, starOpacity));
    }
  }

  public applyPreset(preset: SkyPreset) {
    this.currentPreset = preset;
    this.setTimeOfDay(preset.timeOfDay);

    if (this.skyMesh) {
      const mat = this.skyMesh.material as THREE.ShaderMaterial;
      if (mat.uniforms) {
        mat.uniforms.uSkyTop.value.set(preset.skyTop);
        mat.uniforms.uSkyBottom.value.set(preset.skyBottom);
        mat.uniforms.uSunColor.value.set(preset.sunColor);
      }
    }

    this.sunLight.color.set(preset.sunColor);
    this.ambientLight.color.set(preset.ambientColor);
    this.hemiLight.color.set(preset.sunColor);
    this.hemiLight.groundColor.set(preset.skyBottom);
  }

  public update(delta: number) {
    if (this.cloudsGroup) {
      this.cloudsGroup.rotation.y += delta * 0.015;
    }
  }
}
