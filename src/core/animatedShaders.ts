import * as THREE from 'three';
import { ShaderPreset } from '../types';

export const SHADER_PRESETS: ShaderPreset[] = [
  // 1. Toon & Anime
  {
    id: 'anime_cel',
    name: 'Anime Cel Ink',
    category: 'toon',
    categoryName: 'Toon & Anime',
    emoji: '🖋️',
    description: 'Stepped cel-shaded cartoon ink with stylized outlines',
    colorA: '#FF5376',
    colorB: '#FFE600',
    glow: 0.2,
    speed: 1.0,
  },
  {
    id: 'posterize_ink',
    name: 'Comic Posterize',
    category: 'toon',
    categoryName: 'Toon & Anime',
    emoji: '💥',
    description: 'Bold pop-art graphic posterization and halftones',
    colorA: '#00F0FF',
    colorB: '#FF007F',
    glow: 0.3,
    speed: 0.8,
  },
  {
    id: 'rim_light',
    name: 'Rim Light Glow',
    category: 'toon',
    categoryName: 'Toon & Anime',
    emoji: '✨',
    description: 'Glowing edge highlight around 3D curves',
    colorA: '#00FFB2',
    colorB: '#7A5CFF',
    glow: 0.85,
    speed: 1.2,
  },

  // 2. Fun & Magic
  {
    id: 'rainbow',
    name: 'Rainbow Prism',
    category: 'magic',
    categoryName: 'Fun & Magic',
    emoji: '🌈',
    description: 'Flowing iridescent spectral gradients in real time',
    colorA: '#FF2E93',
    colorB: '#00FFE5',
    glow: 0.6,
    speed: 1.4,
  },
  {
    id: 'glitter',
    name: 'Sparkling Glitter',
    category: 'magic',
    categoryName: 'Fun & Magic',
    emoji: '💖',
    description: 'Multi-faceted specular star flakes catching light',
    colorA: '#FF88DD',
    colorB: '#FFF275',
    glow: 0.9,
    speed: 1.5,
  },
  {
    id: 'sparkler',
    name: 'Sparkler Trails',
    category: 'magic',
    categoryName: 'Fun & Magic',
    emoji: '🎇',
    description: 'Golden spark trails bursting along stroke paths',
    colorA: '#FFAA00',
    colorB: '#FFFFFF',
    glow: 1.0,
    speed: 2.0,
  },
  {
    id: 'candy',
    name: 'Candy Coat',
    category: 'magic',
    categoryName: 'Fun & Magic',
    emoji: '🍭',
    description: 'High-gloss candy shell with sweet pastel reflections',
    colorA: '#FF5C9D',
    colorB: '#8AE9FF',
    glow: 0.4,
    speed: 0.7,
  },
  {
    id: 'slime',
    name: 'Bouncy Slime',
    category: 'magic',
    categoryName: 'Fun & Magic',
    emoji: '🧪',
    description: 'Translucent gooey slime with bubbling reflections',
    colorA: '#55FF22',
    colorB: '#AAFF00',
    glow: 0.5,
    speed: 1.1,
    hasWobble: true,
  },
  {
    id: 'jelly',
    name: 'Jelly Wobble',
    category: 'magic',
    categoryName: 'Fun & Magic',
    emoji: '🍮',
    description: 'Translucent bouncing gelatins with jiggly wobble',
    colorA: '#FF4488',
    colorB: '#FFCC00',
    glow: 0.45,
    speed: 1.3,
    hasWobble: true,
  },
  {
    id: 'jelly_warp',
    name: 'Jelly Boing Dynamic',
    category: 'magic',
    categoryName: 'Fun & Magic',
    emoji: '🔮',
    description: 'Elastic vibrating surface with harmonic ripples',
    colorA: '#B042FF',
    colorB: '#00F5D4',
    glow: 0.7,
    speed: 1.8,
    hasWobble: true,
  },

  // 3. Wonderlust (Elemental & Nature)
  {
    id: 'fire',
    name: 'Fire & Flame',
    category: 'elemental',
    categoryName: 'Wonderlust Elements',
    emoji: '🔥',
    description: 'Blazing flame ribbons with dynamic heat turbulence',
    colorA: '#FF3300',
    colorB: '#FFDD00',
    glow: 1.0,
    speed: 2.2,
  },
  {
    id: 'lava',
    name: 'Molten Lava',
    category: 'elemental',
    categoryName: 'Wonderlust Elements',
    emoji: '🌋',
    description: 'Glowing magma flows with pulsing emissive crust cracks',
    colorA: '#FF1100',
    colorB: '#FF8800',
    glow: 0.9,
    speed: 0.9,
  },
  {
    id: 'lightning',
    name: 'Lightning Arc',
    category: 'elemental',
    categoryName: 'Wonderlust Elements',
    emoji: '⚡',
    description: 'Crackling high-voltage plasma bolts and strikes',
    colorA: '#44DDFF',
    colorB: '#FFFFFF',
    glow: 1.2,
    speed: 2.8,
  },
  {
    id: 'electric_arc',
    name: 'Electric Arc Plasma',
    category: 'elemental',
    categoryName: 'Wonderlust Elements',
    emoji: '🔋',
    description: 'Vibrant electric currents dancing over surfaces',
    colorA: '#00FF99',
    colorB: '#3388FF',
    glow: 1.1,
    speed: 2.5,
  },
  {
    id: 'ocean_wave',
    name: 'Ocean Waves',
    category: 'elemental',
    categoryName: 'Wonderlust Elements',
    emoji: '🌊',
    description: 'Deep rolling ocean surf with sunlight sparkle',
    colorA: '#0055FF',
    colorB: '#00FFAA',
    glow: 0.5,
    speed: 1.0,
  },
  {
    id: 'caustic',
    name: 'Pool Caustics',
    category: 'elemental',
    categoryName: 'Wonderlust Elements',
    emoji: '🏊',
    description: 'Sunlit swimming pool water ripple light rays',
    colorA: '#00CCFF',
    colorB: '#EEFFFF',
    glow: 0.65,
    speed: 1.2,
  },
  {
    id: 'waterfall',
    name: 'Crystal Waterfall',
    category: 'elemental',
    categoryName: 'Wonderlust Elements',
    emoji: '💧',
    description: 'Cascading vertical crystalline water flow',
    colorA: '#33DDFF',
    colorB: '#88FFFF',
    glow: 0.55,
    speed: 1.6,
  },
  {
    id: 'foam',
    name: 'Sea Foam',
    category: 'elemental',
    categoryName: 'Wonderlust Elements',
    emoji: '🧼',
    description: 'Frothy bubbly white water crests',
    colorA: '#FFFFFF',
    colorB: '#A0E6FF',
    glow: 0.35,
    speed: 0.8,
  },
  {
    id: 'ripple',
    name: 'Zen Pond Ripple',
    category: 'elemental',
    categoryName: 'Wonderlust Elements',
    emoji: '🌀',
    description: 'Concentric water ripples expanding smoothly',
    colorA: '#1A8CFF',
    colorB: '#99E6FF',
    glow: 0.4,
    speed: 1.0,
  },
  {
    id: 'foliage_leaf',
    name: 'Living Forest Leaf',
    category: 'elemental',
    categoryName: 'Wonderlust Elements',
    emoji: '🍃',
    description: 'Sun-dappled emerald canopy leaves swaying in wind',
    colorA: '#00CC44',
    colorB: '#AAFF33',
    glow: 0.3,
    speed: 0.7,
  },
  {
    id: 'foliage_fir',
    name: 'Pine Fir Needle',
    category: 'elemental',
    categoryName: 'Wonderlust Elements',
    emoji: '🌲',
    description: 'Textured evergreen forest pine needles',
    colorA: '#006622',
    colorB: '#33BB55',
    glow: 0.2,
    speed: 0.5,
  },
  {
    id: 'cloud',
    name: 'Puffy Cloud Fluff',
    category: 'elemental',
    categoryName: 'Wonderlust Elements',
    emoji: '☁️',
    description: 'Volumetric pastel clouds glowing at golden hour',
    colorA: '#FFF0F5',
    colorB: '#FFD79E',
    glow: 0.45,
    speed: 0.6,
  },

  // 4. Bright & Glass (Cosmic & Sci-Fi)
  {
    id: 'galaxy',
    name: 'Cosmic Galaxy',
    category: 'cosmic',
    categoryName: 'Cosmic & Sci-Fi',
    emoji: '🌌',
    description: 'Swirling starry nebulae with cosmic dust lanes',
    colorA: '#6E00FF',
    colorB: '#FF00A0',
    glow: 0.95,
    speed: 0.8,
  },
  {
    id: 'aurora',
    name: 'Polar Aurora',
    category: 'cosmic',
    categoryName: 'Cosmic & Sci-Fi',
    emoji: '🎆',
    description: 'Luminous curtains of dancing green and violet lights',
    colorA: '#00FF88',
    colorB: '#8800FF',
    glow: 1.0,
    speed: 1.1,
  },
  {
    id: 'plasma',
    name: 'Neon Plasma Core',
    category: 'cosmic',
    categoryName: 'Cosmic & Sci-Fi',
    emoji: '💡',
    description: 'Ultra-bright pulsed reactor neon aura lines',
    colorA: '#FF0055',
    colorB: '#00FFEE',
    glow: 1.3,
    speed: 2.0,
  },
  {
    id: 'volumetric_plasma',
    name: 'Hyper Warp Plasma',
    category: 'cosmic',
    categoryName: 'Cosmic & Sci-Fi',
    emoji: '💫',
    description: 'Sub-surface glowing volumetric energetic sphere',
    colorA: '#FF5500',
    colorB: '#AA00FF',
    glow: 1.1,
    speed: 1.7,
  },
  {
    id: 'hologram',
    name: 'Cyber Foil Hologram',
    category: 'cosmic',
    categoryName: 'Cosmic & Sci-Fi',
    emoji: '💿',
    description: 'Iridescent cyber scanlines and holographic sheen',
    colorA: '#00FFFF',
    colorB: '#FF00FF',
    glow: 0.8,
    speed: 1.5,
  },
];

const vertexShader = `
  uniform float uTime;
  uniform float uTimeSpeed;
  uniform float uWobbleAmount;
  uniform float uWobbleTime;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying vec3 vViewPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;

    vec3 pos = position;

    // Elastic jelly wobble / Boing physics vertex displacement
    if (uWobbleAmount > 0.001) {
      float t = uWobbleTime * 12.0;
      float freq = 6.0;
      float decay = max(0.0, 1.0 - uWobbleTime * 0.4);
      float wobble = sin(pos.y * freq + t) * cos(pos.x * freq + t * 0.8) * uWobbleAmount * decay;
      pos += normal * wobble * 0.15;
    }

    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPos.xyz;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uTimeSpeed;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uEmissiveIntensity;
  uniform int uShaderMode;
  uniform sampler2D uPaintMap;
  uniform bool uUsePaintMap;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying vec3 vViewPosition;

  // Simple pseudo-noise helpers
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    float t = uTime * uTimeSpeed;

    // Default diffuse lighting
    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.8));
    float NdotL = max(0.0, dot(normal, lightDir));
    float fresnel = pow(1.0 - max(0.0, dot(normal, viewDir)), 2.5);

    vec3 finalColor = uColorA;
    float alpha = 1.0;

    // Modes mapped to our 27 shaders (Volumetric Continuous 3D World Space - No Subpart Seams)
    if (uShaderMode == 0) {
      // anime_cel: 3-step cel-shading with ink rim
      float stepL = step(0.65, NdotL) * 0.5 + step(0.2, NdotL) * 0.35 + 0.25;
      vec3 toonBase = mix(uColorA * 0.4, uColorA, stepL);
      if (fresnel > 0.6) toonBase = mix(toonBase, uColorB, 0.7);
      finalColor = toonBase;
    } 
    else if (uShaderMode == 1) {
      // posterize_ink: graphic pop art
      float p = floor(NdotL * 4.0) / 4.0;
      float dots = sin(vWorldPosition.x * 20.0) * sin(vWorldPosition.y * 20.0);
      vec3 pop = mix(uColorA, uColorB, p + dots * 0.15);
      finalColor = pop;
    }
    else if (uShaderMode == 2) {
      // rim_light: vibrant edge glow
      float rim = pow(1.0 - max(0.0, dot(normal, viewDir)), 2.0);
      finalColor = mix(uColorA * 0.3, uColorB * 1.5, rim * uEmissiveIntensity);
    }
    else if (uShaderMode == 3) {
      // rainbow: seamless volumetric spectral rainbow wave
      float hue = fract(vWorldPosition.y * 0.6 + vWorldPosition.x * 0.3 + t * 0.3);
      vec3 rgb = clamp(abs(mod(hue * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
      finalColor = mix(rgb, uColorA, 0.2) + fresnel * uColorB * 0.5;
    }
    else if (uShaderMode == 4) {
      // glitter: sparkling star flakes
      vec2 sp = vWorldPosition.xy + vWorldPosition.yz;
      float glitter = step(0.92, hash(floor(sp * 30.0) + floor(t * 8.0) * 0.1));
      vec3 base = mix(uColorA, uColorB, fract(vWorldPosition.y * 0.5));
      finalColor = base + glitter * vec3(1.5, 1.4, 0.9) * uEmissiveIntensity;
    }
    else if (uShaderMode == 5) {
      // sparkler: fiery spark trails
      vec2 sp = vWorldPosition.xy + vWorldPosition.xz;
      float s = noise(sp * 8.0 - vec2(0.0, t * 3.0));
      float spark = pow(s, 4.0) * 3.0;
      finalColor = mix(uColorA, uColorB, spark) + spark * vec3(1.0, 0.9, 0.5);
    }
    else if (uShaderMode == 6) {
      // candy: sweet gloss specular highlight
      vec3 halfDir = normalize(lightDir + viewDir);
      float spec = pow(max(0.0, dot(normal, halfDir)), 32.0);
      vec3 base = mix(uColorA, uColorB, fresnel * 0.8);
      finalColor = base + spec * vec3(1.0) * 0.9;
    }
    else if (uShaderMode == 7 || uShaderMode == 8 || uShaderMode == 9) {
      // slime / jelly / jelly_warp: subsurface gelatin
      float sub = pow(1.0 - fresnel, 1.5) * 0.6;
      vec3 gel = mix(uColorA, uColorB, sub + sin(t * 2.0 + vWorldPosition.y * 3.0) * 0.2);
      float spec = pow(max(0.0, dot(normal, normalize(lightDir + viewDir))), 48.0);
      finalColor = gel + spec * vec3(0.9, 1.0, 1.0) + fresnel * uColorB * 0.5;
      alpha = 0.92;
    }
    else if (uShaderMode == 10) {
      // fire: flaming ribbon
      vec2 sp = vWorldPosition.xy + vWorldPosition.xz;
      float f = noise(sp * 3.0 - vec2(0.0, t * 2.5)) + noise(sp * 6.0 - vec2(0.0, t * 4.0)) * 0.5;
      vec3 flame = mix(uColorA, uColorB, clamp(f * 1.5, 0.0, 1.0));
      finalColor = flame * (1.0 + uEmissiveIntensity);
    }
    else if (uShaderMode == 11) {
      // lava: glowing magma cracks
      vec2 sp = vWorldPosition.xz + vWorldPosition.xy;
      float crack = step(0.48, noise(sp * 6.0 + sin(t * 0.5)));
      vec3 crust = vec3(0.08, 0.05, 0.05);
      vec3 magma = mix(uColorA, uColorB, sin(t + vWorldPosition.y * 4.0) * 0.5 + 0.5) * 2.0;
      finalColor = mix(magma, crust, crack);
    }
    else if (uShaderMode == 12 || uShaderMode == 13) {
      // lightning / electric_arc: crackling electricity
      vec2 sp = vWorldPosition.xy + vWorldPosition.yz;
      float arc = step(0.88, fract(sin(dot(floor(sp * 15.0), vec2(12.9898, 78.233))) * 43758.5453 + t * 15.0));
      vec3 elec = mix(uColorA, uColorB, fresnel);
      finalColor = elec + arc * vec3(2.0) * uEmissiveIntensity;
    }
    else if (uShaderMode >= 14 && uShaderMode <= 18) {
      // water / ocean / caustics / waterfall / foam / ripple
      float wave = sin(vWorldPosition.x * 4.0 + t * 2.0) * cos(vWorldPosition.z * 4.0 + t * 2.0);
      float c = noise(vWorldPosition.xz * 5.0 + vec2(t * 0.5, t * 0.3));
      vec3 water = mix(uColorA, uColorB, c * 0.6 + wave * 0.2 + fresnel * 0.4);
      finalColor = water + fresnel * vec3(0.4, 0.7, 1.0);
    }
    else if (uShaderMode >= 19 && uShaderMode <= 21) {
      // foliage / forest / cloud
      float wind = sin(t * 2.0 + vWorldPosition.y * 3.0) * 0.1;
      vec3 fol = mix(uColorA, uColorB, NdotL * 0.7 + wind + 0.2);
      finalColor = fol;
    }
    else if (uShaderMode == 22) {
      // galaxy: starry cosmos nebulae
      vec2 sp = vWorldPosition.xy + vWorldPosition.yz;
      float stars = step(0.96, hash(floor(sp * 35.0)));
      float neb = noise(vWorldPosition.xz * 1.5 + vec2(t * 0.1, -t * 0.08));
      vec3 nebColor = mix(uColorA, uColorB, neb);
      finalColor = nebColor + stars * vec3(1.8) * uEmissiveIntensity;
    }
    else if (uShaderMode == 23) {
      // aurora: luminous northern lights
      float curtain = sin(vWorldPosition.x * 3.0 + t * 1.5) * sin(vWorldPosition.y * 2.0 + t);
      vec3 aur = mix(uColorA, uColorB, curtain * 0.5 + 0.5);
      finalColor = aur * (1.0 + fresnel * uEmissiveIntensity);
    }
    else if (uShaderMode == 24 || uShaderMode == 25) {
      // neon plasma / volumetric plasma
      float pulse = sin(t * 3.0 + vWorldPosition.y * 2.0) * 0.2 + 0.8;
      vec3 pl = mix(uColorA, uColorB, fresnel);
      finalColor = pl * pulse * (1.2 + uEmissiveIntensity);
    }
    else if (uShaderMode == 26) {
      // hologram: scanlines & iridescent foil
      float scan = sin(vWorldPosition.y * 60.0 + t * 10.0) * 0.15 + 0.85;
      float holoHue = fract(fresnel * 2.0 + t * 0.2);
      vec3 holoColor = clamp(abs(mod(holoHue * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
      finalColor = mix(uColorA, holoColor, 0.7) * scan + fresnel * uColorB;
      alpha = 0.85;
    }
    else {
      finalColor = mix(uColorA, uColorB, fresnel);
    }

    // Composite painted strokes directly over the animated magic shader!
    if (uUsePaintMap) {
      vec4 paintSample = texture2D(uPaintMap, vUv);
      // Flat light grey base is rgb(0.874, 0.890, 0.921)
      float diff = distance(paintSample.rgb, vec3(0.874, 0.890, 0.921));
      if (diff > 0.05) {
        finalColor = mix(finalColor, paintSample.rgb, paintSample.a);
      }
    }

    // Apply emissive boost
    finalColor += finalColor * uEmissiveIntensity * 0.35;

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export function createMagicShaderMaterial(preset: ShaderPreset, paintTexture?: THREE.Texture | null): THREE.ShaderMaterial {
  const modeIndex = SHADER_PRESETS.findIndex((p) => p.id === preset.id);

  const uniforms = {
    uTime: { value: 0 },
    uTimeSpeed: { value: preset.speed },
    uColorA: { value: new THREE.Color(preset.colorA) },
    uColorB: { value: new THREE.Color(preset.colorB) },
    uEmissiveIntensity: { value: preset.glow },
    uWobbleAmount: { value: 0 },
    uWobbleTime: { value: 0 },
    uShaderMode: { value: modeIndex >= 0 ? modeIndex : 0 },
    uPaintMap: { value: paintTexture || null },
    uUsePaintMap: { value: !!paintTexture },
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
  });

  return mat;
}
