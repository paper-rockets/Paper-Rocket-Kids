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
      uniform vec3 uCloudColor;
      uniform float uTime;
      varying vec3 vWorldPosition;

      float hash21(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      float noise2D(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash21(i);
        float b = hash21(i + vec2(1.0, 0.0));
        float c = hash21(i + vec2(0.0, 1.0));
        float d = hash21(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      float fbm(vec2 p) {
        float val = 0.0;
        float amp = 0.5;
        for (int i = 0; i < 4; i++) {
          val += amp * noise2D(p);
          p *= 2.02;
          amp *= 0.5;
        }
        return val;
      }

      void main() {
        vec3 point = normalize(vWorldPosition);
        float h = max(0.0, point.y);
        vec3 sky = mix(uSkyBottom, uSkyTop, pow(h, 0.7));

        // Real Procedural Volumetric Cloud Layer
        if (point.y > 0.02) {
          vec2 cloudUV = (point.xz / (point.y + 0.12)) * 0.4 + vec2(uTime * 0.012, uTime * 0.006);
          float cloudDensity = fbm(cloudUV);
          float cloudCoverage = smoothstep(0.48, 0.72, cloudDensity) * smoothstep(0.02, 0.25, point.y);

          // Sunlight scattering on clouds
          float sunDot = max(0.0, dot(point, normalize(uSunPosition)));
          vec3 sunLightOnClouds = mix(uCloudColor * 0.9, uSunColor, pow(sunDot, 4.0) * 0.5);
          sky = mix(sky, sunLightOnClouds, cloudCoverage * 0.92);
        }

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
      uCloudColor: { value: new THREE.Color('#FFFFFF') },
      uTime: { value: 0 },
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
        mat.uniforms.uCloudColor.value.set(preset.cloudColor);
      }
    }

    this.sunLight.color.set(preset.sunColor);
    this.ambientLight.color.set(preset.ambientColor);
    this.hemiLight.color.set(preset.sunColor);
    this.hemiLight.groundColor.set(preset.skyBottom);
  }

  public update(delta: number) {
    if (this.skyMesh) {
      const mat = this.skyMesh.material as THREE.ShaderMaterial;
      if (mat.uniforms && mat.uniforms.uTime) {
        mat.uniforms.uTime.value += delta;
      }
    }
  }
}
