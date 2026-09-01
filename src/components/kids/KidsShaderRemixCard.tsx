import React from 'react';
import { motion } from 'motion/react';
import { SparkleStar } from './SparkleStar';
import { ShaderPreset } from '../../types';
import { soundEngine } from '../../utils/audio';
import { triggerHaptic } from '../../utils/haptics';
import { hsvToHex } from '../../core/colorMath';
import { Sparkles, Sliders, Flame, Zap } from 'lucide-react';

interface KidsShaderRemixCardProps {
  activeShader: ShaderPreset;
  colorA: string;
  colorB: string;
  glow: number;
  speed: number;
  onChangeColorA: (color: string) => void;
  onChangeColorB: (color: string) => void;
  onChangeGlow: (glow: number) => void;
  onChangeSpeed: (speed: number) => void;
  onOpenShadersModal: () => void;
}

export const KidsShaderRemixCard: React.FC<KidsShaderRemixCardProps> = ({
  activeShader,
  colorA,
  colorB,
  glow,
  speed,
  onChangeColorA,
  onChangeColorB,
  onChangeGlow,
  onChangeSpeed,
  onOpenShadersModal,
}) => {
  return (
    <motion.aside
      id="shader-remix-card"
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="relative flex flex-col w-64 sm:w-72 p-4 bg-[#FF70B8] rounded-3xl border-[3.5px] border-black shadow-[6px_6px_0px_#1B1B4B] select-none overflow-hidden"
    >
      {/* Curved Glossy White Specular Highlight Bar along top edge */}
      <div className="absolute top-2 left-4 right-8 h-2.5 bg-white/40 rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mt-1 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-2xl filter drop-shadow-sm">{activeShader.emoji}</span>
          <div>
            <h3 className="font-['Fredoka',sans-serif] font-bold text-sm text-black leading-tight truncate max-w-[130px]">
              {activeShader.name}
            </h3>
            <span className="text-[10px] font-bold uppercase text-purple-900 bg-white/70 px-1.5 py-0.2 rounded border border-black/30">
              Magic Remix
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            soundEngine.playBubblePop(1.2);
            triggerHaptic('light');
            onOpenShadersModal();
          }}
          className="p-1.5 bg-[#FFE600] text-black rounded-xl border-[2px] border-black shadow-[2px_2px_0_#000] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          title="Browse all 27 shaders"
        >
          <Sparkles className="w-4 h-4 text-black" />
        </button>
      </div>

      {/* 3 Track Sliders with Chunky Large Touch Targets */}
      <div className="space-y-4 bg-white/90 p-3.5 rounded-2xl border-[2.5px] border-black">
        {/* Track 1: Color Tint / Hue */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-black">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#FF2A6D] border-[1.5px] border-black shadow-[1px_1px_0_#000]" />
              <span className="text-[11px] uppercase tracking-wider">Color Tint</span>
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={colorA.startsWith('#') ? colorA : '#FF5376'}
                onChange={(e) => {
                  onChangeColorA(e.target.value);
                  soundEngine.playDialClick(600);
                }}
                className="w-6 h-6 rounded-full border-[2px] border-black cursor-pointer bg-transparent p-0 shadow-[1px_1px_0_#000] hover:scale-110 active:scale-95 transition-transform"
                title="Primary Color"
              />
              <input
                type="color"
                value={colorB.startsWith('#') ? colorB : '#FFE600'}
                onChange={(e) => {
                  onChangeColorB(e.target.value);
                  soundEngine.playDialClick(800);
                }}
                className="w-6 h-6 rounded-full border-[2px] border-black cursor-pointer bg-transparent p-0 shadow-[1px_1px_0_#000] hover:scale-110 active:scale-95 transition-transform"
                title="Secondary Color"
              />
            </div>
          </div>

          <div className="relative flex items-center h-8">
            <input
              id="slider-shader-hue"
              type="range"
              min="0"
              max="360"
              defaultValue="180"
              onChange={(e) => {
                const hue = parseInt(e.target.value, 10);
                const colA = hsvToHex(hue, 0.9, 1.0);
                const colB = hsvToHex((hue + 55) % 360, 0.9, 1.0);
                onChangeColorA(colA);
                onChangeColorB(colB);
                soundEngine.playDialClick(400 + hue * 2);
                triggerHaptic('light');
              }}
              className="w-full h-4 bg-gradient-to-r from-red-500 via-yellow-400 via-green-400 via-blue-500 to-purple-500 rounded-full border-[2.5px] border-black appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[2.5px] [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:shadow-[2px_2px_0_#000] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>
        </div>

        {/* Track 2: Glow & Bloom Intensity */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-black">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#FFE600] border-[1.5px] border-black shadow-[1px_1px_0_#000]" />
              <span className="text-[11px] uppercase tracking-wider">Glow & Bloom</span>
            </span>
            <span className="text-[11px] font-black text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-lg border border-amber-300">
              {Math.round(glow * 100)}%
            </span>
          </div>

          <div className="relative flex items-center h-8">
            <input
              id="slider-shader-glow"
              type="range"
              min="0.1"
              max="2.0"
              step="0.05"
              value={glow}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onChangeGlow(val);
                soundEngine.playDialClick(500 + val * 400);
                triggerHaptic('light');
              }}
              className="w-full h-4 bg-[#FFE600] rounded-full border-[2.5px] border-black appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[2.5px] [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:shadow-[2px_2px_0_#000] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>
        </div>

        {/* Track 3: Magic Flow Speed */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-black">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#B042FF] border-[1.5px] border-black shadow-[1px_1px_0_#000]" />
              <span className="text-[11px] uppercase tracking-wider">Flow Speed</span>
            </span>
            <span className="text-[11px] font-black text-purple-900 bg-purple-100 px-1.5 py-0.5 rounded-lg border border-purple-300">
              {speed.toFixed(1)}x
            </span>
          </div>

          <div className="relative flex items-center h-8">
            <input
              id="slider-shader-speed"
              type="range"
              min="0.2"
              max="3.0"
              step="0.1"
              value={speed}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onChangeSpeed(val);
                soundEngine.playDialClick(600 + val * 300);
                triggerHaptic('light');
              }}
              className="w-full h-4 bg-[#B042FF] rounded-full border-[2.5px] border-black appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[2.5px] [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:shadow-[2px_2px_0_#000] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Sparkle badge at corner */}
      <div className="absolute -bottom-1 -right-1 pointer-events-none">
        <SparkleStar size={26} color="#FFE600" />
      </div>
    </motion.aside>
  );
};
