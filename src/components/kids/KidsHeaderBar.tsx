import React from 'react';
import { motion } from 'motion/react';
import { SparkleStar } from './SparkleStar';
import { UITheme } from '../../types';
import { soundEngine } from '../../utils/audio';
import { triggerHaptic } from '../../utils/haptics';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Sun,
  Undo2,
  Redo2,
  Trash2,
  Tag,
} from 'lucide-react';

interface KidsHeaderBarProps {
  onOpenToybox: () => void;
  onOpenShaders: () => void;
  onOpenStickers: () => void;
  onOpenSky: () => void;
  onJellyBoing: () => void;
  symmetryCount: number;
  onToggleSymmetry: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onClearCanvas?: () => void;
  activeTheme: UITheme;
  onSelectTheme: (theme: UITheme) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const KidsHeaderBar: React.FC<KidsHeaderBarProps> = ({
  onOpenToybox,
  onOpenShaders,
  onOpenStickers,
  onOpenSky,
  onJellyBoing,
  symmetryCount,
  onToggleSymmetry,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onClearCanvas,
  activeTheme,
  onSelectTheme,
  isMuted,
  onToggleMute,
}) => {
  const themes: { id: UITheme; name: string; color: string }[] = [
    { id: 'periwinkle', name: 'Periwinkle', color: '#8FA2FA' },
    { id: 'cotton_candy', name: 'Pink Cotton', color: '#FFB6D9' },
    { id: 'mint_splash', name: 'Mint Splash', color: '#75F0C2' },
    { id: 'cyber_twilight', name: 'Cyber Neon', color: '#2A2D4A' },
  ];

  return (
    <header
      className="relative z-30 flex items-center justify-between gap-2 px-3 py-2 border-b-[3.5px] border-black shadow-[0_4px_0_#000] select-none transition-colors duration-300"
      style={{
        backgroundColor: themes.find((t) => t.id === activeTheme)?.color || '#8FA2FA',
      }}
    >
      {/* Left: 3 Main Tabs (3D Toybox, Magic Shaders, 3D Stickers) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* 1. 3D Toybox */}
        <motion.button
          id="btn-open-toybox"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            soundEngine.playBubblePop(1.1);
            triggerHaptic('light');
            onOpenToybox();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-[#FF70B8] text-white font-extrabold text-xs sm:text-sm rounded-2xl border-[3px] border-black shadow-[3px_3px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
        >
          <span className="text-base sm:text-lg">🧸</span>
          <span className="font-['Fredoka',sans-serif] tracking-wide whitespace-nowrap">3D Toybox</span>
          <span className="text-[10px] bg-black text-white px-1.5 py-0.2 rounded-full font-black">37</span>
        </motion.button>

        {/* 2. Magic Shaders */}
        <motion.button
          id="btn-open-shaders"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            soundEngine.playBubblePop(1.3);
            triggerHaptic('light');
            onOpenShaders();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 bg-[#00F0FF] text-black font-extrabold text-xs sm:text-sm rounded-2xl border-[3px] border-black shadow-[3px_3px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
          <span className="font-['Fredoka',sans-serif] whitespace-nowrap hidden xs:inline">Magic Shaders</span>
          <span className="text-[10px] bg-black text-white px-1.5 py-0.2 rounded-full font-black">27</span>
        </motion.button>

        {/* 3. 3D Stickers */}
        <motion.button
          id="btn-open-stickers"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            soundEngine.playBubblePop(1.2);
            triggerHaptic('light');
            onOpenStickers();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 bg-[#FFE600] text-black font-extrabold text-xs sm:text-sm rounded-2xl border-[3px] border-black shadow-[3px_3px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
        >
          <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
          <span className="font-['Fredoka',sans-serif] whitespace-nowrap hidden sm:inline">3D Stickers</span>
          <span className="text-[10px] bg-black text-white px-1.5 py-0.2 rounded-full font-black">16</span>
        </motion.button>
      </div>

      {/* Center: Undo/Redo, Symmetry, Boing, Sky */}
      <div className="flex items-center gap-1.5">
        {/* Undo Button */}
        <motion.button
          id="btn-header-undo"
          whileHover={canUndo ? { scale: 1.08 } : undefined}
          whileTap={canUndo ? { scale: 0.92 } : undefined}
          disabled={!canUndo}
          onClick={() => {
            if (canUndo && onUndo) {
              triggerHaptic('light');
              onUndo();
            }
          }}
          title="Undo Last Stroke (Ctrl+Z)"
          className={`flex items-center gap-1 px-2.5 py-1.5 font-bold text-xs rounded-xl border-[2.5px] border-black transition-all ${
            canUndo
              ? 'bg-white text-black shadow-[2.5px_2.5px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer hover:bg-yellow-50'
              : 'bg-white/40 text-black/30 border-black/30 cursor-not-allowed shadow-none'
          }`}
        >
          <Undo2 className="w-4 h-4" />
          <span className="hidden lg:inline">Undo</span>
        </motion.button>

        {/* Redo Button */}
        <motion.button
          id="btn-header-redo"
          whileHover={canRedo ? { scale: 1.08 } : undefined}
          whileTap={canRedo ? { scale: 0.92 } : undefined}
          disabled={!canRedo}
          onClick={() => {
            if (canRedo && onRedo) {
              triggerHaptic('light');
              onRedo();
            }
          }}
          title="Redo Stroke (Ctrl+Y)"
          className={`flex items-center gap-1 px-2.5 py-1.5 font-bold text-xs rounded-xl border-[2.5px] border-black transition-all ${
            canRedo
              ? 'bg-white text-black shadow-[2.5px_2.5px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer hover:bg-yellow-50'
              : 'bg-white/40 text-black/30 border-black/30 cursor-not-allowed shadow-none'
          }`}
        >
          <Redo2 className="w-4 h-4" />
          <span className="hidden lg:inline">Redo</span>
        </motion.button>

        {/* Clear Drawing Button (Moved higher for safety) */}
        <motion.button
          id="btn-header-clear"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            if (onClearCanvas) {
              soundEngine.playEraserWhoosh();
              triggerHaptic('medium');
              onClearCanvas();
            }
          }}
          title="Clear Drawing"
          className="flex items-center gap-1 px-2.5 py-1.5 bg-white text-red-600 font-bold text-xs rounded-xl border-[2.5px] border-black shadow-[2.5px_2.5px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden lg:inline">Clear</span>
        </motion.button>

        {/* Kaleidoscope Snowflake Symmetry */}
        <motion.button
          id="btn-kaleidoscope"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            soundEngine.playBubblePop(1.4);
            triggerHaptic('selection');
            onToggleSymmetry();
          }}
          title="Kaleidoscope Symmetry Mirror"
          className="flex items-center gap-1 px-2.5 py-1.5 bg-[#FFF275] text-black font-bold text-xs rounded-xl border-[2.5px] border-black shadow-[2.5px_2.5px_0_#000] cursor-pointer"
        >
          <span className="text-sm">❄️</span>
          <span className="hidden md:inline">Mirror:</span>
          <span className="font-black text-pink-600 bg-white/80 px-1.5 py-0.2 rounded border border-black">{symmetryCount}x</span>
        </motion.button>

        {/* Jelly Wobble / Boing Button */}
        <motion.button
          id="btn-jelly-boing"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            triggerHaptic('heavy');
            onJellyBoing();
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-[#75F0C2] text-black font-extrabold text-xs rounded-xl border-[2.5px] border-black shadow-[2.5px_2.5px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none animate-bounce cursor-pointer"
        >
          <span className="text-sm">🍮</span>
          <span className="font-['Fredoka',sans-serif]">Boing!</span>
        </motion.button>

        {/* Sky Worlds */}
        <motion.button
          id="btn-sky-worlds"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            soundEngine.playBubblePop(1.0);
            triggerHaptic('light');
            onOpenSky();
          }}
          className="hidden md:flex items-center gap-1 px-2.5 py-1.5 bg-[#B042FF] text-white font-bold text-xs rounded-xl border-[2.5px] border-black shadow-[2.5px_2.5px_0_#000] cursor-pointer"
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Sky</span>
        </motion.button>
      </div>

      {/* Right: Themes & Mute */}
      <div className="flex items-center gap-2">
        {/* Theme Picker Chips */}
        <div className="hidden xl:flex items-center gap-1 p-1 bg-white/70 rounded-xl border-[2px] border-black">
          {themes.map((t) => (
            <button
              key={t.id}
              id={`theme-btn-${t.id}`}
              onClick={() => {
                soundEngine.playDialClick(900);
                triggerHaptic('selection');
                onSelectTheme(t.id);
              }}
              title={t.name}
              className={`w-5 h-5 rounded-full border-[1.5px] border-black transition-transform cursor-pointer ${
                activeTheme === t.id ? 'scale-125 ring-2 ring-black' : 'opacity-80 hover:opacity-100'
              }`}
              style={{ backgroundColor: t.color }}
            />
          ))}
        </div>

        {/* Audio Mute / Unmute */}
        <button
          id="btn-toggle-sound"
          onClick={() => {
            triggerHaptic('light');
            onToggleMute();
          }}
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          className="p-2 bg-white text-black rounded-xl border-[2.5px] border-black shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-black" />}
        </button>
      </div>
    </header>
  );
};
