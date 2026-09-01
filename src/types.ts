export type AppMode = 'kids' | 'pro';

export type UITheme = 'periwinkle' | 'cotton_candy' | 'mint_splash' | 'cyber_twilight';

export type BrushType = 
  | 'flat_paint'
  | 'bucket'
  | 'magic_wand' 
  | 'stardust' 
  | 'sticker' 
  | 'eraser';

export interface BrushSizeOption {
  id: string;
  name: string;
  radius: number; // in world units
  label: string;
}

export type ShaderCategoryId = 'toon' | 'magic' | 'elemental' | 'cosmic';

export interface ShaderPreset {
  id: string;
  name: string;
  category: ShaderCategoryId;
  categoryName: string;
  emoji: string;
  description: string;
  colorA: string;
  colorB: string;
  glow: number;
  speed: number;
  hasWobble?: boolean;
}

export type ModelCategoryId = 'animals' | 'cartoons' | 'houses' | 'vehicles' | 'shapes';

export interface ToyModelInfo {
  id: string;
  name: string;
  category: ModelCategoryId;
  categoryName: string;
  icon: string;
  description: string;
  subParts: string[];
  scale: number;
  polyCount: number;
  tags: string[];
  file?: string;
  remoteUrl?: string;
  rotation?: { x: number; y: number; z: number };
  position?: { x: number; y: number; z: number };
}

export interface StickerItem {
  id: string;
  name: string;
  emoji: string;
  scale: number;
}

export interface SkyPreset {
  id: string;
  name: string;
  timeOfDay: number; // 0.0 to 1.0 (0 = midnight, 0.25 = sunrise, 0.5 = midday, 0.75 = sunset)
  skyTop: string;
  skyBottom: string;
  sunColor: string;
  ambientColor: string;
  cloudColor: string;
  description: string;
  icon: string;
}

export interface PaintedStrokePoint {
  x: number;
  y: number;
  z: number;
  pressure: number;
  time: number;
}

export interface PaintedStroke {
  id: string;
  points: PaintedStrokePoint[];
  brushType: BrushType;
  color: string;
  radius: number;
  shaderId: string;
  symmetryCount: number;
  meshId?: string;
}

export interface PlacedSticker {
  id: string;
  stickerId: string;
  emoji: string;
  position: [number, number, number];
  normal: [number, number, number];
  rotation: number;
  scale: number;
}

export interface ToyPartColorMap {
  [partName: string]: {
    color: string;
    shaderId?: string;
  };
}
